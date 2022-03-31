import os.path
import random
import tempfile
import string
from functools import lru_cache
from typing import List, Optional, Any, Dict, Union, Tuple

import cv2
import ffmpeg
import pathlib
import time, sys
import numpy as np
import torch, torchvision
import skimage.measure

from config import config
from config.config import get_video_folder, get_video_metadata, get_video_permutations
from config.config import _IMPORTANCE_MAPS, _X264_PATH, _TWO_PASS_STATS
from config.const import Task, EditMode


#GPAC = True
GPAC = False

NUM_VIDEOS_PER_USER = 5

MAX_LEVEL_8b, MIN_LEVEL_8b, MID_LEVEL_8b = 255, 0, 127
NUM_COLOR_CHANNELS = 3
MB_SIZE = 16


@lru_cache()
def get_video_names() -> List[str]:
    return list(get_video_metadata().keys())


def _get_video_details_by_name(video_name: str) -> Dict[str, Any]:
    metadata = get_video_metadata()
    for video_details in metadata.values():
        if video_name.lower() == video_details["name"].lower():
            return video_details
    raise ValueError(f"cannot find id for video name {video_name}")

def get_video_details_by_id(video_id: Union[str, int]) -> Dict[str, Any]:
    str_id = str(video_id)
    metadata = get_video_metadata()
    return metadata[str_id]

def get_random_videos(count=1) -> List[str]:
    return random.sample(list(get_video_metadata().keys()), k=count)

def get_path_for_video(video_id: str) -> str:
    video_path = get_video_details_by_id(video_id)["path"]
    return os.path.join(get_video_folder(), video_path)

def get_edges_path(video_id:str) -> str:
    video_path = get_path_for_video(video_id)
    return str(pathlib.Path(pathlib.Path(video_path).parent, 'edges'))

def get_path_for_npy_video(video_id: str) -> str:
    video_path = get_video_details_by_id(video_id)["npy_path"]
    return os.path.join(get_video_folder(), video_path)

def get_path_for_npy_blurred_video(video_id: str, sigma) -> str:
    video_path = get_video_details_by_id(video_id)[f"npy_blurred_{sigma}_path"]
    return os.path.join(get_video_folder(), video_path)

def get_path_for_npy_noise_video(video_id: str, noise_id) -> str:
    video_path = get_video_details_by_id(video_id)[f"noise{noise_id}_path"]
    return os.path.join(get_video_folder(), video_path)

def get_video_optical_flow(video_id: str) -> str:
    relative_path = get_video_details_by_id(video_id)["optical_flow"]
    path = os.path.join(get_video_folder(), relative_path)
    return np.load(path, allow_pickle=True)

def get_path_for_y4m_video(video_id: str) -> str:
    video_path = get_video_details_by_id(video_id)["y4m_path"]
    return os.path.join(get_video_folder(), video_path)

def get_video_name(video_id: str) -> str:
    return get_video_details_by_id(video_id)["name"]

def get_video_bitrate(video_id: str) -> str:
    bitrate = get_video_details_by_id(video_id)["bitrate"]
    return int(bitrate)

def get_video_buffer(video_id: str) -> bytes:
    # assume unique video name
    video_file_path = get_path_for_video(video_id)
    with open(video_file_path, 'rb') as f:
        return f.read()

def get_video_frame_count(video_id: Union[str, int]) -> Optional[int]:
    video_id = str(video_id)
    return get_video_details_by_id(video_id)["num_frames"]

def get_video_fps(video_id: Union[str, int]) -> Optional[int]:
    video_id = str(video_id)
    return get_video_details_by_id(video_id)["fps"]

def get_video_width_height(video_id: Union[str, int]) -> Tuple[int, int]:
    video_id = str(video_id)
    details = get_video_details_by_id(video_id)
    return details["width"], details["height"]

def get_data_from_annotation_array(height, width, annotation_buffer):
    annotation = np.frombuffer(annotation_buffer, dtype=np.uint8)
    annotation_np = annotation.reshape(width, height, -1, order='F').swapaxes(0, 1)
    return annotation_np.astype('float32')

def get_next_video_from_perms(video_id: str, perm: int, num_videos: int):
    if num_videos >= NUM_VIDEOS_PER_USER:
        return -1, "", 0, ""
    videos_dists_perm = get_video_permutations()
    if perm < 0:
        # choose randomly which permutation to use
        perm = random.randint(0, len(videos_dists_perm) - 1)
        #choose randomly from a list
        video_id, distortion = random.choice(videos_dists_perm[perm])
        total_frames = get_video_frame_count(video_id)
        return perm, video_id, total_frames, distortion
    permutation = videos_dists_perm[perm]
    loc = [i for i, v in enumerate(permutation) if v[0] == video_id]
    loc = (loc[0] + 1) % len(permutation)
    video_id, distortion = permutation[loc]
    total_frames = get_video_frame_count(video_id)
    return perm, video_id, total_frames, distortion

def reshape_annotation_map_to_video_shape(annotation_map, video_props, device):
    '''
    Reshapes annotation map from frame window size to video window size using bilinear interpolation
    '''
    video_width = video_props['width']
    video_height = video_props['height']
    if device == 'gpu':
        annotation_map = torch.from_numpy(annotation_map).permute(2, 0, 1)[None, :]

        annotation_map = torch.nn.functional.interpolate(
            annotation_map,
            [video_height, video_width],
            mode='bilinear',
            align_corners=True
        )
        annotation_resized = annotation_map.squeeze().permute(1, 2, 0).clamp(MIN_LEVEL_8b, MAX_LEVEL_8b) / MAX_LEVEL_8b
    else:
        annotation_resized = cv2.resize(annotation_map, (video_width, video_height),
                                        interpolation=cv2.INTER_LINEAR)
        annotation_resized = np.clip(annotation_resized, MIN_LEVEL_8b, MAX_LEVEL_8b) / MAX_LEVEL_8b

    return annotation_resized


def launch_ffmpeg_process(video_props, **kwargs):
    return (
        ffmpeg.input(
            'pipe:',
            format='rawvideo',
            pix_fmt='rgb24',
            s='{}x{}'.format(video_props['width'], video_props['height']),
        )
            .output(
            'pipe:',
            vcodec='libx264',
            preset='ultrafast',
            format='mp4',
            movflags='frag_keyframe',
        )
            .overwrite_output()
            .run_async(pipe_stdin=True, pipe_stdout=True, pipe_stderr=True)
    )


def process_frame_blur(video_np, annotation_resized, device, **kwargs):
    video_props = kwargs['video_props']
    video_width, video_height, video_id = video_props['width'], video_props['height'], video_props['video_id']

    blurred_2_video_path = get_path_for_npy_blurred_video(video_id, sigma=2)
    blurred_2_video_np = np.load(blurred_2_video_path, allow_pickle=True)
    blurred_5_video_path = get_path_for_npy_blurred_video(video_id, sigma=5)
    blurred_5_video_np = np.load(blurred_5_video_path, allow_pickle=True)

    annotation_neg = 1 - annotation_resized
    range1 = (annotation_neg >= 0) & (annotation_neg < 0.4)
    range2 = (annotation_neg >= 0.4) & (annotation_neg <= 1.0)

    # blur_map -> map between [0,1], inverse of annotation map
    # 0 -> no blur, 1 -> high blur
    # blur = 1 - annotation

    if device == 'gpu':
        video_tensor = torch.from_numpy(video_np)
        blurred_2_video_tensor = torch.from_numpy(blurred_2_video_np)
        blurred_5_video_tensor = torch.from_numpy(blurred_5_video_np)

        processed_video = \
            range1 * (video_tensor * annotation_resized + blurred_2_video_tensor * (1 - annotation_resized)) + \
            range2 * (blurred_2_video_tensor * annotation_resized + blurred_5_video_tensor * (1 - annotation_resized))
        processed_video = processed_video.cpu().detach().numpy()

    else:
        processed_video = \
            range1 * (video_np * annotation_resized + blurred_2_video_np * (1 - annotation_resized)) + \
            range2 * (blurred_2_video_np * annotation_resized + blurred_5_video_np * (1 - annotation_resized))
    return processed_video.astype(np.uint8)


def process_frame_salt_and_pepper(video_np, annotation_resized, device, **kwargs):
    video_props = kwargs['video_props']
    video_width, video_height, num_frames, video_id = video_props['width'], video_props['height'], \
                                                      video_props['num_frames'], video_props['video_id']

    # uniformly random noise in [-1, 1] * MAX_LEVEL_8b; at random locations.
    noise_pattern = np.load(get_path_for_npy_noise_video(video_id, noise_id='1'), allow_pickle=True)

    if device == 'gpu':
        video_np = torch.from_numpy(video_np)
        noise_pattern = torch.from_numpy(noise_pattern)
        processed_video = (video_np + noise_pattern * (1 - annotation_resized)).clamp(MIN_LEVEL_8b, MAX_LEVEL_8b)
    else:
        processed_video = np.clip(video_np +
                                  noise_pattern * (1 - annotation_resized),
                                  MIN_LEVEL_8b, MAX_LEVEL_8b)

    if device == 'gpu':
        processed_video = processed_video.cpu().detach().numpy()

    return processed_video.astype(np.uint8)


def process_video(video_np, processing_func, **kwargs):
    frames = []
    video_np = video_np.astype('float32')
    annotation_map = kwargs.get('annotation_normalized')
    ffmpeg_process = kwargs.get('ffmpeg_process')
    num_frames = annotation_map.shape[2]

    video_props = kwargs['video_props']
    video_width = video_props['width']
    video_height = video_props['height']

    if torch.cuda.is_available():
        device = 'gpu'
    else:
        device = 'cpu'

    # device = 'cpu'

    # Resize annotation map from editor window size to video size
    annotation_resized = reshape_annotation_map_to_video_shape(annotation_map, video_props, device)

    if processing_func == process_frame_blur or \
            processing_func == process_frame_salt_and_pepper:
        processed_video = processing_func(video_np, annotation_resized[:, :, np.newaxis, :], device, **kwargs)
        # ffmpeg_process.stdin.write(np.transpose(processed_video, (3, 0, 1, 2)).tobytes())
        # below is faster than above coz ffmpeg starts processing in parallel
        for i in range(num_frames):
            ffmpeg_process.stdin.write(processed_video[..., i].tobytes())

    else:
        for frame_num in range(num_frames):
            processed_frame = processing_func(video_np[..., frame_num],
                                              annotation_resized[..., frame_num:frame_num + 1],
                                              device, **kwargs)
            ffmpeg_process.stdin.write(processed_frame)
            frames.append(processed_frame)
        processed_video = np.array(frames)

    return processed_video

def importance_map_rescale(annotation_np, min_del_qp=-10, max_del_qp=10):
    # Convert [0, 1] annotation map range such that del_qp is between [min_del_qp, max_del_qp]
    # assumes del_qp = -3 * log_2(f(importance))
    # where attention is in [0, 1]
    annotation = 2**(((max_del_qp - min_del_qp) * annotation_np + min_del_qp) / 3)
    # print(annotation.min(), annotation.max())
    return annotation


def macroblock_importance_map(annotation_np, video_props, method='max'):
    annotation = reshape_annotation_map_to_video_shape(annotation_np, video_props, 'cpu')

    allowed_methods = ['max', 'min', 'mean', 'median']
    if method == 'max':
        annotation = skimage.measure.block_reduce(annotation, (MB_SIZE, MB_SIZE, 1), np.max)
    elif method == 'min':
        annotation = skimage.measure.block_reduce(annotation, (MB_SIZE, MB_SIZE, 1), np.min)
    elif method == 'mean':
        annotation = skimage.measure.block_reduce(annotation, (MB_SIZE, MB_SIZE, 1), np.mean)
    elif method == 'median':
        annotation = skimage.measure.block_reduce(annotation, (MB_SIZE, MB_SIZE, 1), np.median)
    else:
        raise ValueError(f"{method}: method is not implemented. Currently implemented methods are: \n{allowed_methods}")
    annotation = np.transpose(annotation, axes=[2, 0, 1])
    annotation = importance_map_rescale(annotation)
    annotation = annotation.astype(np.float32)
    return annotation


def x264_process_video(y4m_path, bitrate, importance_map, importance_name, stats_2pass = 'x264_2pass.log'):
    # Save importance map output
    im_path = os.path.join(_IMPORTANCE_MAPS, importance_name)

    if not os.path.isdir(_IMPORTANCE_MAPS):
        os.makedirs(_IMPORTANCE_MAPS)

    with open(im_path, 'w') as f:
        importance_map.tofile(f)

    x264_code = os.path.join(_X264_PATH, 'x264')
    if GPAC:
        video_path = im_path.replace('.bin', '.mp4')
        command1 = '{} --pass 1 --impfile {} --bitrate {} --stats {} -o {} {} --quiet'.format(x264_code, im_path, bitrate, stats_2pass, video_path, y4m_path)
        os.system(command1)
        command2 = '{} --pass 2 --impfile {} --bitrate {} --stats {} -o {} {} --quiet'.format(x264_code, im_path, bitrate, stats_2pass, video_path, y4m_path)
        os.system(command2)
        with open(video_path, 'rb') as f:
            return f.read()
    else:
        video_path = im_path.replace('.bin', '.264')
        command1 = '{} --pass 1 --impfile {} --bitrate {} --stats {} -o {} {} --quiet'.format(x264_code, im_path, bitrate, stats_2pass, video_path, y4m_path)
        os.system(command1)
        command2 = '{} --pass 2 --impfile {} --bitrate {} --stats {} -o {} {} --quiet'.format(x264_code, im_path, bitrate, stats_2pass, video_path, y4m_path)
        os.system(command2)
        kwargs = {'vcodec': 'h264', 'format': 'mp4', 'movflags': 'frag_keyframe', 'loglevel': 'error'}
        out = ffmpeg.input(video_path).output('pipe:', **kwargs)
        vid, _ = out.run(capture_stdout=True)
        return vid


def handle_distortion(video_id: str,
                      editor_width,
                      editor_height,
                      annotation_buffer,
                      user_id: str,
                      distortion_type
                      ):
    allowed_distortion_types = ['blur', 'SnP', 'x264', 'Test']
    if distortion_type not in allowed_distortion_types:
        raise ValueError(f"{distortion_type}: distortion type not implemented. Currently implemented distortions are:"
                         f"\n{allowed_distortion_types}")

    if distortion_type == 'x264':
        A = time.time()
        video_path = get_path_for_video(video_id)
        video_width, video_height = get_video_width_height(video_id)
        video_name = get_video_name(video_id)
        y4m_path = get_path_for_y4m_video(video_id)
        bitrate = get_video_bitrate(video_id)
        video_props = {'width': video_width, 'height': video_height, 'video_id': video_id, \
                'y4m_path': y4m_path, 'name': video_name}

        annotation_np = get_data_from_annotation_array(editor_height, editor_width, annotation_buffer)
        importance_map = macroblock_importance_map(annotation_np, video_props, method='max')
        random_val = ''.join(random.choices(string.ascii_uppercase + string.digits, k=10))
        importance_name = user_id + '_' + random_val + '_' + video_name + '.bin'
        stats_2pass = user_id + '_' + random_val + '_' + video_name + '_2pass_stats.log'
        stats_2pass = os.path.join(_TWO_PASS_STATS, stats_2pass)
        out = x264_process_video(y4m_path, bitrate, importance_map, importance_name, stats_2pass)
        B = time.time()
        print(f'Time taken for backend handle distortion {distortion_type} call: {(B - A):0.4f} s', file=sys.stderr)
        return out
    elif distortion_type == 'blur':
        processing_func = process_frame_blur
    elif distortion_type == 'SnP':
        processing_func = process_frame_salt_and_pepper
    elif distortion_type == 'Test':
        video_path = get_path_for_video(video_id)
        kwargs = {'vcodec': 'h264', 'format': 'ismv'}
        out = ffmpeg.input(video_path).video.filter('negate').output('pipe:', **kwargs)
        vid, _ = out.run(capture_stdout=True)
        return vid

    A = time.time()
    video_path = get_path_for_npy_video(video_id)
    video_width, video_height = get_video_width_height(video_id)
    video_props = {
        'width': video_width,
        'height': video_height,
        'video_id': video_id
    }

    # Load video
    # cap = cv2.VideoCapture(video_path)
    video_np = np.load(video_path, allow_pickle=True)

    # Convert bytes array to numpy array.
    annotation_np = get_data_from_annotation_array(editor_height, editor_width, annotation_buffer)
    num_frames = annotation_np.shape[2]
    video_props['num_frames'] = num_frames

    # Launch FFMPEG process to write out
    ffmpeg_process = launch_ffmpeg_process(video_props)

    # Process Video Frames
    frames = process_video(video_np, processing_func,
                           annotation_normalized=annotation_np,
                           ffmpeg_process=ffmpeg_process,
                           video_props=video_props)
    ffmpeg_process.stdin.close()

    # Extract FFMPEG encoded processed video frame
    out = ffmpeg_process.stdout.read(video_width * video_height * NUM_COLOR_CHANNELS * num_frames)
    B = time.time()
    print(f'Time taken for backend handle distortion {distortion_type} call: {(B - A):0.4f} s',
          file=sys.stderr)

    return out


def random_distortion_ffmpeg(
        video_id: str,
        editor_width: int,
        editor_height: int,
        annotation_buffer,
) -> bytes:
    video_path = get_path_for_video(video_id)
    kwargs = {'vcodec': 'h264', 'format': 'ismv'}
    out = ffmpeg.input(video_path).video.filter('negate').output('pipe:', **kwargs)
    vid, _ = out.run(capture_stdout=True)
    return vid


def get_pixel_flow_data(video_id:str) -> bytes:
    video_path = get_path_for_video(video_id)
    total_frames = get_video_frame_count(video_id)
    width,height = get_video_width_height(video_id)

    pixel_flow = get_video_optical_flow(video_id)
    return pixel_flow.tobytes()


def _save_a_video(file_name: str, subdir: str, file_content: bytes):
    save_dir = config.get_video_save_dir()
    save_sub_dir = os.path.join(save_dir, subdir)
    os.makedirs(save_sub_dir, exist_ok=True)
    abs_file_path = os.path.join(save_sub_dir, file_name)
    with open(abs_file_path, 'wb') as f:
        f.write(file_content)
    config.get_logger().info(f"saved {abs_file_path}")


def save_interactive(annotation_buffer: bytes, user_id: str, edit_mode: EditMode, video_name: str):
    file_name = f"{user_id}_{video_name}_{edit_mode}.bin"
    _save_a_video(file_name, Task.INTERACTIVE.value, annotation_buffer)


def random_distortion(
        video_id: str,
        edit_mode,
        editor_width,
        editor_height,
        displayer_width,
        displayer_height,
        annotation_buffer,
) -> bytes:
    video_path = get_path_for_video(video_id)
    video_width, video_height = get_video_width_height(video_id)
    video_fps = get_video_fps(video_id)

    cap = cv2.VideoCapture(video_path)
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    temp_dir = tempfile.gettempdir()
    temp_file = os.path.join(temp_dir, 'temp_file.mp4')
    out = cv2.VideoWriter(temp_file, fourcc, video_fps, (video_width, video_height))
    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break
        blur = cv2.GaussianBlur(frame, (17, 17), 0)
        out.write(blur)
    out.release()
    cap.release()
    with open(temp_file, 'rb') as f:
        return f.read()
