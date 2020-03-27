import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import ThemedApp from './components/ThemedApp'
import * as serviceWorker from './serviceWorker'
import typometryTheme from './components/typometryTheme'
import typometryThemeDark from './components/typometryThemeDark'
import { BrowserRouter } from 'react-router-dom'
import { useMediaQuery } from '@material-ui/core'

ReactDOM.render(
  <BrowserRouter>
    <ThemedApp
      lightTheme={typometryTheme}
      darkTheme={typometryThemeDark}
      useDarkTheme={useMediaQuery('(prefers-color-scheme: dark)')}
    />
  </BrowserRouter>
  , document.getElementById('app'))

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister()
