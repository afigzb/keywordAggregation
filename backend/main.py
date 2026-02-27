from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

@app.get("/")
def read_root():
    return {"message": "Hello from Python Backend!"}

@app.get("/api/data")
def get_data():
    return {"data": [1, 2, 3, 4, 5], "status": "success"}

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=6759)
