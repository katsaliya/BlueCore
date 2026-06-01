import PDFDocument = require("pdfkit");

type PdfField = {
  name: string;
  label: string;
  type: string;
  required: boolean;
  value: string | null;
};

export async function generatePlaceholderDocumentPdf(params: {
  title: string;
  templateName: string;
  outputMode: "draft" | "final";
  completionPercent: number;
  missingRequiredFields: string[];
  fields: PdfField[];
}) {
  return new Promise<Buffer>((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      margin: 50
    });

    const chunks: Buffer[] = [];

    doc.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    doc.fontSize(20).text("BlueCore Document Output", { align: "center" });
    doc.moveDown(0.5);
    doc.fontSize(16).text(params.title, { align: "center" });
    doc.moveDown(0.25);
    doc.fontSize(11).text(`Template: ${params.templateName}`, { align: "center" });
    doc.text(`Mode: ${params.outputMode.toUpperCase()}`, { align: "center" });
    doc.text(`Completion: ${params.completionPercent}%`, { align: "center" });
    doc.moveDown();

    if (params.outputMode === "draft") {
      doc
        .fontSize(12)
        .text("DRAFT DOCUMENT - values may still be incomplete.", {
          align: "center"
        });
      doc.moveDown();
    }

    if (params.missingRequiredFields.length > 0) {
      doc.fontSize(12).text("Missing required fields:", { underline: true });
      doc.moveDown(0.3);
      for (const field of params.missingRequiredFields) {
        doc.fontSize(11).text(`- ${field}`);
      }
      doc.moveDown();
    }

    doc.fontSize(12).text("Document fields", { underline: true });
    doc.moveDown(0.5);

    for (const field of params.fields) {
      const displayValue =
        field.value && field.value.trim().length > 0
          ? field.value
          : field.required
          ? "[MISSING REQUIRED VALUE]"
          : "[blank]";

      doc.fontSize(11).text(`${field.label}:`, { continued: true });
      doc.fontSize(11).text(` ${displayValue}`);
      doc.moveDown(0.35);
    }

    doc.moveDown();
    doc
      .fontSize(10)
      .text(`Generated at: ${new Date().toISOString()}`, { align: "right" });

    doc.end();
  });
}