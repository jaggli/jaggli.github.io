import { intersectRectRect } from '../lib'

class Pipe {
  constructor (p5, relativeSpeed) {
    this.p5 = p5
    this.topHeight = p5.random(0.05, 0.7)
    this.bottomHeight = 0.8 - this.topHeight
    this.distance = 0
    this.relativeSpeed = relativeSpeed
    this.x = p5.width
    this.frozen = false
  }
  draw () {
    const { height } = this.p5
    this.update()
    this.p5.fill(73, 111, 135)
    this.p5.noStroke()
    this.p5.rect(
      this.x,
      0,
      this.getWidth(),
      this.topHeight * height
    )
    this.p5.rect(
      this.x,
      height - (this.bottomHeight * height),
      this.getWidth(),
      this.bottomHeight * height
    )
  }
  getWidth () {
    return this.p5.width / 20
  }
  update () {
    const { width } = this.p5
    this.speed = width / (1000 / this.relativeSpeed)
    if (this.frozen) { return }
    this.distance += 1
    this.x = width - (this.distance * this.speed) + this.getWidth() / 2
  }
  isOffscreen () {
    const { width } = this.p5
    return this.x < width * -1
  }
  intersects (rect) {
    const top = {
      x: this.x,
      y: 0,
      width: this.getWidth(),
      height: this.topHeight * this.p5.height
    }
    const bottom = {
      x: this.x,
      y: this.p5.height - (this.bottomHeight * this.p5.height),
      width: this.getWidth(),
      height: this.bottomHeight * this.p5.height
    }
    return (
      intersectRectRect(rect, top) ||
      intersectRectRect(rect, bottom)
    )
  }
  freeze () {
    this.frozen = true
  }
  unfreeze () {
    this.frozen = false
  }
  isFrozen () {
    return this.frozen
  }
}

export default Pipe
