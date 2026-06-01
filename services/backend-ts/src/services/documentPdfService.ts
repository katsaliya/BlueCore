import PDFDocument = require("pdfkit");
import puppeteer from "puppeteer";
import { renderEngineRoomLogHtml, renderOilRecordBookHtml } from "./formTemplates";

type PdfField = {
  name: string;
  label: string;
  type: string;
  required: boolean;
  value: string | null;
};

async function renderHtmlToPdf(html: string): Promise<Buffer> {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });
    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "0", right: "0", bottom: "0", left: "0" }
    });
    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
}

export async function generateDocumentPdf(params: {
  title: string;
  templateCode: string;
  templateName: string;
  outputMode: "draft" | "final";
  completionPercent: number;
  missingRequiredFields: string[];
  fields: PdfField[];
}): Promise<Buffer> {
  const fieldMap: Record<string, string> = {};
  for (const f of params.fields) {
    if (f.value) fieldMap[f.name] = f.value;
  }

  if (params.templateCode === "engine-room-log-v1") {
    const html = renderEngineRoomLogHtml(fieldMap, params.outputMode);
    return renderHtmlToPdf(html);
  }

  if (params.templateCode === "oil-record-book-v1") {
    const html = renderOilRecordBookHtml(fieldMap, params.outputMode);
    return renderHtmlToPdf(html);
  }

  return generateGenericPdf(params);
}

// Legacy alias — existing callers pass templateName not templateCode.
// Documents route has been updated to pass templateCode; this shim keeps any
// other caller working until they're updated.
export async function generatePlaceholderDocumentPdf(params: {
  title: string;
  templateName: string;
  outputMode: "draft" | "final";
  completionPercent: number;
  missingRequiredFields: string[];
  fields: PdfField[];
}): Promise<Buffer> {
  return generateGenericPdf(params);
}

async function generateGenericPdf(params: {
  title: string;
  templateName: string;
  outputMode: "draft" | "final";
  completionPercent: number;
  missingRequiredFields: string[];
  fields: PdfField[];
}): Promise<Buffer> {
  return new Promise<Buffer>((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 50 });
    const chunks: Buffer[] = [];
    doc.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    doc.fontSize(18).text("BlueCore Document Output", { align: "center" });
    doc.moveDown(0.5);
    doc.fontSize(14).text(params.title, { align: "center" });
    doc.moveDown(0.25);
    doc.fontSize(10)
      .text(`Template: ${params.templateName}`, { align: "center" })
      .text(`Mode: ${params.outputMode.toUpperCase()} · Completion: ${params.completionPercent}%`, { align: "center" });
    doc.moveDown();

    if (params.outputMode === "draft") {
      doc.fontSize(11).text("DRAFT — values may still be incomplete.", { align: "center" });
      doc.moveDown();
    }

    doc.fontSize(12).text("Document Fields", { underline: true });
    doc.moveDown(0.5);
    for (const field of params.fields) {
      const v = field.value?.trim() ? field.value : field.required ? "[MISSING]" : "[blank]";
      doc.fontSize(10).text(`${field.label}: `, { continued: true }).text(v);
      doc.moveDown(0.3);
    }

    doc.moveDown();
    doc.fontSize(9).text(`Generated: ${new Date().toISOString()}`, { align: "right" });
    doc.end();
  });
}
