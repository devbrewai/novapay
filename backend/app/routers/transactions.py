import json
from pathlib import Path

from fastapi import APIRouter

from app.models import TransactionResponse

router = APIRouter()

_DATA_PATH = Path(__file__).resolve().parent.parent / "data" / "transactions.json"
_transactions_data: list[TransactionResponse] | None = None


def _load_transactions() -> list[TransactionResponse]:
    global _transactions_data  # noqa: PLW0603
    if _transactions_data is None:
        raw = json.loads(_DATA_PATH.read_text())
        _transactions_data = [TransactionResponse(**t) for t in raw]
    return _transactions_data


@router.get("/transactions")
async def get_transactions() -> list[TransactionResponse]:
    return _load_transactions()
