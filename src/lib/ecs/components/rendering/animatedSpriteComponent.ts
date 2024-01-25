import {GameComponent} from "../../gameComponent";
import {AnimatedSprite} from "../../../rendering/animatedSprite";


export class AnimatedSpriteComponent implements GameComponent {

    constructor(private _animatedSprite: AnimatedSprite) {
    }


    get animatedSprite(): AnimatedSprite {
        return this._animatedSprite;
    }

    set animatedSprite(value: AnimatedSprite) {
        this._animatedSprite = value;
    }

    getName(): string {
        return "animatedSprite";
    }
}
