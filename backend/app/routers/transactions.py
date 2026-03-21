from fastapi import APIRouter

router = APIRouter()


@router.get("/transactions")
async def get_transactions() -> dict[str, str]:
    return {"message": "Transactions endpoint — not yet implemented"}
