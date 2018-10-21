import { intersectRectRect } from '../lib'

const STORAGE_KEY_HIGHSCORE = 'airplane-highscore'

class AppBar {
  constructor (p5, font) {
    this.p5 = p5
    this.x = 0
    this.y = 0
    this.font = font
    this.fontSize = 0
    this.highscore = parseInt(
      global.localStorage.getItem(STORAGE_KEY_HIGHSCORE) || 0,
      10
    )
  }
  draw (points = 0, hint = '') {
    this.update()

    this.p5.push()
    this.p5.fill(250, 221, 127)
    this.p5.noStroke()
    this.p5.rect(
      0,
      this.y,
      this.width,
      this.getHeight()
    )
    this.p5.pop()

    this.p5.push()
    const padding = this.p5.height / 70
    const text = `COINS: ${points}`
    this.p5.textFont(this.font)
    this.p5.fill(0, 0, 0)
    this.p5.textSize(this.fontSize)
    const textX = this.p5.width - padding - this.p5.textWidth(text)

    if (points > this.highscore) {
      this.highscore = points
      global.localStorage.setItem(STORAGE_KEY_HIGHSCORE, this.highscore)
    }
    this.p5.text(`HIGHSCORE: ${this.highscore}`, padding, this.y + this.fontSize)

    this.p5.text(text, textX, this.y + this.fontSize)
    this.p5.stroke(255, 255, 255)
    this.p5.textAlign(this.p5.CENTER)
    this.p5.strokeWeight(this.fontSize / 10)
    this.p5.text(hint, this.p5.width / 2, this.fontSize * 5)

    this.p5.pop()
  }
  getHeight () {
    const { height } = this.p5
    return height / 15
  }
  update (points) {
    const { width, height } = this.p5
    this.width = width
    this.y = height - this.getHeight()
    this.fontSize = this.getHeight() / 1.3
  }
  intersects (rect) {
    return intersectRectRect(rect, {
      x: this.x,
      y: this.y,
      width: this.p5.width,
      height: this.getHeight()
    })
  }
}

export default AppBar
