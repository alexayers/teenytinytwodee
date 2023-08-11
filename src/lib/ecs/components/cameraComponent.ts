import {GameComponent} from "../gameComponent";
import {Camera} from "../../rendering/rayCaster/camera";


export class CameraComponent implements GameComponent {

    private _camera: Camera;


    constructor(camera: Camera) {
        this._camera = camera;
    }


    get camera(): Camera {
        return this._camera;
    }

    set camera(value: Camera) {
        this._camera = value;
    }

    get xPlane() : number {
        return this._camera.xPlane;
    }

    get yPlane() : number {
        return this._camera.yPlane;
    }

    get fov() : number {
        return this._camera.fov;
    }

    get xDir() : number {
        return this._camera.xDir;
    }

    get yDir() : number {
        return this._camera.yDir;
    }

    get xPos() : number {
        return this._camera.xPos;
    }

    get yPos() : number {
        return this._camera.yPos;
    }

    getName(): string {
        return "camera";
    }

}
