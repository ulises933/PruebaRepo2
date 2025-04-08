import pytest
from datetime import datetime
from app.bussiness_logic.capturist_service import CapturistService, CapturistCreate, CapturistUpdate
from app.bussiness_logic.db_models import Capturist

@pytest.fixture
def capturist_service(db_session):
    return CapturistService(db_session)

@pytest.fixture
def sample_capturist_data():
    return {
        "full_name": "John Doe",
        "email": "john.doe@example.com",
        "payroll_number": "P123",
        "personnel_number": "EMP456",
        "company_code": "COMP789"
    }

def test_create_capturist(capturist_service, sample_capturist_data):
    # Arrange
    capturist_create = CapturistCreate(**sample_capturist_data)
    user_mod = "test_user"

    # Act
    created_capturist = capturist_service.create_capturist(capturist_create, user_mod)

    # Assert
    assert created_capturist.full_name == sample_capturist_data["full_name"]
    assert created_capturist.email == sample_capturist_data["email"]
    assert created_capturist.payroll_number == sample_capturist_data["payroll_number"]
    assert created_capturist.personnel_number == sample_capturist_data["personnel_number"]
    assert created_capturist.company_code == sample_capturist_data["company_code"]
    assert created_capturist.is_active == True
    assert created_capturist.created_by == user_mod
    assert created_capturist.modified_by == user_mod

def test_update_capturist(capturist_service, sample_capturist_data):
    # Arrange
    capturist_create = CapturistCreate(**sample_capturist_data)
    user_mod = "test_user"
    created_capturist = capturist_service.create_capturist(capturist_create, user_mod)

    # Modify data for update
    updated_data = sample_capturist_data.copy()
    updated_data["full_name"] = "Jane Doe"
    updated_data["email"] = "jane.doe@example.com"
    updated_data["is_active"] = False
    updated_data["id"] = created_capturist.id

    capturist_update = CapturistUpdate(**updated_data)

    # Act
    updated_capturist = capturist_service.update_capturist(
        created_capturist.id, 
        capturist_update, 
        "update_user"
    )

    # Assert
    assert updated_capturist.full_name == "Jane Doe"
    assert updated_capturist.email == "jane.doe@example.com"
    assert updated_capturist.is_active == False
    assert updated_capturist.modified_by == "update_user"
    assert updated_capturist.created_by == "test_user"  # Should not change

def test_get_capturists(capturist_service, sample_capturist_data):
    # Arrange
    capturist_create = CapturistCreate(**sample_capturist_data)
    user_mod = "test_user"
    
    # Create two capturists, one active and one inactive
    active_capturist = capturist_service.create_capturist(capturist_create, user_mod)
    
    inactive_data = sample_capturist_data.copy()
    inactive_data["full_name"] = "Inactive User"
    inactive_data["email"] = "inactive@example.com"
    inactive_data["personnel_number"] = "EMP789"
    inactive_capturist = capturist_service.create_capturist(
        CapturistCreate(**inactive_data), 
        user_mod
    )
    
    # Make second capturist inactive
    update_data = inactive_data.copy()
    update_data["id"] = inactive_capturist.id
    update_data["is_active"] = False
    capturist_service.update_capturist(
        inactive_capturist.id,
        CapturistUpdate(**update_data),
        user_mod
    )

    # Act
    all_capturists = capturist_service.get_capturists(active_only=False)
    active_capturists = capturist_service.get_capturists(active_only=True)

    # Assert
    assert len(all_capturists) == 2
    assert len(active_capturists) == 1
    assert active_capturists[0].full_name == "John Doe"

def test_get_capturist(capturist_service, sample_capturist_data):
    # Arrange
    capturist_create = CapturistCreate(**sample_capturist_data)
    user_mod = "test_user"
    created_capturist = capturist_service.create_capturist(capturist_create, user_mod)

    # Act
    retrieved_capturist = capturist_service.get_capturist(created_capturist.id)
    non_existent_capturist = capturist_service.get_capturist(999999)

    # Assert
    assert retrieved_capturist is not None
    assert retrieved_capturist.id == created_capturist.id
    assert retrieved_capturist.email == sample_capturist_data["email"]
    assert retrieved_capturist.full_name == sample_capturist_data["full_name"]
    assert non_existent_capturist is None 