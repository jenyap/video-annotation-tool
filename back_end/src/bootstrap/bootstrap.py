import os.path
import pathlib
import secrets
from os import PathLike
from tempfile import mkdtemp

from config.config import (get_video_folder, set_video_folder, get_logger, get_video_save_dir,
                           get_video_metadata, get_video_metadata_path)


def _generate_stub_video(video_dir: PathLike, video_name: str):
    with open(os.path.join(video_dir, video_name), 'wb') as f:
        f.write(b'\x10' * 10)


def _get_secret_file_path() -> pathlib.Path:
    this_dir = pathlib.Path(__file__).parent
    return pathlib.Path(this_dir, '__token__')


def _generate_secret():
    token_file = _get_secret_file_path()
    with token_file.open('wb') as f:
        f.write(secrets.token_bytes(100))


def get_secret():
    token_file = _get_secret_file_path()
    if not token_file.exists():
        _generate_secret()
    with token_file.open('rb') as f:
        return f.read()


def bootstrap():
    logger = get_logger()
    vid_dir = get_video_folder()
    logger.info(f"videos dir at: {vid_dir}")
    if (not vid_dir) or not os.path.exists(vid_dir):
        videos_folder = mkdtemp()
        logger.info(f"videos dir not found creating temp: {videos_folder} and dropping some mocks")
        _generate_stub_video(videos_folder, 'a')
        _generate_stub_video(videos_folder, 'b')
        _generate_stub_video(videos_folder, 'c')
        set_video_folder(videos_folder)
    if get_video_metadata() is not None:
        logger.info(f"loaded video metadata from {get_video_metadata_path()}")
    logger.info(f"video save dir at: {get_video_save_dir()}")
    logger.info("bootstrap finished")
