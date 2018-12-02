import React from 'react'
import './WordsToType.css'
import Word from './Word'
import ReactCSSTransitionGroup from 'react-addons-css-transition-group'

const WordsToType = props => (
  <>
    <div className='WordsToType'>
      <ReactCSSTransitionGroup
        transitionName='fade'
        transitionEnterTimeout={300}
        transitionLeaveTimeout={300}>
        { props.words.map((word, index) => (
          <span key={index} id={index === 0 ? 'firstWord' : null}>
            <Word
              text={word}
              typed={index < props.currentWord}
              typo={props.typoIndices.includes(index)}
              containsTypo={props.typo}
              current={index === props.currentWord}
            />
            <Space />
          </span>
        )) }
      </ReactCSSTransitionGroup>
    </div>
  </>
)

const Space = () => (
  <span>{' '}</span>
)

export default WordsToType
