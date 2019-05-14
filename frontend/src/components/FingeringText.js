import React from 'react'
import ReactCSSTransitionGroup from 'react-addons-css-transition-group'
import './FingeringIndicator.css'

const FingeringText = props => (
  <div className={
    props.standAlone ?
    'fingering-container'
    :
    'bigram-container'
  }>
    <ReactCSSTransitionGroup
      transitionName='fade'
      transitionEnterTimeout={250}
      transitionLeaveTimeout={250}>
      { props.fingeringObject.fingering.map((finger, index) => (
        renderFingeredText(finger)
      )) }
    </ReactCSSTransitionGroup>
  </div>
)

const getFingerNumber = function(fingering) {
  if (Array.isArray(fingering)) {
    return fingering[1]
  }
  else {
    return fingering.fingering[1]
  }
}

const renderFingeredText = function(text) {
  console.log('Rendering: ')
  console.log(text)
  if (Array.isArray(text)) {
    return (
      <span className={'bigram b' + getFingerNumber(text)}>
        { text[0] }
      </span>
    )
  }
  else {
    return renderModGroup(text)
  }
}

const renderModGroup = function(modGroup) {
  return (
    <span>
      <span className={'mod mod-start b' + modGroup.modFinger}>
        { modGroup.modName + ' ' }
      </span>
      { modGroup.fingering.map((finger, index) => (
        <span key={index} className={'bigram b' + getFingerNumber(finger)}>
          { finger[0] }
        </span>
      )) }
      <span className={'mod mod-end b' + modGroup.modFinger} />
    </span>
  )
}


export default FingeringText

