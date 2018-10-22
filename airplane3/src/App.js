import { PureComponent } from 'react'
import P5 from 'p5'
import './App.css'
import 'p5/lib/addons/p5.sound'

import sketch from './sketch'

class App extends PureComponent {
  constructor () {
    super()
    this.ref = null
    this.p5 = null
  }
  componentDidMount () {
    this.p5 = new P5(sketch, 'root')
  }
  render () {
    return null
  }
}

export default App
