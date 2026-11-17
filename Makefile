.PHONY: help install train test lint typecheck ci dev build-docker run-docker clean

PYTHON ?= python

help:
	@echo "Synapse-Voice Makefile commands:"
	@echo "  make install     - Install Python dependencies"
	@echo "  make train       - Train and evaluate ML models with subject-grouped CV"
	@echo "  make test        - Run test suite with pytest"
	@echo "  make lint        - Run ruff linter"
	@echo "  make typecheck   - Run mypy type checker"
	@echo "  make ci          - Run lint, typecheck, and tests"
	@echo "  make dev         - Start local FastAPI backend"
	@echo "  make build-docker - Build backend and frontend docker images"
	@echo "  make clean       - Remove cached files and test artifacts"

install:
	$(PYTHON) -m pip install -r backend/requirements.txt
	$(PYTHON) -m pip install -r ml/requirements.txt

train:
	$(PYTHON) ml/src/train.py

test:
	$(PYTHON) -m pytest backend/tests ml/tests -v

lint:
	$(PYTHON) -m ruff check backend ml rag reproduction

typecheck:
	$(PYTHON) -m mypy backend/app ml/src --ignore-missing-imports

ci: lint typecheck test

dev:
	$(PYTHON) -m uvicorn backend.app.main:app --reload --port 8000

clean:
	find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
	find . -type f -name "*.pyc" -delete 2>/dev/null || true
	rm -rf .pytest_cache .mypy_cache .ruff_cache
