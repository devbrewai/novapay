import json
from pathlib import Path

from fastapi import APIRouter

from app.models import AccountResponse

router = APIRouter()

_DATA_PATH = Path(__file__).resolve().parent.parent / "data" / "account.json"
_account_data: AccountResponse | None = None


def _load_account() -> AccountResponse:
    global _account_data  # noqa: PLW0603
    if _account_data is None:
        raw = json.loads(_DATA_PATH.read_text())
        _account_data = AccountResponse(**raw)
    return _account_data


@router.get("/account")
async def get_account() -> AccountResponse:
    return _load_account()
