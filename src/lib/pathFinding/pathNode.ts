export class PathNode {
    private _x: number;
    private _y: number;
    private _idx: number;
    private _parent: number;
    private _g: number;
    private _h: number;
    private _f: number;

    public constructor(x: number, y: number) {
        this._x = x;
        this._y = y;
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

    get idx(): number {
        return this._idx;
    }

    set idx(value: number) {
        this._idx = value;
    }

    get parent(): number {
        return this._parent;
    }

    set parent(value: number) {
        this._parent = value;
    }

    get g(): number {
        return this._g;
    }

    set g(value: number) {
        this._g = value;
    }

    get h(): number {
        return this._h;
    }

    set h(value: number) {
        this._h = value;
    }

    get f(): number {
        return this._f;
    }

    set f(value: number) {
        this._f = value;
    }
}
