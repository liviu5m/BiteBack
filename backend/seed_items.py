import random
from faker import Faker
from sqlmodel import Session, create_engine, select
from faker_food import FoodProvider  # 1. Import the provider

from database import engine
from models import Item, ItemCategory, User

fake = Faker()
fake.add_provider(FoodProvider)


def seed_items(num_items: int = 20):
    with Session(engine) as session:
        user_stmt = select(User)
        user = session.exec(user_stmt).first()

        if not user:
            print(
                "❌ Error: No users found in the database. Please create a user first before seeding items!"
            )
            return

        print(f"🌱 Seeding {num_items} items for user: {user.username}...")

        categories = list(ItemCategory)

        for _ in range(num_items):
            new_item = Item(
                name=fake.ingredient().capitalize(),
                weight=random.randint(100, 2000),
                category=random.choice(categories),
                days=random.randint(1, 14),
                user_id=3,
                saved=False,
            )
            session.add(new_item)

        session.commit()
        print(f"✅ Successfully seeded {num_items} items into the database!")


if __name__ == "__main__":
    seed_items(20)
