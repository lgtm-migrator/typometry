import React from 'react'
import './App.css'
import TypeInputBox from './TypeInputBox'
import WordsToType from './WordsToType'
import FingeringIndicator from './FingeringIndicator'
import SpeedTest from './SpeedTest'
import AppMenu from './AppMenu'
import axios from 'axios'
import { Paper, Grid, Fade } from '@material-ui/core'
import LinearProgress from '@material-ui/core/LinearProgress'
import { withStyles } from '@material-ui/core'
import Notification from './Notification'
import * as constants from './constants'
import ReactGA from 'react-ga'
import BigramProgress from './BigramProgress'

ReactGA.initialize('UA-106571309-3');

axios.defaults.xsrfHeaderName = 'X-CSRFToken'
axios.defaults.xsrfCookieName = 'csrftoken'

const styles = theme => ({
  '@global': {
    body: {
      background: theme.palette.primary.background
    }
  },
  root: {
    padding: theme.spacing(1.6),
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    backgroundColor: theme.palette.secondaryPaper.primary.main
  },
  words: {
    position: 'relative',
    padding: theme.spacing(1.5),
    marginBottom: theme.spacing(1.6),
    backgroundColor: theme.palette.primaryPaper.primary.main
  },
  input: {
    padding: '-10px',
    backgroundColor: theme.palette.primaryPaper.primary.main
  },
  progressBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    borderTopLeftRadius: '3px',
    borderTopRightRadius: '3px'
  },
  gatherData: {
    color: theme.palette.primary.contrastText,
    margin: '1em',
    fontFamily: 'mononoki, monospace',
    fontSize: '1.5em'
  }
})

class App extends React.Component {
  constructor (props) {
    super(props)

    let urlMode = 'smartExercise'
    const originalUrl = window.location.toString()
    if (originalUrl.includes('smart-exercise')) {
      urlMode = 'smartExercise'
    } else if (originalUrl.includes('practice')) {
      urlMode = 'practice'
    } else if (originalUrl.includes('speed-test')) {
      urlMode = 'speedTest'
    }

    this.state = {
      text: '',
      wordsArray: [],
      newWords: [],
      typedText: '',
      lastKeyPressTime: null,
      currentWord: 0,
      containsTypo: false,
      numTypos: 0,
      lastChar: '',
      nextChar: '',
      hasPendingWordsRequest: false,
      timeStarted: null,
      numWordsTyped: 0,
      lastWordTime: null,
      typoIndices: [],
      timeAtLastTenWords: [],
      bigramScores: [],
      wordScores: [],
      fontSize: 3,
      mode: urlMode,
      longText: '',
      longTextCurrentParagraph: 0,
      typingLocked: false,
      showProgress: false,
      progressPct: 0,
      exercises: [],
      noMoreExercises: false,
      notifications: window.messages || [],
      showNotification: false,
      topBigrams: [],
      topBigramScores: []
    }

    this.handleChange = this.handleChange.bind(this)
    this.handleKeyPress = this.handleKeyPress.bind(this)
    this.updateCurrentWord = this.updateCurrentWord.bind(this)
    this.handleZoomClick = this.handleZoomClick.bind(this)
    this.getTopBigrams = this.getTopBigrams.bind(this)
    this.getTopBigramScores = this.getTopBigramScores.bind(this)
    this.handleModeChange = this.handleModeChange.bind(this)
    this.resetStats = this.resetStats.bind(this)
    this.clearWords = this.clearWords.bind(this)
    this.startSpeedTest = this.startSpeedTest.bind(this)
    this.finishSpeedTest = this.finishSpeedTest.bind(this)
    this.lockTyping = this.lockTyping.bind(this)
    this.unlockTyping = this.unlockTyping.bind(this)
    this.showProgress = this.showProgress.bind(this)
    this.updateProgress = this.updateProgress.bind(this)
    this.handleLongText = this.handleLongText.bind(this)
    this.dismissNotification = this.dismissNotification.bind(this)
    this.addNotification = this.addNotification.bind(this)
  }

  dismissNotification () {
    let newNotifications = [...this.state.notifications]
    newNotifications.shift()
    this.setState({showNotification: false})
    let show = false
    if (newNotifications.length > 0) {
      show = true
    }
    const callbackRef = this
    // Allow notification dismiss animation to complete before updating state
    setTimeout(function () {
      callbackRef.setState({
        notifications: newNotifications,
        showNotification: show
      })
    }, 400)
  }

  addNotification(notification) {
    let newNotifications = [...this.state.notifications]
    newNotifications.push(notification)
    this.setState({
      notifications: newNotifications,
      showNotification: true
    })
  }

  componentDidMount () {
    this.updateCurrentWord(0)
    this.inputElement.focus()
  }

  appendBigram (bigram, speed) {
    const { bigramScores } = this.state
    let newBigrams = bigramScores
    let b = newBigrams.findIndex(b => b.bigram === bigram)

    if (speed < 10) {
      return
    } else if (speed > 2500) {
      speed = 2500
    }

    if (b === -1) {
      const newBigram = { bigram: bigram, speed: [speed] }
      newBigrams.push(newBigram)
    } else {
      console.log(newBigrams[b].speed)
      newBigrams[b].speed.push(speed)
    }
    this.setState({ bigramScores: newBigrams })
  }

  appendWordScore (word, speed) {
    const { wordScores } = this.state
    let newWordScores = wordScores
    let w = newWordScores.findIndex(w => w.word === word)

    if (speed < 10) {
      return
    } else if (speed > 15000) {
      speed = 15000
    }

    if (w === -1) {
      const newWordScore = { word: word, speed: [speed] }
      newWordScores.push(newWordScore)
    } else {
      newWordScores[w].speed.push(speed)
    }
    this.setState({ wordScores: newWordScores })
  }

  reportScores () {
    const {
      wordScores,
      bigramScores,
      mode
    } = this.state
    let callbackRef = this
    // Deep-copy from state
    let alteredWordScores = JSON.parse(JSON.stringify(wordScores))
    let alteredBigramScores = JSON.parse(JSON.stringify(bigramScores))
    alteredWordScores = alteredWordScores.map(score => {
      let count = score.speed.length
      let scoreSum = score.speed.reduce((prev, current) => current += prev)
      score.average_time = scoreSum / count
      delete score.speed
      score.count = count
      return score
    })
    alteredBigramScores = alteredBigramScores.map(score => {
      let count = score.speed.length
      let scoreSum = score.speed.reduce((prev, current) => current += prev)
      score.average_time = scoreSum / count
      delete score.speed
      score.count = count
      return score
    })
    console.log('Sending scores...')
    axios.post(constants.WEBSITE_API_URL + '/words/metrics/',
    {
       word_scores: alteredWordScores,
       bigram_scores: alteredBigramScores
    })
    .then(function (response) {
      console.log('Received response')
      console.log(response)
      if (mode === 'smartExercise') {
        callbackRef.getTopBigramScores()
      }
    })
    .catch(function (error) {
      console.log(error)
    })
    console.log({
      word_scores: alteredWordScores,
      bigram_scores: alteredBigramScores
    })
    this.setState({
      wordScores: [],
      bigramScores: []
    })
  }

  /*
  This function handles checking the entered key before
  passing off to handleChange. It checks for spacebar
  and for when the correct character has been pressed.
  In both cases it handles measuring the speed of the
  bigram.
  */
  handleKeyPress (event) {
    const {
      currentWord,
      containsTypo,
      numTypos,
      lastChar,
      nextChar,
      lastKeyPressTime,
      typedText,
      wordsArray,
      numWordsTyped,
      lastWordTime,
      timeAtLastTenWords,
      typoIndices,
      typingLocked
    } = this.state

    if (wordsArray.length === 0 || typingLocked) {
      event.preventDefault()
      return
    }

    // Check if updated state of word has valid bigram
    // Check if word is complete (handle final space bigram)
    const spacePressed = (event ? event.which : window.event.keyCode) === 32
    let wordFragmentCorrect = false
    if (typedText === wordsArray[currentWord]) { // Word is complete
      wordFragmentCorrect = spacePressed
    } else {
      wordFragmentCorrect = typedText + event.key === wordsArray[currentWord].slice(0, typedText.length + 1)
    }

    if (wordFragmentCorrect && event.key === nextChar) {
      const time = window.performance.now()

      if (lastChar) {
        let bigramSpeed = time - lastKeyPressTime
        const bigram = lastChar + nextChar
        this.appendBigram(bigram, bigramSpeed)
      }
      const last = event.key
      const lastTime = time

      // Set next char
      const word = wordsArray[currentWord]
      const currentLetter = typedText.length + 1
      let next = ''
      if (currentLetter === word.length) {
        next = ' '
      } else {
        next = word[currentLetter]
      }

      this.setState({
        lastChar: last,
        nextChar: next,
        lastKeyPressTime: lastTime
      })
    }

    if (spacePressed) {
      event.preventDefault() // Don't call handleChange
      const nextWord = currentWord + 1

      // Check if word is complete and free of typos
      const word = wordsArray[currentWord]
      const currentText = event.target.value
      const isCompleteWord = word === currentText
      let newNumTypos = numTypos
      let newNumWordsTyped = numWordsTyped
      let newTimeAtLastTenWords = timeAtLastTenWords
      if (newNumWordsTyped === 1) {
        ReactGA.event({
          category: 'Typing',
          action: 'Typed first word',
          value: 1
        })
      } else if (newNumWordsTyped % 10 === 0 && newNumWordsTyped !== 0) {
        ReactGA.event({
          category: 'Typing',
          action: 'Typed ' + newNumWordsTyped.toString() + ' words',
          value: newNumWordsTyped
        })
      }

      if (containsTypo || !isCompleteWord) {
        newNumTypos++
        let newTypos = typoIndices
        newTypos.push(currentWord)
        this.setState({ typoIndices: newTypos })
      } else {
        // Word is complete
        newNumWordsTyped++
        const now = window.performance.now()
        if (lastWordTime) {
          if (newTimeAtLastTenWords.length === 10) {
            newTimeAtLastTenWords.shift()
          }
          newTimeAtLastTenWords.push(now)
        }

        // Push this word score
        if (newTimeAtLastTenWords.length > 1) {
          const wordTime = now - newTimeAtLastTenWords[newTimeAtLastTenWords.length - 2]
          this.appendWordScore(word, wordTime)
        }

        if ((newNumWordsTyped - 1) % 5 === 0 && newTimeAtLastTenWords.length === 10) {
          // Update WPM display
          let elapsedTime = now - newTimeAtLastTenWords[0]
          let secondsPerWord = elapsedTime / 10000
          let WPM = (1 / secondsPerWord) * 60
          WPM = Math.round(WPM)
          this.setState({ currentWPM: WPM })
        }
        this.setState({
          lastWordTime: now,
          lastTenWordTimes: newTimeAtLastTenWords,
          numWordsTyped: newNumWordsTyped
        })
      }

      this.setState({
        typedText: '',
        lastChar: ' ',
        currentWord: nextWord,
        containsTypo: false,
        numTypos: newNumTypos
      })

      this.updateCurrentWord(nextWord)
    }
  }

  handleChange (event) {
    const {
      currentWord,
      wordsArray
    } = this.state

    // Check for typos
    const currentText = event.target.value
    const typedLength = currentText.length
    const word = wordsArray[currentWord]
    const wordFragment = word.slice(0, typedLength)
    const typo = wordFragment !== currentText

    this.setState({
      typedText: currentText,
      containsTypo: typo
    })
  }

  updateCurrentWord (currentWord, wordsAfterPrune = null) {
    const wordsArray = wordsAfterPrune || this.state.wordsArray
    console.log('Updating current word to ' + currentWord)
    const {
      hasPendingWordsRequest,
      newWords,
      mode
    } = this.state

    if (mode === 'smartExercise') {
      const { exercises } = this.state
      if (exercises.length > 1 && wordsArray[currentWord] === exercises[1].words[0]) {
        let exercisesCopy = exercises
        exercisesCopy.shift()
        this.setState({exercises: exercisesCopy})
      }
    }

    if (wordsArray.length - currentWord < 60 && !hasPendingWordsRequest && newWords.length === 0) {
      if (mode === 'practice' || mode === 'speedTest') {
        this.setState({hasPendingWordsRequest: true})
        console.log('Requesting new words from API')
        let endpoint = '/words/'
        axios.get(constants.WEBSITE_API_URL + endpoint)
          .then(res => {
            console.log('Fetch complete')
            if (wordsArray.length === 0) {
              this.setState({
                wordsArray: res.data,
                hasPendingWordsRequest: false
              }, () => {
                this.updateCurrentWord(0)
              })
            } else {
              this.setState({
                newWords: res.data,
                hasPendingWordsRequest: false
              })
            }
          })
      }
      else if (mode === 'longText') {
        const {
          longText,
          longTextCurrentParagraph
        } = this.state
        let endpoint = '/words/long-text/' + longText + '/' + longTextCurrentParagraph + '/'
        axios.get(constants.WEBSITE_API_URL + endpoint)
          .then(res => {
            console.log('Fetch complete')
            if (wordsArray.length === 0) {
              this.setState({
                wordsArray: res.data.words,
                longTextCurrentParagraph: res.data.newParagraph,
                hasPendingWordsRequest: false
              }, () => {
                this.updateCurrentWord(0)
              })
            } else {
              this.setState({
                newWords: res.data.words,
                longTextCurrentParagraph: res.data.newParagraph,
                hasPendingWordsRequest: false
              })
            }
          })
      }
      else if (mode === 'smartExercise') {
        const {
          exercises,
          newWords
        } = this.state
        let endpoint = '/words/smart/'
        this.setState({hasPendingWordsRequest: true})
        axios.get(constants.WEBSITE_API_URL + endpoint)
          .then(res => {
            console.log('Fetch complete')
            console.log(res.data)
            let newWordsCopy = newWords
            if (res.data.type === 'gatherData') {
              newWordsCopy = newWordsCopy.concat(res.data.words)
              console.log(newWordsCopy)
              if (wordsArray.length === 0) {
                this.setState({
                  wordsArray: newWordsCopy,
                  hasPendingWordsRequest: false
                }, () => {
                  this.updateCurrentWord(0)
                })
              } else {
                this.setState({
                  newWords: newWordsCopy,
                  hasPendingWordsRequest: false
                })
              }
            } else if (res.data.type === 'noExercise') {
              this.setState({noMoreExercises: true})
            } else {
              this.setState({noMoreExercises: false})
              let newExercises = res.data.exercises
              let firstExercise = false
              if (exercises.length === 0) {
                firstExercise = true
              }
              let exercisesCopy = exercises
              for (let i = 0; i < newExercises.length; ++i) {
                console.log(newExercises[i].words)
                newWordsCopy = newWordsCopy.concat(newExercises[i].words)
              }
              console.log(newWordsCopy)
              exercisesCopy = exercisesCopy.concat(newExercises) // Extend exercise array with new ones
              if (firstExercise) {
                this.lockTyping()
                this.setState({ wordsArray: [] })
              }
              if (wordsArray.length === 0 || firstExercise) {
                this.setState({
                  exercises: exercisesCopy,
                  wordsArray: newWordsCopy,
                  hasPendingWordsRequest: false
                }, () => {
                  this.updateCurrentWord(0)
                  this.unlockTyping()
                })
              } else {
                this.setState({
                  exercises: exercisesCopy,
                  newWords: newWordsCopy,
                  hasPendingWordsRequest: false
                })
              }
            }
          })
      }
    }
    if (wordsArray.length === 0) {
      return
    }
    const next = wordsArray[currentWord][0]
    const timeStarted = window.performance.now()

    this.setState({
      nextChar: next,
      timeWordStarted: timeStarted
    })
  }

  componentDidUpdate () {
    // Erase line?
    let firstWordOffset = null
    let currentWordOffset = null
    try {
      firstWordOffset = document.getElementById('firstWord').offsetTop
      currentWordOffset = document.getElementById('currentWord').offsetTop
    } catch (e) {
      // Nothing has rendered yet; no currentWord
      return
    }
    const offsetPx = currentWordOffset - firstWordOffset
    if (offsetPx > 5) {
      const {
        wordsArray,
        currentWord,
        newWords
      } = this.state

      this.reportScores()

      if (currentWord === 0) {
        // Prevent this from happening infinitely and incorrectly
        return
      }

      let wordsAfterPrune = wordsArray.slice(currentWord)
      if (newWords !== []) {
        wordsAfterPrune = wordsAfterPrune.concat(newWords)
        this.setState({
          newWords: [],
          typoIndices: []
        })
      }

      this.setState({
        wordsArray: wordsAfterPrune,
        currentWord: 0
      })
    }
  }

  handleZoomClick(zoom) {
    console.log('zoomHandler')
    const fontSize = this.state.fontSize
    const newFontSize = (zoom === 'zoomIn') ? fontSize + 0.5 : fontSize - 0.5
    console.log(newFontSize + 'em')
    ReactGA.event({
      category: 'Interaction',
      action: 'Set font size to ' + newFontSize + 'em',
      value: newFontSize
    })
    this.setState({fontSize: newFontSize})
  }

  getTopBigrams() {
    console.log('Requesting top bigrams from API')
    let top_n = 113
    let endpoint = '/words/top/' +  top_n.toString() + '/'
    axios.get(constants.WEBSITE_API_URL + endpoint)
      .then(res => {
        console.log('Fetch complete')
          this.setState({
            topBigrams: res.data.bigrams,
          })
      })
  }

  getTopBigramScores() {
    console.log('Requesting scores from API')
    let top_n = 113
    let endpoint = '/words/scores/bigram/' +  top_n.toString() + '/'
    axios.get(constants.WEBSITE_API_URL + endpoint)
      .then(res => {
        console.log('Fetch complete')
          this.setState({
            topBigramScores: res.data.bigram_scores,
          })
      })
  }

  handleModeChange(name) {
    this.setState({
      mode: name,
      modeText: name
    })
    ReactGA.event({
      category: 'Interaction',
      action: 'Changed mode to ' + name
    })
    this.clearWords()
    this.unlockTyping()
    this.showProgress(false)
    this.updateProgress(0)
    if (name === 'smartExercise') {
      this.getTopBigrams()
      this.getTopBigramScores()
    }
  }

  handleLongText(name) {
    this.setState({
      longText: name,
      mode: 'longText',
      modeText: 'Long Text'
    })
    this.clearWords()
    this.unlockTyping()
    this.showProgress(false)
    this.updateProgress(0)
  }

  resetStats() {
    this.setState({
      numTypos: 0,
      numWordsTyped: 0
    })
  }

  clearWords() {
    this.setState({
      wordsArray: [],
      exercises: [],
      newWords: [],
      typedText: '',
      typoIndices: [],
      currentWord: 0,
      containsTypo: false
    }, () => {
      this.updateCurrentWord(0)
    })
  }

  lockTyping() {
    this.setState({
      typingLocked: true,
      typedText: ''
    })
  }

  unlockTyping() {
    this.setState({
      typingLocked: false
    })
    this.inputElement.focus()
  }

  startSpeedTest() {
    console.log('startFunc')
    this.resetStats()
    this.unlockTyping()
  }

  finishSpeedTest() {
    console.log('endFunc')
    this.lockTyping()
    this.clearWords()
  }

  showProgress(show) {
    this.setState({
      showProgress: show
    })
  }

  updateProgress(percent) {
    console.log('Progress: ' + percent + '%')
    this.setState({
      progressPct: percent
    })
  }

  render () {
    const {
      typedText,
      wordsArray,
      topBigrams,
      topBigramScores,
      containsTypo,
      currentWord,
      typoIndices,
      fontSize,
      mode,
      hasPendingWordsRequest,
      numTypos,
      numWordsTyped,
      showProgress,
      progressPct,
      exercises,
      longText,
      showSettings,
      notifications,
      showNotification
    } = this.state

    const { classes, setDarkTheme } = this.props

    return (
      <div className='App'>
        <Grid container justify='center' spacing={5}>
          { notifications.length > 0 ?
            <Notification forceOpen={showNotification} onDismiss={this.dismissNotification} {...notifications[0]} />
            :
            ''
          }
          <Grid item sm={12} />
          <Grid item sm={12} md={8}>
            <AppMenu
              zoomHandler = {this.handleZoomClick}
              modeHandler = {this.handleModeChange}
              longTextHandler = {this.handleLongText}
              setDarkTheme = {setDarkTheme}
              activeItem = {mode}
              longText = {longText}
              openSettings = {showSettings} />
            <Paper
              className={classes.root}>
              <Grid>
                <Grid item>
                  <Paper className={classes.words} elevation={4}>
                    { showProgress ?
                      <LinearProgress className={classes.progressBar} variant='determinate' value={progressPct} />
                      :
                      ''
                    }
                    { mode === 'speedTest' ?
                      <SpeedTest
                        words={wordsArray}
                        currentWord={currentWord}
                        typo={containsTypo}
                        typoIndices={typoIndices}
                        fontSize={fontSize}
                        loading={hasPendingWordsRequest && wordsArray.length === 0}
                        typedText={typedText}
                        numTypos={numTypos}
                        numWordsTyped={numWordsTyped}
                        startFunction={this.startSpeedTest}
                        endFunction={this.finishSpeedTest}
                        showProgress={this.showProgress}
                        updateProgress={this.updateProgress} />
                      :
                      <Fade in={true}>
                        <WordsToType
                          mode={mode}
                          words={wordsArray}
                          currentWord={currentWord}
                          typedText={typedText}
                          typo={containsTypo}
                          typoIndices={typoIndices}
                          fontSize={fontSize}
                          loading={hasPendingWordsRequest && wordsArray.length === 0} />
                      </Fade>
                    }
                  </Paper>
                </Grid>
                <Grid item>
                  <Paper className={classes.input}>
                    <TypeInputBox
                      onChange={this.handleChange}
                      onKeyDown={this.handleKeyPress}
                      value={typedText}
                      inputRef={el => this.inputElement = el}/>
                  </Paper>
                </Grid>
              </Grid>
            </Paper>
            {exercises.length > 0 && mode === 'smartExercise' ?
              <FingeringIndicator
                text={exercises[0].text}
                fingeringObject={exercises[0].fingering}
                showWord={true}/>
              :
              ''
            }
            {exercises.length === 0 && mode === 'smartExercise' ?
              <BigramProgress bigramScores={topBigramScores} topBigrams={topBigrams} />
              :
              ''
            }
            { mode === 'smartExercise' && exercises.length === 0 && !hasPendingWordsRequest ?
              <div className={classes.gatherData}>
                More data needed for smart exercise. Continue typing...
              </div>
              :
              ''
            }
            </Grid>
          </Grid>
      </div>
    )
  }
}

export default withStyles(styles, { withTheme: true })(App)
