import {GameRenderSystem} from "../../gameRenderSystem";
import {RayCaster} from "../../../rendering/rayCaster/rayCaster";
import {WorldMap} from "../../../rendering/rayCaster/worldMap";
import {GameEntityRegistry} from "../../../registries/gameEntityRegistry";
import {GameEntity} from "../../gameEntity";
import {Color} from "../../../primatives/color";
import {Renderer} from "../../../rendering/renderer";
import {RenderPerformance} from "../../../rendering/rayCaster/renderPerformance";
import {CameraComponent} from "../../components/rendering/cameraComponent";
import {Game} from "../../../../app/main";
import {AnimatedSpriteComponent} from "../../components/rendering/animatedSpriteComponent";

export class RayCastRenderSystem implements GameRenderSystem {

    private _rayCaster: RayCaster;
    private _worldMap : WorldMap = WorldMap.getInstance();
    private _gameEntityRegistry: GameEntityRegistry = GameEntityRegistry.getInstance();
    private _floor:HTMLImageElement;
    private _ceiling:HTMLImageElement;

    constructor() {
        this._floor = new Image();
        this._floor.src = require("../../../../assets/floor.png")

        this._ceiling = new Image();
        this._ceiling.src = require("../../../../assets/ceiling.png")

        this._rayCaster = new RayCaster(this._floor,this._ceiling);
    }

    process(): void {

        let player : GameEntity = this._gameEntityRegistry.getSingleton("player");

        RenderPerformance.updateFrameTimes();
        this.moveAllDoors();

        let camera: CameraComponent = player.getComponent("camera") as CameraComponent;

        this._rayCaster.drawSkyBox(camera.camera);

        for(let x : number = 0; x < Renderer.getCanvasWidth(); x++) {
            this._rayCaster.drawWall(camera.camera, x);
        }

        this._rayCaster.drawSpritesAndTransparentWalls(camera.camera);
        let gameEntities: Array<GameEntity> = this._worldMap.getGameEntities();

        for (let i = 0;i < gameEntities.length; i++ ) {
            let animatedSpriteComponent : AnimatedSpriteComponent = gameEntities[i].getComponent("animatedSprite") as AnimatedSpriteComponent;
            animatedSpriteComponent.animatedSprite.nextFrame();
        }

    }

    moveAllDoors() : void {
        this._worldMap.moveDoors();
    }

}
