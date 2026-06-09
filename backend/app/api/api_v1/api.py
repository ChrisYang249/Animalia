from fastapi import APIRouter
from app.api.api_v1.endpoints import auth, users, dashboard, clients, products, applications, cats

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(clients.router, prefix="/clients", tags=["clients"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])
api_router.include_router(products.router, prefix="/products", tags=["orders"])
api_router.include_router(applications.router, prefix="/applications", tags=["applications"])
api_router.include_router(cats.router, prefix="/cats", tags=["cats"])
