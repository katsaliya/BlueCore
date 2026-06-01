import { db } from "../db/sqlite";

export type DocumentTemplate = {
  id: number;
  code: string;
  name: string;
  description: string | null;
  schemaJson: string;
  createdAt: string;
};

export type DocumentRun = {
  id: number;
  userId: number;
  sessionId: string | null;
  templateId: number;
  status: string;
  title: string;
  createdAt: string;
  completedAt: string | null;
};

export type DocumentFieldValue = {
  id: number;
  documentRunId: number;
  fieldName: string;
  fieldValue: string | null;
  source: string | null;
  confidence: number | null;
  updatedAt: string;
};

export function listDocumentTemplates(): DocumentTemplate[] {
  const rows = db.prepare(`
    SELECT id, code, name, description, schema_json, created_at
    FROM document_templates
    ORDER BY id ASC
  `).all() as Array<{
    id: number;
    code: string;
    name: string;
    description: string | null;
    schema_json: string;
    created_at: string;
  }>;

  return rows.map((row) => ({
    id: row.id,
    code: row.code,
    name: row.name,
    description: row.description,
    schemaJson: row.schema_json,
    createdAt: row.created_at
  }));
}

export function getDocumentTemplateByCode(code: string): DocumentTemplate | null {
  const row = db.prepare(`
    SELECT id, code, name, description, schema_json, created_at
    FROM document_templates
    WHERE code = ?
  `).get(code) as
    | {
        id: number;
        code: string;
        name: string;
        description: string | null;
        schema_json: string;
        created_at: string;
      }
    | undefined;

  if (!row) return null;

  return {
    id: row.id,
    code: row.code,
    name: row.name,
    description: row.description,
    schemaJson: row.schema_json,
    createdAt: row.created_at
  };
}

export function createDocumentTemplate(params: {
  code: string;
  name: string;
  description?: string | null;
  schemaJson: string;
}) {
  const createdAt = new Date().toISOString();

  const result = db.prepare(`
    INSERT INTO document_templates (code, name, description, schema_json, created_at)
    VALUES (?, ?, ?, ?, ?)
  `).run(
    params.code,
    params.name,
    params.description ?? null,
    params.schemaJson,
    createdAt
  );

  return {
    id: Number(result.lastInsertRowid),
    code: params.code,
    name: params.name,
    description: params.description ?? null,
    schemaJson: params.schemaJson,
    createdAt
  } satisfies DocumentTemplate;
}

export function createDocumentRun(params: {
  userId: number;
  sessionId?: string | null;
  templateId: number;
  status?: string;
  title: string;
}) {
  const createdAt = new Date().toISOString();
  const status = params.status ?? "draft";

  const result = db.prepare(`
    INSERT INTO document_runs (user_id, session_id, template_id, status, title, created_at, completed_at)
    VALUES (?, ?, ?, ?, ?, ?, NULL)
  `).run(
    params.userId,
    params.sessionId ?? null,
    params.templateId,
    status,
    params.title,
    createdAt
  );

  return {
    id: Number(result.lastInsertRowid),
    userId: params.userId,
    sessionId: params.sessionId ?? null,
    templateId: params.templateId,
    status,
    title: params.title,
    createdAt,
    completedAt: null
  } satisfies DocumentRun;
}

export function listUserDocumentRuns(userId: number): DocumentRun[] {
  const rows = db.prepare(`
    SELECT id, user_id, session_id, template_id, status, title, created_at, completed_at
    FROM document_runs
    WHERE user_id = ?
    ORDER BY created_at DESC
  `).all(userId) as Array<{
    id: number;
    user_id: number;
    session_id: string | null;
    template_id: number;
    status: string;
    title: string;
    created_at: string;
    completed_at: string | null;
  }>;

  return rows.map((row) => ({
    id: row.id,
    userId: row.user_id,
    sessionId: row.session_id,
    templateId: row.template_id,
    status: row.status,
    title: row.title,
    createdAt: row.created_at,
    completedAt: row.completed_at
  }));
}

export function getDocumentRunById(id: number): DocumentRun | null {
  const row = db.prepare(`
    SELECT id, user_id, session_id, template_id, status, title, created_at, completed_at
    FROM document_runs
    WHERE id = ?
  `).get(id) as
    | {
        id: number;
        user_id: number;
        session_id: string | null;
        template_id: number;
        status: string;
        title: string;
        created_at: string;
        completed_at: string | null;
      }
    | undefined;

  if (!row) return null;

  return {
    id: row.id,
    userId: row.user_id,
    sessionId: row.session_id,
    templateId: row.template_id,
    status: row.status,
    title: row.title,
    createdAt: row.created_at,
    completedAt: row.completed_at
  };
}

export function userOwnsDocumentRun(userId: number, documentRunId: number) {
  const row = db.prepare(`
    SELECT 1
    FROM document_runs
    WHERE id = ? AND user_id = ?
  `).get(documentRunId, userId);

  return !!row;
}

export function upsertDocumentFieldValue(params: {
  documentRunId: number;
  fieldName: string;
  fieldValue: string | null;
  source?: string | null;
  confidence?: number | null;
}) {
  const updatedAt = new Date().toISOString();

  db.prepare(`
    INSERT INTO document_field_values (
      document_run_id,
      field_name,
      field_value,
      source,
      confidence,
      updated_at
    )
    VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT(document_run_id, field_name)
    DO UPDATE SET
      field_value = excluded.field_value,
      source = excluded.source,
      confidence = excluded.confidence,
      updated_at = excluded.updated_at
  `).run(
    params.documentRunId,
    params.fieldName,
    params.fieldValue,
    params.source ?? null,
    params.confidence ?? null,
    updatedAt
  );
}

export function getDocumentTemplateById(id: number): DocumentTemplate | null {
  const row = db.prepare(`
    SELECT id, code, name, description, schema_json, created_at
    FROM document_templates
    WHERE id = ?
  `).get(id) as
    | {
        id: number;
        code: string;
        name: string;
        description: string | null;
        schema_json: string;
        created_at: string;
      }
    | undefined;

  if (!row) return null;

  return {
    id: row.id,
    code: row.code,
    name: row.name,
    description: row.description,
    schemaJson: row.schema_json,
    createdAt: row.created_at
  };
}

export function updateDocumentRunStatus(params: {
  documentRunId: number;
  status: string;
  completedAt?: string | null;
}) {
  db.prepare(`
    UPDATE document_runs
    SET status = ?, completed_at = ?
    WHERE id = ?
  `).run(
    params.status,
    params.completedAt ?? null,
    params.documentRunId
  );
}

export function markDocumentRunFinalized(documentRunId: number) {
  const completedAt = new Date().toISOString();

  db.prepare(`
    UPDATE document_runs
    SET status = 'finalized', completed_at = ?
    WHERE id = ?
  `).run(completedAt, documentRunId);

  return completedAt;
}

export function listDocumentFieldValues(documentRunId: number): DocumentFieldValue[] {
  const rows = db.prepare(`
    SELECT id, document_run_id, field_name, field_value, source, confidence, updated_at
    FROM document_field_values
    WHERE document_run_id = ?
    ORDER BY field_name ASC
  `).all(documentRunId) as Array<{
    id: number;
    document_run_id: number;
    field_name: string;
    field_value: string | null;
    source: string | null;
    confidence: number | null;
    updated_at: string;
  }>;

  return rows.map((row) => ({
    id: row.id,
    documentRunId: row.document_run_id,
    fieldName: row.field_name,
    fieldValue: row.field_value,
    source: row.source,
    confidence: row.confidence,
    updatedAt: row.updated_at
  }));
}