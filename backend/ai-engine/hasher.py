from PIL import Image
import imagehash
import requests
from io import BytesIO


def generate_hash(image_path: str) -> str:
    try:
        img = Image.open(image_path).convert("RGB")
        hash_value = imagehash.phash(img)
        return str(hash_value)
    except Exception as e:
        raise Exception(f"Hashing failed: {str(e)}")


def compare_hashes(hash1: str, hash2: str) -> float:
    try:
        # if hash2 looks like a URL, fetch the image first
        if hash2.startswith("http"):
            remote_hash = hash_from_url(hash2)
            if not remote_hash:
                return 0.0
            hash2 = remote_hash

        h1 = imagehash.hex_to_hash(hash1)
        h2 = imagehash.hex_to_hash(hash2)

        # imagehash distance: 0 = identical, 64 = completely different
        distance = h1 - h2
        similarity = max(0, 100 - (distance / 64 * 100))
        return round(similarity, 2)

    except Exception as e:
        raise Exception(f"Comparison failed: {str(e)}")


def hash_from_url(url: str) -> str:
    try:
        headers = {"User-Agent": "Mozilla/5.0"}
        response = requests.get(url, timeout=5, headers=headers)
        img = Image.open(BytesIO(response.content)).convert("RGB")
        return str(imagehash.phash(img))
    except Exception:
        return None