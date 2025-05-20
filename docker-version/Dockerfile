# Use official Python base
FROM python:3.13.3-alpine

# Environment
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Set working directory
WORKDIR /app

# System dependencies for compiling Flask extensions
RUN apk add --no-cache gcc musl-dev libffi-dev libgcc openssl-dev tzdata busybox-extras

# Set timezone to Europe/Oslo and sync time at container start
RUN cp /usr/share/zoneinfo/Europe/Oslo /etc/localtime && echo "Europe/Oslo" > /etc/timezone

# Install Python deps
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy app code
COPY . .

# Expose gunicorn port
EXPOSE 8000

# Run using Gunicorn (production server) and sync time before start
CMD ["sh", "-c", "ntpd -d -q -n -p pool.ntp.org && gunicorn -w 4 -b 0.0.0.0:8000 app:app"]