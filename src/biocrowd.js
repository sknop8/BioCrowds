const THREE = require('three');
// const GRID_SIZE = 30;
// let NUM_MARKERS = 200; // Default

let container = [];

// BioCrowd class
export class BioCrowd {
  constructor(gridSize, numMarkers) {
    this.grid_size = gridSize;
    this.num_markers = numMarkers;
    this.markers = [];
    this.agents = [];
    this.ScatterMarkers();
  }

  // Randomly scatters markers
  ScatterMarkers() {
    // Initialize marker container
    container = new Array(this.grid_size);
    container.fill(new Array(this.grid_size), 0, this.grid_size);

    // Scatter markers
    for (let i = 0; i < this.num_markers; i++) {
      let x = Math.random() * this.grid_size;
      let z = Math.random() * this.grid_size;
      let marker = new THREE.Vector3(x, 0, z);
      this.markers.push(marker);
      let slot = container[Math.floor(x)][Math.floor(z)];
      if (slot) {
        slot.push(marker);
      } else {
        container[Math.floor(x)][Math.floor(z)] = [marker];
      }
    }
  }

  // Initializes agents with start and end pts
  SetupAgents(startPts, endPts) {
    for (let i = 0; i < startPts.length; i++) {
      let agent = new Agent(startPts[i], endPts[i]);
      this.agents.push(agent)
    }
  }

  // Move agents 1 step if they haven't yet reached their goal
  MoveAgents() {
    for (let i = 0; i < this.agents.length; i++) {
      let agent = this.agents[i];
      if (!agent.done) agent.step();
    }
  }
}

// Agent class
export class Agent {
  constructor(start, goal) {
    this.pos = start;
    // this.velocity = 0;
    this.goal = goal;
    // this.orientation = 1;
    // this.size = 1;
    this.markers = [];
    this.weights = [];
    this.max_speed = 3;
    this.done = false;
  }

  computeMarkerWeights() {
    this.weights = [];
    let total = 0;
    for (let i = 0; i < this.markers.length; i++) {
      let v1 = this.goal.clone();
      let v2 = this.markers[i].clone();
      v1.sub(this.pos);
      v2.sub(this.pos);
      v1.normalize();
      v2.normalize();
      let weight = v1.dot(v2) + 1;
      this.weights.push(weight);
      total += weight;
    }
    this.weights.forEach((m) => { m /= total });
  }

  step() {
    // Retrieves markers and computes their weights
    this.markers = container[Math.floor(this.pos.x)][Math.floor(this.pos.z)].slice();
    this.computeMarkerWeights();

    // Computes motion vector
    let motionVec = new THREE.Vector3();
    for (let i = 0; i < this.weights.length; i++) {
      let dist = this.markers[i].clone();
      dist.sub(this.pos);
      motionVec.add(dist.multiplyScalar(this.weights[i]));
    }

    // Computes new position
    const speed = Math.min(motionVec.length(), this.max_speed);

    const disp = motionVec.divideScalar(motionVec.length()).multiplyScalar(speed);
    this.pos.add(disp);

    // Checks if I have reached my goal
    if (this.pos.distanceTo(this.goal) < 0.01) {
      this.done = true;
    }
  }
}

//
// export default {
//   BioCrowd: BioCrowd,
//   Agent: Agent
// }
