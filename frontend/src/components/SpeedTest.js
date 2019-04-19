import React, {Component} from 'react'
import './SpeedTest.css'
import TestResults from './TestResults'
import WordsToType from './WordsToType'
import { Button } from 'semantic-ui-react'
import * as ci from 'correcting-interval'

class SpeedTest extends Component {
  constructor(props) {
    super(props)
    this.state = {
      timerStarted: false,
      testStarted: false,
      testComplete: false,
      totalSeconds: 60,
      elapsedSeconds: 0,
      numTypos: 0,
      numWordsTyped: 0
    }
    this.startTimer = this.startTimer.bind(this)
    this.incrementTimer = this.incrementTimer.bind(this)
    this.beginTest = this.beginTest.bind(this)
  }

  startTimer() {
    this.setState({
      elapsedSeconds: 0,
      timeStarted: Date.now(),
      timerStarted: true
    })
    this.timer = ci.setCorrectingInterval(() => {
      const {
        totalSeconds,
        elapsedSeconds,
        timeStarted,
      } = this.state

      // Test for clock running ahead / behind
      const currentTime = Date.now()
      const elapsedTime = currentTime - timeStarted
      let newElapsed = elapsedSeconds + 1
      const offset = elapsedTime - (newElapsed * 1000)
      let aheadBehind = offset < 0 ? 'ahead' : 'behind'
      const printOffset = offset < 0 ? offset * -1 : offset
      console.log('Running ' + printOffset + 'ms ' + aheadBehind)

      this.setState({
        elapsedSeconds: (newElapsed <= totalSeconds ? newElapsed : totalSeconds),
      })
      if (elapsedSeconds >= totalSeconds) {
        this.setState({
          timerStarted: false,
          testStarted: false,
          testComplete: true,
          numWordsTyped: this.props.numWordsTyped,
          numTypos: this.props.numTypos
        })
        ci.clearCorrectingInterval(this.timer)
        this.props.endFunction()
      }
    }, 1000)
  }

  incrementTimer() {
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (this.props.typedText !== prevProps.typedText && !prevState.timerStarted) {
      if (this.state.testStarted) {
        this.startTimer()
      }
    }
  }

  componentWillUnmount() {
    this.setState({timerStarted: false})
    ci.clearCorrectingInterval(this.timer)
  }

  beginTest() {
    this.props.startFunction()
    this.setState({
      testStarted: true,
      testComplete: false
    })
  }

  render() {
    const {
      numWordsTyped,
      numTypos,
      totalSeconds
    } = this.state

    return (
      <div className='SpeedTest'>
        { this.state.testComplete ?
          <TestResults
            wordsPerMinute={Math.round(numWordsTyped / totalSeconds * 60)}
            numTypos={numTypos}
            totalSeconds={totalSeconds} />
          :
          ''
        }
        { !this.state.testStarted ?
          <Button onClick={this.beginTest}>Start</Button>
          :
          <WordsToType {...this.props} />
        }
      </div>
    )
  }
}

export default SpeedTest
