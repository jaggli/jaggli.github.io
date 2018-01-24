import React from 'react'
import PropTypes from 'prop-types'
import { withStyles } from 'material-ui/styles'
import List, { ListItem, ListItemText } from 'material-ui/List'
import Menu, { MenuItem } from 'material-ui/Menu'
import Card, { CardActions, CardContent, CardHeader } from 'material-ui/Card'
import Button from 'material-ui/Button'
import Typography from 'material-ui/Typography'
import Divider from 'material-ui/Divider'
import Avatar from 'material-ui/Avatar'
import ExpandMoreIcon from 'material-ui-icons/ExpandMore'
import Collapse from 'material-ui/transitions/Collapse'
import IconButton from 'material-ui/IconButton'

import green from 'material-ui/colors/green'
import lime from 'material-ui/colors/lime'
import amber from 'material-ui/colors/amber'
import orange from 'material-ui/colors/orange'
import deepOrange from 'material-ui/colors/deepOrange'
import red from 'material-ui/colors/red'

const styles = theme => ({
  card: {
    margin: '20px'
  },
  title: {
    color: 'gray'
  },
  number1: { backgroundColor: green[500] },
  number2: { backgroundColor: lime[500] },
  number3: { backgroundColor: amber[500] },
  number5: { backgroundColor: orange[500] },
  number8: { backgroundColor: deepOrange[500] },
  number13: { backgroundColor: red[500] }
})

class SimpleListMenu extends React.Component {
  constructor () {
    super()
    this.state = {
      selected: null
    }
    this.handleClick = this.handleClick.bind(this)
  }

  handleClick (event, option = null) {
    this.setState({ selected: option })
    this.props.onChange(option)
  }

  render () {
    const { classes, title, options, description } = this.props
    const { selected } = this.state

    return (
      <div>
        <Card className={classes.card}>
          <CardHeader
            onClick={event => {
              if (!selected) { return }
              this.handleClick(event)
            }}
            avatar={
              selected &&
              <Avatar className={classes['number' + selected.value]}>
                {selected.value}
              </Avatar>
            }
            action={
              selected &&
              <IconButton>
                <ExpandMoreIcon />
              </IconButton>
            }
            title={selected ? selected.title : title}
            subheader={selected ? <small>{title}</small> : description}
          />
          <Collapse in={!selected} timeout='auto'>
            <Divider />
            <List>
              {options.map(option => (
                <ListItem
                  key={option.title}
                  onClick={event => {
                    window.setTimeout(() => {
                      this.handleClick(event, option)
                    }, 300)
                  }}
                  button
                  >
                  <Avatar className={classes['number' + option.value]}>
                    {option.value}
                  </Avatar>
                  <ListItemText primary={option.title} />
                </ListItem>
              ))}
            </List>
          </Collapse>
        </Card>
      </div>
    )
  }
}

SimpleListMenu.propTypes = {
  classes: PropTypes.object.isRequired
}

SimpleListMenu.defaultProps = {
  onChange: () => {}
}

export default withStyles(styles)(SimpleListMenu)
