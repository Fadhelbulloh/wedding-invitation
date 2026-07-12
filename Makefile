.PHONY: help install dev build start test lint clean deploy backup tokens

# Default target
help:
	@echo "Wedding Invitation - Available commands:"
	@echo ""
	@echo "  make install       - Install dependencies"
	@echo "  make dev          - Start development server"
	@echo "  make build        - Build production bundle"
	@echo "  make start        - Start production server"
	@echo "  make test         - Run tests"
	@echo "  make typecheck    - Run TypeScript type checking"
	@echo "  make lint         - Run all checks (typecheck + tests)"
	@echo "  make clean        - Remove build artifacts and dependencies"
	@echo "  make tokens N=5   - Generate N guest tokens (default: 5)"
	@echo "  make backup       - Backup data directory to ./backup/"
	@echo "  make setup-env    - Copy .env.example to .env.local"
	@echo "  make deploy       - Build and show deploy instructions"
	@echo ""

# Install dependencies
install:
	npm install

# Development
dev:
	npm run dev

# Build
build:
	npm run build

# Start production server
start:
	npm run start

# Run tests
test:
	node --test src/lib/guests.test.ts src/lib/storage.test.ts

# TypeScript type checking
typecheck:
	npx tsc --noEmit

# Run all checks
lint: typecheck test
	@echo "✓ All checks passed"

# Clean build artifacts
clean:
	rm -rf .next
	rm -rf node_modules
	rm -rf data/*.json
	@echo "✓ Cleaned build artifacts"

# Generate guest tokens
N ?= 5
tokens:
	@echo "Generating $(N) guest tokens:"
	@for i in $$(seq 1 $(N)); do \
		echo "  $$(openssl rand -hex 8)"; \
	done

# Backup data directory
BACKUP_DIR := ./backup/$$(date +%Y%m%d-%H%M%S)
backup:
	@mkdir -p $(BACKUP_DIR)
	@if [ -d data ]; then \
		cp -r data $(BACKUP_DIR)/; \
		echo "✓ Data backed up to $(BACKUP_DIR)"; \
	else \
		echo "✗ No data directory found"; \
		exit 1; \
	fi

# Setup environment
setup-env:
	@if [ ! -f .env.local ]; then \
		cp .env.example .env.local; \
		echo "✓ Created .env.local from .env.example"; \
		echo "⚠  Remember to set ADMIN_PASSWORD in .env.local"; \
	else \
		echo "✗ .env.local already exists"; \
	fi

# Deploy instructions
deploy: build
	@echo ""
	@echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
	@echo "Build complete! Ready to deploy."
	@echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
	@echo ""
	@echo "Pre-deployment checklist:"
	@echo "  ☐ Edit src/content/invitation.ts (names, dates, venue)"
	@echo "  ☐ Add images to public/gallery/"
	@echo "  ☐ Generate tokens: make tokens N=<number_of_guests>"
	@echo "  ☐ Create data/guests.json on VPS: {\"token\": \"Guest Name\"}"
	@echo "  ☐ Set ADMIN_PASSWORD and DATA_DIR on VPS"
	@echo ""
	@echo "Deploy to VPS:"
	@echo "  1. rsync -avz --exclude node_modules --exclude .git --exclude data . user@vps:/path/to/app"
	@echo "  2. ssh user@vps 'cd /path/to/app && npm ci && npm run build'"
	@echo "  3. Set up process manager (pm2/systemd) to run: npm start"
	@echo "  4. Configure reverse proxy (nginx/caddy) with HTTPS"
	@echo ""
	@echo "Guest links: https://your-domain/i/<token>"
	@echo "Admin: https://your-domain/admin"
	@echo ""
