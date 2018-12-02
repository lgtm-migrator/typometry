import React from 'react'
import './Word.css'

const Word = props => (
  <span
    id={props.current ? 'currentWord' : null}
    className={whichStyle(props)}>
    {props.text}
  </span>
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

export default Word
