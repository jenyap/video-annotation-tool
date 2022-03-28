import gzip
import pathlib
import uuid

import flask
from flask import Flask, jsonify, request
from flask_cors import CORS
from werkzeug.wrappers import response

from bootstrap import get_secret, bootstrap
from config.config import get_logger, get_video_permutations
from config.const import APP_NAME, Task, EditMode
from video.video import (
    get_video_names, get_video_buffer,
    get_video_frame_count, handle_distortion, get_next_video_from_perms,
    save_interactive, get_random_videos, get_pixel_flow_data, get_edges_path
)

app = Flask(APP_NAME)
CORS(app, supports_credentials=True)

app.secret_key = get_secret()


def _add_headers_to_response(resp: response.Response):
    resp.headers.add("Access-Control-Allow-Origin", "*")
    resp.headers.add("Access-Control-Allow-Credentials", "true")
    resp.headers.add("Access-Control-Allow-Headers", "*")
    resp.headers.add("Access-Control-Allow-Methods", "*")
    return resp


@app.route('/get_pixel_flow')
def get_pixel_flow():
    video = request.args.get('video', '')
    if not video or video not in get_video_names():
        return response.Response(status=response.HTTPStatus.NOT_FOUND)

    data = get_pixel_flow_data(video)
    compressed = gzip.compress(data)
    return response.Response(compressed, status=response.HTTPStatus.OK, content_type='gzip')

@app.route('/next_video')
def get_next_video():
    video = request.args.get('prev_video', '')
    videos_annotated = request.args.get('video_num', '')
    perm = request.args.get('permutation', '')
    videos_dists_perm =  get_video_permutations()
    if not all((video, videos_annotated, perm)):
        return response.Response(status=response.HTTPStatus.BAD_REQUEST)
    if video not in get_video_names():
        return response.Response(status=response.HTTPStatus.NOT_FOUND)
    if not videos_annotated.isdecimal():
        return response.Response(status=response.HTTPStatus.BAD_REQUEST)
    if perm.isalpha() or not videos_annotated.isdecimal():
        return response.Response(status=response.HTTPStatus.BAD_REQUEST)
    if not (int(perm) < len(videos_dists_perm)):
        return response.Response(status=response.HTTPStatus.BAD_REQUEST)
    if int(perm) < 0 and int(videos_annotated) != 0:
        return response.Response(status=response.HTTPStatus.BAD_REQUEST)
    video, videos_annotated, perm = str(video), int(videos_annotated), int(perm)
    perm, new_video, frames, distortion = get_next_video_from_perms(video, perm, videos_annotated)
    return _add_headers_to_response(jsonify([perm, new_video, frames, distortion]))

@app.route('/get_edges')
def get_edges():
    video = request.args.get('video', '')
    frame = request.args.get('frame', '')
    if not all((video, frame)):
        return response.Response(status=response.HTTPStatus.BAD_REQUEST)
    if video not in get_video_names():
        return response.Response(status=response.HTTPStatus.NOT_FOUND)
    total_frames = get_video_frame_count(video)
    if not frame.isdecimal() or int(frame) > total_frames:
        return response.Response(status=response.HTTPStatus.BAD_REQUEST)

    edges_path = get_edges_path(video)
    edge_frame = sorted(pathlib.Path(edges_path).iterdir())[int(frame)]
    with open(edge_frame, 'rb') as f:
        buffer = f.read()
    return response.Response(buffer, status=response.HTTPStatus.OK, content_type='jpeg')


@app.route('/get_video')
def get_video():
    video = request.args.get('video', '')
    if not video or video not in get_video_names():
        return response.Response(status=response.HTTPStatus.NOT_FOUND)
    try:
        video_buffer = get_video_buffer(video)
    except ValueError:
        video_buffer = None
    if not video_buffer:
        return response.Response(status=response.HTTPStatus.NOT_FOUND)
    resp = response.Response(video_buffer, status=response.HTTPStatus.OK)
    return resp


@app.route('/get_uid', methods=['GET'])
def get_uid():
    return jsonify(str(uuid.uuid4()))


@app.route('/edit_video', methods=['GET', 'POST'])
def edit_video():
    user_name = request.args.get('uid').lower()
    video_id = request.args.get('video', '')
    if not video_id or video_id not in get_video_names():
        return response.Response(status=response.HTTPStatus.NOT_FOUND)
    edit_mode = request.args.get('edit_mode', '').lower()
    edit_modes = EditMode.get_values()
    if edit_mode not in edit_modes:
        return response.Response(f"supported edit modes: {edit_modes}",
                                 status=response.HTTPStatus.BAD_REQUEST)
    editor_width = int(request.args.get('editor_width'))
    editor_height = int(request.args.get('editor_height'))
    annotation_buffer = gzip.decompress(request.get_data())
    logger = get_logger()
    logger.info(f"got request with {edit_mode=} {editor_width=} {editor_height=} "
                f"annotation buffer len {len(annotation_buffer)}")

    args = [video_id, editor_width, editor_height, annotation_buffer, user_name]
    if edit_mode == EditMode.BLUR.value:
        distortion_type = 'blur'
    elif edit_mode == EditMode.SALT_AND_PEPPER_NOISE.value:
        distortion_type = 'SnP'
    elif edit_mode == EditMode.X264.value:
        distortion_type = 'x264'
    elif edit_mode == EditMode.TEST.value:
        distortion_type = 'Test'
    else:
        raise NotImplementedError(f"cannot find handler for {edit_mode}")

    args.append(distortion_type)
    buffer = handle_distortion(*args)

    return response.Response(buffer, status=response.HTTPStatus.OK, content_type='video/mp4')


@app.route('/save_video', methods=['GET', 'POST'])
def save_video():
    video = request.args.get('video', '')
    task = request.args.get('task', '').lower()
    user_name = request.args.get('uid').lower()
    if not (all((task, video, user_name)) and Task.validate(task)):
        return response.Response("missing uid, video name or invalid task",
                                 status=response.HTTPStatus.BAD_REQUEST)
    annotation_buffer = gzip.decompress(request.get_data())
    if task == Task.INTERACTIVE.value:
        edit_mode = request.args.get('edit_mode', '').lower()
        if not EditMode.validate(edit_mode):
            return response.Response(f"invalid edit mode {edit_mode}. use: {EditMode.get_values()}",
                                     status=response.HTTPStatus.BAD_REQUEST)
        save_interactive(annotation_buffer, user_name, EditMode.from_value(edit_mode), video)
    return response.Response(status=response.HTTPStatus.OK)


@app.route('/')
def index():
    urls = []
    for u in app.url_map.iter_rules():
        if 'static' in u.endpoint:
            continue
        urls.append(flask.url_for(u.endpoint, _external=True))
    return "<!DOCTYPE html><body>" + '\n'.join(f"<a href={u}>{u}</a><br>" for u in urls) + "</body>"


def main():
    bootstrap()
    app.config['SESSION_COOKIE_SAMESITE'] = 'None'
    app.config['SESSION_COOKIE_SECURE'] = True
    app.run(debug=True)


def create_app():
    bootstrap()
    app.config['SESSION_COOKIE_SAMESITE'] = 'None'
    app.config['SESSION_COOKIE_SECURE'] = True
    return app


if __name__ == '__main__':
    main()
