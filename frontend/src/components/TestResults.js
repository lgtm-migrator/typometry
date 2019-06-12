import React from 'react'
import Typography from '@material-ui/core/Typography'

const TestResults = props => (
  <div>
        <Typography>{props.wordsPerMinute}</Typography>
        <Typography>Words per minute</Typography>
        <Typography>{props.accuracy + '%'}</Typography>
        <Typography>Accuracy</Typography>
  </div>
)

export default TestResults
