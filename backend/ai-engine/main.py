from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
import shutil
import os
from hasher import generate_hash, compare_hashes
from extractor import extract_frames

app = FastAPI(title="Sports Shield AI Engine")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

TEMP_DIR = "temp"
os.makedirs(TEMP_DIR, exist_ok=True)


class CompareRequest(BaseModel):
    hash1: str
    hash2: str


@app.get("/")
def root():
    return {"status": "AI Engine is running"}


@app.post("/fingerprint")
async def fingerprint(file: UploadFile = File(...)):
    temp_path = os.path.join(TEMP_DIR, file.filename)

    try:
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        file_ext = file.filename.lower().split(".")[-1]

        if file_ext in ["mp4", "mov", "avi"]:
            frames = extract_frames(temp_path)
            if not frames:
                raise HTTPException(status_code=400, detail="Could not extract frames from video")
            hash_value = generate_hash(frames[0])
        else:
            hash_value = generate_hash(temp_path)

        return {
            "success": True,
            "hash": hash_value,
            "fileType": file_ext,
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)


@app.post("/compare")
def compare(req: CompareRequest):
    try:
        similarity = compare_hashes(req.hash1, req.hash2)
        return {
            "success": True,
            "similarity": similarity,
            "isMatch": similarity > 80,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)