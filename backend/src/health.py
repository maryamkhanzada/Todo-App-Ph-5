"""
Health check endpoint for the backend application.
This endpoint is used by Kubernetes to check the health of the application.
"""
from fastapi import APIRouter

router = APIRouter()

@router.get("/health")
def health_check():
    """
    Health check endpoint to verify the application is running.
    """
    return {"status": "healthy", "service": "todo-backend"}