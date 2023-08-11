import {GameComponent} from "../gameComponent";
import {Sprite} from "../../rendering/sprite";

export class SpriteComponent implements GameComponent {

    private _sprite: Sprite;
    constructor(sprite: Sprite) {
        this._sprite = sprite;
    }


    get sprite(): Sprite {
        return this._sprite;
    }

    set sprite(value: Sprite) {
        this._sprite = value;
    }

    getName(): string {
        return "sprite";
    }

}
