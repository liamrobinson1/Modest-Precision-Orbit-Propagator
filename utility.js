function tic(name) {
  console.time(name)
}

function toc(name) {
  console.timeEnd(name)
}

function rref(A) {
    var rows = A.length;
    var columns = A[0].length;

    var lead = 0;
    for (var k = 0; k < rows; k++) {
        if (columns <= lead) return;

        var i = k;
        while (A[i][lead] === 0) {
            i++;
            if (rows === i) {
                i = k;
                lead++;
                if (columns === lead) return;
            }
        }
        var irow = A[i], krow = A[k];
        A[i] = krow, A[k] = irow;

        var val = A[k][lead];
        for (var j = 0; j < columns; j++) {
            A[k][j] /= val;
        }

        for (var i = 0; i < rows; i++) {
            if (i === k) continue;
            val = A[i][lead];
            for (var j = 0; j < columns; j++) {
                A[i][j] -= val * A[k][j];
            }
        }
        lead++;
    }
    return A;
}

function revArr(arr) {
  var newArray = [];
  for (var i = arr.length - 1; i >= 0; i--) {
    newArray.push(arr[i]);
  }
  return newArray;
}

function showVertexPath(points, userColor) {
  const linemat = new THREE.LineBasicMaterial( { color: userColor } );
  const geometry = new THREE.BufferGeometry().setFromPoints( points );
  const line = new THREE.Line( geometry, linemat );

  scene.add( line );
}

function calculateElements(state, body, requestedElement) { //CALCULATES KEPLERIAN ELEMENTS WITH RESPECT TO A BODY
  var mu = G * body.mass

  var rBody = createVector(state[0] - body.pos.x, state[1] - body.pos.y, state[2] - body.pos.z)
  var vBody = createVector(state[3] - body.vel.x, state[4] - body.vel.y, state[5] - body.vel.z)

  var rBodyHat = p5.Vector.div(rBody, rBody.mag())
  var vBodyHat = p5.Vector.div(vBody, vBody.mag())

  rmag = rBody.mag()
  var vmag = vBody.mag()

  var vectorToBody = p5.Vector.mult(rBody, -1)

  var bodyPosVelAngle = vBody.angleBetween(vectorToBody)

  var hVector = p5.Vector.cross(rBody, vBody)
  var h = hVector.mag()

  var orbitNormal = p5.Vector.div(hVector, h)

  var orbitBinormal = p5.Vector.cross(vBodyHat, orbitNormal)

  var a = 1 / (2 / rmag - vmag ** 2 / mu)
  var period = 2 * PI * ((a) ** 3 / mu) ** 0.5
  var p = h ** 2 / mu
  var e = -mu / (2 * a)
  var ecc = (1 + 2 * e * h ** 2 / mu ** 2) ** 0.5
  var eccVector = p5.Vector.cross(vBody, hVector).div(mu).sub(rBodyHat)

  var apoapsis = a * (1 + ecc)
  var periapsis = a * (1 - ecc)

  var gamma = acos(h / (rmag * vmag))

  if(p5.Vector.dot(rBody, vBody) > 0) {
    theta = acos((p / rmag - 1) / ecc)
  }
  else {
    theta = 2 * PI - acos((p / rmag - 1) / ecc)
  }

  if(ecc > 1) {
    hyperbolicElements(ecc, eccVector, orbitNormal, a)
  }

  switch(requestedElement) {
    case "theta":
      return theta
    case "bodyAngle":
      console.log("returning bodyangle")
      return bodyPosVelAngle
  }
}

function hyperbolicElements(ecc, eccVector, orbitNormal, a) {
  var betaAngle = acos(1 / ecc)

  var s1 = p5.Vector.mult(eccVector, cos(betaAngle))
  var s2 = p5.Vector.mult(p5.Vector.cross(orbitNormal, eccVector), sin(betaAngle))

  var S = p5.Vector.add(s1, s2)

  var t1 = p5.Vector.cross(S, orbitNormal)

  var T = p5.Vector.div(t1, t1.mag())
  var R = p5.Vector.cross(S, T)

  var b1 = abs(a) * (ecc ** 2 - 1) ** 0.5
  var b2 = p5.Vector.cross(S, orbitNormal)

  var B = p5.Vector.mult(b2, b1)

  var BdotR = p5.Vector.dot(B, R)
  var BdotT = p5.Vector.dot(B, T)
}

function mouseWheel(event) {
  scrollActivity = 1
}

function clif(str, vari) {
  if(frameCount % 100 == 0) {
    console.log(str, vari)
  }
}
