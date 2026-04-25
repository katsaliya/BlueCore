import fs from "fs";
import { env } from "../config/env";

export type VoiceTranscriptionResult = {
  ok: boolean;
  filename?: string;
  language?: string;
  duration?: number;
  text: string;
};

export async function transcribeAudioFile(
  filePath: string,
  filename: string,
  mimeType: string
): Promise<VoiceTranscriptionResult> {
  const buffer = await fs.promises.readFile(filePath);
  const blob = new Blob([buffer], {
    type: mimeType || "application/octet-stream"
  });

  const form = new FormData();
  form.append("file", blob, filename);

  const response = await fetch(`${env.VOICE_BRIDGE_BASE_URL}/transcribe`, {
    method: "POST",
    body: form
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Voice bridge HTTP ${response.status}: ${text}`);
  }

  return (await response.json()) as VoiceTranscriptionResult;
}

export async function synthesizeSpeech(text: string): Promise<Buffer> {
  const response = await fetch(`${env.VOICE_BRIDGE_BASE_URL}/speak`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ text })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Voice bridge HTTP ${response.status}: ${errorText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}