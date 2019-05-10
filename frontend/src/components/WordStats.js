import React from 'react'
import './WordStats.css'
import FingeringIndicator from './FingeringIndicator'
import './FingeringIndicator.css'

const WordStats = props => (
  <div>
    <div>
      This word is {common(props.frequency)} in this language.
    </div>
    <div className='fingering-container'>
      { props.fingering.map((finger, index) => (
        <span key={index} className={'bigram b' + finger}>
          { props.word[index] === ' ' ? '␣' : props.word[index] }
        </span>
      )) }
    </div>
    <FingeringIndicator
      fingers={ props.fingering }
      text={ props.word }
      showWord={ false } />
  </div>
)

const common = function(freq) {
  switch (freq) {
    case 0:
      return <span className='freq c0'>extremely common</span>
    case 1:
      return <span className='freq c1'>very common</span>
    case 2:
      return <span className='freq c2'>common</span>
    case 3:
      return <span className='freq c3'>somewhat common</span>
    case 4:
      return <span className='freq c4'>somewhat uncommon</span>
    case 5:
      return <span className='freq c5'>uncommon</span>
    case 6:
      return <span className='freq c6'>very uncommon</span>
    case 7:
      return <span className='freq c7'>extremely uncommon</span>
    default:
      return 'unknown'
  }
}

export default WordStats