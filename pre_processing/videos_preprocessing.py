import os
import sys
import cv2
import json
import argparse

from tqdm import tqdm
from helper.optical_flow import optical_flow
from helper.videos_noises import VideosNoises
from helper.videos_json import CreateInputJson

def ScaleVideo(video_path, output_video_path, w=480, h=270):
    command = 'ffmpeg -y -i {} -vf scale={}:{} {} -hide_banner -loglevel error'.format(video_path, w, h, output_video_path)
    os.system(command)

def ScaleVideos(videos_dir, w=480, h=270):
    videos_names = [d for d in os.listdir(videos_dir) if os.path.isdir(os.path.join(videos_dir, d))]
    for video_name in tqdm(videos_names, desc='rescale videos'):
        video_dir = os.path.join(videos_dir, video_name)
        video_path = os.path.join(video_dir, video_name +'.mp4')
        if not os.path.exists(video_path):
            print('[ERROR][ScaleVideos] {} does not exist'.format(video_path))
            continue
        output_video_path = os.path.join(video_dir, video_name +'_small.mp4')
        ScaleVideo(video_path, output_video_path, w, h)

def ConvertToRawVideo(video_path, output_video_path):
    command = 'ffmpeg -y -i {} -pix_fmt yuv420p {} -hide_banner -loglevel error'.format(video_path, output_video_path)
    os.system(command)

def ConvertToRawVideos(videos_dir):
    videos_names = [d for d in os.listdir(videos_dir) if os.path.isdir(os.path.join(videos_dir, d))]
    for video_name in tqdm(videos_names, desc='covert to y4m video'):
        video_dir = os.path.join(videos_dir, video_name)
        video_path = os.path.join(video_dir, video_name +'.mp4')
        if not os.path.exists(video_path):
            print('[ERROR][ConvertToRawVideos] {} does not exist'.format(video_path))
            continue
        output_video_path = os.path.join(video_dir, video_name +'.y4m')
        ConvertToRawVideo(video_path, output_video_path)

def VideoEdgeDetection(video_path, dir_path):
    os.makedirs(dir_path, exist_ok=True)

    i = 0
    cap = cv2.VideoCapture(video_path)
    while True:
        ret, frame = cap.read()
        if not ret:
            break
        edges = cv2.Canny(frame, 100, 200)
        filename = os.path.join(dir_path, 'frame{:04d}.jpg'.format(i))
        cv2.imwrite(filename, edges, [int(cv2.IMWRITE_JPEG_QUALITY), 30])
        i += 1
    cap.release()

def VideosEdgeDetection(videos_dir):
    videos_names = [d for d in os.listdir(videos_dir) if os.path.isdir(os.path.join(videos_dir, d))]
    for video_name in tqdm(videos_names, desc='video edge detection'):
        video_dir = os.path.join(videos_dir, video_name)
        small_video_path = os.path.join(video_dir, video_name +'_small.mp4')
        edges_dir = os.path.join(video_dir, 'edges')
        VideoEdgeDetection(small_video_path, edges_dir)

def ComputeOpticalFlow(videos_dir):
    videos_names = [d for d in os.listdir(videos_dir) if os.path.isdir(os.path.join(videos_dir, d))]
    for video_name in tqdm(videos_names, desc='compute optical flow'):
        video_dir = os.path.join(videos_dir, video_name)
        small_video_path = os.path.join(video_dir, video_name +'_small.mp4')
        if not os.path.exists(small_video_path):
            print('[ERROR][ComputeOpticalFlow] {} does not exist'.format(video_path))
            continue
        output_path=os.path.join(video_dir, video_name +'_optical_flow.npy')
        optical_flow(small_video_path, output_path, algorithm='farneback')

def main():
    parser = argparse.ArgumentParser(description='video pre-processing for faster annotation.')
    parser.add_argument('--videos_dir', required=True, type=str, help='videos dir')
    args = parser.parse_args()

    videos_dir = os.path.abspath(args.videos_dir)
    if not os.path.isdir(videos_dir):
        print('[ERROR][videos_json] {} is not a dir'.format(videos_dir))
        return
    ScaleVideos(videos_dir)
    ConvertToRawVideos(videos_dir)
    ComputeOpticalFlow(videos_dir)
    VideosNoises(videos_dir)
    VideosEdgeDetection(videos_dir)
    CreateInputJson(videos_dir)
    
if __name__ == '__main__':
    main()
