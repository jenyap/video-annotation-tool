import React from 'react';
import { Typography } from '@mui/material';
import './Instructions.css';
import consts from '../consts';

function Instructions() {
    return (
        <div className='Instructions'>
            <Typography variant='h3'>
                Welcome To Annotation Tool Application
            </Typography>
            <Typography variant='body1' className='instruction-content' align='left'>
                <font color="red"><em>NOTE:</em></font> Please use <i>Chrome Browser</i>.
                Unfortunately, other browsers are not supported right now. Also, please do not
                refresh the page while completing the task. Thank you!
            </Typography>
            <Typography variant='h6' align='left'>
                What is the goal?
            </Typography>
            <Typography variant='body1' className='instruction-content' align='left'>
                You are presented with a distorted video on the left and an annotation map on the right.
                The objective of the task is to generate the "best looking" video you can using the annotation map.
                Note that best looking is intentionally a bit vague, as it is subjective.
            </Typography>
            <Typography variant='h6' align='left'>
                The Task
            </Typography>
            <Typography variant='body1' align='left'>
                Please watch the next video:
            </Typography>
            <video width='640' height='360' controls src='instructions/example.mp4' type="video/mp4" />
            <Typography variant='body1' align='left' component={'span'}>
                <ul>
                    <li>
                        You are presented with a distorted video on the left and an annotation map on the right.
                    </li>
                    <li>
                        In order to improve the quality of certain areas of the video, you can color areas of 
                        the annotation map on the right red with the painting brush. Similarly, in order to 
                        degrade the quality of certain areas, you can use the eraser. After you color/erase, 
                        a new distorted video is generated and presented on the left. 
                    </li>
                    <li>
                        Note that when you color a certain area red, the quality in the other areas decreases. 
                        For example, in the gif below, over-emphasizing the guitarist makes him look good, 
                        but produces substantial artifacts in the background, making the overall video look worse.
                    </li>
                    <img src='instructions/gif_guitar.gif' width="800" height="360" controls alt="" />
                    <li>
                        Repeat this process until you are satisfied with the result! Once you are done press 
                        Next Video to view the next video.To get started, press on the Task button. When you 
                        are done, press Next Video to save your results and proceed.
                    </li>
                    <li>
                        You should spend at least <em>{consts.SPEND_MINUTES} minutes</em> on each video.
                        The Next Video button will be available after {consts.SPEND_MINUTES} minutes.
                    </li>
                </ul>
            </Typography>
        </div>
    )
}

export default Instructions;
