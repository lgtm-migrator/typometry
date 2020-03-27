import React, { useState } from 'react'
import App from './App'
import { ThemeProvider } from '@material-ui/styles'
import ReactGA from 'react-ga'
import Header from './header/Header'
import { useMediaQuery } from '@material-ui/core'

function ThemedApp (props) {
  if (localStorage.getItem('useDarkTheme') === null) {
    localStorage.setItem('useDarkTheme', useMediaQuery('(prefers-color-scheme: dark)'))
  }
  const [useDarkTheme, setUseDarkTheme] = useState(localStorage.getItem('useDarkTheme'))

  function setUseDarkThemeWithEvent (dark) {
    console.log('Use dark theme: ' + dark)
    ReactGA.event({
      category: 'Interaction',
      action: dark ? 'Enabled dark mode' : 'Disabled dark mode'
    })
    setUseDarkTheme(dark)
  }

  return (
    <div>
      <ThemeProvider theme={
        useDarkTheme ?
          props.darkTheme
          :
          props.lightTheme
      }>
        <Header setDarkTheme={setUseDarkThemeWithEvent} />
        <App setDarkTheme={setUseDarkThemeWithEvent} />
      </ThemeProvider>
    </div>
  )
}

export default ThemedApp