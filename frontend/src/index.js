import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import ThemedApp from './components/ThemedApp'
import Header from './components/header/Header'
import * as serviceWorker from './serviceWorker'
import typometryTheme from './components/typometryTheme'
import typometryThemeDark from './components/typometryThemeDark'
import { BrowserRouter } from 'react-router-dom'

ReactDOM.render(
    <Header loggedIn={window.is_logged_in} />
  , document.getElementById('header'))
ReactDOM.render(
  <BrowserRouter>
    <ThemedApp
      lightTheme={typometryTheme}
      darkTheme={typometryThemeDark}
      useDarkTheme={window.dark_theme}
    />
  </BrowserRouter>
  , document.getElementById('app'))

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister()
