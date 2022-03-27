import os
import cv2

def GetVideoParams(video_path):
    if not os.path.exists(video_path):
        print('[ERROR][GetVideoParams] {} does not exist'.format(video_path))
        return
    cap = cv2.VideoCapture(video_path)
    video_width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    video_height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    video_fps = int(cap.get(cv2.CAP_PROP_FPS))

    num_frames = 0
    while True:
        ret, _ = cap.read()
        if not ret:
            break
        num_frames += 1
    cap.release()
    return video_width, video_height, num_frames, video_fps

