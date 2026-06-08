# Portable container for the RecallOps Cortex API.
# Runs free (no card) on Hugging Face Spaces; also works on Render / Fly / Cloud Run.
FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
# HF Spaces expects 7860; other hosts inject $PORT.
ENV PORT=7860
EXPOSE 7860
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-7860}"]
