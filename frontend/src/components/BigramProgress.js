import React from 'react'
import { withStyles } from '@material-ui/core'
import { useTheme } from '@material-ui/styles'

const styles = theme => ({

})

function IndividualBigramProgress(props) {
  return (
    <div className='bigram'>bg</div>
  )
}

function BigramProgress(props) {
  const theme = useTheme()
  const darkTheme = theme.palette.type === 'dark'
  return (
    {
      props.bigrams.map((bigramScore, index) => (
        <div key={index}>
          <IndividualBigramProgress bigramScore={bigramScore} />
        </div>
      ))
    }
  )
}

export default withStyles(styles, {withTheme: true})(BigramProgress)
