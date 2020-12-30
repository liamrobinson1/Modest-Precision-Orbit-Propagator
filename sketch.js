function setup() {
  w = windowWidth
  h = windowHeight
}

function draw() {
  if(frameCount > 0) {
    if(sat.stillInOnePiece == 1) {
      if(keyIsDown(190) && time.halt == 0) {
        sat.executeManeuver("V", 0.036)
        time.keyPressedLastFrame = 1
        time.burnMagnitude += 1
      }

      if(keyIsDown(188) && time.halt == 0) {
        sat.executeManeuver("V", -0.036)
        time.keyPressedLastFrame = 1
        time.burnMagnitude -= 1
      }

      if(keyIsDown(ESCAPE)) {
        time.halt = 1
      }

      if(!keyIsDown(190) && !keyIsDown(190) && time.keyPressedLastFrame == 1) {
        time.keyPressedLastFrame = 0
        time.burnMagnitude = 0
      }
    }
  }
}
