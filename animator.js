class Animator {
  constructor(frames) {
    this.framesToAnimate = frames
    this.trajectoryArray = [] //Updated by the propagator
    this.i = 0
    this.animating = false
  }

  showNextStep() {
    // console.log(calculateElements(sat.state, moon, "theta"))
    // console.log(calculateElements(sat.state, moon, "theta"), calculateElements(sat.state, moon, "ecc"))
    var propagatorTimestep = propagator.initialStepSize
    this.indexStep = Math.ceil(this.trajectoryArray.length / this.framesToAnimate)
    this.timeStep = this.indexStep * propagatorTimestep
    var nextPoint = this.trajectoryArray[this.i]

    sat.pos.x = nextPoint[0]
    sat.pos.y = nextPoint[1]
    sat.pos.z = nextPoint[2]
    sat.vel.x = nextPoint[3]
    sat.vel.y = nextPoint[4]
    sat.vel.z = nextPoint[5]

    this.i += this.indexStep
    time.timeSinceCreation += this.timeStep

    sat.animateTimestep()
    environmentalUpdates()

    if(this.i >= this.trajectoryArray.length - 1) {
      sat.pos.x = this.trajectoryArray[this.trajectoryArray.length - 1][0]
      sat.pos.y = this.trajectoryArray[this.trajectoryArray.length - 1][1]
      sat.pos.z = this.trajectoryArray[this.trajectoryArray.length - 1][2]
      sat.vel.x = this.trajectoryArray[this.trajectoryArray.length - 1][3]
      sat.vel.y = this.trajectoryArray[this.trajectoryArray.length - 1][4]
      sat.vel.z = this.trajectoryArray[this.trajectoryArray.length - 1][5]

      sat.calculateElements(earth)
      environmentalUpdates()
      this.endAnimation()
    }
  }

  endAnimation() {
    time.halt = 1
    this.animating = false
    this.i = 0
    this.trajectoryArray = []
    time.delta = timeSlider.value()
    time.timeSinceCreation = this.finalTime
    sat.displayElements()
  }
}
