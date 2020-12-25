var w = 0
var h = 0

const G = 10

let time
var deltaT = 1
var timeStop = 0

var satMass = 3
var satOrbitalRadius = 100
var satAngle = -2

let earth
var earthMass = 40
var earthDrawRadius = 40

let moon
let tempMoon
var moonAngle = 0
var moonOrbitRadius = 400
var moonDrawRadius = 10
var moonMass = 15

let falcon
let falconcopy
let falconTrail = []
let falconMoonTrail = []
var transferFrame = 4

let missionSequence
// let missionArr = ["Propagate, to FREL = 2", "Propagate, to MANG = 1.2", "Target ECCE = 1.32, at FREL = 3", "Propagate, to FREL = 100", "Target MPER = 30, at moonperiapsis", "Target MECC = 0.05, at FREL = 100", "Propagate, to moonperiapsis", "Propagate, to EVPA = -0.4", "Target MECC = 2.2, at FREL = 30", "Propagate, to periapsis", "Target RMAG = 100, at periapsis", "Target ECCE = 0.01, at apoapsis", "Propagate, to FREL = 2"]
// let missionArr = ["Propagate, to FREL = 2", "Propagate, to MANG = 1.2", "Target ECCE = 1.32, at FREL = 50", "Propagate, to FREL = 100", "Target MPER = 30, at moonperiapsis", "Target MECC = 0.4, at FREL = 100", "Propagate, to EVPA = 0", "Target MECC = 1, at periapsis", "Target RMAG = 100, at periapsis", "Target ECCE = 0.01, at FREL = 40"]
let missionArr = ["Propagate, to EVPA = -1"]

let satImage
let moonImage
let earthImage

let plume

function preload() {
  satImage = loadImage('assets/saturnV.png')
  earthImage = loadImage('assets/earth.png')
  moonImage = loadImage('assets/moon.png')
  scaledMoon = loadImage('assets/moon.png')
}

function setup() {
  frameRate(60)
  createCanvas(windowWidth, windowHeight)
  w = windowWidth
  h = windowHeight
  earth = new Earth(earthMass, w / 2, h / 2, earthDrawRadius)
  moon = new Moon(moonMass, moonOrbitRadius, earth, 0, moonDrawRadius)
  falcon = new GravSat(satOrbitalRadius, satAngle, satMass, 0)
  falconcopy = new GravSat(satOrbitalRadius, satAngle, satMass, 0)
  falcon.missionAnimTimer = new Time(falcon.deltaT, 0)

  falcon.copy(falconcopy)
  // missionSequence = new Mission(["Propagate, to FREL = 2", "Propagate, to MANG = 1.5", "Target MECC = 0.70, at moonperiapsis", "Target MECC = 0.18, at FREL = 3", "Propagate, to moonperiapsis", "Target MECC = 0.01, at FREL = 3"], falcon)
  missionSequence = new Mission(missionArr, falcon)
  // missionSequence = new Mission([], falcon)
  plume = new ExhaustPlume(falcon.pos, falcon.vel.mag(), falcon.vel, 20, 0, 0)

  time = new Time(deltaT, 1)
  resizeImages()
}

function draw() {
  //TIME UPDATE
  time.update()

  //UPDATE AND DRAW PLANETS AND MOONS
  earth.show()
  moon.show()
  moon.drawSOI()
  moon.update()


  //UPDATE AND SHOW THE SAT
  falcon.showSat()
  falcon.checkSOI(1)

  if(falcon.stillInOnePiece == 1 && time.currentFrame < transferFrame) {
    falcon.stillInOnePiece = falcon.orbitUpdate(time.halt, 1, moon, 1)
  }

  if(frameCount == 2) {
    falcon.correctThetaFindRs(5000)
  }

  if(time.currentFrame >= transferFrame && falcon.haltPropagation == 0 && !time.halt) {
    if(falcon.missionSegment == 0 && falcon.missionAnimTimer.timeSinceCreation == 0) {
      missionSequence.printSequence()
    }
    if(falcon.missionSegment < missionSequence.sequence.length) {
      if(falcon.missionAnimTimer.timeSinceCreation == 0) {
        var results = missionSequence.executeSequence(falcon.missionSegment)
        missionSequence.burnMagnitude = results[0]
        missionSequence.framesToWait = results[1]
        falcon.executeManeuver(missionSequence.burnMagnitude)
        plume = new ExhaustPlume(falcon.pos, falcon.vel.mag(), p5.Vector.mult(falcon.vel, -1), missionSequence.burnMagnitude * 10, 40 + abs(missionSequence.burnMagnitude) * 10, 50)
        falcon.correctThetaFindRs(5000)
        falcon.calculateElements(moon)
        falcon.stillInOnePiece = falcon.orbitUpdate(time.halt, 1, moon, 1)

        falcon.displayElements()
        falcon.showSat()

        missionSequence.propagator.drawConvergence()
        falcon.missionAnimTimer.timeSinceCreation += 1
      }
      //IF WE"RE IN THE MIDDLE OF A SEGMENT
      else if(falcon.missionAnimTimer.timeSinceCreation < missionSequence.framesToWait && falcon.stillInOnePiece == 1) {
        falcon.standardTimestep()
        if(falcon.missionAnimTimer.timeSinceCreation == 2) {
          falcon.correctThetaFindRs(5000)
        }
        falcon.missionAnimTimer.timeSinceCreation += 1
      }
      //IF WE"VE COMPLETED THE CURRENT SEGMENT
      else if(falcon.missionAnimTimer.timeSinceCreation == missionSequence.framesToWait) {
        falcon.missionAnimTimer.timeSinceCreation = 0
        falcon.missionSegment += 1
        console.log("Moving on!")
        falcon.correctThetaFindRs(5000)
      }
    }
    else if(falcon.stillInOnePiece) {
      falcon.transferComplete = 1
      falcon.standardTimestep()

      if(keyIsDown(190)) {
        falcon.executeManeuver(0.016)
        falcon.correctThetaFindRs(5000)
        time.keyPressedLastFrame = 1
        time.burnMagnitude += 1

        // plume = new ExhaustPlume(thrusterPos, sourceVelMag, thrustVector, thrustMag, particleNum, lifetime)
        // }
      }

      if(keyIsDown(188)) {
        falcon.executeManeuver(-0.016)
        falcon.correctThetaFindRs(5000)
        time.keyPressedLastFrame = 1
        time.burnMagnitude -= 1
      }

      if(keyIsDown(ESCAPE)) {
        time.halt = 1
      }

      if(!keyIsDown(190) && !keyIsDown(190) && time.keyPressedLastFrame == 1) {
        plume = new ExhaustPlume(falcon.pos, falcon.vel.mag(), p5.Vector.mult(falcon.vel, -1), time.burnMagnitude / 3, 40 + time.burnMagnitude, 50)
        time.keyPressedLastFrame = 0
        time.burnMagnitude = 0
      }
    }
    else {
      falcon.showSat()
      falcon.displayElements()
    }
  }

  if(falcon.stillInOnePiece == 1 && time.halt == 0) {
    // falcon.displayFutureTrajectory(500)
    falconTrail.push([falcon.pos.x, falcon.pos.y])
    falconMoonTrail.push([moon.pos.x - falcon.pos.x, moon.pos.y - falcon.pos.y])
  }

  if(time.halt == 0) {
    falcon.drawMostRecentPath()
    plume.update()
  }
  plume.show()
  falcon.showTrail()

  // moonRelativeOrbit()
  addImages()

  if(falcon.missionSegment == missionSequence.sequence.length) {
    falcon.missionAnimTimer.timeSinceCreation = 0
    falcon.missionSegment = 0
    falcon.transferComplete = 0
  }
}
