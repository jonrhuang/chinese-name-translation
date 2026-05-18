from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
from dotenv import load_dotenv
from huggingface_hub import InferenceClient
from pypinyin import lazy_pinyin, Style
from parser import load_dictionary
import re
import unicodedata
from collections import defaultdict

load_dotenv()


app = FastAPI(
  title="English to Chinese Name Translator Backend",
  version="1.0.0",
)

app.add_middleware(
  CORSMiddleware,
  allow_origins=[
    "http://127.0.0.1:4200", 
    "http://localhost:4200"
  ], 
  allow_credentials=False,
  allow_methods=["*"],
  allow_headers=["*"],
)

# Load dictionary at startup
dictionary = load_dictionary()

pinyin_lookup = defaultdict(list)
character_lookup = defaultdict(list)

def strip_tones(pinyin_text: str):
  return re.sub(r'\d', '', pinyin_text).lower()

for entry in dictionary:
  stripped = strip_tones(entry["pinyin"])

  pinyin_lookup[stripped].append({
    "simplified": entry["simplified"],
    "pinyin": lazy_pinyin(entry["simplified"], style=Style.TONE)[0],
    "definition": entry["definition"]
  })

  character_lookup[entry["simplified"]].append({
    "definition": entry["definition"]
  })

def strip_accents(pinyin_text: str):
    # normalize accented characters into base + accent parts
    normalized = unicodedata.normalize('NFKD', pinyin_text)

    # remove diacritic marks
    stripped = ''.join(
        c for c in normalized
        if not unicodedata.combining(c)
    )

    # optional cleanup (if any weird spacing)
    return stripped

class TranslateReqBody(BaseModel):
  name: str

@app.get("/")
def root():
  return {"message": "API is running"}

@app.get("/hello/{name}")
def hello(name: str):
  return {"message": f"Hello, {name}!"}

@app.post("/translate")
def translate(body: TranslateReqBody):
  client = InferenceClient(
    api_key=os.environ["HF_TOKEN"],
  )

  completion = client.chat.completions.create(
    model="deepseek-ai/DeepSeek-V3:fastest", 
    messages=[
      {
        "role": "system",
        "content": (
          "Your job is to translate a name from another language "
          "such as english to chinese simplified characters. "
          "You will answer with just the name and nothing else. "
          "You will first look for an existing translation of any "
          "famous person with the same or phonetically similar name "
          "and return that name. If there is none, you will return "
          "the closest phonetically similar name to the input name."
        )
      },
      {
        "role": "user",
        "content": f"Input name: {body.name}"
      }
    ], 
  )

  characters = completion.choices[0].message.content.strip()

  accented_pinyin = lazy_pinyin(characters, style=Style.TONE)
  numbered_pinyin = lazy_pinyin(characters, style=Style.TONE3)

  definitions = []

  for char in characters:
    entries = character_lookup.get(char, [])
    char_defs = []
    for entry in entries:
      char_defs.extend(entry["definition"])
    definitions.append(char_defs)

  character_data = []

  for i, char in enumerate(characters):
    tone_pinyin = numbered_pinyin[i]
    stripped_pinyin = strip_tones(tone_pinyin)

    candidates = pinyin_lookup.get(stripped_pinyin, [])

    matches = [
      match
      for match in candidates
      if strip_accents(match["pinyin"]) == stripped_pinyin
    ]
    
    character_data.append({
      "pinyin_stripped": stripped_pinyin,
      "translations": matches
    })

  return {
    "input": body.name,
    "initial_translation": characters,
    "definitions" : definitions, 
    "pinyin": " ".join(accented_pinyin),
    "character_count": len(characters),
    "characters": character_data
  }