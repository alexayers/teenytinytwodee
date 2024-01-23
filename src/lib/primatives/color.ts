import {ColorUtils} from "../utils/colorUtils";


export class Color {
    private _red: number;
    private _green:number;
    private _blue:number;
    private _alpha:number = 1;

    constructor(red: number = 0, green : number = 0, blue : number = 0, alpha : number = 1) {
        this._alpha = alpha;
        this._red = red;
        this._green = green;
        this._blue = blue;
    }


    get red(): number {
        return this._red;
    }

    set red(value: number) {
        this._red = value;
    }

    get green(): number {
        return this._green;
    }

    set green(value: number) {
        this._green = value;
    }

    get blue(): number {
        return this._blue;
    }

    set blue(value: number) {
        this._blue = value;
    }

    get alpha(): number {
        return this._alpha;
    }

    set alpha(value: number) {
        this._alpha = value;
    }

    public toString() : string {
        return ColorUtils.RGBtoHex(this._red, this._green, this._blue);
    }


}
