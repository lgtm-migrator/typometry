import React from 'react'
import './WordsToType.css'
import WordMetadataPopup from './Word'
import { Fade } from '@material-ui/core'
import DelayedProgressCircle from './DelayedProgressCircle'

const WordsToType = props => (

  <div className={
    props.mode === 'longText' ?
      'WordsToType enlarged-height'
      :
      'WordsToType normal-height'
      } style={{fontSize: (props.fontSize + 'em')}}>
      <Fade
        in={!(props.words.length === 0)}>
        <span>
        { props.words.map((word, index) => (
          <span key={index} id={index === 0 ? 'firstWord' : null}>
            <WordMetadataPopup
              key={index+word}
              text={word}
              typed={index < props.currentWord}
              typo={props.typoIndices.includes(index)}
              containsTypo={props.typo}
              current={index === props.currentWord}
            />
          <Space />
        </span>
        )) }
        </span>
      </Fade>
  </div>
)

const Space = () => (
  <span>{' '}</span>
)

export default WordsToType
