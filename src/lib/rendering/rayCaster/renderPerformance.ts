


export class RenderPerformance {

    static frameCount:number = 0;
    static lastFrame: number;
    static frameTime:number;
    static deltaTime: number;

    static updateFrameTimes() : void {
        RenderPerformance.frameCount++;
        RenderPerformance.frameTime = performance.now() - RenderPerformance.lastFrame;
        RenderPerformance.deltaTime = RenderPerformance.frameTime / (1000/60);
        RenderPerformance.lastFrame = performance.now();

    }


}





