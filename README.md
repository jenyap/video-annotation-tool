# Video Annotation Tool

## General:
1. Download the code: ```git clone https://github.com/jenyap/video-annotation-tool.git```
2. Create ```saved_videos```, ```x264_stats``` and ```importance_maps``` directories in ```${Project_Dir}```
3. After running step 2 in BackEnd a virtual environment is created in ```${Project_Dir}/venv```. <br>To activate it run: ```source ${Project_Dir}/venv/bin/activate```. Please run these two steps first.
4. Please use Chrome Browser.

## X264:
1. git clone the modified [x264](https://github.com/wave-one/x264) code.
2. Define an environment variable named X264_WAVEONE and set it to the full-path of x264 directory.
3. If [GPAC](https://github.com/gpac/gpac) is installed, set ```GPAC = TRUE``` in ```${Project_Dir}/back_end/src/video/video.py```
4. Compile x264 using following commands:
   ```
   ./configure --disable-interlaced
   make -j
   ```
5. In ```pre_processing/helper/videos_bitrates.py``` create a ```videos_bitrate``` python dict that maps from a video name to the wanted bitrate. For example ```videos_bitrate = {'video1': 100, 'video2': 150}```

## Videos:
Add the videos where BackEnd will run. Example video directory is provided below (Dataset section).

#### ```${Project_Dir}/videos``` structure:
  - video1:
    - video1.mp4
  - video2:
    - video2.mp4
  - ...
  - videoN:
    - videoN.mp4

#### Video Pre-Processing
1. ```source ${Project_Dir}/venv/bin/activate```.
2. Download the videos and save them in ```${Project_Dir}/videos``` as described above.
3. Run ```${Project_Dir}/pre_processing/videos_preprocessing.py --videos_dir ${Project_Dir}/videos```.
4. Copy the created JSON file to: ```${Project_Dir}/back_end/src/data/videos_data.json```.

## BackEnd:
1. Go to: ```${Project_Dir}/back_end```
2. Run ```make install```
3. Activate the virtual env
4. Go to: ```${Project_Dir}/back_end/src```
5. Run: ```waitress-serve --call --port=PortNum 'app:create_app' ```

## FrontEnd:
1. Install node and npm
2. Update the IP address and port number of the backend server in ```${Project_Dir}/front_end/src/videoClient.js```
3. Go to: ```${Project_Dir}/front_end```
4. Run: ```npm install```
5. Run: ```npm run build```
6. Install serve:  ```npm install -g serve```
7. Run: ```serve -s build```

## Post-Processing
To visualize the importance map as an mp4 video please use ```${Project_Dir}/post_processing/annotations.py```

## Dataset:
For our research we used a subset of videos from CLIC 2021 video compression [challenge](http://compression.cc/tasks/). 
The videos we used can be found [here](https://drive.google.com/file/d/1As6u_D6jN2uLPEbZ45kVWe609E151Y5P/view?usp=sharing).

We used MTurk to annotate the videos using this tool, the results can be found [here](https://drive.google.com/file/d/1L_njK-NqHgUYpZsUHFreupJ9ksA0w4ER/view?usp=sharing).

We created an average importance map based on the MTurk user annotations. 
We encoded each video twice using x264: (1) with the importance map (2) without the importance map (baseline).
One can find the videos and the average importance map [here](https://drive.google.com/file/d/10HtnlMTjjLVenX9KkHsKhcRhmW-kfSLd/view?usp=sharing).

## Try the Video Annotation Tool
Please use Chrome browser and go to [this](http://34.133.152.191:3000/) website.

## Acknowledgement
We would like to thank Ayal Mittelman and Itamar Raviv for helping develop the video annotation tool.
