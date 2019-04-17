import React from 'react'
import './WordsToType.css'
import WordMetadataPopup from './Word'
import ReactCSSTransitionGroup from 'react-addons-css-transition-group'
import { Placeholder } from 'semantic-ui-react'

const WordsToType = props => (

  <div className='WordsToType' style={{fontSize: (props.fontSize + 'em')}}>
    { props.loading ?
      <ReactCSSTransitionGroup
        transitionName='fade'
        transitionEnterTimeout={400}
        transitionLeaveTimeout={400}>
        <div>
          <Placeholder fluid style={{marginTop: '-0.3em'}}>
            <Placeholder.Line length='full'/>
            <Placeholder.Line length='full'/>
          </Placeholder>
          <br/>
        </div>
      </ReactCSSTransitionGroup>
      :
      <ReactCSSTransitionGroup
        transitionName='fade'
        transitionAppear={true}
        transitionAppearTimeout={700}
        transitionEnterTimeout={500}
        transitionLeaveTimeout={500}>
        { props.words.map((word, index) => (
          <span key={index} id={index === 0 ? 'firstWord' : null}>
            <WordMetadataPopup
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
    }
  </div>
)

const Space = () => (
  <span>{' '}</span>
)

export default WordsToType
