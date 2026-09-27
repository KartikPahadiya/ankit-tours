import os
from app.core.database import Base, SessionLocal, engine
from app.core.security import get_password_hash
from app.models import Room, SafariConfig, Stay, StayImage, TourPackage, User


def seed_database():

    Base.metadata.create_all(bind=engine)

    db = SessionLocal()

    try:
        admin_email = os.getenv(
            "ADMIN_EMAIL",
            "admin@ankittravels.com",
        )

        admin_password = os.getenv(
            "ADMIN_PASSWORD",
            "Admin@12345",
        )

        admin = (
            db.query(User)
            .filter(User.email == admin_email.lower())
            .first()
        )

        if not admin:
            admin = User(
                name="Ankit Travels Admin",
                email=admin_email.lower(),
                phone=None,
                password_hash=get_password_hash(admin_password),
                role="admin",
                is_verified=True,
                is_active=True,
            )

            db.add(admin)
            db.commit()
        # # --------------------------------
        # # Admin user (always created)
        # # --------------------------------

        # admin = (
        #     db.query(User)
        #     .filter(User.email == "admin@Ankit Travels.com")
        #     .first()
        # )

        # if not admin:
        #     admin = User(
        #         name="Ankit Travels Admin",
        #         email="admin@Ankit Travels.com",
        #         phone=None,
        #         password_hash=get_password_hash("Admin@12345"),
        #         role="admin",
        #         is_verified=True,
        #         is_active=True,
        #     )

        #     db.add(admin)
        #     db.commit()

        # --------------------------------
        # Tour / safari packages
        # --------------------------------

        existing_packages = db.query(TourPackage).count()

        if existing_packages == 0:

            db.add_all(
                [
                    TourPackage(
                        title="3-Day Ranthambore & Local Rajasthan",
                        duration="3 Days / 2 Nights",
                        description=(
                            "From ₹25,000 per couple. Day 1: arrival, local "
                            "market and Sawai Madhopur orientation. Day 2: "
                            "early-morning safari, Ranthambore Fort and Trinetra "
                            "Ganesh Temple, sunset photography. Day 3: village "
                            "walk, local food and crafts, departure assistance. "
                            "Final price depends on hotel category, transport, "
                            "safari permits/availability, season and activities."
                        ),
                        price=25000,
                        price_type="total",
                        includes=[
                            "Railway station pickup/drop",
                            "Hotel stay (2 nights)",
                            "Ranthambore safari arrangement",
                            "Ranthambore Fort & Ganesh Temple",
                            "Village walk & local food experience",
                            "Local host throughout",
                        ],
                        icon="🐅",
                        color="orange",
                        display_order=1,
                    ),
                    TourPackage(
                        title="5-Day Ranthambore & Real Rajasthan",
                        duration="5 Days / 4 Nights",
                        description=(
                            "From ₹45,000 per couple. Five days covering "
                            "wildlife, Ranthambore Fort and Trinetra Ganesh "
                            "Temple, village life and culture, and slow "
                            "Rajasthan — ending with a relaxed day and railway "
                            "station transfer. Final quotation depends on "
                            "accommodation, transport, safari permits, season "
                            "and selected activities."
                        ),
                        price=45000,
                        price_type="total",
                        includes=[
                            "Railway station pickup/drop",
                            "Hotel stay (4 nights)",
                            "Ranthambore safari arrangement",
                            "Fort, temple & heritage storytelling",
                            "Village & culture day",
                            "Photography experience",
                            "Local host throughout",
                        ],
                        icon="🏰",
                        color="emerald",
                        display_order=2,
                    ),
                ]
            )

            db.commit()

        # --------------------------------
        # Safari options (Gypsy / Canter x Morning / Afternoon)
        # --------------------------------

        existing_safaris = db.query(SafariConfig).count()

        if existing_safaris == 0:

            db.add_all(
                [
                    SafariConfig(
                        vehicle_type="Gypsy",
                        shift="Morning",
                        price_per_person=1800,
                        seats_per_vehicle=6,
                        timing="Around 6:00 AM (varies by season)",
                        note="Permit and park charges as per forest department rules.",
                        display_order=1,
                    ),
                    SafariConfig(
                        vehicle_type="Gypsy",
                        shift="Afternoon",
                        price_per_person=1800,
                        seats_per_vehicle=6,
                        timing="Around 2:30 PM (varies by season)",
                        note="Permit and park charges as per forest department rules.",
                        display_order=2,
                    ),
                    SafariConfig(
                        vehicle_type="Canter",
                        shift="Morning",
                        price_per_person=900,
                        seats_per_vehicle=20,
                        timing="Around 6:00 AM (varies by season)",
                        note="Permit and park charges as per forest department rules.",
                        display_order=3,
                    ),
                    SafariConfig(
                        vehicle_type="Canter",
                        shift="Afternoon",
                        price_per_person=900,
                        seats_per_vehicle=20,
                        timing="Around 2:30 PM (varies by season)",
                        note="Permit and park charges as per forest department rules.",
                        display_order=4,
                    ),
                ]
            )

            db.commit()

        # --------------------------------
        # GOA
        # --------------------------------

        existing_stays = db.query(Stay).count()

        if existing_stays == 0:

            goa = Stay(
                name="The Palm Grove Goa",
                slug="the-palm-grove-goa",
                description=(
                    "A beautiful coastal stay surrounded by palm trees, "
                    "close to the beaches and vibrant local experiences."
                ),
                property_type="Villa",
                city="Goa",
                state="Goa",
                country="India",
                address="North Goa, Goa",
                latitude=15.5527,
                longitude=73.7532,
                rating=4.8,
                review_count=124,
                status="active",
            )

            db.add(goa)
            db.flush()

            db.add_all(
                [
                    StayImage(
                        stay_id=goa.id,
                        image_url=(
                            "https://images.unsplash.com/"
                            "photo-1582610116397-edb318620f90"
                            "?auto=format&fit=crop&w=1200&q=85"
                        ),
                        is_primary=True,
                        display_order=0,
                    ),
                    StayImage(
                        stay_id=goa.id,
                        image_url=(
                            "https://images.unsplash.com/"
                            "photo-1566073771259-6a8506099945"
                            "?auto=format&fit=crop&w=1200&q=85"
                        ),
                        is_primary=False,
                        display_order=1,
                    ),
                ]
            )


            db.add_all(
                [
                    Room(
                        stay_id=goa.id,
                        name="Deluxe Garden Room",
                        description="Spacious room with a private garden view.",
                        max_guests=2,
                        price_per_night=4500,
                        total_rooms=5,
                    ),
                    Room(
                        stay_id=goa.id,
                        name="Premium Pool Villa",
                        description="Private villa with pool access.",
                        max_guests=4,
                        price_per_night=7500,
                        total_rooms=2,
                    ),
                ]
            )


            # --------------------------------
            # MANALI
            # --------------------------------

            manali = Stay(
                name="Mountain Mist Retreat",
                slug="mountain-mist-retreat-manali",
                description=(
                    "A peaceful mountain retreat with beautiful valley views, "
                    "perfect for a relaxing Himalayan getaway."
                ),
                property_type="Resort",
                city="Manali",
                state="Himachal Pradesh",
                country="India",
                address="Old Manali, Himachal Pradesh",
                latitude=32.2396,
                longitude=77.1887,
                rating=4.7,
                review_count=89,
                status="active",
            )

            db.add(manali)
            db.flush()


            db.add_all(
                [
                    StayImage(
                        stay_id=manali.id,
                        image_url=(
                            "https://images.unsplash.com/"
                            "photo-1605649487212-47bdab064df7"
                            "?auto=format&fit=crop&w=1200&q=85"
                        ),
                        is_primary=True,
                        display_order=0,
                    ),
                    StayImage(
                        stay_id=manali.id,
                        image_url=(
                            "https://images.unsplash.com/"
                            "photo-1548013146-72479768bada"
                            "?auto=format&fit=crop&w=1200&q=85"
                        ),
                        is_primary=False,
                        display_order=1,
                    ),
                ]
            )


            db.add_all(
                [
                    Room(
                        stay_id=manali.id,
                        name="Valley View Room",
                        description="Cozy room overlooking the mountains.",
                        max_guests=2,
                        price_per_night=3500,
                        total_rooms=8,
                    ),
                    Room(
                        stay_id=manali.id,
                        name="Mountain Suite",
                        description="Large suite with panoramic mountain views.",
                        max_guests=4,
                        price_per_night=6000,
                        total_rooms=3,
                    ),
                ]
            )


            # --------------------------------
            # UDAIPUR
            # --------------------------------

            udaipur = Stay(
                name="Lakeview Heritage Haveli",
                slug="lakeview-heritage-haveli-udaipur",
                description=(
                    "A traditional heritage stay offering beautiful lake views "
                    "and a peaceful royal atmosphere."
                ),
                property_type="Homestay",
                city="Udaipur",
                state="Rajasthan",
                country="India",
                address="Old City, Udaipur, Rajasthan",
                latitude=24.5854,
                longitude=73.7125,
                rating=4.9,
                review_count=156,
                status="active",
            )

            db.add(udaipur)
            db.flush()


            db.add_all(
                [
                    StayImage(
                        stay_id=udaipur.id,
                        image_url=(
                            "https://images.unsplash.com/"
                            "photo-1602643163983-ed0babc39797"
                            "?auto=format&fit=crop&w=1200&q=85"
                        ),
                        is_primary=True,
                        display_order=0,
                    ),
                    StayImage(
                        stay_id=udaipur.id,
                        image_url=(
                            "https://images.unsplash.com/"
                            "photo-1599661046289-e31897846e41"
                            "?auto=format&fit=crop&w=1200&q=85"
                        ),
                        is_primary=False,
                        display_order=1,
                    ),
                ]
            )


            db.add_all(
                [
                    Room(
                        stay_id=udaipur.id,
                        name="Heritage Room",
                        description="Traditional room with heritage interiors.",
                        max_guests=2,
                        price_per_night=4200,
                        total_rooms=4,
                    ),
                    Room(
                        stay_id=udaipur.id,
                        name="Lake View Suite",
                        description="Premium suite with lake views.",
                        max_guests=3,
                        price_per_night=6800,
                        total_rooms=2,
                    ),
                ]
            )

            db.commit()

        print("Database seeded successfully.")


    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
