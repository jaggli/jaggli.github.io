class Plane {
  constructor (p5, images) {
    this.p5 = p5
    this.velocity = 0
    this.frozen = true
    this.y = p5.height / 2
    this.animation = images.slice(0, 2)
    this.startImage = this.animation[0]
    this.currentImage = this.startImage
    this.gravityDirection = 1
  }
  draw () {
    this.update()
    this.p5.fill(255)

    const image = this.frozen
      ? this.startImage
      : this.currentImage

    // draw airplane
    this.p5.push()
    this.p5.angleMode(this.p5.DEGREES)
    this.p5.translate(
      this.x,
      this.y
    )
    const offset = -0.3
    const amplitude = 1.5
    const relativeVelocity = Math.max(
      Math.min(
        (this.velocity / this.p5.height) * -100,
        amplitude + offset
      ),
      -amplitude + offset
    )
    const angle = -relativeVelocity * 50
    this.p5.rotate(angle)
    this.p5.image(
      image,
      -this.width / 2,
      -this.height / 2,
      this.width,
      this.height
    )
    this.p5.pop()

    if (!this.frozen && this.p5.frameCount % 3 === 0) {
      this.currentImage = this.animation.shift()
      this.animation.push(this.currentImage)
    }
  }
  update () {
    const { width, height } = this.p5
    const ratio = this.startImage.width / this.startImage.height
    this.width = width / 5
    this.height = this.width / ratio
    this.gravity = height / 6000 * this.gravityDirection
    this.lift = height / 200
    this.x = width / 4

    if (this.frozen) { return }

    // apply gravity
    this.velocity += this.gravity

    // handle y position
    this.y += this.velocity

    // handle boundaries
    if (this.y > height) {
      this.y = height
      this.velocity = 0
    }

    if (this.y < 0) {
      this.y = 0
      this.velocity = this.velocity / 2
    }
  }
  up () {
    if (this.frozen) { return }
    this.gravityDirection = -1
  }
  down () {
    if (this.frozen) { return }
    this.gravityDirection = 1
  }
  getCollisionArea () {
    return {
      x: this.x - this.width / 2 + this.width / 4,
      y: this.y - this.height / 2 + this.height / 10,
      width: this.width - this.width / 1.7,
      height: this.height - this.height / 2.3
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

export default Plane
