import * as React from 'react'
import { useState } from 'react'
import App from './App'
import { ThemeProvider } from '@material-ui/styles'
import * as ReactGA from 'react-ga'
import Header from './header/Header'
import { useMediaQuery } from '@material-ui/core'
import typometryTheme from './typometryTheme'
import typometryThemeDark from './typometryThemeDark'

function ThemedApp (props) {
  if (localStorage.getItem('useDarkTheme') === null) {
    localStorage.setItem('useDarkTheme', useMediaQuery('(prefers-color-scheme: dark)') ? 'true' : 'false')
  }
  const [useDarkTheme, setUseDarkTheme] = useState(localStorage.getItem('useDarkTheme') === 'true')
  console.log('Use dark theme is ' + useDarkTheme)

  function setUseDarkThemeWithEvent (dark) {
    console.log('Use dark theme: ' + dark)
    ReactGA.event({
      category: 'Interaction',
      action: dark ? 'Enabled dark mode' : 'Disabled dark mode'
    })
    localStorage.setItem('useDarkTheme', dark)
    setUseDarkTheme(dark)
  }

  return (
    <div>
      <ThemeProvider theme={
        useDarkTheme ?
          typometryThemeDark
          :
          typometryTheme
      }>
        <Header setDarkTheme={setUseDarkThemeWithEvent} />
        <App setDarkTheme={setUseDarkThemeWithEvent} />
      </ThemeProvider>
    </div>
  )
}

export default ThemedApp