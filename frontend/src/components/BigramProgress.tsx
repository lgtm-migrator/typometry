import * as React from 'react'
import { BigramScore } from './interfaces'
import { createStyles, Grid, makeStyles, Theme } from '@material-ui/core'

interface BigramProps {
  bigramScore: BigramScore
}

interface BigramProgressProps {
  bigramScores: BigramScore[]
  topBigrams: string[]
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    bigramProgressContainer: {
      margin: '4px'
    },
    bigramProgress0: {
      backgroundColor: '#ddd',
      fontSize: '1.5em',
      fontFamily: 'mononoki, monospace',
      color: '#000',
      borderRadius: '4px'
    },
    bigramProgress1: {
      backgroundColor: '#bbf',
      fontSize: '1.5em',
      fontFamily: 'mononoki, monospace',
      color: '#000',
      borderRadius: '4px'
    },
    bigramProgress2: {
      backgroundColor: '#aaf',
      fontSize: '1.5em',
      fontFamily: 'mononoki, monospace',
      color: '#000',
      borderRadius: '4px'
    },
    bigramProgress3: {
      backgroundColor: '#8f8',
      fontSize: '1.5em',
      fontFamily: 'mononoki, monospace',
      color: '#000',
      borderRadius: '4px'
    }
  })
)

const Bigram: React.FC<BigramProps> = (props) => {
  const classes = useStyles()

  const whichStyle = (score: BigramScore) => {
    switch (score.count) {
      case 0:
        return classes.bigramProgress0
      case 1:
        return classes.bigramProgress1
      case 2:
        return classes.bigramProgress2
      default:
        return classes.bigramProgress3
    }
  }

  return (
    <span className={whichStyle(props.bigramScore)}>
    { props.bigramScore.bigram.replace(' ', '␣') }
    </span>
  )
}

const BigramProgress: React.FC<BigramProgressProps> = (props) => {
  const classes = useStyles()

  let displayedScores: BigramScore[] = []
  let scoredBigrams = props.bigramScores.map((bigramScore) => bigramScore.bigram)
  for (let i = 0; i < props.topBigrams.length; i++) {
    let bigramIndex = scoredBigrams.findIndex(bigram => bigram === props.topBigrams[i])
    if (bigramIndex !== -1) {
      displayedScores.push(props.bigramScores[bigramIndex])
    } else {
      displayedScores.push({avg_time: 0, count: 0, bigram: props.topBigrams[i]})
    }
  }
  return (
    <Grid container justify='space-between'>
      {
        displayedScores.map((bigramScore, index) => (
          <Grid item key={index} className={classes.bigramProgressContainer}>
            <Bigram bigramScore={bigramScore} />
          </Grid>
        ))
      }
    </Grid>
  )
}

export default BigramProgress
