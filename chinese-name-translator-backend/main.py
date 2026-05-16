from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
from dotenv import load_dotenv
from huggingface_hub import InferenceClient
import pinyin

load_dotenv()


app = FastAPI(
  title="English to Chinese Name Translator Backend",
  version="1.0.0",
)

app.add_middleware(
  CORSMiddleware,
  allow_origins=["http://127.0.0.1:4200"], 
  allow_credentials=False,
  allow_methods=["*"],
  allow_headers=["*"],
)

class ReqBody(BaseModel):
  name: str

@app.get("/")
def root():
  return {"message": "API is running"}

@app.get("/hello/{name}")
def hello(name: str):
  return {"message": f"Hello, {name}!"}

@app.post("/translate")
def translate(body: ReqBody):
  client = InferenceClient(
    api_key=os.environ["HF_TOKEN"],
  )

  completion = client.chat.completions.create(
    model="deepseek-ai/DeepSeek-V3:fastest", 
    messages=[
      {
        "role": "system",
        "content": "Your job is to translate a name from another language such as english to chinese simplified characters. You will answer with just the name and nothing else. You will first look for an existing translation of any famous person with the same or phonetically similar name and return that name. If there is none, you will return the closest phonetically similar name to the input name."
      },
      {
        "role": "user",
        "content": f"Input name: {body.name}"
      }
    ], 
  )

  characters = completion.choices[0].message.content
  pinyinTranslation = pinyin.get(characters, delimiter=" ")

  test = body.name + " poggers"
  return {"characters": characters, "pinyin": pinyinTranslation}