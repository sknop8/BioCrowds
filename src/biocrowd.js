const THREE = require('three');
const GRID_SIZE = 30;
let NUM_MARKERS = 200; // Default
let markers = [];
let agents = [];
let container = [];


// Called once at the beginning
// Randomly scatters markers
function ScatterMarkers(numMarkers) {
  if (numMarkers) NUM_MARKERS = numMarkers;
  // Initialize marker container
  container = new Array(GRID_SIZE);
  container.fill(new Array(GRID_SIZE), 0, GRID_SIZE);

  // Scatter markers
  for (let i = 0; i < NUM_MARKERS; i++) {
    let x = Math.random() * GRID_SIZE;
    let z = Math.random() * GRID_SIZE;
    let marker = new THREE.Vector3(x, 0, z);
    markers.push(marker);
    let slot = container[Math.floor(x)][Math.floor(z)];
    if (slot) {
      slot.push(marker);
    } else {
      container[Math.floor(x)][Math.floor(z)] = [marker];
    }
  }

  return markers;
}

// Initializes agents with start and end pts
function SetupAgents(startPts, endPts) {
  for (let i = 0; i < startPts.length; i++) {
    let agent = new Agent(startPts[i], endPts[i]);
    agents.push(agent)
  }
}

// Move agents 1 step
// Returns false if all agents have reached their goal
function MoveAgents() {

}

// Agent class
class Agent {
  constructor(start, goal) {
    this.position = start;
    this.velocity = 0;
    this.goal = goal;
    this.orientation = 1;
    this.size = 1;
    this.markers = [];
  }

  computeVelocity() {

  }

}

export default {
  ScatterMarkers: ScatterMarkers,
  Agent: Agent
}
