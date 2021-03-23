import Simulator from "~/physics/Simulator"

let simulator:Simulator | undefined

export function getSimulator(nowInSeconds:()=>number) {
    if(!simulator) {
        simulator = new Simulator(nowInSeconds)
    }
    return simulator
}