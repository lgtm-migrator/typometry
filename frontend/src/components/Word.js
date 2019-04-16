import React from 'react'
import './Word.css'
import { Popup } from 'semantic-ui-react'

const Word = props => (
  <span
    id={props.current ? 'currentWord' : null}
    className={whichStyle(props) + ' ui simple'}>
    {props.text}
  </span>
)

const WordMetadataPopup = props => (
  <Popup
      trigger={<Word {...props} />}
      content='Woot!'
      on='click'
  />
)

const whichStyle = function (props) {
  const current = props.current
  const typed = props.typed
  const containsTypo = props.containsTypo
  const typo = props.typo
  if (current) {
    if (containsTypo) {
      return 'typo'
    } else {
      return 'currentWord'
    }
  } else if (typed && !typo) {
    return 'typedCorrect'
  } else if (typed && typo) {
    return 'typedTypo'
  }
  return 'Word'
}

export default WordMetadataPopup
