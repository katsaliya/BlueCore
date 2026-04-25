"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.transcribeAudioFile = transcribeAudioFile;
exports.synthesizeSpeech = synthesizeSpeech;
const fs_1 = __importDefault(require("fs"));
const env_1 = require("../config/env");
async function transcribeAudioFile(filePath, filename, mimeType) {
    const buffer = await fs_1.default.promises.readFile(filePath);
    const blob = new Blob([buffer], {
        type: mimeType || "application/octet-stream"
    });
    const form = new FormData();
    form.append("file", blob, filename);
    const response = await fetch(`${env_1.env.VOICE_BRIDGE_BASE_URL}/transcribe`, {
        method: "POST",
        body: form
    });
    if (!response.ok) {
        const text = await response.text();
        throw new Error(`Voice bridge HTTP ${response.status}: ${text}`);
    }
    return (await response.json());
}
async function synthesizeSpeech(text) {
    const response = await fetch(`${env_1.env.VOICE_BRIDGE_BASE_URL}/speak`, {
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
