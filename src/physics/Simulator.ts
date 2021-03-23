import { Vec2, World } from "~/vendor/Box2D/Box2D";

export default class Simulator {
    constructor(private nowInSeconds:() => number){
        //
    }
    world = new World(new Vec2(0, -9.8))
    timeAllowed = 0
    timeUsed = 0
    tps = 30
    time = this.nowInSeconds()
    tickDuration = 1 / this.tps
    update(dt:number) {
        const newTime = this.nowInSeconds()

        while((this.time - this.tickDuration) < newTime) {
            this.world.Step(this.tickDuration, 10, 4)
            this.time += this.tickDuration
        }
        this.timeUsed += (this.nowInSeconds()) - newTime
      this.timeAllowed += dt
    }
    logPerformance() {
        let msg = (this.timeUsed / this.timeAllowed * 100).toFixed(2) + '% cpu time on simulation'
        this.timeUsed =0
        this.timeAllowed = 0
        return msg
    }
}