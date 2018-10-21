class Sprite {
  constructor (p5, image, relativeSpeed, align = 0) {
    this.p5 = p5
    this.image = image
    this.frozen = true
    this.relativeSpeed = relativeSpeed
    this.x = p5.width
    this.align = align
  }
  draw () {
    this.update()

    this.p5.push()
    this.p5.angleMode(this.p5.DEGREES)
    this.p5.translate(
      this.x,
      this.y
    )
    this.p5.scale(this.scale)
    this.p5.image(
      this.image,
      0,
      this.image.height / -2,
      this.image.width,
      this.image.height
    )
    this.p5.pop()
  }
  update () {
    const { width, height } = this.p5
    this.scale = height / 300
    this.y = this.align === 'bottom'
      ? height - (this.image.height / 2) * this.scale
      : this.align * height
    this.speed = width / (1000 / this.relativeSpeed)

    if (this.frozen) { return }

    this.x -= this.speed
    if (this.x < -this.image.width * this.scale - width / 10) {
      this.x = width
    }
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

export default Sprite
