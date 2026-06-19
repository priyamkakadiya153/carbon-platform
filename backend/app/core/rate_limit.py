"""
Rate limiting configuration using slowapi (Starlette-compatible wrapper for limits).

The limiter uses the client's real IP address as the rate-limit key.
Limits are defined as constants so routes can reference them by name.
"""

from __future__ import annotations

from slowapi import Limiter
from starlette.requests import Request


def get_proxy_aware_remote_address(request: Request) -> str:
    """Retrieve client remote IP address, parsing X-Forwarded-For if behind a proxy."""
    x_forwarded_for = request.headers.get("X-Forwarded-For")
    if x_forwarded_for:
        return x_forwarded_for.split(",")[0].strip()
    return request.client.host if request.client else "127.0.0.1"


# Shared limiter instance — must be attached to app.state.limiter in main.py
limiter = Limiter(key_func=get_proxy_aware_remote_address)

# Per-route rate limit strings (requests/minute)
CALCULATE_LIMIT = "30/minute"
INSIGHTS_LIMIT = "10/minute"
ENTRIES_LIMIT = "20/minute"
