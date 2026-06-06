import random
from faker import Faker
from sqlmodel import Session, create_engine, select

# Import your actual models and database engine from your project layout
# Adjust these imports depending on your exact file structure (e.g., from app.models or from core.db)
from database import engine  # Your engine configuration instance
from models import Item, ItemCategory, User

fake = Faker()


def seed_items(num_items: int = 20):
    with Session(engine) as session:
        # 1. Grab a valid user from the DB to avoid foreign key (user_id) errors
        user_stmt = select(User)
        user = session.exec(user_stmt).first()

        if not user:
            print(
                "❌ Error: No users found in the database. Please create a user first before seeding items!"
            )
            return

        print(f"🌱 Seeding {num_items} items for user: {user.username}...")

        # Get list of categories from your actual Enum class
        categories = list(ItemCategory)

        for _ in range(num_items):
            new_item = Item(
                name=fake.word().capitalize()
                + " "
                + random.choice(["Package", "Container", "Bottle", "Bag", ""]),
                weight=random.randint(100, 2000),  # Weight in grams
                category=random.choice(categories),  # Random valid Enum choice
                days=random.randint(1, 14),  # Expiration window
                user_id=3,  # Linked to your valid user
                saved=random.choice([True, False]),
            )
            session.add(new_item)

        session.commit()
        print(f"✅ Successfully seeded {num_items} items into the database!")


if __name__ == "__main__":
    seed_items(20)
