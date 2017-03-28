const THREE = require('three');

function copyContainer(container) {
  // console.log(container)
  let size = container.length;
  let copy = new Array(size);
  copy.fill(new Array(size), 0, size);
  for (let i = 0; i < size; i++) {
    copy[i] = container[i].slice()
    for (let j = 0; j < size; j++) {
        copy[i][j] = container[i][j].slice()
    }
  }
  return copy;
}

// BioCrowd class
export class BioCrowd {
  constructor(gridSize, numMarkers) {
    this.grid_size = gridSize;
    this.num_markers = numMarkers;
    this.markers = [];
    this.agents = [];
    this.container = [];
    this.ScatterMarkers();
  }

  // Randomly scatters markers
  ScatterMarkers() {
    // Initialize marker container
    this.container = new Array(this.grid_size);
    this.container.fill(new Array(this.grid_size), 0, this.grid_size);

    // Scatter markers
    for (let i = 0; i < this.num_markers; i++) {
      let x = Math.random() * this.grid_size;
      let z = Math.random() * this.grid_size;
      let marker = new THREE.Vector3(x, 0, z);
      this.markers.push(marker);
      let slot = this.container[Math.floor(x)][Math.floor(z)];
      if (slot) {
        slot.push(marker);
      } else {
        this.container[Math.floor(x)][Math.floor(z)] = [marker];
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

    let containerCopy = copyContainer(this.container);

    for (let i = 0; i < this.agents.length; i++) {
      let agent = this.agents[i];
      if (!agent.done) agent.step(containerCopy);

      // Clamp agents to grid space
      let p = agent.pos;
      if (p.x < 0) p.x = 0;
      if (p.z < 0) p.z = 0;
      if (p.x >= this.grid_size) p.x = this.grid_size - 1;
      if (p.z >= this.grid_size) p.z = this.grid_size - 1;
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
    this.size = 2.0; // Radius of bubble (integer pls)
    this.markers = [];
    this.weights = [];
    this.max_speed = 0.06;
    this.done = false;
  }

  retrieveMarkers(container) {

    const x = Math.floor(this.pos.x);
    const z = Math.floor(this.pos.z);
    this.markers = [];
    for (let i = -this.size; i <= this.size; i++) {
      for (let j = -this.size; j <= this.size; j++) {
        if (x + i >= 0 && z + j >= 0 &&
            x + i < container.length &&
            z + j < container.length ) {
          this.markers = this.markers.concat(container[x + i][z + j]);
          container[x + i][z + j] = [];
        }
      }
    }
  }

  computeMarkerWeights() {
    this.weights = [];
    let total = 0;
    for (let i = 0; i < this.markers.length; i++) {
      let v1 = this.goal.clone();
      let v2 = this.markers[i].clone();
      v1.sub(this.pos);
      v2.sub(this.pos);
      let weight = v1.dot(v2) + 1;
      this.weights.push(weight);
      total += weight;
    }
    this.weights.forEach((m) => { m /= total });
  }

  step(container) {
    // Retrieves markers and computes their weights
    this.retrieveMarkers(container);
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
    if (this.pos.distanceTo(this.goal) < 2) {
      this.done = true;
    }
  }
}

//
// export default {
//   BioCrowd: BioCrowd,
//   Agent: Agent
// }
