import React, {Component} from 'react'
import './SpeedTest.css'
import TestResults from './TestResults'
import WordsToType from './WordsToType'
import { Button } from 'semantic-ui-react'
import * as ci from 'correcting-interval'
import ReactCSSTransitionGroup from 'react-addons-css-transition-group'

class SpeedTest extends Component {
  constructor(props) {
    super(props)
    this.state = {
      timerStarted: false,
      testStarted: false,
      testComplete: false,
      totalSeconds: 6,
      elapsedSeconds: 0,
      numTypos: 0,
      numWordsTyped: 0
    }
    this.startTimer = this.startTimer.bind(this)
    this.beginTest = this.beginTest.bind(this)
    this.finishTest = this.finishTest.bind(this)
  }

  startTimer() {
    this.setState({
      elapsedSeconds: 0,
      timeStarted: Date.now(),
      timerStarted: true
    })
    console.log('Timer started')
    this.props.showProgress(true)
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
      this.props.updateProgress((elapsedSeconds + 1) / totalSeconds * 100 + 2)
      if (elapsedSeconds >= totalSeconds) {
        this.finishTest()
      }
    }, 1000)
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

  finishTest() {
    this.setState({
      timerStarted: false,
      testStarted: false,
      testComplete: true,
      numWordsTyped: this.props.numWordsTyped,
      numTypos: this.props.numTypos
    })
    ci.clearCorrectingInterval(this.timer)
    this.props.showProgress(false)
    this.props.updateProgress(0)
    this.props.endFunction()
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
          <ReactCSSTransitionGroup
            transitionName='fade'
            transitionEnterTimeout={300}
            transitionLeaveTimeout={300}>
            <TestResults
              key='testResults'
              wordsPerMinute={Math.round(numWordsTyped / totalSeconds * 60)}
              accuracy={Math.round(numWordsTyped / (numWordsTyped + numTypos) * 100)}
              numTypos={numTypos}
              totalSeconds={totalSeconds} />
          </ReactCSSTransitionGroup>
          :
          ''
        }
        { !this.state.testStarted ?
          <Button key='beginTest' onClick={this.beginTest}>
            {this.state.testComplete ? 'Restart' : 'Start'}
          </Button>
          :
          <ReactCSSTransitionGroup
            transitionName='fade'
            transitionEnterTimeout={300}
            transitionLeaveTimeout={300}>
            <WordsToType key='wordsToType' {...this.props} />
          </ReactCSSTransitionGroup>
        }
      </div>
    )
  }
}

export default SpeedTest
