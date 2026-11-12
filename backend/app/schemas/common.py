"""Shared response models for list+payload endpoints."""

from typing import Generic, TypeVar

from pydantic import BaseModel

T = TypeVar("T")


class Error(BaseModel):
    """Consistent error body returned on failures."""

    detail: str


class ListResponse(BaseModel, Generic[T]):
    """Envelope for collection endpoints (allows adding pagination later)."""

    items: list[T]
