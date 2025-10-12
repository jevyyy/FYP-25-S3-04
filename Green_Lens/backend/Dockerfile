# Use Python 3.10 base image
FROM python:3.10-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY src/ ./src/

# Copy model files from Green_Lens directory
# Note: You'll need to adjust this path based on your deployment structure
COPY ../Green_Lens/backend/src/ouput_model/ ./models/
COPY ../Green_Lens/backend/src/camera/ ./data/

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV PORT=5000
ENV MODEL_PATH=./models/flower_img_classifier.keras
ENV CLASS_NAMES_PATH=./data/class_names.json
ENV CLASS_DICT_PATH=./data/classes_to_name_dictionary.json

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD python -c "import requests; requests.get('http://localhost:5000/health')" || exit 1

# Run the application
CMD ["python", "src/app.py"]
