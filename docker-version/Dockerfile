# Use official Python base
FROM python:3.13.3-alpine

# Environment
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Set working directory
WORKDIR /app

# System dependencies for compiling Flask extensions
RUN apk add --no-cache gcc musl-dev libffi-dev libgcc openssl-dev tzdata busybox-extras redis supervisor

# Set timezone to Europe/Oslo and sync time at container start
RUN cp /usr/share/zoneinfo/Europe/Oslo /etc/localtime && echo "Europe/Oslo" > /etc/timezone

# Install Python deps
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy app code
COPY . .

# Copy supervisord config
COPY supervisord.conf /etc/supervisord.conf

# Expose gunicorn port
EXPOSE 8000

# Start both redis-server og gunicorn/flask via supervisord
CMD ["supervisord", "-c", "/etc/supervisord.conf"]