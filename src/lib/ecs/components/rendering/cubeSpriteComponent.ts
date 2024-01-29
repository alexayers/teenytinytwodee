import {GameComponent} from "../../gameComponent";
import {Sprite} from "../../../rendering/sprite";


export enum CubeSpriteSide {
    NORTH,
    SOUTH,
    EAST,
    WEST
}

export class CubeSpriteComponent implements GameComponent {


    constructor(private _sprite: Array<Sprite>) {

    }

    get sprite(): Array<Sprite> {
        return this._sprite;
    }

    set sprite(value: Array<Sprite>) {
        this._sprite = value;
    }

    getName(): string {
        return "cubeSprite";
    }

}
