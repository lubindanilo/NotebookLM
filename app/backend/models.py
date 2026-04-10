from __future__ import annotations

from enum import Enum
from pydantic import BaseModel


class SourceType(str, Enum):
    URL = "url"
    YOUTUBE = "youtube"
    TEXT = "text"
    FILE = "file"
    DRIVE = "drive"


class OutputType(str, Enum):
    AUDIO = "audio"
    VIDEO = "video"
    CINEMATIC_VIDEO = "cinematic_video"
    SLIDES = "slides"
    QUIZ = "quiz"
    FLASHCARDS = "flashcards"
    MINDMAP = "mindmap"
    INFOGRAPHIC = "infographic"
    REPORT = "report"
    STUDY_GUIDE = "study_guide"
    DATA_TABLE = "data_table"


class SourceInput(BaseModel):
    type: SourceType
    value: str  # URL, text content, or uploaded filename
    title: str | None = None
    mime_type: str | None = None  # for drive sources
    file_id: str | None = None  # for drive sources


class OutputConfig(BaseModel):
    output_type: OutputType
    language: str = "en"
    instructions: str | None = None
    # Audio
    audio_format: str | None = None
    audio_length: str | None = None
    # Video
    video_format: str | None = None
    video_style: str | None = None
    # Report
    report_format: str | None = None
    custom_prompt: str | None = None
    extra_instructions: str | None = None
    # Quiz / Flashcards
    quiz_difficulty: str | None = None
    quiz_quantity: str | None = None
    # Infographic
    infographic_orientation: str | None = None
    infographic_detail: str | None = None
    infographic_style: str | None = None
    # Slides
    slide_format: str | None = None
    slide_length: str | None = None


class GenerateRequest(BaseModel):
    sources: list[SourceInput]
    outputs: list[OutputConfig]
    notebook_title: str | None = None


class FileInfo(BaseModel):
    filename: str
    output_type: str
    size: int


class JobStatusResponse(BaseModel):
    job_id: str
    status: str
    progress: dict[str, str]
    files: list[FileInfo]
    error: str | None = None
    elapsed: float | None = None


class AuthStatusResponse(BaseModel):
    authenticated: bool
    age_days: int | None = None
    warning: str | None = None
