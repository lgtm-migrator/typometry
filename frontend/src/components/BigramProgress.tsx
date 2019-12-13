import * as React from 'react'
import { BigramScore } from './interfaces'
import './BigramProgress.css'

interface BigramProps {
  bigramScore: BigramScore
}

interface BigramProgressProps {
  bigramScores: BigramScore[]
  topBigrams: string[]
}

const Bigram: React.FC<BigramProps> = (props) => (
  <span className='bigram-progress'>
    { props.bigramScore.bigram }
  </span>
)

const BigramProgress: React.FC<BigramProgressProps> = (props) => {
  // Deep copy scores
  let scoresCopy: BigramScore[] = JSON.parse(JSON.stringify(props.bigramScores))
  let scoredBigrams = props.bigramScores.map((bigramScore) => bigramScore.bigram)
  for (let i = 0; i < props.topBigrams.length; i++) {
    if (!scoredBigrams.includes(props.topBigrams[i])) {
      scoresCopy.push({avg_time: 0, count: 0, bigram: props.topBigrams[i]})
    }
  }
  return (
    <span>
      {
        scoresCopy.map((bigramScore, index) => (
          <span key={index}>
            <Bigram bigramScore={bigramScore} />
          </span>
        ))
      }
    </span>
  )
}

export default BigramProgress
