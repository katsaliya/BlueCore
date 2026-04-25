import os
import tempfile
from pathlib import Path
from dotenv import load_dotenv
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.responses import FileResponse
from faster_whisper import WhisperModel
import pyttsx3

load_dotenv()

HOST = os.getenv("HOST", "127.0.0.1")
PORT = int(os.getenv("PORT", "50055"))
WHISPER_MODEL = os.getenv("WHISPER_MODEL", "base")
WHISPER_DEVICE = os.getenv("WHISPER_DEVICE", "cpu")
WHISPER_COMPUTE_TYPE = os.getenv("WHISPER_COMPUTE_TYPE", "int8")

app = FastAPI(title="GreenWatch Voice Bridge")

stt_model = WhisperModel(
    WHISPER_MODEL,
    device=WHISPER_DEVICE,
    compute_type=WHISPER_COMPUTE_TYPE,
)

def synthesize_to_file(text: str, output_path: str) -> None:
    engine = pyttsx3.init()
    engine.setProperty("rate", 175)
    engine.save_to_file(text, output_path)
    engine.runAndWait()

@app.get("/health")
def health():
    return {
        "ok": True,
        "service": "greenwatch-voice-bridge",
        "host": HOST,
        "port": PORT,
        "model": WHISPER_MODEL,
    }

@app.post("/transcribe")
async def transcribe(file: UploadFile = File(...)):
    suffix = os.path.splitext(file.filename or "audio.wav")[1] or ".wav"

    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            contents = await file.read()
            tmp.write(contents)
            tmp_path = tmp.name

        segments, info = stt_model.transcribe(tmp_path)

        text_parts = []
        for segment in segments:
            text_parts.append(segment.text.strip())

        transcript = " ".join(part for part in text_parts if part).strip()

        return {
            "ok": True,
            "filename": file.filename,
            "language": getattr(info, "language", None),
            "duration": getattr(info, "duration", None),
            "text": transcript,
        }
    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))
    finally:
        try:
            if "tmp_path" in locals() and os.path.exists(tmp_path):
                os.remove(tmp_path)
        except Exception:
            pass

@app.post("/speak")
async def speak(payload: dict):
    text = str(payload.get("text", "")).strip()

    if not text:
      raise HTTPException(status_code=400, detail="Missing text")

    try:
        out_dir = Path(tempfile.gettempdir()) / "greenwatch-tts"
        out_dir.mkdir(parents=True, exist_ok=True)

        out_path = out_dir / f"reply-{os.getpid()}.wav"
        synthesize_to_file(text, str(out_path))

        if not out_path.exists():
            raise RuntimeError("TTS output file was not created")

        return FileResponse(
            path=str(out_path),
            media_type="audio/wav",
            filename="reply.wav",
        )
    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))