var w = 0
var h = 0

// const scaleFactor = 1 * 10 ** 6
// const G = 6.674 * 10 ** -11 / scaleFactor ** 3
//
// let time
// var deltaT = 100
// var timeStop = 0
//
// var satMass = 3
// var satOrbitalRadius = 35786000 / scaleFactor
// var satAngle = -3 / 2
//
// let earth
// var earthMass = 5.972 * 10 ** 24
// var earthDrawRadius = 6.371 * 10 ** 6 / scaleFactor
//
// let moon
// let tempMoon
// var moonAngle = 0
// var moonOrbitRadius = 3.48 * 10 ** 8 / scaleFactor
// var moonDrawRadius = 1737.1 * 10 ** 3 / scaleFactor
// var moonMass = 5

const G = 10

let time
var deltaT = 1
var timeStop = 0

var satMass = 3
var satOrbitalRadius = 100
var satAngle = 0

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

let satImage
let moonImage
let earthImage

function preload() {
  satImage = loadImage('assets/saturnV.png')
  earthImage = loadImage('assets/earth.png')
  moonImage = loadImage('assets/moon.png')
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
  falcon.missionAnimTimer = new Time(falcon.deltaT)

  falcon.copy(falconcopy)
  missionSequence = new Mission(["Propagate, to FREL = 2", "Propagate, to MANG = 1.5", "Target MECC = 0.70, at moonperiapsis", "Target MECC = 0.18, at FREL = 3", "Propagate, to moonperiapsis", "Target MECC = 0.01, at FREL = 3"], falcon)
  // missionSequence = new Mission([], falcon)

  time = new Time(deltaT)
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
      }
      if(keyIsDown(188)) {
        falcon.executeManeuver(-0.016)
        falcon.correctThetaFindRs(5000)
      }

      if(keyIsDown(ESCAPE)) {
        time.halt = 1
      }
    }
    else {
      falcon.showSat()
      falcon.displayElements()
    }
  }

  falconTrail.push([falcon.pos.x, falcon.pos.y])
  falconMoonTrail.push([moon.pos.x - falcon.pos.x, moon.pos.y - falcon.pos.y])
  if(time.halt == 0) {
    falcon.drawMostRecentPath()
  }

  noFill()
  push()
  beginShape()
  stroke(0, 255, 255)
  for(var i = 0; i < falconTrail.length; i++) {
    vertex(falconTrail[i][0], falconTrail[i][1])
  }
  endShape()
  pop()

  moonRelativeOrbit()

  addImages()
}
