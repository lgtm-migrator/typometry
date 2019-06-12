import React from 'react'
import Typography from '@material-ui/core/Typography'
import makeStyles from '@material-ui/core/styles/makeStyles'
import Grid from '@material-ui/core/Grid'

const useStyles = makeStyles(theme => ({
  stat: {
    fontSize: '3em'
  },
  label: {
    marginTop: '-1em',
    marginBottom: '1em',
    textTransform: 'uppercase'
  }
}))

function Statistic(props) {
  const classes = useStyles()
  const { stat, label } = props

  return (
    <Grid container direction='column' justify='center'>
      <Grid item>
        <Typography className={classes.stat}>
          { stat }
        </Typography>
      </Grid>
      <Grid item>
        <Typography className={classes.label}>
          { label }
        </Typography>
      </Grid>
    </Grid>
  )
}

export default Statistic