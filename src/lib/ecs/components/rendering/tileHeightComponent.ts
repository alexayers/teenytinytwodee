import {GameComponent} from "../../gameComponent";


export class TileHeightComponent implements GameComponent {

    constructor(private _tileHeight: number) {
    }


    get tileHeight(): number {
        return this._tileHeight;
    }

    set tileHeight(value: number) {
        this._tileHeight = value;
    }

    getName(): string {
        return "tileHeight";
    }
}
