import * as React from 'react'
import { BigramScore } from './interfaces'

interface BigramProps {
  bigramScore: BigramScore
}

interface BigramProgressProps {
  bigramScores: BigramScore[]
}

const Bigram: React.FC<BigramProps> = (props) => (
  <span className='bigram-progress'>
    { props.bigramScore.bigram }
  </span>
)

const BigramProgress: React.FC<BigramProgressProps> = (props) => {
  return (
    <span>
      {
        props.bigramScores.map((bigramScore, index) => (
          <span key={index}>
            <Bigram bigramScore={bigramScore} />
          </span>
        ))
      }
    </span>
  )
}

export default BigramProgress
