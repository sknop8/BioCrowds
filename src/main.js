const THREE = require('three'); // older modules are imported like this. You shouldn't have to worry about this much
import Framework from './framework'
import BioCrowd from './biocrowd'

let verts = [];
let particles = [];
let scene;
let clock;
let particleSystem;

// called after the scene loads
function onLoad(framework) {
    scene = framework.scene;
    const camera = framework.camera;
    const renderer = framework.renderer;
    const gui = framework.gui;
    const stats = framework.stats;

    // Basic Lambert white
    const lambertWhite = new THREE.MeshLambertMaterial({ color: 0xaaaaaa, side: THREE.DoubleSide });

    // Set light
    const directionalLight = new THREE.DirectionalLight( 0xffffff, 1 );
    directionalLight.color.setHSL(0.1, 1, 0.95);
    directionalLight.position.set(1, 3, 2);
    directionalLight.position.multiplyScalar(10);

    // scene.background = skymap;
    renderer.setClearColor(0xffffff, 1);

    const objLoader = new THREE.OBJLoader();
    const markerGeo = new THREE.BoxGeometry( 0.1, 0.1, 0.1 );
    const material = new THREE.MeshBasicMaterial( { color: 0x000000 } );


    // set camera position
    camera.position.set(15, 50, -15);
    camera.lookAt(new THREE.Vector3(0,-10,0));

    scene.add(directionalLight);

    // edit params and listen to changes like this
    // more information here: https://workshop.chromeexperiments.com/examples/gui/#1--Basic-Usage
    gui.add(camera, 'fov', 0, 180).onChange(function(newVal) {
        camera.updateProjectionMatrix();
    });


    clock = new THREE.Clock();
    clock.start();

    let markers = BioCrowd.ScatterMarkers(1000);

    for (let m in markers){
      let pos = markers[m];
      let markerMesh = new THREE.Mesh(markerGeo, material);
      markerMesh.position.set(pos.x, pos.y, pos.z);
      scene.add(markerMesh);
    }

}

function lerp(a, b, t) {
    return (1 - t) * a + t * b;
}

// called on frame updates
function onUpdate(framework) {

}

// when the scene is done initializing, it will call onLoad, then on frame updates, call onUpdate
Framework.init(onLoad, onUpdate);
