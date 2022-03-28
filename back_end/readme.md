# Installation
Developed in python3.8 (tested also on python3.9, should be compatible with 3.7)

```shell
  $ cd annotation-tool/back_end
  $ make install
```

# Run
```shell
$ cd annotation-tool/back_end
$ make run
# open browser at printed url (usually http://127.0.0.1:5000)
```
# Use

## get video
```http://127.0.0.1:5000/get_video?video=<video_id>``` where ```<video_id>``` is the video ID from ```back_end/src/data/videos_data.json```.
returns: the video encoded in mp4

## get pixel flow
```http://127.0.0.1:5000/get_pixel_flow?video=<video_id>``` where ```<video_id>``` is the video ID from ```back_end/src/data/videos_data.json```.

returns: gzipped array of int8 with shape <br>
```python
  (width, height, frame_count, 2)
```
## get edges frame
```http://127.0.0.1:5000/get_edges?video=<video_id>&frame=<frame_number>``` where<br>
```<video_id>``` is the is the video ID from ```back_end/src/data/videos_data.json``` and ```<frame_number>``` is the number<br>
of the frame to get edges frame for.

```python
http://127.0.0.1:5000/get_edges?video=1&frame=19
```
returns: the frame as jpeg

## get uid
```http://127.0.0.1:5000/get_uid``` get a unique identifier to identify saved videos

returns: a unique string

```python3
import requests
 
url = 'http://127.0.0.1:5000/get_uid'
r = requests.get(url)
print(r.json())
 
"dfcda3a4-6457-452f-b17d-73e933045d6c"
```
