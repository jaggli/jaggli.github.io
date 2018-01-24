import React, { PureComponent } from 'react'
import Reboot from 'material-ui/Reboot'

import AppBar from 'material-ui/AppBar'
import Toolbar from 'material-ui/Toolbar'
import Typography from 'material-ui/Typography'

import SimpleListMenu from './SimpleListMenu'

import dict from './dict'
console.log(dict)

class App extends PureComponent {
  render () {
    return (
      <div>
        <Reboot />
        <AppBar position='static' color='primary'>
          <Toolbar>
            <Typography type='title' color='inherit'>
              Groomer
            </Typography>
          </Toolbar>
        </AppBar>
        {dict.questions.map((question, i) => (
          <SimpleListMenu
            title={question.title}
            options={question.options}
            description={question.description}
            section={dict.sections[question.section]}
            key={i}
            />
        ))}
      </div>
    )
  }
}

export default App
