import os
import sys
import argparse
import cv2
import numpy as np

from helper.videos_data import GetVideoParams
from scipy.ndimage import gaussian_filter
from tqdm import tqdm

NUM_COLOR_CHANNELS = 3
MAX_LEVEL_8b = 255

def convert_video_to_npy_array(mp4_video_path, video_props):
    assert mp4_video_path.rsplit(".", 1)[1] == 'mp4', 'Input path not .mp4'

    height, width, num_frames = video_props['height'], video_props['width'], video_props['num_frames']
    npy_video = np.zeros((height, width, NUM_COLOR_CHANNELS, num_frames), dtype='uint8')

    frame_num = 0
    cap = cv2.VideoCapture(mp4_video_path)
    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break
        frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        npy_video[..., frame_num] = frame

        frame_num += 1

    cap.release()

    return npy_video


def blur_video(video_np, sigma_gauss=5):
    height, width, num_channels, num_frames = video_np.shape
    blurred_video = np.zeros(video_np.shape)
    for i in range(num_frames):
        for j in range(num_channels):
            blurred_video[:, :, j, i] = gaussian_filter(video_np[:, :, j, i], sigma=sigma_gauss)
    return blurred_video


def get_noise(video_np, thr=0.2):
    '''
    :return: uniformly random noise in [-1, 1] * MAX_LEVEL_8b; at random locations.
    '''
    height, width, num_channels, num_frames = video_np.shape
    # Generate noise in [-1, 1]
    noise = (np.random.rand(height, width, num_channels, num_frames) - 0.5) * 2
    # Find random indices; these locations have noise in [-thr, thr]
    noise_idx = np.abs(noise) < thr
    # Remove noise at other locations, and scale noise in this region back to [-1, 1]
    return noise * noise_idx * 1/thr * MAX_LEVEL_8b


def VideosNoises(videos_dir):
    videos_dir = os.path.abspath(videos_dir)
    if not os.path.isdir(videos_dir):
        print('[ERROR][videos_numpy_noises] {} is not a dir'.format(videos_dir))
        return

    videos_names = [d for d in os.listdir(videos_dir) if os.path.isdir(os.path.join(videos_dir, d))]

    for video_name in tqdm(videos_names, desc='noise preprocessing'):
        video_dir = os.path.join(videos_dir, video_name)
        video_path = os.path.join(video_dir, video_name + '.mp4')

        video_width, video_height, num_frames, video_fps = GetVideoParams(video_path)
        video_props = {'height': video_height, 'width': video_width, 'num_frames': num_frames}

        # # get original video data in npy format
        npy_video = convert_video_to_npy_array(video_path, video_props)
        npy_video_name = video_name.rsplit(".", 1)[0] + '.npy'

        # get blurred video
        for sigma_gauss in [2 ,5]:
            npy_blurred_video = blur_video(npy_video, sigma_gauss)
            blurred_video_name = video_name.rsplit(".", 1)[0] + '_BLURRED_{}.mp4'.format(sigma_gauss)
            npy_blurred_video_name = blurred_video_name.rsplit(".", 1)[0] + '.npy'
            # Save noise as npy files
            npy_blurred_video_path = os.path.join(video_dir, npy_blurred_video_name)
            np.save(npy_blurred_video_path, npy_blurred_video)

        # get noise tensor for using as salt and pepper noise
        noise_tensor1 = get_noise(npy_video)
        noise_tensor2 = get_noise(npy_video)
        noise_tensor1_video_name = video_name.rsplit(".", 1)[0] + '_Noise1.npy'
        noise_tensor2_video_name = video_name.rsplit(".", 1)[0] + '_Noise2.npy'

        # Save videos as npy files
        npy_video_path = os.path.join(video_dir, npy_video_name)
        np.save(npy_video_path, npy_video)

        noise_video_path = os.path.join(video_dir, noise_tensor1_video_name)
        np.save(noise_video_path, noise_tensor1)
        noise_video_path = os.path.join(video_dir, noise_tensor2_video_name)
        np.save(noise_video_path, noise_tensor2)
