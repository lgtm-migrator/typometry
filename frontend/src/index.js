import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import App from './components/App'
import Header from './components/header/Header'
import * as serviceWorker from './serviceWorker'

ReactDOM.render(<Header loggedIn={window.is_logged_in} />, document.getElementById('header'))
ReactDOM.render(<App />, document.getElementById('app'))

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister()
