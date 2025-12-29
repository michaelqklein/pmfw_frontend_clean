// rl-maze.js — A TensorFlow.js port of your Python reinforcement learning maze

import * as tf from '@tensorflow/tfjs';
import Plotly from 'plotly.js-dist';

const x = 25;
const y = 25;
const simLength = 1000;

let maze = tf.randomUniform([x, y], -0.01, 0.01);

// Function to set values probabilistically
function setValuesProbabilistically(tensor, probability, value) {
  const mask = tf.randomUniform(tensor.shape).less(tf.scalar(probability));
  return tf.where(mask, tf.fill(tensor.shape, value), tensor);
}

maze = setValuesProbabilistically(maze, 0.1, -1);
maze = setValuesProbabilistically(maze, 0.2, -0.2);
maze = tf.tidy(() => {
  const update = tf.tensor2d([[1]], [1, 1]);
  return maze.pad([[0, -1], [0, -1]]).concat(update, 0).concat(update, 1);
});

let stateValue = tf.randomUniform([x, y], -0.01, 0.01);
let stateVisit = tf.zeros([x, y]);

let agentPosition = [0, 0];

function getReward(position) {
  return maze.arraySync()[position[0]][position[1]];
}

function isValid(pos) {
  return pos[0] >= 0 && pos[0] < x && pos[1] >= 0 && pos[1] < y;
}

function moveAgent(agentPosition, exploration, stateValue, stateVisit) {
  const possibleMoves = [[0,1],[0,-1],[1,0],[-1,0],[0,0]];
  let bestAction = [0,0];
  let maxValue = stateValue.arraySync()[agentPosition[0]][agentPosition[1]];

  for (const action of possibleMoves) {
    const newPos = [agentPosition[0] + action[0], agentPosition[1] + action[1]];
    if (!isValid(newPos)) continue;

    const maxVisit = stateVisit.max().arraySync();
    const familiar = stateVisit.arraySync()[newPos[0]][newPos[1]];
    const inverted = 1 - (familiar / (maxVisit + 1));
    const compExpl = exploration * inverted;
    const vt = stateValue.arraySync()[newPos[0]][newPos[1]];
    const value = vt + compExpl;

    if (value > maxValue) {
      bestAction = action;
      maxValue = value;
    }
  }
  return [agentPosition[0] + bestAction[0], agentPosition[1] + bestAction[1]];
}

function updateStateValue(stateValue, state_t, reward, state_t_plus_1) {
  const alpha = 0.1;
  const gamma = 0.99;

  const current = stateValue.arraySync()[state_t[0]][state_t[1]];
  const next = stateValue.arraySync()[state_t_plus_1[0]][state_t_plus_1[1]];
  const TD_error = reward + gamma * next - current;
  stateValue = stateValue.clone();
  stateValue.bufferSync().set(current + alpha * TD_error, state_t[0], state_t[1]);
  return stateValue;
}

async function teachingAI() {
  for (let t = 0; t < simLength; t++) {
    let reward = 0;
    agentPosition = [0, 0];
    let totalReward = 0;
    let homeSave = 0;
    const exploration = 1 - (t / simLength);

    while (homeSave < 2) {
      const oldPosition = [...agentPosition];
      // agentPosition = moveAgent(agentPosition, exploration, stateValue, stateVisit);
      if (agentPosition[0] === x - 1 && agentPosition[1] === y - 1) homeSave++;

      const r = 1 // getReward(agentPosition);
      reward = r;
      totalReward += reward;

      // update state value
      // stateValue = updateStateValue(stateValue, oldPosition, reward, agentPosition);
      // increment state visit
      // const buf = stateVisit.bufferSync();
      // buf.set(buf.get(agentPosition[0], agentPosition[1]) + 1, agentPosition[0], agentPosition[1]);
      // stateVisit = buf.toTensor();
    }

    if (t % 100 === 0) {
      console.log(`Iteration ${t}`);
      // await plotGrids();
    }
  }
  console.log("Simulation Complete");
}

async function plotGrids() {
  const sv = await stateValue.array();
  const visit = await stateVisit.array();

  const layout = { margin: { t: 30 } };

  Plotly.newPlot('valuePlot', [{ z: sv, type: 'heatmap', colorscale: 'Hot' }], { ...layout, title: 'State Value' });
  Plotly.newPlot('visitPlot', [{ z: visit, type: 'heatmap', colorscale: 'Hot' }], { ...layout, title: 'State Visit' });
}

// In your component or script:
// <div id="valuePlot"></div>
// <div id="visitPlot"></div>
// Then call:
// runSimulation();

export { teachingAI };
