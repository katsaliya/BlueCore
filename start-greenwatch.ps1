$root = "C:\Users\arman\Desktop\GreenWatch"

Write-Host "Starting GreenWatch..." -ForegroundColor Cyan

Write-Host "Starting Docker VectorAI DB..." -ForegroundColor Yellow
docker start greenwatch-vectorai-latest | Out-Null

Write-Host "Checking Ollama..." -ForegroundColor Yellow
try {
    Invoke-RestMethod http://127.0.0.1:11434/api/tags | Out-Null
    Write-Host "Ollama is running on 11434" -ForegroundColor Green
} catch {
    Write-Host "Ollama is not reachable on 11434" -ForegroundColor Red
}

Write-Host "Starting backend-ts on 8080..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd `"$root\services\backend-ts`"; npm run dev"

Write-Host "Starting vectorai-bridge-py on 50054..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd `"$root\services\vectorai-bridge-py`"; .\.venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 50054 --reload"

Write-Host "Starting voice-bridge-py on 50055..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd `"$root\services\voice-bridge-py`"; .\.venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 50055 --reload"

Write-Host "Starting ui-test on 5173..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd `"$root\services\ui-test`"; npm run dev"

Write-Host "GreenWatch startup commands launched." -ForegroundColor Green
Write-Host "Ports:" -ForegroundColor Cyan
Write-Host "  backend:              http://127.0.0.1:8080"
Write-Host "  vectorai bridge:      http://127.0.0.1:50054"
Write-Host "  voice bridge:         http://127.0.0.1:50055"
Write-Host "  ui:                   http://127.0.0.1:5173"
Write-Host "  ollama:               http://127.0.0.1:11434"
Write-Host "  vector db host port:  127.0.0.1:50053"