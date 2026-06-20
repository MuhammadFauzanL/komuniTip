FROM python:3.11-slim

# Set environment variables
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PORT=7860

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application files and model
COPY anti_obfuscation_detector.py .
COPY main.py .
COPY models/indobert_onnx/ models/indobert_onnx/

# Expose port untuk Hugging Face Spaces
EXPOSE 7860

# Jalankan Uvicorn di port 7860 (Standar Hugging Face)
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]
