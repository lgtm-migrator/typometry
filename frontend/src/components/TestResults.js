import React from 'react'
import { Statistic } from 'semantic-ui-react'

const TestResults = props => (
  <div>
      <Statistic>
        <Statistic.Value>{props.wordsPerMinute}</Statistic.Value>
        <Statistic.Label>Words per minute</Statistic.Label>
      </Statistic>
      <Statistic>
        <Statistic.Value>{props.accuracy + '%'}</Statistic.Value>
        <Statistic.Label>Accuracy</Statistic.Label>
      </Statistic>
  </div>
)

export default TestResults
