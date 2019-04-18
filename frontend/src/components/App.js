import React from 'react'
import './App.css'
import TypeInputBox from './TypeInputBox'
import WordsToType from './WordsToType'
import SpeedTest from './SpeedTest'
import AppMenu from './AppMenu'
import axios from 'axios'
import { Segment } from 'semantic-ui-react'

axios.defaults.xsrfHeaderName = 'X-CSRFToken'
axios.defaults.xsrfCookieName = 'csrftoken'

const WEBSITE_API_URL = 'http://localhost:8000'

class App extends React.Component {
  constructor (props) {
    super(props)
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
      currentWPM: 0,
      timeStarted: null,
      numWordsTyped: 0,
      lastWordTime: null,
      typoIndices: [],
      timeAtLastTenWords: [],
      bigramScores: [],
      wordScores: [],
      fontSize: 3,
      mode: 'practice'
    }

    this.handleChange = this.handleChange.bind(this)
    this.handleKeyPress = this.handleKeyPress.bind(this)
    this.updateCurrentWord = this.updateCurrentWord.bind(this)
    this.handleZoomClick = this.handleZoomClick.bind(this)
    this.handleModeChange = this.handleModeChange.bind(this)
  }

  componentDidMount () {
    this.updateCurrentWord(0)
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
      bigramScores
    } = this.state
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
    axios.post(WEBSITE_API_URL + '/words/metrics/',
    {
       word_scores: alteredWordScores,
       bigram_scores: alteredBigramScores
    })
    .then(function (response) {
      console.log('Received response')
      console.log(response)
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
      typoIndices
    } = this.state

    if (wordsArray.length === 0) {
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

    const {
      hasPendingWordsRequest,
      newWords,
      mode
    } = this.state

    if (wordsArray.length - currentWord < 60 && !hasPendingWordsRequest && newWords.length === 0) {
      this.setState({ hasPendingWordsRequest: true })
      console.log('Requesting new words from API')
      let endpoint = '/words'
      if (mode === 'smartExercise') {
        endpoint = '/words/smart'
      }
      axios.get(WEBSITE_API_URL + endpoint)
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

  handleZoomClick(e, { name }) {
    const fontSize = this.state.fontSize
    if (name === 'zoom in') {
      this.setState({fontSize: fontSize + 0.5})
    } else {
      this.setState({fontSize: fontSize - 0.5})
    }
  }

  handleModeChange(e, { name }) {
    if (name === 'practice') {
      this.setState({mode: 'practice'})
    }
    else if (name === 'smartExercise') {
      this.setState({mode: 'smartExercise'})
    }
    else if (name === 'speedTest') {
      this.setState({mode: 'speedTest'})
    }
    this.setState({
      wordsArray: [],
      newWords: [],
      typedText: [],
      typoIndices: [],
      currentWord: 0
    }, () => {
      this.updateCurrentWord(0)
    })
  }

  render () {
    const {
      typedText,
      wordsArray,
      containsTypo,
      currentWord,
      typoIndices,
      fontSize,
      mode,
      hasPendingWordsRequest
    } = this.state

    return (
      <div className='App'>
        <AppMenu
          zoomHandler = {this.handleZoomClick}
          modeHandler = {this.handleModeChange}
          activeItem = {mode} />
        <Segment attached='bottom' className='blue-background'>
          <Segment raised>
            {mode === 'speedTest' ?
              <SpeedTest
                words={wordsArray}
                currentWord={currentWord}
                typo={containsTypo}
                typoIndices={typoIndices}
                fontSize={fontSize}
                loading={hasPendingWordsRequest && wordsArray.length === 0}/>
              :
              <WordsToType
                words={wordsArray}
                currentWord={currentWord}
                typo={containsTypo}
                typoIndices={typoIndices}
                fontSize={fontSize}
                loading={hasPendingWordsRequest && wordsArray.length === 0}/>
            }
          </Segment>
          <Segment>
          <TypeInputBox
            onChange={this.handleChange}
            onKeyDown={this.handleKeyPress}
            value={typedText} />
          </Segment>
        </Segment>
      </div>
    )
  }
}

export default App
