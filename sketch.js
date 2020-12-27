var w = 0
var h = 0

const G = 6.6743 * 10 ** -20
const SF = 50

let time
var deltaT = 1
var timeStop = 0
var scrollActivity = 0

var satMass = 3
var satOrbitalRadius = 100
var satAngle = -2

let earth
var earthMass = 5.97219 * 10 ** 24
var earthEqRadius = 6378.1370
var earthPolRadius = 6356.7523142
var earthOmega = 7.2921150 * 10 ** -5
var earthAxisTilt = 0.4101524

let moon
let tempMoon
var moonAngle = 0
var moonOrbitRadius = 357000
var moonDrawRadius = 1737.1 / SF
var moonMass = 7.348 * 10 ** 22

let sat
let satTrail = [[], [], []]
var transferFrame = 4

let missionSequence
let missionArr = []

let earthTex
let moonTex

let earthCam
let satCam
let moonCam
let currentCam

let myFont

let plume

function suc() {
  console.log("success")
}

function bad() {
  console.log("bad")
}

function preload() {
  myFont = loadFont('assets/SourceSansPro-Regular.otf')
  earthTex = loadImage('assets/earthmap1k.jpg')
  moonTex = loadImage('assets/moonmap1k.jpg')
}

function setup() {
  frameRate(60)
  createCanvas(windowWidth, windowHeight, WEBGL)
  cameraSetup()
  perspective(PI / 3.0, windowWidth / windowHeight, 0.01, 50000)
  w = windowWidth
  h = windowHeight
  earth = new Earth(earthMass, 0, 0, earthEqRadius, earthPolRadius, earthOmega, earthAxisTilt)
  moon = new Moon(moonMass, moonOrbitRadius, earth, 0, moonDrawRadius)
  sat = new GravSat(satOrbitalRadius, satAngle, satMass)
  sat.missionAnimTimer = new Time(sat.deltaT, 0)

  missionSequence = new Mission(missionArr, sat)
  plume = new ExhaustPlume(sat.pos, sat.vel.mag(), sat.vel, 20, 0, 0)

  time = new Time(deltaT, 1)
}

function draw() {
  //ORBIT CONTROL
  orbitControl(1, 1, 0.02)
  cameraControl()
  scrollActivity = 0

  //TIME UPDATE
  time.update()

  //UPDATE AND DRAW PLANETS AND MOONS
  earth.show()
  moon.show()
  moon.update()

  //UPDATE AND SHOW THE SAT
  sat.displayElements()
  sat.standardTimestep()

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
      plume = new ExhaustPlume(sat.pos, sat.vel.mag(), p5.Vector.mult(sat.vel, -1), time.burnMagnitude / 3, 40 + time.burnMagnitude, 50)
      time.keyPressedLastFrame = 0
      time.burnMagnitude = 0
    }
  }

  if(sat.stillInOnePiece == 1 && time.halt == 0 && time.timeSinceCreation % 10 == 0) {
    satTrail[0].push(sat.pos.x)
    satTrail[1].push(sat.pos.y)
    satTrail[2].push(sat.pos.z)
  }

  if(time.halt == 0) {
    plume.update()
  }

  plume.show()
  sat.displayFutureTrajectory(2000, earth)
  // sat.displayFutureTrajectory(sat.period / 2, moon)
  sat.saveGroundTrack(earth)
  sat.showGroundTrack()
  drawVectors()
  drawEcliptic()
}
