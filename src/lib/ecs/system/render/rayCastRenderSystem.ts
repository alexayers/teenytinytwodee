import {GameRenderSystem} from "../../gameRenderSystem";
import {RayCaster} from "../../../rendering/rayCaster/rayCaster";
import {WorldMap} from "../../../rendering/rayCaster/worldMap";
import {GameEntityRegistry} from "../../../registries/gameEntityRegistry";
import {GameEntity} from "../../gameEntity";
import {CameraComponent} from "../../components/cameraComponent";
import {Color} from "../../../primatives/color";
import {Renderer} from "../../../rendering/renderer";
import {Performance} from "../../../rendering/rayCaster/performance";

export class RayCastRenderSystem implements GameRenderSystem {

    private _rayCaster: RayCaster;
    private _worldMap : WorldMap = WorldMap.getInstance();
    private _gameEntityRegistry: GameEntityRegistry = GameEntityRegistry.getInstance();
    private _floor:HTMLImageElement;
    private _ceiling:HTMLImageElement;

    constructor() {
        this._floor = new Image();
        this._floor.src = require("../../../../assets/wall.png")

        this._ceiling = new Image();
        this._ceiling.src = require("../../../../assets/door.png")

        this._rayCaster = new RayCaster(this._floor,this._ceiling);
    }

    process(): void {

        let player : GameEntity = this._gameEntityRegistry.getSingleton("player");

        Performance.updateFrameTimes();
        this.moveAll();

        let camera: CameraComponent = player.getComponent("camera") as CameraComponent;

        this._rayCaster.drawSkyBox(camera.camera);

        for(let x : number = 0; x < Renderer.getCanvasWidth(); x++) {
            this._rayCaster.drawWall(camera.camera, x);
        }

        this._rayCaster.drawSpritesAndTransparentWalls(camera.camera);

    }

    moveAll() : void {
        this._worldMap.moveDoors();
    }

}
