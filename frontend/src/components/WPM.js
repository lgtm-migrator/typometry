import React from 'react'
import './WPM.css'
import ReactCSSTransitionGroup from 'react-addons-css-transition-group'

const WPM = props => (
  <div className='WPM'>
    <ReactCSSTransitionGroup
      transitionName='fade'
      transitionEnterTimeout={500}
      transitionLeaveTimeout={300}>
      <div key={props.currentWPM === 0 ? 'hidden' : 'shown'} >
        { props.currentWPM === 0 ? ' ' : props.currentWPM + ' WPM' }
      </div>
    </ReactCSSTransitionGroup>
  </div>
)

export default WPM
