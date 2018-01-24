import React, { PureComponent } from 'react'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import RaisedButton from 'material-ui/RaisedButton';

class App extends PureComponent {
  render () {
    return (
      <MuiThemeProvider>
        <div className='App'>
          <header className='App-header'>
            <h1 className='App-title'>Welcome to React</h1>
          </header>
          <p className='App-intro'>
            To get started, edit <code>src/App.js</code> and save to reload.
          </p>
          <RaisedButton>Click Me</RaisedButton>
        </div>
      </MuiThemeProvider>
    )
  }
}

export default App
