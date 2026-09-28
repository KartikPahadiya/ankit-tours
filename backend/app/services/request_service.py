import secrets
from datetime import date, datetime, timedelta, timezone

from sqlalchemy import desc
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.booking_request import BookingRequest
from app.models.custom_plan import CustomPlan
from app.models.payment import Payment
from app.models.room import Room
from app.models.safari_config import SafariConfig
from app.models.stay import Stay
from app.models.tour_package import TourPackage
from app.models.user import User

from app.services.booking_service import (
    get_available_rooms,
    validate_dates,
)

from app.services.notification_service import (
    create_notification,
)
from app.services.notification_dispatcher import (
    dispatch_notification,
)


REQUEST_TYPE_LABELS = {
    "stay": "Stay",
    "safari": "Safari",
    "package": "Tour package",
    "custom": "Custom package",
}


def compute_default_amount(
    db: Session,
    request_type: str,
    item_id: int,
    check_in: date | None,
    check_out: date | None,
    rooms: int,
) -> float | None:
    """The payable amount for listed items is fixed by the
    price list — stays (per night × nights × rooms), safaris
    (per person × seats/rooms) and packages (listed price ×
    rooms). Only custom packages have no listed price, so
    their amount stays None until the admin sets one."""

    if request_type == "stay":
        room = (
            db.query(Room)
            .filter(Room.id == item_id)
            .first()
        )

        if not room or not check_in or not check_out:
            return None

        nights = (check_out - check_in).days

        return round(
            float(room.price_per_night)
            * nights
            * rooms,
            2,
        )

    if request_type == "safari":
        safari = (
            db.query(SafariConfig)
            .filter(SafariConfig.id == item_id)
            .first()
        )

        if not safari:
            return None

        return round(
            float(safari.price_per_person) * rooms,
            2,
        )

    if request_type == "package":
        package = (
            db.query(TourPackage)
            .filter(TourPackage.id == item_id)
            .first()
        )

        if not package:
            return None

        return round(float(package.price) * rooms, 2)

    # custom packages have no listed price
    return None


def resolve_item_name(
    db: Session,
    request_type: str,
    item_id: int,
) -> str:
    """Validate the item exists and return a display name snapshot."""

    if request_type == "stay":
        room = (
            db.query(Room)
            .filter(Room.id == item_id)
            .first()
        )

        if not room:
            raise ValueError("Room not found.")

        stay = db.query(Stay).filter(
            Stay.id == room.stay_id
        ).first()

        stay_name = stay.name if stay else "Stay"

        return f"{stay_name} — {room.name}"

    if request_type == "safari":
        safari = (
            db.query(SafariConfig)
            .filter(SafariConfig.id == item_id)
            .first()
        )

        if not safari:
            raise ValueError("Safari option not found.")

        return (
            f"{safari.vehicle_type} Safari "
            f"({safari.shift} shift)"
        )

    if request_type == "package":
        package = (
            db.query(TourPackage)
            .filter(TourPackage.id == item_id)
            .first()
        )

        if not package:
            raise ValueError("Tour package not found.")

        return package.title

    if request_type == "custom":
        plan = (
            db.query(CustomPlan)
            .filter(CustomPlan.id == item_id)
            .first()
        )

        if not plan:
            raise ValueError("Custom plan not found.")

        return f"Custom Package Plan #{plan.id}"

    raise ValueError("Unsupported request type.")


def is_expired(
    request: BookingRequest,
    now: datetime,
) -> bool:
    expires_at = request.expires_at

    if request.status != "accepted":
        return False

    if expires_at is None:
        return False

    # SQLite stores datetimes without tzinfo; treat naive
    # values as UTC so the comparison never crashes.
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(
            tzinfo=timezone.utc
        )

    return expires_at < now


def effective_status(
    request: BookingRequest,
    now: datetime | None = None,
) -> str:
    now = now or datetime.now(timezone.utc)

    if is_expired(request, now):
        return "expired"

    return request.status


def create_request(
    db: Session,
    user: User,
    request_type: str,
    item_id: int,
    check_in: date | None,
    check_out: date | None,
    rooms: int,
) -> BookingRequest:
    """Create a booking request, reusing the user's still-live
    request for the same item and dates instead of stacking
    duplicates."""

    item_name = resolve_item_name(
        db, request_type, item_id
    )

    if request_type == "stay":
        if not check_in or not check_out:
            raise ValueError(
                "Check-in and check-out dates are required."
            )

        validate_dates(check_in, check_out)

    if rooms < 1:
        raise ValueError(
            "At least one room is required."
        )

    now = datetime.now(timezone.utc)

    live = (
        db.query(BookingRequest)
        .filter(
            BookingRequest.user_id == user.id,
            BookingRequest.type == request_type,
            BookingRequest.item_id == item_id,
            BookingRequest.check_in == check_in,
            BookingRequest.check_out == check_out,
            BookingRequest.rooms == rooms,
            BookingRequest.status.in_(
                ["requested", "accepted"]
            ),
        )
        .all()
    )

    for request in live:
        if effective_status(request, now) in (
            "requested",
            "accepted",
        ):
            return request

    request = BookingRequest(
        request_reference=(
            "RQ-"
            + secrets.token_hex(5).upper()
        ),
        user_id=user.id,
        type=request_type,
        item_id=item_id,
        item_name=item_name,
        check_in=check_in,
        check_out=check_out,
        rooms=rooms,
        status="requested",
        amount=compute_default_amount(
            db,
            request_type,
            item_id,
            check_in,
            check_out,
            rooms,
        ),
    )

    db.add(request)
    db.commit()
    db.refresh(request)

    return request


def notify_request_user(
    db: Session,
    request: BookingRequest,
    message: str,
) -> None:
    """Best-effort user notification; never breaks the flow."""

    try:
        user = request.user

        if not user:
            return

        if user.phone:
            notification = create_notification(
                db=db,
                user=user,
                booking=None,
                channel="whatsapp",
                event="booking_request_update",
                recipient=user.phone,
                message=message,
            )

            dispatch_notification(
                db=db,
                notification=notification,
            )
        elif user.email:
            notification = create_notification(
                db=db,
                user=user,
                booking=None,
                channel="email",
                event="booking_request_update",
                recipient=user.email,
                subject=(
                    f"Request update - "
                    f"{request.request_reference}"
                ),
                message=message,
            )

            dispatch_notification(
                db=db,
                notification=notification,
            )
    except Exception:
        db.rollback()


def accept_request(
    db: Session,
    request: BookingRequest,
    admin: User,
    amount: float | None,
    note: str | None,
) -> BookingRequest:
    """Accept a pending request and open its payment window.

    Atomic: the conditional UPDATE only wins if the request is
    still pending, so concurrent admin clicks cannot double-accept.
    For stays, availability is re-checked first so a request for
    dates that just sold out cannot be accepted.
    """

    if request.type == "stay":
        if not request.check_in or not request.check_out:
            raise ValueError(
                "This stay request has no dates."
            )

        room = (
            db.query(Room)
            .filter(Room.id == request.item_id)
            .first()
        )

        if not room:
            raise ValueError("Room not found.")

        available = get_available_rooms(
            db,
            room,
            request.check_in,
            request.check_out,
        )

        if available < request.rooms:
            raise ValueError(
                "Not enough rooms left for the "
                "requested dates."
            )

    sync_plan_status = None
    if request.type == "custom":
        # Keep the linked CustomPlan row in step so the
        # customer's My Bookings page shows the same state.
        sync_plan_status = "accepted"

    values = {
        "status": "accepted",
        "decided_by": admin.id,
        "decided_at": datetime.now(timezone.utc),
        "expires_at": (
            datetime.now(timezone.utc)
            + timedelta(
                hours=settings.REQUEST_PAYMENT_EXPIRE_HOURS
            )
        ),
        "admin_note": note,
    }

    if amount is not None:
        # The admin set an explicit amount — allowed for any
        # request type (discounts, extras, random cases).
        # For listed items this overrides the computed price.
        values["amount"] = amount
    elif request.type != "custom":
        # Stays / safaris / packages fall back to the listed
        # price, recomputed fresh at acceptance.
        values["amount"] = compute_default_amount(
            db,
            request.type,
            request.item_id,
            request.check_in,
            request.check_out,
            request.rooms,
        )
    # custom packages with no amount yet stay unset and can be
    # filled in later from the bookings panel

    claimed = (
        db.query(BookingRequest)
        .filter(
            BookingRequest.id == request.id,
            BookingRequest.status == "requested",
        )
        .update(values, synchronize_session="fetch")
    )

    if claimed == 0:
        raise ValueError(
            "This request is no longer pending."
        )

    if sync_plan_status:
        db.query(CustomPlan).filter(
            CustomPlan.id == request.item_id
        ).update({"status": sync_plan_status})

    db.commit()
    db.refresh(request)

    amount_text = (
        f"\nAmount: ₹{float(request.amount):,.2f}"
        if request.amount
        else ""
    )

    notify_request_user(
        db,
        request,
        f"""Good news! Your {request.item_name} request
({request.request_reference}) has been accepted.{amount_text}
You can now pay from My Requests on the website.""",
    )

    return request


def reject_request(
    db: Session,
    request: BookingRequest,
    admin: User,
    note: str | None,
) -> BookingRequest:
    """Reject a pending or (unpaid) accepted request."""

    claimed = (
        db.query(BookingRequest)
        .filter(
            BookingRequest.id == request.id,
            BookingRequest.status.in_(
                ["requested", "accepted"]
            ),
        )
        .update(
            {
                "status": "rejected",
                "decided_by": admin.id,
                "decided_at": datetime.now(
                    timezone.utc
                ),
                "admin_note": note,
                "expires_at": None,
            },
            synchronize_session="fetch",
        )
    )

    if claimed == 0:
        raise ValueError(
            "This request cannot be rejected "
            "(it may already be paid)."
        )

    if request.type == "custom":
        db.query(CustomPlan).filter(
            CustomPlan.id == request.item_id
        ).update({"status": "rejected"})

    db.commit()
    db.refresh(request)

    note_text = (
        f"\nNote from Ankit: {note}" if note else ""
    )

    notify_request_user(
        db,
        request,
        f"""We're sorry, your {request.item_name} request
({request.request_reference}) could not be
confirmed this time.{note_text}""",
    )

    return request


def set_request_amount(
    db: Session,
    request: BookingRequest,
    amount: float,
    note: str | None,
) -> BookingRequest:
    """Update the payable amount while the request is accepted
    and not yet paid. Allowed for every request type — the
    listed price is just the default; the admin can adjust it
    for discounts, extras or any other case."""

    claimed = (
        db.query(BookingRequest)
        .filter(
            BookingRequest.id == request.id,
            BookingRequest.status == "accepted",
        )
        .update(
            {
                "amount": amount,
                "admin_note": note,
            },
            synchronize_session="fetch",
        )
    )

    if claimed == 0:
        raise ValueError(
            "Amount can only be set on an accepted, "
            "unpaid request."
        )

    db.commit()
    db.refresh(request)

    notify_request_user(
        db,
        request,
        f"""The amount for your {request.item_name} request
({request.request_reference}) is now
₹{float(request.amount):,.2f}.""",
    )

    return request


def mark_request_paid(
    db: Session,
    request: BookingRequest,
    admin: User,
    amount: float,
    note: str | None,
) -> BookingRequest:
    """Record an offline payment (e.g. paid over WhatsApp chat).

    Works both on an accepted request and directly on a new one,
    for the case where the customer already paid during the
    WhatsApp chat before the admin got to it. Creates a captured
    Payment row for the audit trail/revenue reporting, with no
    Razorpay IDs.
    """

    if request.status == "requested" and request.type == "stay":
        # Same guard as acceptance: never confirm a stay the
        # calendar can't actually honour.
        if not request.check_in or not request.check_out:
            raise ValueError(
                "This stay request has no dates."
            )

        room = (
            db.query(Room)
            .filter(Room.id == request.item_id)
            .first()
        )

        if not room:
            raise ValueError("Room not found.")

        available = get_available_rooms(
            db,
            room,
            request.check_in,
            request.check_out,
        )

        if available < request.rooms:
            raise ValueError(
                "Not enough rooms left for the "
                "requested dates."
            )

    claimed = (
        db.query(BookingRequest)
        .filter(
            BookingRequest.id == request.id,
            BookingRequest.status.in_(
                ["requested", "accepted"]
            ),
        )
        .update(
            {
                "status": "paid",
                "amount": amount,
                "admin_note": note,
                "decided_by": admin.id,
                "decided_at": datetime.now(
                    timezone.utc
                ),
                "expires_at": None,
            },
            synchronize_session="fetch",
        )
    )

    if claimed == 0:
        raise ValueError(
            "Only a pending or accepted, unpaid "
            "request can be marked as paid."
        )

    if request.type == "custom":
        db.query(CustomPlan).filter(
            CustomPlan.id == request.item_id
        ).update({"status": "accepted"})

    payment = Payment(
        request_id=request.id,
        amount=amount,
        currency="INR",
        status="captured",
        paid_at=datetime.now(timezone.utc),
    )

    db.add(payment)
    db.commit()
    db.refresh(request)

    notify_request_user(
        db,
        request,
        f"""Payment of ₹{amount:,.2f} received for your
{request.item_name} request
({request.request_reference}). Thank you!""",
    )

    return request


def list_user_requests(
    db: Session,
    user_id: int,
) -> list[BookingRequest]:
    return (
        db.query(BookingRequest)
        .filter(BookingRequest.user_id == user_id)
        .order_by(desc(BookingRequest.created_at))
        .all()
    )


def list_all_requests(
    db: Session,
    status: str | None = None,
) -> list[BookingRequest]:
    query = db.query(BookingRequest)

    if status:
        query = query.filter(
            BookingRequest.status == status
        )

    return (
        query.order_by(desc(BookingRequest.created_at))
        .all()
    )
