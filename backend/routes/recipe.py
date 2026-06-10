from typing import Any
from fastapi import APIRouter, Depends
from groq import BaseModel
from sqlmodel import select
from database import SessionDep
from models import Recipe, RecipeDifficulty
from utils import verifyUserTokenSession


app = APIRouter(prefix="/api/recipe")


class RecipeData(BaseModel):
    recipe_name: str
    match_percentage: int
    prep_time_minutes: int
    difficulty: RecipeDifficulty
    cuisine_tag: str
    hook_line: str
    used_ingredients: str
    missing_ingredients: str
    preservation_tip: str
    image_url: str


@app.post("/")
def saveRecipe(
    data: RecipeData,
    session: SessionDep,
    user: dict[Any, Any] = Depends(verifyUserTokenSession),
):
    recipe = Recipe(
        recipe_name=data.recipe_name,
        match_percentage=data.match_percentage,
        prep_time_minutes=data.prep_time_minutes,
        difficulty=data.difficulty,
        cuisine_tag=data.cuisine_tag,
        hook_line=data.hook_line,
        used_ingredients=data.used_ingredients,
        missing_ingredients=data.missing_ingredients,
        preservation_tip=data.preservation_tip,
        image_url=data.image_url,
        user_id=user["userId"],
    )
    session.add(recipe)
    session.commit()
    session.refresh(recipe)
    return "Successfully added recipe"


@app.delete("/{id}")
def deleteItem(id: int, session: SessionDep):
    stmt = select(Recipe).where(Recipe.id == id)
    recipe = session.exec(stmt).one_or_none()
    session.delete(recipe)
    session.commit()
    return "Successfully deleted recipe"


@app.get("/")
def getRecipes(
    session: SessionDep, user: dict[Any, Any] = Depends(verifyUserTokenSession)
):
    recipesStmt = select(Recipe).where(Recipe.user_id == user["userId"])
    recipes = session.exec(recipesStmt).all()
    return recipes
