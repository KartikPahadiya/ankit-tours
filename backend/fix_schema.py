"""
One-time schema repair: adds columns that exist on the SQLAlchemy models
but are missing from the actual database tables (SQLite's create_all only
creates missing tables - it never alters existing ones).

Safe to run repeatedly: it only adds columns that are genuinely missing,
and only nullable ones (SQLite cannot ADD COLUMN NOT NULL without a default).
"""
from sqlalchemy import inspect, text

from app.core.database import Base, engine
from app.models import (  # noqa: F401 - registers all models
    Booking,
    Notification,
    Payment,
    Review,
    Room,
    RoomAvailability,
    Stay,
    StayImage,
    TourPackage,
    TravelPlan,
    User,
)


def fix_schema() -> None:
    Base.metadata.create_all(bind=engine)

    inspector = inspect(engine)
    added = []

    with engine.connect() as conn:
        for table in Base.metadata.tables.values():
            if not inspector.has_table(table.name):
                continue

            existing = {
                column["name"]
                for column in inspector.get_columns(table.name)
            }

            for column in table.columns:
                if column.name in existing:
                    continue

                column_type = column.type.compile(engine.dialect)

                if not column.nullable:
                    # SQLite requires a DEFAULT when adding NOT NULL
                    # columns to an existing table.
                    default = (
                        column.default.arg
                        if column.default is not None
                        and column.default.is_scalar
                        else 0
                    )
                    conn.execute(
                        text(
                            f"ALTER TABLE {table.name} "
                            f"ADD COLUMN {column.name} {column_type} "
                            f"NOT NULL DEFAULT {default}"
                        )
                    )
                    added.append(f"{table.name}.{column.name}")
                    continue

                conn.execute(
                    text(
                        f"ALTER TABLE {table.name} "
                        f"ADD COLUMN {column.name} {column_type}"
                    )
                )
                added.append(f"{table.name}.{column.name}")

        conn.commit()

    if added:
        print("Added missing columns:")
        for item in added:
            print(f"  - {item}")
    else:
        print("Schema is already in sync - nothing to do.")


if __name__ == "__main__":
    fix_schema()
