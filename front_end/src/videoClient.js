import axios from 'axios';
import pako from 'pako';


const DOMAIN_NAME = 'http://127.0.0.1:5000';

const COMPRESS_HEADERS = {
    'Accept': "application/json, text/plain, */*",
    'Content-Encoding': 'gzip',
};

const getSessionId = async () => {
    try {
        const res = await axios({
            url: `${DOMAIN_NAME}/get_uid`,
            method: 'GET'
        });
        return res.data
    } catch (err) {
        console.error(err);
    }
}

const getNextTask = async (videoName, permutation, videoNum) => {
    try {
        const res = await axios({
            url: `${DOMAIN_NAME}/next_video`,
            method: 'GET',
            params: {
                'prev_video': videoName,
                'permutation': permutation,
                'video_num': videoNum
            }
        });

        return {
            permutation: res.data[0],
            name: res.data[1],
            frames: res.data[2],
            distortion: res.data[3]
        };

    } catch (err) {
        console.error(err);
    }
}

const getVideoSrc = async (videoName) => {
    try {
        const res = await axios({
            url: `${DOMAIN_NAME}/get_video?video=${videoName}`,
            method: 'GET',
            responseType: 'blob',
            withCredentials: true,
        });

        return _build_object_url(res.data);
    } catch (err) {
        console.error(err);
    }
}

const getPixelFlow = async (videoName) => {
    try {
        const res = await axios({
            url: `${DOMAIN_NAME}/get_pixel_flow?video=${videoName}`,
            method: 'GET',
            responseType: 'arraybuffer',
            decompress: true
        });
        const val = pako.ungzip(res.data);
        const pixelFlow = new Int8Array(val.buffer)
        return pixelFlow
    } catch (err) {
        console.error(err);
    }
}

const getFrameSrcs = async (videoName, frameIndex) => {
    try {
        const res = await axios({
            url: `${DOMAIN_NAME}/get_edges`,
            method: 'GET',
            responseType: 'blob',
            params: {
                'video': videoName,
                'frame': frameIndex
            }
        });

        return _build_object_url(res.data);
    } catch (err) {
        console.error(err)
    }
}


const saveExperimentResult = async (videoName, dataAnnotation, distortion, sessionId) => {
    const data = pako.gzip(dataAnnotation);

    let params = {
        task: 'interactive',
        uid: sessionId,
        edit_mode: distortion,
        video: videoName
    };

    try {
        await axios({
            url: `${DOMAIN_NAME}/save_video`,
            withCredentials: true,
            method: 'POST',
            headers: COMPRESS_HEADERS,
            params: params,
            data
        });
    } catch (err) {
        console.error(err);
    }
}

let source;
const editVideo = async (videoName, distortion, sessionId, dataAnnotation, videosDimensions) => {
    source = axios.CancelToken.source();
    const data = pako.gzip(dataAnnotation);

    try {
        const res = await axios({
            url: `${DOMAIN_NAME}/edit_video`,
            method: 'POST',
            responseType: 'blob',
            headers: COMPRESS_HEADERS,
            params: {
                video: videoName,
                uid: sessionId,
                edit_mode: distortion,
                editor_width: videosDimensions.editorWidth,
                editor_height: videosDimensions.editorHeight,
            },
            data,
            cancelToken: source.token
        });
        source = null;
        return _build_object_url(res.data);
    } catch (err) {
        if (axios.isCancel(err)) {
            return;
        }
        console.error(err);
    }
}

const cancelEditRequests = () => {
    if (source) {
        source.cancel('Edit request canceled.');
    }
}

const _build_object_url = (obj) => {
    return window.URL.createObjectURL(new Blob([obj]));
}

export default {
    cancelEditRequests,
    getNextTask,
    getSessionId,
    getVideoSrc,
    getFrameSrcs,
    getPixelFlow,
    saveExperimentResult,
    editVideo
};
