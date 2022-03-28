import os
import cv2
import argparse
import numpy as np

annotation_width = 480
annotation_height = 270

def LoadResult(result_path, width, height):
    if not os.path.exists(result_path):
        print('[Error][LoadResult] Path does not exist: {}'.format(result_path))
        return
    with open(result_path, 'rb') as f:
        result = f.read()
    result = np.frombuffer(result, dtype=np.uint8)
    result = result.reshape(width, height, -1, order='F').swapaxes(0, 1)
    return result

def ConvertAnnotationToBGR(annotation_frame):
    h, w = annotation_frame.shape
    red = annotation_frame.astype(np.uint8)
    blue = np.zeros((h, w), dtype=np.uint8)
    green = np.zeros((h, w), dtype=np.uint8)
    frame = np.stack((blue, green, red), axis=2)
    return frame

def VideoAnnotation(annotation_map, output_file):
    '''
    :input -
        annotation_map - a numpy array of the annotation results.
                Use LoadResult to load the annotation results to a numpy arr.
        video_path - the video which was annotated.
    '''
    assert output_file.endswith('.mp4')

    annotation_num_frames = annotation_map.shape[2]
    
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    out = cv2.VideoWriter(output_file, fourcc, 25, (annotation_width, annotation_height))
    
    for i in range(annotation_num_frames):
        ann_frame = ConvertAnnotationToBGR(annotation_map[..., i])
        out.write(ann_frame)
    out.release()


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Create video of the annotation result.')
    parser.add_argument('-AMP', '--ann_map_path', required=True, type=str,
                        help='path to the annotation result')
    parser.add_argument('-OF', '--output_file', required=True, type=str,
                        help='path to output file')
    args = parser.parse_args()

    # create output dir if it doesn't exist
    output_file_path = args.output_file.rsplit("/", 1)[0]
    if not os.path.isdir(output_file_path):
        os.makedirs(output_file_path)

    # get annotation map result
    result = LoadResult(args.ann_map_path, annotation_width, annotation_height)
    VideoAnnotation(result, args.output_file)
