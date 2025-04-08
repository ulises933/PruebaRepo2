import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient
from app.bussiness_logic.endpoints import business_logic_router
from app.bussiness_logic.capturist_service import CapturistService
from app.bussiness_logic.dependencies import get_capturist_service
from app.bussiness_logic.db_models import Capturist

@pytest.fixture
def app(db_session):
    app = FastAPI()
    app.include_router(business_logic_router)
    
    def get_test_capturist_service():
        return CapturistService(db_session)
    
    app.dependency_overrides[get_capturist_service] = get_test_capturist_service
    return app

@pytest.fixture
def client(app):
    return TestClient(app)

@pytest.fixture
def db_session_for_test(db_session):
    # This gives us access to the session in our tests
    return db_session

@pytest.fixture
def sample_capturist_data():
    return {
        "full_name": "John Doe",
        "email": "john.doe@example.com",
        "payroll_number": "P123",
        "personnel_number": "EMP456",
        "company_code": "COMP789"
    }

def test_create_capturist(client, sample_capturist_data, db_session_for_test):
    # Arrange
    user_mod = "test_user"
    initial_count = db_session_for_test.query(Capturist).count()

    # Act
    response = client.post(
        "/capturist",
        json=sample_capturist_data,
        params={"user_mod": user_mod}
    )

    # Assert API response
    assert response.status_code == 200
    data = response.json()
    assert "data" in data
    assert "returnData" in data["data"]
    assert data["data"]["returnData"]["full_name"] == sample_capturist_data["full_name"]
    assert data["data"]["returnData"]["email"] == sample_capturist_data["email"]
    assert data["data"]["returnData"]["is_active"] == True
    
    # Assert database state
    new_count = db_session_for_test.query(Capturist).count()
    assert new_count == initial_count + 1
    
    created_capturist = db_session_for_test.query(Capturist).filter_by(
        personnel_number=sample_capturist_data["personnel_number"]
    ).first()
    assert created_capturist is not None
    assert created_capturist.email == sample_capturist_data["email"]
    assert created_capturist.created_by == user_mod
    
    return data["data"]["returnData"]

def test_update_capturist(client, sample_capturist_data, db_session_for_test):
    # Arrange
    user_mod = "test_user"
    created_capturist = test_create_capturist(client, sample_capturist_data, db_session_for_test)
    
    # Prepare update data
    update_data = sample_capturist_data.copy()
    update_data["full_name"] = "Jane Doe"
    update_data["is_active"] = False
    update_data["id"] = created_capturist["id"]

    # Act
    response = client.patch(
        f"/capturist/{created_capturist['id']}",
        json=update_data,
        params={"user_mod": "update_user"}
    )

    # Assert API response
    assert response.status_code == 200
    data = response.json()
    assert "data" in data
    assert "returnData" in data["data"]
    
    # Assert database state
    updated_capturist = db_session_for_test.query(Capturist).get(created_capturist["id"])
    assert updated_capturist is not None
    assert updated_capturist.full_name == "Jane Doe"
    assert updated_capturist.is_active == False
    assert updated_capturist.modified_by == "update_user"
    assert updated_capturist.created_by == user_mod  # Original creator shouldn't change

def test_get_capturists(client, sample_capturist_data, db_session_for_test):
    # Arrange
    user_mod = "test_user"
    
    # Create active capturist
    test_create_capturist(client, sample_capturist_data, db_session_for_test)
    
    # Create and deactivate second capturist
    inactive_data = sample_capturist_data.copy()
    inactive_data["full_name"] = "Inactive User"
    inactive_data["personnel_number"] = "EMP789"  # Need unique personnel number
    inactive_capturist = test_create_capturist(client, inactive_data, db_session_for_test)
    
    # Make second capturist inactive
    update_data = inactive_data.copy()
    update_data["id"] = inactive_capturist["id"]
    update_data["is_active"] = False
    client.patch(
        f"/capturist/{inactive_capturist['id']}",
        json=update_data,
        params={"user_mod": user_mod}
    )

    # Assert database state before API call
    total_capturists = db_session_for_test.query(Capturist).count()
    active_capturists_count = db_session_for_test.query(Capturist).filter_by(is_active=True).count()
    assert total_capturists == 2
    assert active_capturists_count == 1

    # Act
    active_response = client.get("/capturists", params={"active_only": True})
    all_response = client.get("/capturists", params={"active_only": False})

    # Assert API response
    assert active_response.status_code == 200
    assert all_response.status_code == 200
    
    active_data = active_response.json()
    all_data = all_response.json()
    
    assert len(active_data["data"]["returnData"]) == active_capturists_count
    assert len(all_data["data"]["returnData"]) == total_capturists

def test_delete_capturist_maintains_record(client, sample_capturist_data, db_session_for_test):
    """Test that deactivating a capturist doesn't delete the database record"""
    # Arrange
    created_capturist = test_create_capturist(client, sample_capturist_data, db_session_for_test)
    initial_count = db_session_for_test.query(Capturist).count()
    
    # Act - Deactivate the capturist
    update_data = sample_capturist_data.copy()
    update_data["id"] = created_capturist["id"]
    update_data["is_active"] = False
    response = client.patch(
        f"/capturist/{created_capturist['id']}",
        json=update_data,
        params={"user_mod": "test_user"}
    )
    
    # Assert
    final_count = db_session_for_test.query(Capturist).count()
    assert final_count == initial_count  # Record should still exist
    
    deactivated_capturist = db_session_for_test.query(Capturist).get(created_capturist["id"])
    assert deactivated_capturist is not None
    assert deactivated_capturist.is_active == False 