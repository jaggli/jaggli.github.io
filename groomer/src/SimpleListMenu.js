import React from 'react'
import PropTypes from 'prop-types'
import { withStyles } from 'material-ui/styles'
import List, { ListItem, ListItemText } from 'material-ui/List'
import Card, { CardHeader } from 'material-ui/Card'
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
    margin: '20px',
    '&:first-child': {
      marginTop: '0'
    }
  },
  cardSelected: {
    margin: '0 20px'
  },
  header: {
    '&:hover': {
      backgroundColor: '#00000024',
      cursor: 'pointer'
    }
  },
  title: {
    color: 'gray'
  },
  number1: { backgroundColor: green[500] },
  number2: { backgroundColor: lime[500] },
  number3: { backgroundColor: amber[500] },
  number5: { backgroundColor: orange[500] },
  number8: { backgroundColor: deepOrange[500] },
  number13: { backgroundColor: red[500] },
  item1: {
    '&:hover': {
      backgroundColor: green[100]
    }
  },
  item2: {
    '&:hover': {
      backgroundColor: lime[100]
    }
  },
  item3: {
    '&:hover': {
      backgroundColor: amber[100]
    }
  },
  item5: {
    '&:hover': {
      backgroundColor: orange[100]
    }
  },
  item8: {
    '&:hover': {
      backgroundColor: deepOrange[100]
    }
  },
  item13: {
    '&:hover': {
      backgroundColor: red[100]
    }
  }
})

class SimpleListMenu extends React.Component {
  constructor () {
    super()
    this.handleClick = this.handleClick.bind(this)
  }

  handleClick (event, option = null) {
    this.props.onChange(option)
  }

  render () {
    const { classes, title, options, description, value } = this.props
    const selected = options.filter(
      option => parseInt(option.value, 10) === value
    ).pop() || null

    return (
      <Card className={selected ? classes.cardSelected : classes.card}>
        <CardHeader
          onClick={event => {
            if (!selected) { return }
            this.handleClick(event)
          }}
          avatar={
            selected &&
            <Avatar
              className={classes['number' + selected.value]}
              >
              {selected.value}
            </Avatar>
          }
          action={
            selected &&
            <IconButton>
              <ExpandMoreIcon />
            </IconButton>
          }
          className={selected && classes.header}
          title={selected ? selected.title : title}
          subheader={selected ? <small>{title}</small> : description}
        />
        <Collapse in={!selected} timeout='auto'>
          <Divider />
          <List>
            {options.map(option => (
              <ListItem
                onClick={event => {
                  window.setTimeout(() => {
                    this.handleClick(event, option)
                  }, 300)
                }}
                key={option.title}
                className={classes['item' + option.value]}
                button
                >
                <ListItemText primary={option.title} />
                <Avatar className={classes['number' + option.value]}>
                  {option.value}
                </Avatar>
              </ListItem>
            ))}
          </List>
        </Collapse>
      </Card>
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
