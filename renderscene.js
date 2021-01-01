var p5 = new p5();

var mesh, renderer, scene, cam, controls, currentCam

var propagator

const G = 6.6743 * 10 ** -20
const PI = 3.14159265358979

let time
var deltaT = 10
var timeStop = 0
let timeSlider

let sat
const satTrail = []
const pastPoints = []
var satMass = 3
var satAngle = -2

let earth
let earthRender
var earthOrbitRadius = 0
var earthMass = 5.97219 * 10 ** 24
var earthEqRadius = 6378.1370
var earthPolRadius = 6356.7523142
var earthOmega = 7.2921150 * 10 ** -5                                           //Earth's rotational angular speed in rad / sec
var earthAxisTilt = 0.4101524                                                   //Earth's axis tilt in rad

let moon
let moonRender
let tempMoon
var moonAngle = 0
const moonOrbitRadius = 358000
const moonRadius = 1737.1
const moonMass = 7.348 * 10 ** 22
const moonOrbitOmega = 2.66169 * 10 ** -6                                       //Moon's orbital angular speed in rad / sec

let sun
let sunRender
var sunOrbitalRadius = 147.12 * 10 ** 6
var sunMass = 1.98847 * 10 ** 30
var sunRadius = 696340

let mission
let executed = 0
let animator

var planet_data = [{
name: 'EARTH',
 radius: earthEqRadius,
 surface_texture: 'assets/earthmap10k.jpg',
 elevation_texture: 'assets/8081_earthbump4k.jpg',
 specular_texture: 'assets/8081_earthspec4k.jpg',
 bump_texture: 'assets/8081_earthbump4k.jpg',
 emissive_texture: 'assets/8081_earthlights4k.jpg',
 cloud_texture: 'assets/fair_clouds_4k.png',
 length_of_day: 1,
 rotation: 0,
 bumpScale: 0.015,
 displacementScale: 5,
 segments: 500,
 emissivity: 1,
 emissiveColor: new THREE.Color("rgb(251, 250, 240)")
},
{
name: 'MOON',
 radius: moonRadius,
 surface_texture: 'assets/moonmap4k.jpg',
 elevation_texture: 'assets/moonbump4k.jpg',
 specular_texture: '',
 bump_texture: 'assets/moonbump4k.jpg',
 emissive_texture: '',
 cloud_texture: '',
 length_of_day: 0,
 rotation: 0,
 bumpScale: 0.015,
 displacementScale: 5,
 segments: 200,
 emissivity: 0,
 emissiveColor: new THREE.Color("rgb(251, 250, 240)")
},
{
name: 'SUN',
 radius: sunRadius,
 surface_texture: 'assets/sunmap.jpg',
 elevation_texture: '',
 specular_texture: '',
 bump_texture: '',
 emissive_texture: 'assets/sunmap.jpg',
 cloud_texture: '',
 length_of_day: 0,
 rotation: 0,
 bumpScale: 0,
 displacementScale: 0,
 segments: 100,
 emissivity: 1,
 emissiveColor: new THREE.Color("rgb(251, 250, 240)")
}
]

init()
animate()

function init() {
  createEnvironmentObjects()
  setUpScene()
  createPlanets()
  createUserControls()

// TESTING CAPABILITIES HERE
    // var targeter = new Targeter(sat.state, earth, "periapsis", 10000, "V")
    // targeter.vary()
    // sat.propToApoapsis(earth, 10)
}

function animate() {
  p5Controls()
  cameraControl()
  resizeRendererToDisplaySize(renderer)

  if(animator.animating == false) {
    time.update() //This needs to be here to give time a chance to unpause itself
    if(time.halt == 0) {
      removeEntities()

      if(mission.missionComplete == false && mission.ready == true) {
        mission.executeMissionSegment()
        mission.advanceMissionSegment()
      }
      else {
        sat.standardTimestep()
        environmentalUpdates()
      }
    }
  }

  else {
    removeEntities()
    animator.showNextStep()
    showVertexPath(sat.convergencePath, new THREE.Color('rgb(0, 255, 0)')) //TEMP REMOVE LATER
  }

  requestAnimationFrame(animate)
  renderer.render(scene, cam);
}

function createPlanet(details) {
    var mesh = new THREE.Mesh(
        new THREE.SphereBufferGeometry(details.radius, details.segments, details.segments),
        new THREE.MeshPhongMaterial({
            map: THREE.ImageUtils.loadTexture(details.surface_texture),
            bumpMap: THREE.ImageUtils.loadTexture(details.elevation_texture),
            bumpScale: details.bumpScale,
            specularMap: THREE.ImageUtils.loadTexture(details.specular_texture),
            displacementMap: THREE.ImageUtils.loadTexture(details.elevation_texture),
            displacementScale: details.displacementScale,
            specular: new THREE.Color(0x222222),
            shininess: 50,
            emissiveMap: THREE.ImageUtils.loadTexture(details.emissive_texture),
            emissive: details.emissiveColor,
            emissiveIntensity: details.emissivity,
        })
    );
    return mesh;
}

function createClouds(radius, segments, cloud_texture) {
  var mesh = new THREE.Mesh(
      new THREE.SphereBufferGeometry(radius, segments, segments),
      new THREE.MeshPhongMaterial({
          map: THREE.ImageUtils.loadTexture(cloud_texture),
          transparent: true
      })
  );
  return mesh;
}

function createCities(radius, segments, emissive_texture) {
  var mesh = new THREE.Mesh(
      new THREE.SphereBufferGeometry(radius, segments, segments),
      new THREE.MeshPhongMaterial({
        emissiveMap: THREE.ImageUtils.loadTexture(emissive_texture),
        emissive: new THREE.Color("rgb(251, 250, 230)"),
        emissiveIntensity: 1,
        transparent: true
      })
  );
  return mesh;
}

function createEnvironmentObjects() {
  time = new Time(deltaT, 1)
  earth = new Earth(earthMass, 0, 0, earthEqRadius, earthPolRadius, earthOmega, earthAxisTilt)
  moon = new Moon(moonMass, moonOrbitRadius, earth, 0, moonRadius, moonOrbitOmega)
  sat = new Satellite(satMass)
  animator = new Animator(500)
  mission = new Mission(sat)
}

function setUpScene() {
  renderer = new THREE.WebGLRenderer({canvas: document.querySelector('#c')});
  renderer.setPixelRatio(window.innerWidth / window.innerHeight)
  scene = new THREE.Scene()
  cam = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 300000000)
  const controls = new THREE.OrbitControls(cam, renderer.domElement);
  controls.zoomSpeed = 0.8
  controls.panSpeed = 0.3
  scene.add(new THREE.AmbientLight(0x222222));
  var light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(1, 0, 0);
  scene.add(light);
  scene.add(new THREE.AxesHelper(7000));
}

function createPlanets() {
  const loader = new THREE.TextureLoader();
  const texture = loader.load(
    'assets/starmap_8k.jpg',
    () => {
      const rt = new THREE.WebGLCubeRenderTarget(texture.image.height);
      rt.fromEquirectangularTexture(renderer, texture);
      scene.background = rt;
    })

    earthRender = createPlanet(planet_data[0]);
    moonRender = createPlanet(planet_data[1])
    sunRender = createPlanet(planet_data[2])

    earthRender.visible = true;
    scene.add(earthRender);

    moonRender.visible = true;
    scene.add(moonRender);

    sunRender.visible = true;
    scene.add(sunRender);

    cam.position.set(16000, 0, 0);
    cam.lookAt(0, 0, 0)

    // var clouds
    // clouds = createClouds(planet_data[i].radius / 2 + 3, 1000, planet_data[i].cloud_texture)
    // clouds.visible = true;
    // scene.add(clouds);

    // var cities
    // cities = createCities(planet_data[i].radius + 0.5, 1000, planet_data[i].emissive_texture)
    // cities.visible = true;
    // scene.add(cities);
}

function resizeRendererToDisplaySize(renderer) {
  const canvas = renderer.domElement;
  if(canvas.width !== canvas.clientWidth || canvas.height !== canvas.clientHeight) {
    renderer.setSize(window.innerWidth, window.innerWidth, false);
    cam.aspect = canvas.clientWidth / canvas.clientHeight;
    cam.updateProjectionMatrix();
  }
}
