from fastapi import APIRouter

router = APIRouter()


@router.get("/account")
async def get_account() -> dict[str, str]:
    return {"message": "Account endpoint — not yet implemented"}
