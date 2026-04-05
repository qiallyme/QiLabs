"""Pipeline state machine — validates and enforces state transitions."""

from __future__ import annotations

import logging

from .models import PipelineState, VALID_TRANSITIONS

log = logging.getLogger(__name__)


class InvalidTransitionError(Exception):
    """Raised when a state transition is not allowed."""


def validate_transition(current: PipelineState, target: PipelineState) -> bool:
    """Return True if transition from *current* to *target* is valid."""
    return target in VALID_TRANSITIONS.get(current, set())


def advance(current: PipelineState, target: PipelineState) -> PipelineState:
    """Advance state, raising on invalid transition."""
    if not validate_transition(current, target):
        raise InvalidTransitionError(
            f"Cannot transition from {current.value!r} to {target.value!r}"
        )
    return target


def on_failure(current: PipelineState) -> PipelineState:
    """Standard failure transition — always moves to FAILED."""
    return PipelineState.FAILED


def retry(current: PipelineState) -> PipelineState:
    """Reset a FAILED record back to DETECTED for re-processing."""
    if current != PipelineState.FAILED:
        raise InvalidTransitionError(
            f"Can only retry from 'failed', got {current.value!r}"
        )
    return PipelineState.DETECTED
