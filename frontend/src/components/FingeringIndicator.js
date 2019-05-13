import React, { Component } from 'react'
import ReactCSSTransitionGroup from 'react-addons-css-transition-group'
import './FingeringIndicator.css'

class FingeringIndicator extends Component {
  render() {
    return (
      <div className='hands-container'>
        <div className='hands'>
          { this.props.showWord ?
            <div className='bigram-container'>
              <ReactCSSTransitionGroup
                transitionName='fade'
                transitionEnterTimeout={250}
                transitionLeaveTimeout={250}>
                { this.props.fingers.map((finger, index) => (
                  <span key={index} className={'bigram b' + finger}>
                    { this.props.text[index] === ' ' ? '␣' : this.props.text[index] }
                  </span>
                )) }
              </ReactCSSTransitionGroup>
            </div>
            :
            ''
          }
          <ReactCSSTransitionGroup
            transitionName='fade'
            transitionEnterTimeout={250}
            transitionLeaveTimeout={250}>
            { this.props.fingers.map((finger, index) => (
              <div key={index} className={'finger f' + finger} />
            )) }
          </ReactCSSTransitionGroup>
        </div>
      </div>
    )
  }
}

export default FingeringIndicator
