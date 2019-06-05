import React from 'react'
import './AppMenu.css'
import { Menu } from 'semantic-ui-react'
import {AppBar, Toolbar, IconButton, Select, MenuItem, Tooltip} from '@material-ui/core'
import Icon from '@mdi/react'
import { mdiFormatFontSizeDecrease, mdiFormatFontSizeIncrease } from '@mdi/js'
import { withStyles } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import { useTheme } from '@material-ui/styles'
import FormControl from '@material-ui/core/FormControl'

const styles = theme => ({
  root: {
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  spacer: {
    flexGrow: 1
  },
  whiteText: {
    color: theme.palette.text
  }
})

const useStyles = makeStyles(theme => ({
  formControl: {
    marginRight: theme.spacing(2),
    minWidth: 120,
  }
}))

function ModeDropdown(props) {
  const classes = useStyles()
  const [values, setValues] = React.useState({
    mode: 'practice',
    selectedText: 'metamorphosis'
  })

  function handleChange(event) {
    console.log('handleChange')
    if (!window.is_logged_in && event.target.value === undefined) {
      console.log('Clicked smart exercise but not logged in')
      return // do nothing if disabled option selected
    }
    setValues(oldValues => ({
      ...oldValues,
      [event.target.name]: event.target.value
    }))
    if (event.target.name === 'mode') {
      modeHandler(event.target.value)
    }
    if (event.target.name === 'selectedText') {
      longTextHandler(event.target.value)
    }
  }

  const {
    modeHandler,
    longTextHandler
  } = props

  return (
    <form autoComplete='off'>
      <FormControl className={classes.formControl}>
        <Select
          value={values.mode}
          onChange={handleChange}
          inputProps={{
            name: 'mode',
            id: 'modePicker'
          }}>
          <MenuItem value='practice'>Random Words</MenuItem>
          { window.is_logged_in ?
            <MenuItem value='smartExercise'>Smart Exercise</MenuItem>
            :
            <Tooltip title={'You must log in to enable smart exercises'}>
              <span>
                <MenuItem value='smartExercise' disabled>Smart Exercise</MenuItem>
              </span>
            </Tooltip>
          }
          <MenuItem value='speedTest'>Speed Test</MenuItem>
          {/*<MenuItem value='longText'>Long Texts</MenuItem>*/}
        </Select>
      </FormControl>
      {
        values.mode === 'longText' ?
        <FormControl className={classes.formControl}>
          <Select
            value={values.selectedText}
            onChange={handleChange}
            inputProps={{
              name: 'selectedText',
              id: 'selectLongText'
            }}>
            <MenuItem value={'metamorphosis'}>The Metamorphosis</MenuItem>
            <MenuItem value={'aliceInWonderland'}>Alice in Wonderland</MenuItem>
            <MenuItem value={'tomSawyer'}>The Adventures of Tom Sawyer</MenuItem>
          </Select>
        </FormControl>
        :
        ''
      }
    </form>
  )
}

function AppMenu(props) {
  const theme = useTheme()
  const {
    zoomHandler,
    modeHandler,
    longTextHandler,
    classes,
    activeItem,
    modeText,
    longText
  } = props

  const darkTheme = theme.palette.type === 'dark'

  return (
    <AppBar position='static' className={classes.root} elevation={2}>
      <Toolbar variant='dense'>
      <ModeDropdown {...props}/>
      <div className={classes.spacer}/>
      <Menu.Menu position='right'>
        <IconButton
          name='zoom in'
          onClick={() => zoomHandler('zoomIn')}>
          <Icon
            color={ darkTheme ? '#fff' : '#000'}
            path={mdiFormatFontSizeIncrease}
            size={1}/>
        </IconButton>
        <IconButton
          edge='end'
          name='zoom out'
        onClick={() => zoomHandler('zoomOut')}>
          <Icon
            path={mdiFormatFontSizeDecrease}
            color={ darkTheme ? '#fff' : '#000'}
            size={1}/>
        </IconButton>
      </Toolbar>
    </AppBar>
  )
}

export default withStyles(styles)(AppMenu)
