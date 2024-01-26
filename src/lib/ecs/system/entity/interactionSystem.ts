import {GameSystem} from "../../gameSystem";
import {DoorState, WorldMap} from "../../../rendering/rayCaster/worldMap";
import {GameEntity} from "../../gameEntity";
import {Camera} from "../../../rendering/rayCaster/camera";
import {CameraComponent} from "../../components/rendering/cameraComponent";


export class InteractionSystem implements GameSystem {

    private _worldMap: WorldMap = WorldMap.getInstance();
    processEntity(gameEntity: GameEntity): void {

        if (gameEntity.hasComponent("camera") && gameEntity.hasComponent("interaction")) {

            let camera: CameraComponent = gameEntity.getComponent("camera") as CameraComponent;

            this.interact(camera.camera);
            gameEntity.removeComponent("interaction");
        }


    }

    interact(camera: Camera): void {
        let checkMapX: number = Math.floor(camera.xPos + camera.xDir);
        let checkMapY: number = Math.floor(camera.yPos + camera.yDir);

        let checkMapX2: number = Math.floor(camera.xPos + camera.xDir * 2);
        let checkMapY2: number = Math.floor(camera.yPos + camera.yDir * 2);

        let gameEntity: GameEntity = this._worldMap.getEntityAtPosition(checkMapX, checkMapY);

        if (gameEntity.hasComponent("door") ||
            gameEntity.hasComponent("pushWall") &&
            this._worldMap.getDoorState(checkMapX, checkMapY) == DoorState.CLOSED) { //Open door in front of camera
            this._worldMap.setDoorState(checkMapX, checkMapY, DoorState.OPENING);
            return;
        }

        gameEntity = this._worldMap.getEntityAtPosition(checkMapX2, checkMapY2);

        if (gameEntity.hasComponent("door") ||
            gameEntity.hasComponent("pushWall") &&
            this._worldMap.getDoorState(checkMapX2, checkMapY2) == DoorState.CLOSED) {
            this._worldMap.setDoorState(checkMapX2, checkMapY2, DoorState.OPENING);
            return;
        }

        gameEntity = this._worldMap.getEntityAtPosition(checkMapX, checkMapY);

        if (gameEntity.hasComponent("door") ||
            gameEntity.hasComponent("pushWall") &&
            this._worldMap.getDoorState(checkMapX, checkMapY) == DoorState.OPEN) { //Open door in front of camera
            this._worldMap.setDoorState(checkMapX, checkMapY, DoorState.CLOSING);
            return;
        }

        gameEntity = this._worldMap.getEntityAtPosition(checkMapX2, checkMapY2);

        if (gameEntity.hasComponent("door") ||
            gameEntity.hasComponent("pushWall") &&
            this._worldMap.getDoorState(checkMapX2, checkMapY2) == DoorState.OPEN) {
            this._worldMap.setDoorState(checkMapX2, checkMapY2, DoorState.CLOSING);
            return;
        }

        gameEntity = this._worldMap.getEntityAtPosition(Math.floor(camera.xPos), Math.floor(camera.yPos));

        if (gameEntity.hasComponent("door")) { //Avoid getting stuck in doors
            this._worldMap.setDoorState(Math.floor(camera.xPos), Math.floor(camera.yPos), DoorState.OPENING);
        }


    }

}
