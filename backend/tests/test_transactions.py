from fastapi.testclient import TestClient


def test_transactions_returns_list(client: TestClient) -> None:
    response = client.get("/api/transactions")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 40


def test_transaction_has_required_fields(client: TestClient) -> None:
    response = client.get("/api/transactions")
    txn = response.json()[0]
    assert "id" in txn
    assert "date" in txn
    assert "merchant" in txn
    assert "amount" in txn
    assert "category" in txn
    assert "status" in txn
