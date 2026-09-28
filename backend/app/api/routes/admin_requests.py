from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_admin
from app.models.booking_request import BookingRequest
from app.models.user import User
from app.schemas.booking_request import (
    AcceptRequest,
    AdminBookingRequestResponse,
    MarkPaidRequest,
    RejectRequest,
    SetAmountRequest,
)
from app.services import request_service


router = APIRouter(
    prefix="/api/admin/requests",
    tags=["Admin — Booking Requests"],
)

VALID_STATUSES = {
    "requested",
    "accepted",
    "rejected",
    "expired",
    "paid",
}


def to_admin_response(
    request: BookingRequest,
) -> dict:
    status = request_service.effective_status(request)
    user = request.user

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
        "user_name": user.name if user else None,
        "user_email": user.email if user else None,
        "user_phone": user.phone if user else None,
    }


def get_or_404(
    db: Session,
    request_id: int,
) -> BookingRequest:
    request = (
        db.query(BookingRequest)
        .filter(BookingRequest.id == request_id)
        .first()
    )

    if not request:
        raise HTTPException(
            status_code=404,
            detail="Request not found.",
        )

    return request


@router.get(
    "",
    response_model=list[AdminBookingRequestResponse],
)
def list_requests(
    status: str | None = None,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    if status is not None and status not in VALID_STATUSES:
        raise HTTPException(
            status_code=400,
            detail=f"Status must be one of "
            f"{sorted(VALID_STATUSES)}.",
        )

    requests = request_service.list_all_requests(
        db=db,
        status=status,
    )

    return [
        to_admin_response(request)
        for request in requests
    ]


@router.post(
    "/{request_id}/accept",
    response_model=AdminBookingRequestResponse,
)
def accept(
    request_id: int,
    data: AcceptRequest,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin),
):
    request = get_or_404(db, request_id)

    try:
        request = request_service.accept_request(
            db=db,
            request=request,
            admin=current_admin,
            amount=data.amount,
            note=data.note,
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        )

    return to_admin_response(request)


@router.post(
    "/{request_id}/reject",
    response_model=AdminBookingRequestResponse,
)
def reject(
    request_id: int,
    data: RejectRequest,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin),
):
    request = get_or_404(db, request_id)

    try:
        request = request_service.reject_request(
            db=db,
            request=request,
            admin=current_admin,
            note=data.note,
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        )

    return to_admin_response(request)


@router.post(
    "/{request_id}/amount",
    response_model=AdminBookingRequestResponse,
)
def set_amount(
    request_id: int,
    data: SetAmountRequest,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    request = get_or_404(db, request_id)

    try:
        request = request_service.set_request_amount(
            db=db,
            request=request,
            amount=data.amount,
            note=data.note,
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        )

    return to_admin_response(request)


@router.post(
    "/{request_id}/mark-paid",
    response_model=AdminBookingRequestResponse,
)
def mark_paid(
    request_id: int,
    data: MarkPaidRequest,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin),
):
    """Record an offline payment (e.g. the customer paid Ankit
    directly over the WhatsApp chat)."""

    request = get_or_404(db, request_id)

    try:
        request = request_service.mark_request_paid(
            db=db,
            request=request,
            admin=current_admin,
            amount=data.amount,
            note=data.note,
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        )

    return to_admin_response(request)
