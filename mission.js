class Mission {
  constructor(targetObject) {
    this.target = targetObject
    this.missionSegment = 0
    this.missionArraylength = 6
    this.missionComplete = false
    this.executionTime = 100
    this.ready = false
  }

  advanceMissionSegment() {
    if(this.missionSegment < this.missionArraylength - 1) {
      this.missionSegment += 1
    }
    else {
      this.missionComplete = true
      this.ready = false
    }
  }

  executeMissionSegment() {
    if(this.missionArraylength > 0) {
      console.log("executing segment", this.missionSegment)
      this.runSegment()
    }
    else {
      this.ready = false
      this.missionComplete = true
    }
  }

  runSegment() {
    switch(this.missionSegment) {
      case 0:
        sat.propToAscendingNode(earth, 10)
        break
      case 1:
        this.targetQuantity(earth, "i", 2, "INCCHANGE", 5)
        break
      case 2:
        sat.propToTheta(earth, 10, 4.10)
        break
      case 3:
        this.targetQuantity(earth, "apoapsis", 359000, "V", 25)
        break
      case 4:
        sat.propToTheta(moon, 50, 6)
        break
      case 5:
        this.targetQuantity(moon, "ecc", 0.1, "V", 4)
        break
    }
  }

  targetQuantity(centralBody, paramToTarget, value, burnAxis, sensetivity) {
    console.log("Targeting " + paramToTarget + " = " + value.toString() + " with burn axis " + burnAxis)
    var targeter = new Targeter(sat.state, centralBody, paramToTarget, value, burnAxis, sensetivity)
    var burnVector = targeter.vary()
    // console.log("bv", burnVector, sat.vel)
    if(burnVector) {
      sat.vel.add(burnVector)
      sat.state[3] = sat.vel.x
      sat.state[4] = sat.vel.y
      sat.state[5] = sat.vel.z
    }
    console.log("We are ending the previous segment with a state: ", sat.state)
    mission.ready = true
  }
}
