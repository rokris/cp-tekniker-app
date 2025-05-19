# Use official Python base
FROM python:3.13.3-alpine

# Environment
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Set working directory
WORKDIR /app

# System dependencies for compiling Flask extensions
RUN apk add --no-cache gcc musl-dev libffi-dev libgcc openssl-dev

# Install Python deps
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy app code
COPY . .

# Expose gunicorn port
EXPOSE 8000

# Run using Gunicorn (production server)
CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:8000", "app:app"]