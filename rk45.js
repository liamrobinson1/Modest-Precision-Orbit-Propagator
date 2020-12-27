//RK45F COEFFS
const A = [0, 2/9, 1/3, 3/4, 1, 5/6]
const B = [
  [0,       0,        0,      0,      0,      0],
  [2/9,     0,        0,      0,      0,      0],
  [1/12,    1/4,      0,      0,      0,      0],
  [69/128,  -243/128, 135/64, 0,      0,      0],
  [-17/12,  27/4,     -27/5,  16/15,  0,      0],
  [65/432,  -5/16,    13/16,  4/27,   5/144,  0]
]
const Ch = [47/450, 0, 12/25, 32/225, 1/30, 6/25]
const Ct = [-1/150, 0, 3/100, -16/75, -1/20, 6/25]

class RungeKutta45 {
  constructor(t0, y0, h, propTime, relTol) {
    this.initialTime = t0
    this.currentTime = t0
    this.stopTime = t0 + propTime
    this.h = h
    this.initialState = y0
    this.currentState = y0
    this.relTol = relTol
    this.dataPointsComputed = []
  }

  iterate() {
    var state = [this.initialState[0], this.initialState[1], this.initialState[2], this.initialState[3], this.initialState[4], this.initialState[5]]
    this.dataPointsComputed.push([this.currentTime, state])
    while(this.currentTime < this.stopTime) {
      this.evaluate(this.currentTime, this.currentState, this.h)
      state = [this.currentState[0], this.currentState[1], this.currentState[2], this.currentState[3], this.currentState[4], this.currentState[5]]
      this.dataPointsComputed.push([this.currentTime, state])
    }
    return this.dataPointsComputed
  }

  evaluate(t, y, h) {
    this.currentTime = t + h

    var k = [0, 0, 0, 0, 0, 0, 0] //FIRST 0 TO MAKE SURE ITER 1 USES NO EXTRA INPUTS!!!
    var l = [0, 0, 0, 0, 0, 0, 0]
    var m = [0, 0, 0, 0, 0, 0, 0]
    var n = [0, 0, 0, 0, 0, 0, 0]
    var o = [0, 0, 0, 0, 0, 0, 0]
    var p = [0, 0, 0, 0, 0, 0, 0]

    var ksum = 0
    var lsum = 0
    var msum = 0
    var nsum = 0
    var osum = 0
    var psum = 0

    for(var i = 0; i < 6; i++) {
      var augk = 0
      var augl = 0
      var augm = 0
      var augn = 0
      var augo = 0
      var augp = 0

      for(var j = 0; j < i; j++) {
        augk += B[i][j] * k[j + 1]
        augl += B[i][j] * l[j + 1]
        augm += B[i][j] * m[j + 1]
        augn += B[i][j] * n[j + 1]
        augo += B[i][j] * o[j + 1]
        augp += B[i][j] * p[j + 1]
      }

      k[i + 1] = h * this.dot(0, this.currentTime, y[0] + augk, y[1] + augl, y[2] + augm, y[3] + augn, y[4] + augo, y[5] + augp)
      l[i + 1] = h * this.dot(1, this.currentTime, y[0] + augk, y[1] + augl, y[2] + augm, y[3] + augn, y[4] + augo, y[5] + augp)
      m[i + 1] = h * this.dot(2, this.currentTime, y[0] + augk, y[1] + augl, y[2] + augm, y[3] + augn, y[4] + augo, y[5] + augp)
      n[i + 1] = h * this.dot(3, this.currentTime, y[0] + augk, y[1] + augl, y[2] + augm, y[3] + augn, y[4] + augo, y[5] + augp)
      o[i + 1] = h * this.dot(4, this.currentTime, y[0] + augk, y[1] + augl, y[2] + augm, y[3] + augn, y[4] + augo, y[5] + augp)
      p[i + 1] = h * this.dot(5, this.currentTime, y[0] + augk, y[1] + augl, y[2] + augm, y[3] + augn, y[4] + augo, y[5] + augp)
    }

    for(var i = 0; i < 6; i++) {
      ksum += Ch[i] * k[i + 1]
      lsum += Ch[i] * l[i + 1]
      msum += Ch[i] * m[i + 1]
      nsum += Ch[i] * n[i + 1]
      osum += Ch[i] * o[i + 1]
      psum += Ch[i] * p[i + 1]
    }

    y[0] += ksum
    y[1] += lsum
    y[2] += msum
    y[3] += nsum
    y[4] += osum
    y[5] += psum

    var ek = 0
    var el = 0
    var em = 0
    var en = 0
    var eo = 0
    var ep = 0

    for(var i = 0; i < 6; i++) {
      ek += Ct[i] * k[i + 1]
      el += Ct[i] * l[i + 1]
      em += Ct[i] * m[i + 1]
      en += Ct[i] * n[i + 1]
      eo += Ct[i] * o[i + 1]
      ep += Ct[i] * p[i + 1]
    }

    var hk = 0.9 * h * (this.relTol / Math.abs(ek)) ** 0.2
    var hl = 0.9 * h * (this.relTol / Math.abs(el)) ** 0.2
    var hm = 0.9 * h * (this.relTol / Math.abs(em)) ** 0.2
    var hn = 0.9 * h * (this.relTol / Math.abs(en)) ** 0.2
    var ho = 0.9 * h * (this.relTol / Math.abs(eo)) ** 0.2
    var hp = 0.9 * h * (this.relTol / Math.abs(ep)) ** 0.2

    this.optStep = Math.min([hk, hl, hm, hn, ho, hp])
    this.currentState = [y[0], y[1], y[2], y[3], y[4], y[5]]
    this.h = this.optStep
    this.h = 1
  }

  dot(i, t, y0, y1, y2, y3, y4, y5) {
    var moonPE = moon.queryPosition(t)
    var moonPS = new THREE.Vector3(y0 - moonPE.x, y1 - moonPE.y, y2 - moonPE.z)
    switch(i) {
      case 0:
        return y3
      case 1:
        return y4
      case 2:
        return y5
      case 3:
        return -earth.mu / (y0 ** 2 + y1 ** 2 + y2 ** 2) ** 1.5 * y0 - moon.mu / moonPS.length() ** 3 * moonPS.x
      case 4:
        return -earth.mu / (y0 ** 2 + y1 ** 2 + y2 ** 2) ** 1.5 * y1 - moon.mu / moonPS.length() ** 3 * moonPS.y
      case 5:
        return -earth.mu / (y0 ** 2 + y1 ** 2 + y2 ** 2) ** 1.5 * y2 - moon.mu / moonPS.length() ** 3 * moonPS.z
      // case 3:
      //   return -earth.mu / (y0 ** 2 + y1 ** 2 + y2 ** 2) ** 1.5 * y0
      // case 4:
      //   return -earth.mu / (y0 ** 2 + y1 ** 2 + y2 ** 2) ** 1.5 * y1
      // case 5:
      //   return -earth.mu / (y0 ** 2 + y1 ** 2 + y2 ** 2) ** 1.5 * y2
    }
  }

  extract(i) {
    var requested = []
    if(i == "t") {
      for(var j = 0; j < this.dataPointsComputed.length; j++) {
        requested.push(this.dataPointsComputed[j][0])
      }
    }
    else {
      for(var j = 0; j < this.dataPointsComputed.length; j++) {
        requested.push(this.dataPointsComputed[j][1][i])
      }
    }
    return requested
  }
}
