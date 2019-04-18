import React, {Component} from 'react'
import './SpeedTest.css'
import { Button } from 'semantic-ui-react'
import WordsToType from './WordsToType'
import * as ci from 'correcting-interval'

class SpeedTest extends Component {
  constructor(props) {
    super(props)
    this.state = {
      showWords: false,
      timerStarted: false,
      testComplete: false,
      totalSeconds: 60,
      elapsedSeconds: 0,
    }
    this.startTimer = this.startTimer.bind(this)
    this.incrementTimer = this.incrementTimer.bind(this)
    this.beginTiming = this.beginTiming.bind(this)
  }

  startTimer() {
    this.setState({
      elapsedSeconds: 0,
      timeStarted: Date.now()
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
          timerStarted: false
        })
        ci.clearCorrectingInterval(this.timer)
      }
    }, 1000)
  }

  incrementTimer() {
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (this.state.timerStarted !== prevState.timerStarted) {
      if (this.state.timerStarted) {
        this.startTimer()
      }
    }
    console.log('componentDidUpdate')
  }

  componentWillUnmount() {
    this.setState({timerStarted: false})
    ci.clearCorrectingInterval(this.timer)
  }

  beginTiming() {
    this.setState({timerStarted: true})
  }

  render() {
    return (
      <div className='SpeedTest'>
        { !this.state.timerStarted ?
          <Button onClick={this.beginTiming}>Start</Button>
          :
          <WordsToType {...this.props} />
        }
      </div>
    )
  }
}

export default SpeedTest
