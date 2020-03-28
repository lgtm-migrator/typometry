import * as React from 'react'
import './FingeringIndicator.css'

interface FingeringTextProps {
  standAlone: boolean
  fingeringObject: any
}

const FingeringText: React.FC<FingeringTextProps> = (props) => {
  return (
    <div className={
      props.standAlone ?
        'fingering-container'
        :
        'bigram-container'}>
      {props.fingeringObject.fingering.map((finger, index) => (
        renderFingeredText(finger, index)
      ))}
    </div>
  )
}

const getFingerNumber = function (fingering) {
  if (Array.isArray(fingering)) {
    return fingering[1]
  } else {
    return fingering.fingering[1]
  }
}

const renderFingeredText = function (text, index) {
  if (Array.isArray(text)) {
    return (
      <span key={index} className={'bigram b' + getFingerNumber(text)}>
        {text[0] === ' ' ?
          '␣'
          :
          text[0]}
      </span>
    )
  } else {
    return renderModGroup(text, index)
  }
}

const renderModGroup = function (modGroup, index) {
  return (
    <span key={index}>
      <span className={'mod mod-start b' + modGroup.modFinger}>
        {modGroup.modName}
        &nbsp;
      </span>
      {modGroup.fingering.map((finger, index) => (
        <span key={index} className={'bigram b' + getFingerNumber(finger)}>
          {finger[0]}
        </span>
      ))}
      <span className={'mod mod-end b' + modGroup.modFinger} />
    </span>
  )
}


export default FingeringText

