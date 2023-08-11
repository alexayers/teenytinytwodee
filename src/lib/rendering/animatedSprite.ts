import {Renderer} from "./renderer";
import {Sprite} from "./sprite";


export class AnimatedSprite {

    private _tick:number;
    private readonly _maxTicks:number;
    private _currentFrame: number;
    private _frames:Array<Sprite>;
    private _x: number;
    private _y: number;

    constructor(x: number, y: number, maxTicks: number = 16) {

        this._x = x;
        this._y = y;
        this._maxTicks = maxTicks;
        this._currentFrame = 0;
        this._tick = 0;
        this._frames = [];
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

    addSprite(sprite: Sprite) {
        this._frames.push(sprite);
    }

    render() : void {
        let sprite : Sprite = this._frames[this._currentFrame];
        Renderer.renderImage(sprite.image,this._x,this._y,sprite.width,sprite.height);

        this._tick++;

        if (this._tick == this._maxTicks) {
            this._tick = 0;
            this._currentFrame++;

            if (this._currentFrame == this._frames.length) {
                this._currentFrame = 0;
            }
        }
    }
}
