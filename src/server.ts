import { getSimulator } from "./helpers/physics/simulator";
const {performance} = require('perf_hooks');

function nowInSeconds() {
    return performance.now() * 0.001
}

const sim = getSimulator(nowInSeconds)
const dtMs = 100

setInterval(function tick() {
  sim.update(dtMs*0.001)
}, dtMs)

setInterval(function log() {
  console.log(sim.logPerformance())
}, 2000)