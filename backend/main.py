from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from optimizer import solve_shipyard_model

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {"message": "Backend çalışıyor"}

@app.get("/solve")
def solve(block_count: int = 35):

    result = solve_shipyard_model(block_count)

    return result