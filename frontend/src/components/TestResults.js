import React from 'react'
import Grid from '@material-ui/core/Grid'
import Statistic from './Statistic'
import makeStyles from '@material-ui/core/styles/makeStyles'

const useStyles = makeStyles(theme => ({
  statContainer: {
    marginLeft: '1em',
    marginRight: '1em'
  }
}))

function TestResults(props) {
  const classes = useStyles()

  return (
    <div>
      <Grid container direction='row' justify='center'>
        <Grid item className={classes.statContainer}>
          <Statistic stat={props.wordsPerMinute} label='Words per minute' />
        </Grid>
        <Grid item className={classes.statContainer}>
          <Statistic stat={props.accuracy + '%'} label='Accuracy' />
        </Grid>
      </Grid>
    </div>
  )
}

export default TestResults
