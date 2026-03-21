from pydantic import BaseModel


class CardResponse(BaseModel):
    type: str
    last4: str
    status: str


class AccountResponse(BaseModel):
    id: str
    name: str
    email: str
    account_number: str
    tier: str
    balance: float
    currency: str
    monthly_change: float
    join_date: str
    cards: list[CardResponse]
