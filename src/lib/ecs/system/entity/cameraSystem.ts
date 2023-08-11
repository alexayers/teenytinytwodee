import {GameSystem} from "../../gameSystem";
import {GameEntity} from "../../gameEntity";
import {CameraComponent} from "../../components/cameraComponent";
import {VelocityComponent} from "../../components/velocityComponent";
import {Performance} from "../../../rendering/rayCaster/performance";

export class CameraSystem implements GameSystem {

    private _turnSpeed: number = 0.08;

    processEntity(gameEntity: GameEntity): void {

        if (gameEntity.hasComponent("camera")) {

            let turnSpeed : number = this._turnSpeed * Performance.deltaTime;

            let camera: CameraComponent = gameEntity.getComponent("camera") as CameraComponent;
            let velocity: VelocityComponent = gameEntity.getComponent("velocity") as VelocityComponent;

            camera.camera.move(velocity.velX,velocity.velY)

            if (velocity.rotateRight) {
                camera.camera.rotate(-turnSpeed);
            }

            if (velocity.rotateLeft) {
                camera.camera.rotate(turnSpeed);
            }

            velocity.velX = 0;
            velocity.velY = 0;
            velocity.rotateLeft = false;
            velocity.rotateRight = false;
        }

    }

}
