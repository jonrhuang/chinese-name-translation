from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
from dotenv import load_dotenv
from huggingface_hub import InferenceClient
import pinyin
from parser import load_dictionary
import re
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

def strip_tones(pinyin_text: str):
  return re.sub(r'\d', '', pinyin_text).lower()

for entry in dictionary:
  stripped = strip_tones(entry["pinyin"])

  pinyin_lookup[stripped].append({
    "simplified": entry["simplified"],
    "traditional": entry["traditional"],
    "pinyin": entry["pinyin"],
    "english": entry["english"]
  })

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

  characters = completion.choices[0].message.content
  pinyinTranslation = pinyin.get(characters, delimiter=" ")
  number = len(characters)

  return \
  {
    "characters": characters, 
    "pinyin": pinyinTranslation,
    "number": number,

  }

  # results = [entry for entry in dictionary if entry['pinyin'] == body.pinyin]
