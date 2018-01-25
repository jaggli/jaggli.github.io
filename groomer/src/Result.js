import React from 'react'
import { withStyles } from 'material-ui/styles'
import Card, { CardContent } from 'material-ui/Card'
import Button from 'material-ui/Button'
import ArrowBack from 'material-ui-icons/ArrowBack'
import Autorenew from 'material-ui-icons/Autorenew'
import Divider from 'material-ui/Divider/Divider'
import Typography from 'material-ui/Typography/Typography'

import green from 'material-ui/colors/green'
import lime from 'material-ui/colors/lime'
import amber from 'material-ui/colors/amber'
import orange from 'material-ui/colors/orange'
import deepOrange from 'material-ui/colors/deepOrange'
import red from 'material-ui/colors/red'

const styles = theme => ({
  card: {
    margin: '20px',
    '&:first-child': {
      marginTop: '0'
    }
  },
  leftIcon: {
    marginRight: theme.spacing.unit
  },
  content: {
    textAlign: 'center',
    color: 'white'
  },
  content2: {
    textAlign: 'center'
  },
  buttonRefresh: {
    width: '100%'
  },
  number1: { backgroundColor: green[500] },
  number2: { backgroundColor: lime[500] },
  number3: { backgroundColor: amber[500] },
  number5: { backgroundColor: orange[500] },
  number8: { backgroundColor: deepOrange[500] },
  number13: { backgroundColor: red[500] }
})

class Result extends React.Component {
  render () {
    const { classes, score, onAdjust } = this.props
    if (!score) { return 'no score' }
    return (
      <div>
        <Card className={classes.card}>
          <Button
            className={classes.button}
            onClick={event => onAdjust()}
            >
            <ArrowBack className={classes.leftIcon} />
            Adjust
          </Button>
          <Divider />
          <CardContent className={classes['number' + score]}>
            <Typography type='display4' className={classes.content}>
              {score}
            </Typography>
            <Typography className={classes.content}>
              story point{score > 1 ? 's' : ''}
            </Typography>
          </CardContent>
          {score > 8 &&
            <CardContent>
              <Typography type='title' className={classes.content2}>
                Story should probably be splitted
              </Typography>
            </CardContent>
          }
        </Card>
        <Card className={classes.card}>
          <Button
            className={classes.buttonRefresh}
            onClick={event => global.document.location.reload()}
            >
            <Autorenew className={classes.leftIcon} />
            Start over
          </Button>
        </Card>
      </div>
    )
  }
}

Result.defaultProps = {
  onAdjust: () => {}
}

export default withStyles(styles)(Result)
