import json
from dotenv import load_dotenv
from groq import Groq
from models import Item
import os
import httpx
from google import genai
from json_repair import repair_json

load_dotenv()
PIXABAY_API_KEY = os.getenv("PIXABAY_KEY")
client = Groq()
googleClient = genai.Client()


def get_recipe_image(recipe_name: str) -> str:
    url = f"https://pixabay.com/api/?key={PIXABAY_API_KEY}&q={recipe_name}&image_type=photo&category=food&safesearch=true"
    img = ""
    response = httpx.get(url, timeout=3.0)

    if response.status_code == 200:
        data = response.json()
        hits = data.get("hits", [])
        if hits and len(hits) > 0:
            return hits[0].get("webformatURL", img)
    return img


def getProductMatchingItems(items: list[Item], tab: str):
    content = ""
    inventory_lines = []
    for item in items:
        inventory_lines.append(
            f"- #{item.id} - {item.name} (Weight: {item.weight}, Expiry date : {item.expiryDate} )"
        )
    inventory_str = "\n".join(inventory_lines)
    allowed_names = ", ".join([f"'{item.name}'" for item in items])

    if tab == "missing":
        tab_instruction = """- FILTER CONDITION (Need a few things): Generate recipes where the user has *almost* everything, but requires 1 to 2 external ingredients. Ensure the 'missing_ingredients' array contains exactly 1 or 2 items that are critical or highly recommended to complete the dish, forcing the match_percentage down to roughly 60-80%."""
    elif tab == "saved":
        tab_instruction = f"""- FILTER CONDITION (Strict Inventory Matches Only): Generate recipes using exclusively what is in the inventory. The 'missing_ingredients' array MUST be empty []. Every single recipe generated must be completely constructible using only subsets of this list: {allowed_names}."""
    else:
        tab_instruction = f"""- FILTER CONDITION (Ready to Cook): Generate recipes that require NO extra shopping trips. The 'missing_ingredients' array should only contain non-essential items marked as "Skip – won't ruin the dish". The match_percentage should be near 90-100% based entirely on: {allowed_names}."""

    content = f"""
You are a kitchen assistant backend JSON engine designed to reduce food waste.

USER INVENTORY (with weights and days left until expiration):
{inventory_str}

CRITICAL RULES FOR INGREDIENT LISTS:
- The array "used_ingredients" MUST ONLY contain item names explicitly present in the USER INVENTORY.
- STRICTLY FORBIDDEN: Do not add pantry staples, oils, seasonings, water, or any other assumed matching ingredient to "used_ingredients" if they are not listed in the inventory above.
- The ONLY allowed entries for "used_ingredients" are strictly limited to this exact set: {allowed_names}.
- If a recipe requires any ingredient outside of that explicit set, you MUST classify that ingredient inside the "missing_ingredients" array instead. No exceptions.

TAB-SPECIFIC RUNTIME CONSTRAINTS (CRITICAL OUTCOME DIRECTION):
{tab_instruction}

TASKS:
1. Return a JSON array containing 5 to 8 distinct recipes matching the TAB-SPECIFIC RUNTIME CONSTRAINTS above.
2. Prioritize creating matches using items with the lowest "Expires in" values to prevent food waste.
3. Mix match percentages intentionally according to the filtering logic provided in the constraints.
4. Craft the "hook_line" to clearly explain why this recipe makes sense based on expiring items or heavy weights.
5. Respond ONLY with raw, parseable JSON. Do not include markdown code blocks (```json).
6. Take care so that you only use the item that I gave you don't add anything, and use them to make realistic food with specific items that I gave 
SCHEMA TYPE:
[
  {{
    "recipe_name": "string",
    "match_percentage": int,
    "prep_time_minutes": int,
    "difficulty": "Easy" | "Medium" | "Hard",
    "cuisine_tag": "string",
    "hook_line": "string",
    "used_ingredients": [{{"name":"string"}}, {{"id": "int"}}],
    "missing_ingredients": [{{ "name": "string", "importance": "Critical" | "Skip – won't ruin the dish" }}],
    "preservation_tip": "string"
  }}
]
You are a machine. Respond ONLY with a valid JSON array. Do not include markdown tags, whitespace formatting, or conversational text. If you fail, the system crashes.
"""
    # recipes = getGoogleAIResult(content)
    recipes = getAIResult(content)
    if not isinstance(recipes, list):
        return []

    for recipe in recipes:
        name = recipe.get("recipe_name")
        if name:
            recipe["image_url"] = get_recipe_image(name)

    return recipes


def getAIResult(content: str):
    completion = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[{"role": "user", "content": content}],
        temperature=1,
        max_completion_tokens=2500,
        top_p=1,
        response_format={"type": "json_object"},
        stream=False,  # Correct
        stop=None,
    )

    full_response = completion.choices[0].message.content

    print(full_response)

    repaired_json = repair_json(full_response)

    data = json.loads(repaired_json)
    if isinstance(data, dict):
        if "recipes" in data:
            return data["recipes"]
        if "data" in data:
            return data["data"]
        return list(data.values()) if len(data.values()) == 1 else [data]
    return data


def getGoogleAIResult(content: str):

    response = googleClient.models.generate_content(
        model="gemini-3.5-flash",
        contents=content,
        config={
            "response_mime_type": "application/json",
        },
    )
    return json.loads(response.text)
