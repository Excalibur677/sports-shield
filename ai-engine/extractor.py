import cv2
import os


def extract_frames(video_path: str, num_frames: int = 5) -> list:
    frames = []
    temp_dir = "temp/frames"
    os.makedirs(temp_dir, exist_ok=True)

    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        return frames

    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    if total_frames == 0:
        return frames

    # pick frames evenly spread across the video
    interval = max(1, total_frames // num_frames)

    count = 0
    saved = 0

    while cap.isOpened() and saved < num_frames:
        ret, frame = cap.read()
        if not ret:
            break

        if count % interval == 0:
            frame_path = os.path.join(temp_dir, f"frame_{saved}.jpg")
            cv2.imwrite(frame_path, frame)
            frames.append(frame_path)
            saved += 1

        count += 1

    cap.release()
    return frames