import os
import sys
import cv2
import json
import argparse

from tqdm import tqdm
from helper.videos_data import GetVideoParams
from helper.videos_bitrates import videos_bitrate

def CreateInputJson(videos_dir):
    videos_dir = os.path.abspath(videos_dir)
    if not os.path.isdir(videos_dir):
        print('[ERROR][CreateInputJson] {} is not a dir'.format(input_dir))
        return

    videos_names = [d for d in os.listdir(videos_dir) if os.path.isdir(os.path.join(videos_dir, d))]

    videos_dict = {}
    video_id = 0
    for video_name in tqdm(videos_names, desc='create json'):
        video_dir = os.path.join(videos_dir, video_name)
        mp4_path = os.path.join(video_dir, video_name + '.mp4')
        video_relative_path = os.path.join(video_name, video_name + '.mp4')

        npy_video_name = video_name + '.npy'
        npy_video_relative_path = os.path.join(video_name, npy_video_name)

        npy_blurred_2_video_name = video_name + '_BLURRED_2.npy'
        npy_blurred_2_video_relative_path = os.path.join(video_name, npy_blurred_2_video_name)
        npy_blurred_5_video_name = video_name + '_BLURRED_5.npy'
        npy_blurred_5_video_relative_path = os.path.join(video_name, npy_blurred_5_video_name)

        npy_noise1_video_name = video_name + '_Noise1.npy'
        npy_noise1_video_relative_path = os.path.join(video_name, npy_noise1_video_name)
        npy_noise2_video_name = video_name + '_Noise2.npy'
        npy_noise2_video_relative_path = os.path.join(video_name, npy_noise2_video_name)

        optical_flow_name = video_name + '_optical_flow.npy'
        optical_flow_ralative_path = os.path.join(video_name, optical_flow_name)

        y4m_relative_path = video_relative_path.replace('.mp4', '.y4m')
        relative_edges_dir =  os.path.join(video_name, 'edges')

        assert video_name in videos_bitrate

        video_width, video_height, num_frames, video_fps = GetVideoParams(mp4_path)
        videos_dict[video_id] = {'id': video_id, 'name': video_name, 'path': video_relative_path,
                                'y4m_path': y4m_relative_path, 'npy_path': npy_video_relative_path,
                                'npy_blurred_2_path': npy_blurred_2_video_relative_path,
                                'npy_blurred_5_path': npy_blurred_5_video_relative_path,
                                'noise1_path': npy_noise1_video_relative_path,
                                'noise2_path': npy_noise2_video_relative_path,
                                'optical_flow': optical_flow_ralative_path,
                                'width': video_width, 'height': video_height, 'num_frames': num_frames,
                                'fps': video_fps, 'edges_dir': relative_edges_dir,
                                'bitrate': videos_bitrate[video_name]}
        video_id += 1

    with open('videos_data.json', 'w') as outfile:
        json.dump(videos_dict, outfile, indent=4)

