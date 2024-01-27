import {GameComponent} from "../../gameComponent";


export class LightSourceComponent implements GameComponent {

    private _lightStrength: number

    constructor(lightStrength: number) {
        this._lightStrength = lightStrength;
    }


    get lightStrength(): number {
        return this._lightStrength;
    }

    set lightStrength(value: number) {
        this._lightStrength = value;
    }

    getName(): string {
        return "lightSource";
    }

}
