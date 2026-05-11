# Production Dockerfile for Paperless-ngx on Railway
FROM ghcr.io/paperless-ngx/paperless-ngx:latest

# Railway specific configuration
# Persistent data paths under the /paperless mount
ENV PAPERLESS_DATA_DIR=/paperless/data
ENV PAPERLESS_MEDIA_DIR=/paperless/media
ENV PAPERLESS_CONSUMPTION_DIR=/paperless/consume
ENV PAPERLESS_EXPORT_DIR=/paperless/export

# Default environment variables that should be overridden in Railway
# Database and Redis settings will come from Railway service variables
ENV PAPERLESS_REDIS=redis://broker:6379
ENV PAPERLESS_DBHOST=db
ENV PAPERLESS_PORT=8000

# Required directories under the volume mount
# Railway will attach the volume to /paperless
RUN mkdir -p /paperless/data /paperless/media /paperless/consume /paperless/export

# No custom entrypoint needed as the base image handles it
EXPOSE 8000
