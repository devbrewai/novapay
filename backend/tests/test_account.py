from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_account_returns_ok() -> None:
    response = client.get("/api/account")
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Alex Rivera"
    assert data["balance"] == 12847.32
    assert data["tier"] == "Premium"
    assert isinstance(data["cards"], list)
    assert len(data["cards"]) == 2
