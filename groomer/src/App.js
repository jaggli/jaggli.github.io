import React, { PureComponent } from 'react'
import Reboot from 'material-ui/Reboot'
import { withStyles } from 'material-ui/styles'
import AppBar from 'material-ui/AppBar'
import Toolbar from 'material-ui/Toolbar'
import Typography from 'material-ui/Typography'

import SimpleListMenu from './SimpleListMenu'
import Result from './Result'
import dict from './dict'

const roundFibonacci = (number, a = 1, b = 1) => {
  if (number <= a) { return a }
  return roundFibonacci(number, b, a + b)
}

const styles = theme => ({
  root: {
    paddingTop: '85px'
  },
  content: {
    maxWidth: '600px',
    margin: '0 auto'
  }
})

class App extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      score: null,
      scores: dict.questions.map(() => 0)
    }
    this.refs = Array(dict.questions.length)
    this.handleChange = this.handleChange.bind(this)
  }

  resetScore () {
    this.setState({ score: null })
  }

  calculateScore () {
    const scores = this.state.scores.slice()
    let score = scores.reduce((acc, score) => {
      if (acc === null || score === 0) { return null }
      return acc + score
    }, 0)

    if (score !== null) {
      score = roundFibonacci(score / dict.questions.length)
    }

    this.setState({ score })
  }

  handleChange (value, i) {
    const scores = this.state.scores.slice()
    scores[i] = parseInt(value, 0) || 0
    this.setState({ scores })
    this.calculateScore()
  }

  render () {
    const { classes } = this.props
    const { score } = this.state
    return (
      <div className={classes.root}>
        <Reboot />
        <AppBar position='fixed' color='primary'>
          <Toolbar>
            <Typography type='title' color='inherit'>
              {!score
                ? 'Story estimation'
                : 'Result'
              }
            </Typography>
          </Toolbar>
        </AppBar>
        <div className={classes.content}>
          {!score && dict.questions.map((question, i) => (
            <SimpleListMenu
              title={question.title}
              options={question.options}
              description={question.description}
              section={dict.sections[question.section]}
              onChange={option => {
                this.handleChange(option && option.value, i)
              }}
              key={i}
              />
          ))}
          {score &&
            <Result
              score={score}
              onAdjust={event => this.resetScore()}
              />
          }
        </div>
      </div>
    )
  }
}

export default withStyles(styles)(App)
