import * as React from 'react'
import { BigramScore } from './interfaces'

interface BigramProps {
  bigramScore: BigramScore
}

interface BigramProgressProps {
  bigramScores: BigramScore[]
}

const Bigram: React.FC<BigramProps> = (props) => (
  <div className='bigram'>
    { props.bigramScore.bigram }
  </div>
)

const BigramProgress: React.FC<BigramProgressProps> = (props) => {
  return (
    <div>
      {
        props.bigramScores.map((bigramScore, index) => (
          <div key={index}>
            <Bigram bigramScore={bigramScore} />
          </div>
        ))
      }
    </div>
  )
}

export default BigramProgress
