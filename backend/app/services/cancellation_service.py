from datetime import date


def calculate_refund(
    check_in: date,
    total_amount: float,
):
    """
    Current cancellation policy:

    7+ days before check-in:
        100% refund

    3-6 days before check-in:
        50% refund

    0-2 days before check-in:
        No refund
    """

    days_until_checkin = (
        check_in - date.today()
    ).days

    if days_until_checkin >= 7:
        refund_percentage = 100

    elif days_until_checkin >= 3:
        refund_percentage = 50

    else:
        refund_percentage = 0

    refund_amount = round(
        total_amount
        * refund_percentage
        / 100,
        2,
    )

    return {
        "days_until_checkin": days_until_checkin,
        "refund_percentage": refund_percentage,
        "refund_amount": refund_amount,
        "original_amount": total_amount,
    }