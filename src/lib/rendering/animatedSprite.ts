import {Renderer} from "./renderer";
import {logger, LogType} from "../utils/loggerUtils";


export class AnimatedSprite {

    private _tick:number;
    private readonly _maxTicks:number;
    private _currentFrame: number;
    private _frames:Map<string,Array<HTMLImageElement>> = new Map<string, Array<HTMLImageElement>>();
    private _x: number;
    private _y: number;
    private _width: number;
    private _height: number;
    private _currentAction: string;


    constructor(imageFiles:Map<string,Array<any>>, width: number, height:number, currentAction: string) {
        this._currentAction = currentAction;
        this._width = width;
        this._height = height;
        this._maxTicks = 8;

        for (const [key, files] of imageFiles) {

            this._frames.set(key, []);

            for (const imageFile of files) {
                let image : HTMLImageElement = new Image();
                image.src = imageFile;
                this._frames.get(key).push(image);
            }
        }

        this._currentFrame = 0;
        this._tick = 0;

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

    currentImage() : HTMLImageElement {
        return this._frames.get(this._currentAction)[this._currentFrame];
    }


    get width(): number {
        return this._width;
    }

    set width(value: number) {
        this._width = value;
    }

    get height(): number {
        return this._height;
    }

    set height(value: number) {
        this._height = value;
    }

    nextFrame() : void {
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
