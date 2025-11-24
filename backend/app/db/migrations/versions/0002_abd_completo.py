"""ABD views, functions, procedures and triggers.

Revision ID: 0002_abd_completo
Revises: 0001_init
Create Date: 2025-11-24 10:00:00.000000
"""

from __future__ import annotations

from pathlib import Path
from typing import Iterable, Sequence, Union

from alembic import op

revision: str = "0002_abd_completo"
down_revision: Union[str, None] = "0001_init"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

SQL_DIR = Path(__file__).resolve().parents[4] / "sql"


def _split_sql_statements(sql_text: str) -> list[str]:
    """Handle MySQL DELIMITER directives and return discrete statements."""
    delimiter = ";"
    statements: list[str] = []
    buffer: list[str] = []

    for raw_line in sql_text.splitlines():
        stripped = raw_line.strip()
        if stripped.startswith("DELIMITER "):
            delimiter = stripped.split(" ", 1)[1]
            continue
        buffer.append(raw_line)
        if raw_line.rstrip().endswith(delimiter):
            statement = "\n".join(buffer).rstrip()
            statement = statement[: -len(delimiter)].rstrip()
            if statement:
                statements.append(statement)
            buffer = []

    if buffer:
        statement = "\n".join(buffer).strip()
        if statement:
            statements.append(statement)
    return statements


def _run_sql_file(filename: str) -> None:
    path = SQL_DIR / filename
    sql_text = path.read_text(encoding="utf-8")
    conn = op.get_bind()
    for statement in _split_sql_statements(sql_text):
        conn.exec_driver_sql(statement)


def upgrade() -> None:
    files: Iterable[str] = (
        "01_schema_patch.sql",
        "02_views.sql",
        "03_functions.sql",
        "04_procedures_simple.sql",
        "05_procedures_cursors.sql",
        "06_procedures_transactions.sql",
        "07_triggers.sql",
    )
    for sql_file in files:
        _run_sql_file(sql_file)


def downgrade() -> None:
    _run_sql_file("99_drop_abd_objects.sql")
