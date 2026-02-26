# ============================================================================
# Hermes Agent - Railway Template Dockerfile
# Multi-stage build: Frontend (Node) -> Python deps -> Final image
# ============================================================================

# Stage 1: Build React frontend
FROM node:20-alpine AS frontend-builder

WORKDIR /build/frontend

COPY web/frontend/package*.json ./
RUN npm ci --no-audit --no-fund

COPY web/frontend/ ./
RUN npm run build


# Stage 2: Final image with Python + built frontend
FROM python:3.11-slim

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    git \
    curl \
    supervisor \
    chromium \
    chromium-driver \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js 20 for agent-browser
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y --no-install-recommends nodejs \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy Python dependency files
COPY pyproject.toml requirements.txt ./
COPY web/backend/requirements.txt ./web-requirements.txt

# Install Python dependencies
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -e ".[all]" && \
    pip install --no-cache-dir -r web-requirements.txt

# Copy Node.js dependency files and install
COPY package*.json ./
RUN npm ci --no-audit --no-fund --production 2>/dev/null || true

# Copy full application code
COPY . /app/

# Copy built frontend from stage 1
COPY --from=frontend-builder /build/frontend/dist /app/web/frontend/dist

# Copy Docker configuration
COPY docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf
COPY docker/entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

# Create data directories
RUN mkdir -p /app/data /app/data/logs /app/data/skills /var/log/supervisor

# Environment variables
ENV PYTHONUNBUFFERED=1
ENV PYTHONPATH=/app
ENV PORT=8000
ENV DATABASE_PATH=/app/data/hermes.db
ENV LOG_LEVEL=INFO

# Railway provides PORT env var
EXPOSE ${PORT}

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
    CMD curl -f http://localhost:${PORT}/api/health || exit 1

ENTRYPOINT ["/app/entrypoint.sh"]
