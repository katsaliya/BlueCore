import fs from "fs";
import os from "os";
import path from "path";
import multer from "multer";
import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/requireAuth";
import { AuthenticatedRequest } from "../types/auth";
import { transcribeAudioFile } from "../services/voiceBridge";
import { generatePlaceholderDocumentPdf } from "../services/documentPdfService";
import {
  getDocumentOutputById,
  listDocumentOutputsForRun,
  saveDocumentOutputBuffer,
  userOwnsDocumentOutput
} from "../store/documentOutputStore";
import {
  createDocumentRun,
  getDocumentRunById,
  getDocumentTemplateByCode,
  getDocumentTemplateById,
  listDocumentFieldValues,
  listDocumentTemplates,
  listUserDocumentRuns,
  markDocumentRunFinalized,
  upsertDocumentFieldValue,
  updateDocumentRunStatus,
  userOwnsDocumentRun
} from "../store/documentStore";

const router = Router();
const upload = multer({ dest: path.join(os.tmpdir(), "bluecore-document-uploads") });

const createRunSchema = z.object({
  templateCode: z.string().min(1),
  sessionId: z.string().optional(),
  title: z.string().min(1)
});

const upsertFieldSchema = z.object({
  fieldName: z.string().min(1),
  fieldValue: z.string().nullable(),
  source: z.string().optional(),
  confidence: z.number().optional()
});

const respondSchema = z.object({
  text: z.string().min(1)
});

const exportPdfSchema = z.object({
  mode: z.enum(["draft", "final"]).optional()
});

type TemplateSchemaField = {
  name: string;
  label: string;
  type: string;
  required: boolean;
  prompt?: string;
};

function defaultPromptForField(field: TemplateSchemaField) {
  switch (field.name) {
    case "vessel_name":
      return "What is the vessel name?";
    case "worker_name":
      return "What is the worker name?";
    case "role":
      return "What is the worker role for this shift?";
    case "shift_date":
      return "What is the shift date?";
    case "shift_start":
      return "What time did the shift start?";
    case "shift_end":
      return "What time did the shift end?";
    case "task_summary":
      return "Please describe the work completed during the shift.";
    case "incidents_observed":
      return "Were any incidents observed?";
    case "equipment_status":
      return "What was the equipment status?";
    case "fatigue_level":
      return "How would you describe the fatigue level?";
    case "additional_notes":
      return "Any additional notes?";
    default:
      return `Please provide ${field.label.toLowerCase()}.`;
  }
}

function buildDocumentState(documentId: number) {
  const document = getDocumentRunById(documentId);
  if (!document) {
    return null;
  }

  const template = getDocumentTemplateById(document.templateId);
  if (!template) {
    return null;
  }

  const schema = JSON.parse(template.schemaJson) as {
    fields: TemplateSchemaField[];
  };

  const savedFields = listDocumentFieldValues(documentId);
  const savedMap = new Map(savedFields.map((field) => [field.fieldName, field]));

  const fields = schema.fields.map((field) => {
    const saved = savedMap.get(field.name);

    return {
      name: field.name,
      label: field.label,
      type: field.type,
      required: field.required,
      prompt: field.prompt ?? defaultPromptForField(field),
      value: saved?.fieldValue ?? null,
      source: saved?.source ?? null,
      confidence: saved?.confidence ?? null,
      updatedAt: saved?.updatedAt ?? null
    };
  });

  const requiredFields = fields.filter((field) => field.required);
  const filledRequiredFields = requiredFields.filter(
    (field) => field.value !== null && String(field.value).trim().length > 0
  );

  const missingRequiredFieldObjects = requiredFields.filter(
    (field) => field.value === null || String(field.value).trim().length === 0
  );

  const missingRequiredFields = missingRequiredFieldObjects.map((field) => field.name);

  const completionPercent =
    requiredFields.length === 0
      ? 100
      : Math.round((filledRequiredFields.length / requiredFields.length) * 100);

  const currentField = missingRequiredFieldObjects[0] ?? null;
  const nextQuestion = currentField ? currentField.prompt : null;
  const isReadyForPdf = missingRequiredFields.length === 0;
  const readyForReview = isReadyForPdf && document.status !== "finalized";

  const reviewSummary = fields.map((field) => ({
    label: field.label,
    value:
      field.value && String(field.value).trim().length > 0
        ? field.value
        : field.required
        ? "[MISSING REQUIRED VALUE]"
        : "[blank]",
    required: field.required
  }));

  const nextAction =
    document.status === "finalized"
      ? "download"
      : readyForReview
      ? "confirm_or_edit"
      : "answer_next_question";

  return {
    document,
    template: {
      id: template.id,
      code: template.code,
      name: template.name,
      description: template.description
    },
    fields,
    missingRequiredFields,
    completionPercent,
    currentField: currentField
      ? {
          name: currentField.name,
          label: currentField.label,
          type: currentField.type,
          required: currentField.required,
          prompt: currentField.prompt
        }
      : null,
    nextQuestion,
    isReadyForPdf,
    readyForReview,
    reviewSummary,
    nextAction
  };
}

function syncDocumentStatus(documentId: number) {
  const state = buildDocumentState(documentId);
  if (!state) {
    return null;
  }

  if (state.document.status === "finalized") {
    return state;
  }

  const nextStatus = state.isReadyForPdf ? "ready_for_review" : "collecting";

  if (state.document.status !== nextStatus) {
    updateDocumentRunStatus({
      documentRunId: documentId,
      status: nextStatus,
      completedAt: null
    });

    return buildDocumentState(documentId);
  }

  return state;
}

function fillNextMissingField(params: {
  documentId: number;
  text: string;
  source: string;
  confidence?: number | null;
}) {
  const state = buildDocumentState(params.documentId);

  if (!state) {
    return {
      ok: false as const,
      status: 404,
      message: "Document not found"
    };
  }

  if (state.isReadyForPdf || !state.currentField) {
    const syncedState = syncDocumentStatus(params.documentId);
    return {
      ok: true as const,
      status: 200,
      state: syncedState
    };
  }

  upsertDocumentFieldValue({
    documentRunId: params.documentId,
    fieldName: state.currentField.name,
    fieldValue: params.text.trim(),
    source: params.source,
    confidence: params.confidence ?? null
  });

  const updatedState = syncDocumentStatus(params.documentId);

  return {
    ok: true as const,
    status: 200,
    state: updatedState
  };
}

router.get("/document-templates", requireAuth, (_req, res) => {
  const templates = listDocumentTemplates();

  return res.status(200).json({
    ok: true,
    templates
  });
});

router.post("/documents", requireAuth, (req: AuthenticatedRequest, res) => {
  const parsed = createRunSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      ok: false,
      message: "Invalid document create request",
      issues: parsed.error.issues
    });
  }

  const userId = req.authUser!.id;
  const template = getDocumentTemplateByCode(parsed.data.templateCode);

  if (!template) {
    return res.status(404).json({
      ok: false,
      message: "Template not found"
    });
  }

  const run = createDocumentRun({
    userId,
    sessionId: parsed.data.sessionId ?? null,
    templateId: template.id,
    title: parsed.data.title,
    status: "collecting"
  });

  return res.status(201).json({
    ok: true,
    document: run
  });
});

router.get("/documents", requireAuth, (req: AuthenticatedRequest, res) => {
  const userId = req.authUser!.id;
  const documents = listUserDocumentRuns(userId);

  return res.status(200).json({
    ok: true,
    documents
  });
});

router.get("/documents/:id", requireAuth, (req: AuthenticatedRequest, res) => {
  const userId = req.authUser!.id;
  const documentId = Number(req.params.id);

  if (!Number.isFinite(documentId)) {
    return res.status(400).json({
      ok: false,
      message: "Invalid document id"
    });
  }

  if (!userOwnsDocumentRun(userId, documentId)) {
    return res.status(404).json({
      ok: false,
      message: "Document not found"
    });
  }

  const state = syncDocumentStatus(documentId);

  if (!state) {
    return res.status(404).json({
      ok: false,
      message: "Document not found"
    });
  }

  return res.status(200).json({
    ok: true,
    ...state,
    outputs: listDocumentOutputsForRun(documentId)
  });
});

router.post("/documents/:id/fields", requireAuth, (req: AuthenticatedRequest, res) => {
  const userId = req.authUser!.id;
  const documentId = Number(req.params.id);

  if (!Number.isFinite(documentId)) {
    return res.status(400).json({
      ok: false,
      message: "Invalid document id"
    });
  }

  if (!userOwnsDocumentRun(userId, documentId)) {
    return res.status(404).json({
      ok: false,
      message: "Document not found"
    });
  }

  const parsed = upsertFieldSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      ok: false,
      message: "Invalid document field request",
      issues: parsed.error.issues
    });
  }

  upsertDocumentFieldValue({
    documentRunId: documentId,
    fieldName: parsed.data.fieldName,
    fieldValue: parsed.data.fieldValue,
    source: parsed.data.source,
    confidence: parsed.data.confidence
  });

  const state = syncDocumentStatus(documentId);

  return res.status(200).json({
    ok: true,
    ...state,
    outputs: listDocumentOutputsForRun(documentId)
  });
});

router.post("/documents/:id/respond", requireAuth, (req: AuthenticatedRequest, res) => {
  const userId = req.authUser!.id;
  const documentId = Number(req.params.id);

  if (!Number.isFinite(documentId)) {
    return res.status(400).json({
      ok: false,
      message: "Invalid document id"
    });
  }

  if (!userOwnsDocumentRun(userId, documentId)) {
    return res.status(404).json({
      ok: false,
      message: "Document not found"
    });
  }

  const parsed = respondSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      ok: false,
      message: "Invalid document response request",
      issues: parsed.error.issues
    });
  }

  const result = fillNextMissingField({
    documentId,
    text: parsed.data.text,
    source: "chat",
    confidence: 1
  });

  if (!result.ok) {
    return res.status(result.status).json({
      ok: false,
      message: result.message
    });
  }

  return res.status(200).json({
    ok: true,
    transcript: null,
    ...result.state,
    outputs: listDocumentOutputsForRun(documentId)
  });
});

router.post(
  "/documents/:id/respond/audio",
  requireAuth,
  upload.single("file"),
  async (req: AuthenticatedRequest, res) => {
    const userId = req.authUser!.id;
    const documentId = Number(req.params.id);
    const file = req.file;

    if (!Number.isFinite(documentId)) {
      return res.status(400).json({
        ok: false,
        message: "Invalid document id"
      });
    }

    if (!userOwnsDocumentRun(userId, documentId)) {
      return res.status(404).json({
        ok: false,
        message: "Document not found"
      });
    }

    if (!file) {
      return res.status(400).json({
        ok: false,
        message: "Missing audio file"
      });
    }

    try {
      const transcription = await transcribeAudioFile(
        file.path,
        file.originalname,
        file.mimetype
      );

      const result = fillNextMissingField({
        documentId,
        text: transcription.text,
        source: "voice_transcript",
        confidence: 1
      });

      if (!result.ok) {
        return res.status(result.status).json({
          ok: false,
          message: result.message
        });
      }

      return res.status(200).json({
        ok: true,
        transcript: transcription.text,
        transcriptLanguage: transcription.language,
        transcriptDuration: transcription.duration,
        ...result.state,
        outputs: listDocumentOutputsForRun(documentId)
      });
    } catch (error) {
      return res.status(502).json({
        ok: false,
        message:
          error instanceof Error
            ? `Failed to process document audio response (${error.message})`
            : "Failed to process document audio response"
      });
    } finally {
      try {
        fs.unlinkSync(file.path);
      } catch {
      }
    }
  }
);

router.post("/documents/:id/review", requireAuth, (req: AuthenticatedRequest, res) => {
  const userId = req.authUser!.id;
  const documentId = Number(req.params.id);

  if (!Number.isFinite(documentId)) {
    return res.status(400).json({
      ok: false,
      message: "Invalid document id"
    });
  }

  if (!userOwnsDocumentRun(userId, documentId)) {
    return res.status(404).json({
      ok: false,
      message: "Document not found"
    });
  }

  const state = syncDocumentStatus(documentId);

  if (!state) {
    return res.status(404).json({
      ok: false,
      message: "Document not found"
    });
  }

  return res.status(200).json({
    ok: true,
    readyForReview: state.readyForReview,
    reviewSummary: state.reviewSummary,
    missingRequiredFields: state.missingRequiredFields,
    completionPercent: state.completionPercent,
    nextAction: state.nextAction
  });
});

router.post("/documents/:id/export/pdf", requireAuth, async (req: AuthenticatedRequest, res) => {
  const userId = req.authUser!.id;
  const documentId = Number(req.params.id);

  if (!Number.isFinite(documentId)) {
    return res.status(400).json({
      ok: false,
      message: "Invalid document id"
    });
  }

  if (!userOwnsDocumentRun(userId, documentId)) {
    return res.status(404).json({
      ok: false,
      message: "Document not found"
    });
  }

  const parsed = exportPdfSchema.safeParse(req.body ?? {});
  if (!parsed.success) {
    return res.status(400).json({
      ok: false,
      message: "Invalid export request",
      issues: parsed.error.issues
    });
  }

  const mode = parsed.data.mode ?? "draft";
  const state = syncDocumentStatus(documentId);

  if (!state) {
    return res.status(404).json({
      ok: false,
      message: "Document not found"
    });
  }

  if (mode === "final" && !state.isReadyForPdf) {
    return res.status(400).json({
      ok: false,
      message: "Document is missing required fields",
      missingRequiredFields: state.missingRequiredFields
    });
  }

  const pdfBuffer = await generatePlaceholderDocumentPdf({
    title: state.document.title,
    templateName: state.template.name,
    outputMode: mode,
    completionPercent: state.completionPercent,
    missingRequiredFields: state.missingRequiredFields,
    fields: state.fields.map((field) => ({
      name: field.name,
      label: field.label,
      type: field.type,
      required: field.required,
      value: field.value
    }))
  });

  const output = saveDocumentOutputBuffer({
    documentRunId: documentId,
    outputType: "pdf",
    outputMode: mode,
    mimeType: "application/pdf",
    buffer: pdfBuffer,
    extension: ".pdf"
  });

  return res.status(201).json({
    ok: true,
    output
  });
});

router.post("/documents/:id/finalize", requireAuth, async (req: AuthenticatedRequest, res) => {
  const userId = req.authUser!.id;
  const documentId = Number(req.params.id);

  if (!Number.isFinite(documentId)) {
    return res.status(400).json({
      ok: false,
      message: "Invalid document id"
    });
  }

  if (!userOwnsDocumentRun(userId, documentId)) {
    return res.status(404).json({
      ok: false,
      message: "Document not found"
    });
  }

  const state = syncDocumentStatus(documentId);

  if (!state) {
    return res.status(404).json({
      ok: false,
      message: "Document not found"
    });
  }

  if (!state.isReadyForPdf) {
    return res.status(400).json({
      ok: false,
      message: "Document is missing required fields",
      missingRequiredFields: state.missingRequiredFields
    });
  }

  const pdfBuffer = await generatePlaceholderDocumentPdf({
    title: state.document.title,
    templateName: state.template.name,
    outputMode: "final",
    completionPercent: state.completionPercent,
    missingRequiredFields: state.missingRequiredFields,
    fields: state.fields.map((field) => ({
      name: field.name,
      label: field.label,
      type: field.type,
      required: field.required,
      value: field.value
    }))
  });

  const output = saveDocumentOutputBuffer({
    documentRunId: documentId,
    outputType: "pdf",
    outputMode: "final",
    mimeType: "application/pdf",
    buffer: pdfBuffer,
    extension: ".pdf"
  });

  markDocumentRunFinalized(documentId);

  const finalizedState = buildDocumentState(documentId);

  return res.status(200).json({
    ok: true,
    message: "Document finalized",
    output,
    ...finalizedState
  });
});

router.get("/document-outputs/:outputId/download", requireAuth, (req: AuthenticatedRequest, res) => {
  const userId = req.authUser!.id;
  const outputId = Number(req.params.outputId);

  if (!Number.isFinite(outputId)) {
    return res.status(400).json({
      ok: false,
      message: "Invalid output id"
    });
  }

  if (!userOwnsDocumentOutput(userId, outputId)) {
    return res.status(404).json({
      ok: false,
      message: "Output not found"
    });
  }

  const output = getDocumentOutputById(outputId);

  if (!output || !fs.existsSync(output.filePath)) {
    return res.status(404).json({
      ok: false,
      message: "Output not found"
    });
  }

  res.setHeader("Content-Type", output.mimeType);
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="document-${output.documentRunId}-${output.outputMode}.pdf"`
  );

  return res.sendFile(output.filePath);
});

export default router;