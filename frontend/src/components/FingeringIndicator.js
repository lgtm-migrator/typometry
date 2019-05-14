import React, { Component } from 'react'
import ReactCSSTransitionGroup from 'react-addons-css-transition-group'
import './FingeringIndicator.css'
import FingeringText from './FingeringText'


class FingeringIndicator extends Component {
  render() {
    return (
      <div className='hands-container'>
        <div className='hands'>
          { this.props.showWord ?
            <FingeringText {...this.props} />
            :
            ''
          }
          <ReactCSSTransitionGroup
            transitionName='fade'
            transitionEnterTimeout={250}
            transitionLeaveTimeout={250}>
            { this.props.fingeringObject.fingerSet.map((finger, index) => (
              <div key={index} className={'finger f' + finger} />
            )) }
          </ReactCSSTransitionGroup>
        </div>
      </div>
    )
  }
}

export default FingeringIndicator
