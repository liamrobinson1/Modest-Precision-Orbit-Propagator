var mesh, renderer, scene, cam, controls, linemat

var planet_data = [{
name: 'EARTH',
 radius: 6378,
 surface_texture: 'assets/earthmap10k.jpg',
 elevation_texture: 'assets/8081_earthbump4k.jpg',
 specular_texture: 'assets/8081_earthspec4k.jpg',
 bump_texture: 'assets/8081_earthbump4k.jpg',
 emissive_texture: 'assets/8081_earthlights4k.jpg',
 cloud_texture: 'assets/fair_clouds_4k.png',
 mesh: 0,
 length_of_day: 1,
 rotation: 0
}]

init()
animate()

function init() {
    // renderer
    renderer = new THREE.WebGLRenderer()
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(window.devicePixelRatio)
    document.body.appendChild(renderer.domElement)

    // scene
    scene = new THREE.Scene()

    // camera
    cam = new THREE.PerspectiveCamera(100, window.innerWidth / window.innerHeight, 1, 1000000)
    cam.position.set(0, 0, 0)

    const controls = new THREE.OrbitControls(cam, renderer.domElement);
    controls.zoomSpeed = 0.1
    controls.panSpeed = 0.3
    // controls.keys = {
    // 	LEFT: 65, //left arrow
    // 	UP: 87, // up arrow
    // 	RIGHT: 68, // right arrow
    // 	BOTTOM: 83 // down arrow
    // }

    // ambient
    scene.add( new THREE.AmbientLight( 0x222222 ) );

    // light
    var light = new THREE.DirectionalLight( 0xffffff, 1 );
    light.position.set(Math.cos(0.4101524),Math.sin(0.4101524), 0 );
    scene.add( light );

    // axes
    scene.add( new THREE.AxesHelper( 20 ) );

    const loader = new THREE.TextureLoader();
    const texture = loader.load(
      'assets/starmap_8k.jpg',
      () => {
        const rt = new THREE.WebGLCubeRenderTarget(texture.image.height);
        rt.fromEquirectangularTexture(renderer, texture);
        scene.background = rt;
      })

    for(var i = 0; i < planet_data.length; i++) {
      earth = createPlanet( {
          radius: planet_data[i].radius,
          segments: 1000,
          surface_texture: planet_data[i].surface_texture,
          displacement_map: planet_data[i].bump_texture,
          displacementScale: 5,
          elevation_texture: planet_data[i].elevation_texture,
          specular_texture: planet_data[i].specular_texture,
          emissive_texture: planet_data[i].emissive_texture,
          name: planet_data[i].name,
          bumpScale: 0.15
      });

      earth.visible = true;
      scene.add(earth);

      cam.position.set(planet_data[i].radius, 0, 0);
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
}

function animate() {
    requestAnimationFrame( animate );
    renderer.render( scene, cam );
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
            emissive: new THREE.Color("rgb(251, 250, 240)"),
            emissiveIntensity: 1,
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
