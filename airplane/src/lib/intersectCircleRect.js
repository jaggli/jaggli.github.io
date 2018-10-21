const intersectCircleRect = (circle, rect) => {
  var distX = Math.abs(circle.x - rect.x - rect.width / 2)
  var distY = Math.abs(circle.y - rect.y - rect.height / 2)

  if (distX > (rect.width / 2 + circle.radius)) { return false }
  if (distY > (rect.height / 2 + circle.radius)) { return false }

  if (distX <= (rect.width / 2)) { return true }
  if (distY <= (rect.height / 2)) { return true }

  // also test for corner collisions
  var dx = distX - rect.width / 2
  var dy = distY - rect.height / 2
  return (dx * dx + dy * dy <= (circle.radius * circle.radius))
}

export default intersectCircleRect
