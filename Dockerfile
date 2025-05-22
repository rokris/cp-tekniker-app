# Use official Python base
FROM python:3.13.3-alpine

# Environment
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV FLASK_ENV=production

# Set working directory
WORKDIR /app

# Legg til PYTHONPATH slik at src/functions er på import-sti
ENV PYTHONPATH=/app/src

# System dependencies for compiling Flask extensions
RUN apk add --no-cache \
    build-base \    
    gcc \
    musl-dev \
    libffi-dev \
    libgcc \
    linux-headers \
    openssl-dev \
    tzdata \
    busybox-extras \
    redis \
    supervisor \
    && pip install --no-cache-dir --upgrade pip

# Set timezone to Europe/Oslo and sync time at container start
RUN cp /usr/share/zoneinfo/Europe/Oslo /etc/localtime && echo "Europe/Oslo" > /etc/timezone

# Install Python deps
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy app code
COPY . .

# Copy supervisord config
COPY supervisord.conf /etc/supervisord.conf

EXPOSE 8000

CMD ["supervisord", "-c", "/etc/supervisord.conf"]
