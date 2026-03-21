from pydantic import BaseModel


class TransactionResponse(BaseModel):
    id: str
    date: str
    merchant: str
    category: str
    amount: float
    status: str
    description: str
