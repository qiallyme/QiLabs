# Makefile for QiArchive Operations

.PHONY: up down restart ps logs shell seed ingest review prune backup help

# --- Infrastructure ---
up:
	docker-compose up -d

down:
	docker-compose down

restart:
	docker-compose restart

ps:
	docker-compose ps

logs:
	docker-compose logs -f

# --- Processing (Python Scripts) ---
ingest:
	@echo "Running ingestion pipeline..."
	python3 scripts/ingest/main.py

review:
	@echo "Checking review queue..."
	ls -lh data/10_REVIEW/

prune:
	@echo "Cleaning quarantine folder..."
	rm -rf data/20_QUARANTINE/*

# --- Data Seeding ---
seed:
	@echo "Seeding Paperless with tags/correspondents..."
	python3 scripts/ops/seed_metadata.py

# --- Backup ---
backup:
	@echo "Compressing and archiving manifests and config..."
	tar -czf data/30_EXPORTS/backup_manifests_$(shell date +%Y%m%d).tar.gz data/90_MANIFESTS/ config/

# --- Utilities ---
shell:
	docker-compose exec paperless bash

help:
	@echo "Main Targets:"
	@echo "  up        Start infrastructure (Docker)"
	@echo "  ingest    Process files in data/00_INBOX/"
	@echo "  seed      Apply tags/correspondent seeds from config/"
	@echo "  backup    Archive critical manifest/config data"
	@echo "  logs      Show container logs"
