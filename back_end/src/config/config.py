import json
import os
# import os.path
import random
from os import PathLike

from flask import Flask
from config.const import REPO_DIR, APP_NAME, EditMode

_VIDEOS_FOLDER = os.path.join(REPO_DIR, 'videos')
_logger = None
_VIDEOS_SAVE_DIR = os.path.join(REPO_DIR, 'saved_videos/')
_IMPORTANCE_MAPS = os.path.join(REPO_DIR, 'importance_maps/')
_TWO_PASS_STATS = os.path.join(REPO_DIR, 'x264_stats/')
_METADATA_PATH = os.path.join(REPO_DIR, 'back_end', 'src', 'data', 'videos_data.json')
_X264_PATH = os.environ.get('X264_WAVEONE')
# assert _X264_PATH is not None

_video_meta_data = None
_num_permutations = 10
_videos_distortions = None

def get_video_metadata_path():
    return _METADATA_PATH


def get_video_folder():
    return _VIDEOS_FOLDER


def _load_video_metadata():
    with open(get_video_metadata_path()) as f:
        return json.load(f)


def get_video_metadata():
    global _video_meta_data
    if _video_meta_data is not None:
        return _video_meta_data
    _video_meta_data = _load_video_metadata()
    return _video_meta_data

def get_video_permutations():
    global _videos_distortions
    if _videos_distortions is not None:
        return _videos_distortions
    videos_metadata = get_video_metadata()
    videos_ids = list(videos_metadata.keys())
    allowed_dists = [EditMode.X264.value]
    #allowed_dists = [EditMode.BLUR.value, EditMode.SALT_AND_PEPPER_NOISE.value]
    _videos_distortions = {}
    for i in range(_num_permutations):
        videos = random.sample(videos_ids, len(videos_ids))
        distortions = random.choices(allowed_dists, k=len(videos))
        _videos_distortions[i] = list(zip(videos, distortions))
    return _videos_distortions

def get_video_save_dir():
    return _VIDEOS_SAVE_DIR


def set_video_folder(vid_folder: PathLike):
    global _VIDEOS_FOLDER
    if not os.path.exists(vid_folder):
        raise ValueError("vid_folder should point to existing directory")
    _VIDEOS_FOLDER = str(vid_folder)


def _init_logger():
    app = Flask(APP_NAME)
    global _logger
    _logger = app.logger
    return _logger


def get_logger():
    if _logger is not None:
        return _logger
    return _init_logger()
