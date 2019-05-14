import React, {Component} from 'react'
import './Word.css'
import './WordStats.css'
import { Popup, Placeholder } from 'semantic-ui-react'
import axios from 'axios'
import * as constants from './constants'
import WordStats from './WordStats'

const Word = props => (
  <span
    id={props.current ? 'currentWord' : null}
    className={whichStyle(props) + ' ui simple'}>
    {props.text}
  </span>
)

class WordMetadataPopup extends Component {
  constructor(props) {
    super(props)
    this.state = {
      statsObject: null,
      loading: true
    }
    this.getWordStats = this.getWordStats.bind(this)
  }

  getWordStats() {
    console.log('Requesting word stats...')
    console.log('URL: ' + constants.WEBSITE_API_URL + '/words/stats/' + this.props.text)
    axios.get(constants.WEBSITE_API_URL + '/words/stats/' + this.props.text)
      .then(res => {
        console.log('Word stats fetched')
        this.setState( {
          statsObject: res.data,
          loading: false
        })
      })
  }

  render() {
    const {
      statsObject,
      loading
    } = this.state
    return (
      <Popup
        trigger={<span><Word {...this.props} /></span>}
        position='bottom center'
        content={
          loading ?
            <div className='popup-placeholder'>
              <Placeholder>
                <Placeholder.Line />
                <Placeholder.Line />
              </Placeholder>
              <div className='fingering-container-placeholder'>
                <Placeholder>
                  <Placeholder.Line />
                </Placeholder>
                <Placeholder style={{height: 161, width: 280 }}/>
              </div>
            </div>
            :
          <WordStats
            word={this.props.text}
            loading={loading}
            frequency={statsObject.frequency}
            fingeringObject={statsObject.fingering} />
        }
        on='click'
        onOpen={this.getWordStats}/>
    )
  }
}

const whichStyle = function (props) {
  const current = props.current
  const typed = props.typed
  const containsTypo = props.containsTypo
  const typo = props.typo
  if (current) {
    if (containsTypo) {
      return 'typo'
    } else {
      return 'currentWord'
    }
  } else if (typed && !typo) {
    return 'typedCorrect'
  } else if (typed && typo) {
    return 'typedTypo'
  }
  return 'Word'
}

export default WordMetadataPopup
