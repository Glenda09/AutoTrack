"""AutoTrack backend package."""

from importlib import metadata


def get_version() -> str:
    try:
        return metadata.version("autotrack-backend")
    except metadata.PackageNotFoundError:
        return "0.1.0"
