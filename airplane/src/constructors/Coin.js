import { intersectCircleRect } from '../lib'

class Coin {
  constructor (p5, image, relativeSpeed) {
    this.p5 = p5
    this.image = image
    this.frozen = false
    this.relativeSpeed = relativeSpeed
    this.x = p5.width + this.getWidth()
  }
  draw () {
    this.update()

    this.p5.push()
    this.p5.angleMode(this.p5.DEGREES)
    this.p5.translate(
      this.x,
      this.y
    )
    this.p5.scale(this.getScale())
    this.p5.image(
      this.image,
      this.image.width / -2,
      this.image.height / -2,
      this.image.width,
      this.image.height
    )
    this.p5.pop()
  }
  getScale () {
    return this.p5.width / 10000
  }
  getWidth () {
    return this.getScale() * this.image.width
  }
  isOffscreen () {
    const { width } = this.p5
    return this.x < width * -1
  }
  update () {
    const { width, height } = this.p5
    this.y = height / 2
    this.speed = width / (1000 / this.relativeSpeed)

    if (this.frozen) { return }

    this.x -= this.speed
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
  intersects (area) {
    const circle = {
      x: this.x,
      y: this.y,
      radius: this.getWidth() / 2
    }
    this.p5.push()
    this.p5.fill(0, 255, 0, 100)
    this.p5.noStroke()
    this.p5.rect(area.x, area.y, area.width, area.height)
    this.p5.ellipse(this.x, this.y, this.getWidth())
    this.p5.pop()
    return intersectCircleRect(circle, area)
  }
}

export default Coin
