from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.api import deps
from app.models import User, Client, DeletionLog
from app.schemas.client import Client as ClientSchema, ClientCreate, ClientUpdate

router = APIRouter()


@router.get("/", response_model=List[ClientSchema])
def read_clients(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    clients = db.query(Client).offset(skip).limit(limit).all()
    return clients


@router.post("/", response_model=ClientSchema)
def create_client(
    *,
    db: Session = Depends(deps.get_db),
    client_in: ClientCreate,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    if client_in.email:
        existing_client = db.query(Client).filter(Client.email == client_in.email).first()
        if existing_client:
            raise HTTPException(
                status_code=400,
                detail="Client with this email already exists",
            )

    client = Client(
        name=client_in.name,
        email=client_in.email,
        phone=client_in.phone,
        created_by_id=current_user.id,
    )
    db.add(client)
    db.commit()
    db.refresh(client)
    return client


@router.get("/{client_id}", response_model=ClientSchema)
def read_client(
    *,
    db: Session = Depends(deps.get_db),
    client_id: int,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    client = db.query(Client).filter(Client.id == client_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    return client


@router.put("/{client_id}", response_model=ClientSchema)
def update_client(
    *,
    db: Session = Depends(deps.get_db),
    client_id: int,
    client_in: ClientUpdate,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    client = db.query(Client).filter(Client.id == client_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")

    update_data = client_in.dict(exclude_unset=True)

    if "email" in update_data and update_data["email"]:
        existing_client = (
            db.query(Client)
            .filter(Client.email == update_data["email"], Client.id != client_id)
            .first()
        )
        if existing_client:
            raise HTTPException(
                status_code=400,
                detail="Client with this email already exists",
            )

    for field, value in update_data.items():
        setattr(client, field, value)

    client.updated_at = func.now()
    db.add(client)
    db.commit()
    db.refresh(client)
    return client


@router.delete("/{client_id}")
def delete_client(
    *,
    db: Session = Depends(deps.get_db),
    client_id: int,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    client = db.query(Client).filter(Client.id == client_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")

    deletion_log = DeletionLog(
        table_name="clients",
        record_id=client_id,
        deleted_by_id=current_user.id,
        record_data={
            "name": client.name,
            "email": client.email,
            "phone": client.phone,
        },
    )
    db.add(deletion_log)

    db.delete(client)
    db.commit()
    return {"message": "Client deleted successfully"}
