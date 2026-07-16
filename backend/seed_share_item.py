import random
from datetime import datetime, timedelta
from faker import Faker
from sqlmodel import Session, SQLModel, create_engine, select

from database import engine
from models import ShareItem

# --- IMPORT YOUR MODELS HERE ---
# Adjust these imports according to your project's structure

# Initialize Faker
fake = Faker()

# Simple pool of food words to make Faker generated item names sound like food share listings
FOOD_ADJECTIVES = [
    "Fresh",
    "Organic",
    "Homemade",
    "Leftover",
    "Ripe",
    "Sweet",
    "Savory",
]
FOOD_NOUNS = [
    "Bananas",
    "Sourdough Bread",
    "Tomatoes",
    "Lentil Soup",
    "Apples",
    "Muffins",
    "Carrots",
    "Avocados",
]


def generate_food_name():
    return f"{random.choice(FOOD_ADJECTIVES)} {random.choice(FOOD_NOUNS)}"


def seed_data():
    with Session(engine) as session:
        existing_items = session.exec(select(ShareItem)).first()

        print("Generating mock food shares using Faker...")

        # 2. Generate 8 unique ShareItems using Faker
        inserted_items = []
        for i in range(1, 9):
            item = ShareItem(
                user_id=random.randint(1, 4),  # Generates owner user_id from 1-4
                name=generate_food_name(),
                expiryDate=fake.date_between(start_date="today", end_date="+10d"),
                weight=random.randint(100, 2500),  # Weight between 100g and 2.5kg
                notes=fake.sentence(nb_words=10),  # Realistic random description notes
                location='{"lat": 45.9063, "lng": 28.1977}',
            )
            session.add(item)
            inserted_items.append(item)

        session.commit()
        print(f"Successfully generated {len(inserted_items)} dynamic ShareItems!")


if __name__ == "__main__":
    seed_data()
