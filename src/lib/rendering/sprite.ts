import {Renderer} from "./renderer";


export class Sprite {
    private _width: number;
    private _height: number;
    private _x: number;
    private _y: number;
    private _image:HTMLImageElement;


    constructor(width: number, height: number, imageFile: any) {

        this._width = width;
        this._height = height;
        this._image = new Image();

        this._image.src = imageFile;
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

    get image(): HTMLImageElement {
        return this._image;
    }

    set image(value: HTMLImageElement) {
        this._image = value;
    }

    render(x: number, y: number, width: number, height: number, flip: boolean = false) {
        Renderer.renderImage(this._image, x,y,width,height, flip);
    }

    renderClippedImage() : void {
        Renderer.renderClippedImage(this._image, 0, this.height, this.width, this.height, 0, 0, this.width, this.height);
    }
}
