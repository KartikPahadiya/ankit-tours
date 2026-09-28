from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.booking_request import BookingRequest
from app.models.user import User
from app.schemas.booking_request import (
    BookingRequestResponse,
    CreateBookingRequestRequest,
)
from app.services import request_service


router = APIRouter(
    prefix="/api/requests",
    tags=["Booking Requests"],
)


def to_response(
    request: BookingRequest,
) -> dict:
    """Serialize a request, surfacing accepted-but-past-deadline
    requests as expired."""

    status = request_service.effective_status(request)

    return {
        "id": request.id,
        "request_reference": request.request_reference,
        "type": request.type,
        "item_id": request.item_id,
        "item_name": request.item_name,
        "check_in": request.check_in,
        "check_out": request.check_out,
        "rooms": request.rooms,
        "status": status,
        "amount": (
            float(request.amount)
            if request.amount is not None
            else None
        ),
        "admin_note": request.admin_note,
        "expires_at": request.expires_at,
        "created_at": request.created_at,
    }


@router.post(
    "",
    response_model=BookingRequestResponse,
    status_code=201,
)
def create_request(
    data: CreateBookingRequestRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a booking request (stay/safari/package). Retries
    reuse the user's still-live request for the same item+dates."""

    try:
        request = request_service.create_request(
            db=db,
            user=current_user,
            request_type=data.type,
            item_id=data.item_id,
            check_in=data.check_in,
            check_out=data.check_out,
            rooms=data.rooms,
        )

        return to_response(request)

    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        )


@router.get(
    "/my",
    response_model=list[BookingRequestResponse],
)
def my_requests(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    requests = request_service.list_user_requests(
        db=db,
        user_id=current_user.id,
    )

    return [to_response(request) for request in requests]


@router.get(
    "/{request_id}",
    response_model=BookingRequestResponse,
)
def get_request(
    request_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    request = (
        db.query(BookingRequest)
        .filter(
            BookingRequest.id == request_id,
            BookingRequest.user_id == current_user.id,
        )
        .first()
    )

    if not request:
        raise HTTPException(
            status_code=404,
            detail="Request not found.",
        )

    return to_response(request)
