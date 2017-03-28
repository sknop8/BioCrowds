const THREE = require('three'); // older modules are imported like this. You shouldn't have to worry about this much
import Framework from './framework'
import { BioCrowd, Agent } from './biocrowd'

let scene;
let crowd;
let clock;
const GRID_SIZE = 30;
const NUM_MARKERS = 2500;
let DEBUG = false;
let controls = {
  debug: false,
  config: 1
}
const agentGeo = new THREE.CylinderGeometry( 0.3, 0.3, 1 );
const agentMat = new THREE.MeshBasicMaterial( { color: 0x5599ff } );

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

    renderer.setClearColor(0xeeeeee, 1);

    const objLoader = new THREE.OBJLoader();
    const markerGeo = new THREE.BoxGeometry( 0.1, 0.1, 0.1 );
    const markerMat = new THREE.MeshBasicMaterial( { color: 0x000000 } );

    // set camera position
    camera.position.set(-5, 25, 30);
    camera.lookAt(new THREE.Vector3(GRID_SIZE / 2, -5, GRID_SIZE / 2));

    scene.add(directionalLight);

    // edit params and listen to changes like this
    // more information here: https://workshop.chromeexperiments.com/examples/gui/#1--Basic-Usage
    gui.add(camera, 'fov', 0, 180).onChange(function(newVal) {
        camera.updateProjectionMatrix();
    });

    const planeGeo = new THREE.PlaneBufferGeometry(GRID_SIZE, GRID_SIZE);
    const planeMat = new THREE.MeshBasicMaterial( { color: 0xffffff, side: THREE.DoubleSide } );
    const planeMesh = new THREE.Mesh(planeGeo, planeMat);
    planeMesh.rotation.x = Math.PI / 2
    planeMesh.position.setX(GRID_SIZE / 2)
    planeMesh.position.setZ(GRID_SIZE / 2)
    planeMesh.position.setY(-0.5)
    scene.add(planeMesh);

    // Initialize bio crowd
    SetupCrowd();

    if (DEBUG) {
      for (let m in crowd.markers){
        let pos = crowd.markers[m];
        let markerMesh = new THREE.Mesh(markerGeo, markerMat);
        markerMesh.position.set(pos.x, pos.y, pos.z);
        scene.add(markerMesh);
      }
    }

    gui.add(controls, 'config', {CONF1: 1, CONF2: 2}).onChange((val) => {
      SetupCrowd();
    });


    clock = new THREE.Clock();
    clock.start();
}

function SetupCrowd() {
  ClearScene();
  crowd = new BioCrowd(GRID_SIZE, NUM_MARKERS);
  let startPositions = [];
  let endPositions = [];

  if (controls.config == 1) {
    const NUM_AGENTS = 30;
    for (let i = 0; i < NUM_AGENTS; i++) {
      let x0 = (i / NUM_AGENTS) * (GRID_SIZE - 4) + 2;
      let z0 = 0;
      let x1 = x0;
      let z1 = GRID_SIZE;
      startPositions.push(new THREE.Vector3(x0, 0, z0));
      endPositions.push(new THREE.Vector3(x1, 0, z1));
    }
    for (let i = 0; i < NUM_AGENTS; i++) {
      let x1 = (i / NUM_AGENTS) * (GRID_SIZE - 4) + 2;
      let z1 = 0;
      let x0 = x1;
      let z0 = GRID_SIZE;
      startPositions.push(new THREE.Vector3(x0, 0.5, z0));
      endPositions.push(new THREE.Vector3(x1, 0.5, z1));
    }
  } else if (controls.config == 2) {
    const NUM_AGENTS = 10;
    for (let i = 0; i < NUM_AGENTS; i++) {
      let x0 = (i / NUM_AGENTS) * (GRID_SIZE / 2) + GRID_SIZE / 4;
      let z0 = GRID_SIZE / 4;
      let x1 = (i / NUM_AGENTS) * GRID_SIZE;
      let z1 = GRID_SIZE - 2;
      startPositions.push(new THREE.Vector3(x0, 0, z0));
      endPositions.push(new THREE.Vector3(x1, 0, z1));
    }
    for (let i = 0; i < NUM_AGENTS; i++) {
      let z0 = (i / NUM_AGENTS) * (GRID_SIZE / 2) + GRID_SIZE / 4;
      let x0 = GRID_SIZE / 4;
      let z1 = (i / NUM_AGENTS) * GRID_SIZE;
      let x1 = GRID_SIZE - 2;
      startPositions.push(new THREE.Vector3(x0, 0.5, z0));
      endPositions.push(new THREE.Vector3(x1, 0.5, z1));
    }
    for (let i = 0; i < NUM_AGENTS; i++) {
      let x0 = (i / NUM_AGENTS) * (GRID_SIZE / 2) + GRID_SIZE / 4;
      let z0 = 3 * GRID_SIZE / 4;
      let x1 = (i / NUM_AGENTS) * GRID_SIZE;
      let z1 = 2;
      startPositions.push(new THREE.Vector3(x0, 0.5, z0));
      endPositions.push(new THREE.Vector3(x1, 0.5, z1));
    }
    for (let i = 0; i < NUM_AGENTS; i++) {
      let z0 = (i / NUM_AGENTS) * (GRID_SIZE / 2) + GRID_SIZE / 4;
      let x0 = 3 * GRID_SIZE / 4;
      let z1 = (i / NUM_AGENTS) * GRID_SIZE;
      let x1 = 2;
      startPositions.push(new THREE.Vector3(x0, 0.5, z0));
      endPositions.push(new THREE.Vector3(x1, 0.5, z1));
    }
  }

  crowd.SetupAgents(startPositions, endPositions);
}

function ClearScene() {
  if (!crowd) return;
  for (let i = 0; i < crowd.agents.length; i++) {
    scene.remove(scene.getObjectByName("agent" + i,true));
  }
}

// called on frame updates
function onUpdate(framework) {
  let go = true;
  // if (clock) go = (Math.floor(clock.getElapsedTime() * 100) % 2 == 0);

  if (crowd && go) {
    crowd.MoveAgents();
    const agents = crowd.agents;

    for (let i = 0; i < agents.length; i++) {
      if (!agents[i].done) {
        let pos = agents[i].pos;
        let name = "agent" + i;
        let agentMesh = scene.getObjectByName(name,true);

        if (agentMesh) {
          agentMesh.position.set(pos.x,pos.y,pos.z)
        } else {
          const agentMat = new THREE.MeshBasicMaterial( { color: new THREE.Color(Math.random(), Math.random(), Math.random())} );
          let agentMesh = new THREE.Mesh(agentGeo, agentMat);
          agentMesh.position.set(pos.x, pos.y, pos.z);
          agentMesh.name = name;
          scene.add(agentMesh);
        }
      }
    }
  }
}

// when the scene is done initializing, it will call onLoad, then on frame updates, call onUpdate
Framework.init(onLoad, onUpdate);
