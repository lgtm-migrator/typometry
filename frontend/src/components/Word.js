import React from 'react'
import './Word.css'
import './WordStats.css'
import { withStyles } from '@material-ui/core'
import { useTheme } from '@material-ui/styles'
import { Paper, Popper, Fade, ClickAwayListener } from '@material-ui/core'
import axios from 'axios'
import * as constants from './constants'
import WordStats from './WordStats'
import ReactGA from 'react-ga'

const Word = props => (
  <span
    id={props.current ? 'currentWord' : null}
    className={whichStyle(props) + ' Word'}>
    {props.text}
  </span>
)

const styles = theme => ({
  root: {
    padding: theme.spacing(2),
    backgroundColor: theme.palette.popper.primary.main
  }
})

function WordMetadataPopup(props) {
  const { classes } = props
  const [anchorEl, setAnchorEl] = React.useState(null)
  const [statsObject, setStatsObject] = React.useState(null)
  const [loading, setLoading] = React.useState(true)
  const open = Boolean(anchorEl)
  const id = open ? 'word-metadata-popper' : null

  function handleClick(event) {
    ReactGA.event({
      category: 'Interaction',
      action: 'Viewed word stats for \'' + props.text + '\''
    })
    setAnchorEl(anchorEl ? null : event.currentTarget)
    getWordStats()
  }

  function handleClickAway() {
    setAnchorEl(null)
  }

  function getWordStats() {
    console.log('Requesting word stats...')
    console.log('URL: ' + constants.WEBSITE_API_URL + '/words/stats/' + props.text + '/')
    axios.get(constants.WEBSITE_API_URL + '/words/stats/' + props.text + '/')
      .then(res => {
        console.log('Word stats fetched')
        setStatsObject(res.data)
        setLoading(false)
      })
  }

  return (
    <ClickAwayListener onClickAway={handleClickAway}>
      <span onClick={handleClick}>
        <Word {...props} />
        <Popper
          id={id}
          open={open}
          anchorEl={anchorEl}
          modifiers={{
            flip: {
              enabled: true,
            },
            arrow: {
              enabled: true,
              element: anchorEl
            }
          }}
          transition>
          {({ TransitionProps }) => (
            <Fade {...TransitionProps} timeout={350}>
              {
                loading ?
                  <span> </span>
                :
                  <Paper className={classes.root} elevation={16}>
                    <WordStats
                      word={props.text}
                      loading={loading}
                      frequency={statsObject.frequency}
                      fingeringObject={statsObject.fingering}/>
                  </Paper>
              }
            </Fade>
          )}
        </Popper>
      </span>
    </ClickAwayListener>
  )
}

const whichStyle = function (props) {
  const current = props.current
  const typed = props.typed
  const containsTypo = props.containsTypo
  const typo = props.typo
  const theme = useTheme()
  const darkTheme = theme.palette.type === 'dark'
  if (current && !darkTheme) {
    if (containsTypo) {
      return 'typo'
    } else {
      return 'currentWord'
    }
  } else if (current && darkTheme) {
    if (containsTypo) {
      return 'typo-dark'
    } else {
      return 'currentWord-dark'
    }
  }
  else if (typed && !typo) {
    return 'typedCorrect'
  } else if (typed && typo) {
    return 'typedTypo'
  }
  return ''
}

export default withStyles(styles, {withTheme: true})(WordMetadataPopup)
