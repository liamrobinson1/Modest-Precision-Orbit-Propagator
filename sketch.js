var w = 0
var h = 0

const G = 10

let time
var deltaT = 1
var timeStop = 0

var satMass = 3
var satOrbitalRadius = 100
var satAngle = - 3.14 / 2

let earth
var earthMass = 40
var earthDrawRadius = 50

let moon
let tempMoon
var moonAngle = 0
var moonOrbitRadius = 250
var moonDrawRadius = 10
var moonMass = 10

let falcon
let falconcopy
let falconTrail = []
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
  earth = new Earth(earthMass, w / 2, h / 2)
  moon = new Moon(moonMass, moonOrbitRadius, earth, 0, 0)
  falcon = new GravSat(satOrbitalRadius, satAngle, satMass, 0)
  falconcopy = new GravSat(satOrbitalRadius, satAngle, satMass, 0)
  falcon.missionAnimTimer = new Time(falcon.deltaT)

  falcon.copy(falconcopy)
  missionSequence = new Mission(["Propagate, to FREL = 20", "Propagate, to apoapsis", "Target POSM = 400, at FREL = 100"], falcon)
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
  falcon.checkSOI()

  if(falcon.stillInOnePiece == 1 && time.currentFrame < transferFrame) {
    falcon.stillInOnePiece = falcon.orbitUpdate(time.halt, 1, moon)
  }

  if(frameCount == 2) {
    falcon.correctThetaFindRs()
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
        console.log("Our results are: ", results)
        falcon.executeManeuver(missionSequence.burnMagnitude)

        falcon.stillInOnePiece = falcon.orbitUpdate(time.halt, 1, moon)
        falcon.correctThetaFindRs()
        falcon.calculateElements(moon)
        falcon.displayElements()
        falcon.showSat()
        missionSequence.propagator.drawConvergence()
        falcon.missionAnimTimer.timeSinceCreation += 1
      }
      //IF WE"RE IN THE MIDDLE OF A SEGMENT
      else if(falcon.missionAnimTimer.timeSinceCreation < missionSequence.framesToWait && falcon.stillInOnePiece == 1) {
        // console.log('executing', falcon.pos)
        falcon.stillInOnePiece = falcon.orbitUpdate(time.halt, 1, moon)
        falcon.correctThetaFindRs()
        falcon.calculateElements(moon)
        falcon.displayElements()
        falcon.showSat()
        falcon.missionAnimTimer.timeSinceCreation += 1
      }
      //IF WE"VE COMPLETED THE CURRENT SEGMENT
      else if(falcon.missionAnimTimer.timeSinceCreation == missionSequence.framesToWait) {
        falcon.missionAnimTimer.timeSinceCreation = 0
        falcon.missionSegment += 1
        console.log("Moving on!")
      }
    }
    else if(falcon.stillInOnePiece) {
      falcon.transferComplete = 1
      falcon.stillInOnePiece = falcon.orbitUpdate(time.halt, 1, moon)
      falcon.correctThetaFindRs()
      falcon.calculateElements(moon)
      falcon.displayElements()
      falcon.showSat()

      if(keyIsDown(190)) {
        falcon.executeManeuver(0.016)
        falcon.correctThetaFindRs(0)
      }
      if(keyIsDown(188)) {
        falcon.executeManeuver(-0.016)
        falcon.correctThetaFindRs(0)
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

  if(time.currentFrame % 1 == 0) {
    falconTrail.push([falcon.pos.x, falcon.pos.y])
  }
  // falcon.displayFutureTrajectory(500)

  noFill()
  push()
  beginShape()
  stroke(0, 255, 255)
  for(var i = 0; i < falconTrail.length; i++) {
    vertex(falconTrail[i][0], falconTrail[i][1])
  }
  endShape()
  pop()

  addImages()
}
