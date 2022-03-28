import React, { useEffect } from "react";

function VideoDisplayer(props) {
    const { src } = props;

    const videoRef = React.useRef();

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.load();
        }
    }, [src]);


    return (
        <div>
            <video id="left_video" width="800" height="450" ref={videoRef} autoPlay loop muted>
                <source src={src} type="video/mp4" />
                Your browser does not support the video tag.
            </video>
        </div>
    )
}

export default VideoDisplayer;
