import os
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from app.backend.main import app

client = TestClient(app)


class TestAuthStatus:
    def test_returns_auth_info(self):
        resp = client.get("/api/auth-status")
        assert resp.status_code == 200
        data = resp.json()
        assert "authenticated" in data

    def test_unauthenticated_when_no_storage(self, tmp_path, monkeypatch):
        monkeypatch.setattr(
            "app.backend.routes.STORAGE_STATE", tmp_path / "nonexistent.json"
        )
        resp = client.get("/api/auth-status")
        assert resp.status_code == 200
        assert resp.json()["authenticated"] is False


class TestUpload:
    def test_upload_file(self):
        resp = client.post(
            "/api/upload",
            files={"file": ("test.txt", b"hello world", "text/plain")},
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["original_name"] == "test.txt"
        assert data["size"] == 11
        # Cleanup
        Path(f"./uploads/{data['filename']}").unlink(missing_ok=True)

    def test_upload_preserves_extension(self):
        resp = client.post(
            "/api/upload",
            files={"file": ("document.pdf", b"%PDF-1.4", "application/pdf")},
        )
        data = resp.json()
        assert data["filename"].endswith("_document.pdf")
        Path(f"./uploads/{data['filename']}").unlink(missing_ok=True)


class TestGenerate:
    def test_rejects_empty_sources(self):
        resp = client.post(
            "/api/generate",
            json={
                "sources": [],
                "outputs": [{"output_type": "audio", "language": "en"}],
            },
        )
        assert resp.status_code == 400

    def test_rejects_empty_outputs(self):
        resp = client.post(
            "/api/generate",
            json={
                "sources": [{"type": "url", "value": "https://example.com"}],
                "outputs": [],
            },
        )
        assert resp.status_code == 400

    def test_creates_job(self):
        resp = client.post(
            "/api/generate",
            json={
                "sources": [{"type": "url", "value": "https://example.com"}],
                "outputs": [{"output_type": "audio", "language": "en"}],
            },
        )
        assert resp.status_code == 200
        assert "job_id" in resp.json()


class TestStatus:
    def test_not_found(self):
        resp = client.get("/api/status/nonexistent")
        assert resp.status_code == 404

    def test_returns_job_status(self):
        # Create a job first
        create = client.post(
            "/api/generate",
            json={
                "sources": [{"type": "url", "value": "https://example.com"}],
                "outputs": [{"output_type": "report", "language": "en"}],
            },
        )
        job_id = create.json()["job_id"]

        resp = client.get(f"/api/status/{job_id}")
        assert resp.status_code == 200
        data = resp.json()
        assert data["job_id"] == job_id
        assert "progress" in data
        assert "report" in data["progress"]


class TestDownload:
    def test_not_found_job(self):
        resp = client.get("/api/download/nonexistent/file.mp3")
        assert resp.status_code == 404

    def test_not_found_file(self, tmp_path):
        # Create output dir for a fake job but no file
        job_dir = Path("./output/fakejob123")
        job_dir.mkdir(parents=True, exist_ok=True)
        resp = client.get("/api/download/fakejob123/missing.mp3")
        assert resp.status_code == 404
        job_dir.rmdir()
