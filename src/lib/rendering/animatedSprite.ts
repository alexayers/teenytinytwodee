import {Renderer} from "./renderer";
import {Sprite} from "./sprite";


export class AnimatedSprite {

    private _tick:number;
    private readonly _maxTicks:number;
    private _currentFrame: number;
    private _frames:Map<string,Array<HTMLImageElement>>;
    private _x: number;
    private _y: number;
    private _currentAction: string;


    constructor(x: number, y: number, maxTicks: number = 16) {

        this._x = x;
        this._y = y;
        this._maxTicks = maxTicks;
        this._currentFrame = 0;
        this._tick = 0;
        this._frames = new Map<string, Array<HTMLImageElement>>();
    }


    get x(): number {
        return this._x;
    }

    set x(value: number) {
        this._x = value;
    }

    get y(): number {
        return this._y;
    }

    set y(value: number) {
        this._y = value;
    }


    get tick(): number {
        return this._tick;
    }

    set tick(value: number) {
        this._tick = value;
    }

    get currentFrame(): number {
        return this._currentFrame;
    }

    set currentFrame(value: number) {
        this._currentFrame = value;
    }

    get frames(): Map<string, Array<HTMLImageElement>> {
        return this._frames;
    }

    set frames(value: Map<string, Array<HTMLImageElement>>) {
        this._frames = value;
    }

    get currentAction(): string {
        return this._currentAction;
    }

    set currentAction(value: string) {

        if (this._currentAction != value) {
            this._currentAction = value;
            this._tick = 0;
            this._currentFrame = 0;
        }

    }

    render() : void {
        let imageElement : HTMLImageElement = this._frames.get(this._currentAction)[this._currentFrame];
        Renderer.renderImage(imageElement,this._x,this._y,imageElement.width,imageElement.height);

        this._tick++;

        if (this._tick == this._maxTicks) {
            this._tick = 0;
            this._currentFrame++;

            if (this._currentFrame == this._frames.get(this._currentAction).length) {
                this._currentFrame = 0;
            }
        }
    }
}
