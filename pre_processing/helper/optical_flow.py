"""
Based on tutorial link: https://github.com/spmallick/learnopencv/tree/master/Optical-Flow-in-OpenCV
"""

import argparse
import cv2
import numpy as np


def dense_optical_flow(method, video_path, params=[], to_gray=False):
    # read the video
    cap = cv2.VideoCapture(video_path)
    # Read the first frame
    ret, old_frame = cap.read()

    # Preprocessing for exact method
    if to_gray:
        old_frame = cv2.cvtColor(old_frame, cv2.COLOR_BGR2GRAY)

    flows = []
    while True:
        # Read the next frame
        ret, new_frame = cap.read()
        frame_copy = new_frame
        # breakpoint()
        if not ret:
            break
        # Preprocessing for exact method
        if to_gray:
            new_frame = cv2.cvtColor(new_frame, cv2.COLOR_BGR2GRAY)
        # Calculate Optical Flow
        flow = method(old_frame, new_frame, None, *params)
        flows.append(flow)
        old_frame = new_frame
    return np.array(flows)


def optical_flow(video_path, output_path, algorithm):
    if algorithm == 'farneback':
        method = cv2.calcOpticalFlowFarneback
        params = [0.5, 3, 15, 3, 5, 1.2, 0]  # Farneback's algorithm parameters
        res = dense_optical_flow(method, video_path, params, to_gray=True)
    else:
        print('[ERROR][optical_flow] algorithm {} does not exist'.format(algorithm))
    res = res.astype(np.int8)
    np.save(output_path, res)
