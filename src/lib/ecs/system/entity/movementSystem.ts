import {GameEntity} from "../../gameEntity";
import {GameSystem, processComponents} from "../../gameSystem";
import {VelocityComponent} from "../../components/velocityComponent";
import {PositionComponent} from "../../components/positionComponent";
import {AnimatedSpriteComponent} from "../../components/rendering/animatedSpriteComponent";
import {GameEntityRegistry} from "../../../registries/gameEntityRegistry";
import {CameraComponent} from "../../components/rendering/cameraComponent";
import {Camera} from "../../../rendering/rayCaster/camera";
import {WorldMap} from "../../../rendering/rayCaster/worldMap";

enum MovementDirection {
    UP,
    DOWN,
    LEFT,
    RIGHT
}

export class MovementSystem implements GameSystem {

    private _gameEntityRegistry: GameEntityRegistry = GameEntityRegistry.getInstance();
    private _worldMap: WorldMap = WorldMap.getInstance();

    @processComponents(["velocity", "position"],["velocity"])
    processEntity(gameEntity: GameEntity): void {

        let velocityComponent: VelocityComponent =
            gameEntity.getComponent("velocity") as VelocityComponent;
        let positionComponent: PositionComponent =
            gameEntity.getComponent("position") as PositionComponent;

        let tempX: number = Math.floor(positionComponent.x + velocityComponent.velX);
        let tempY: number = Math.floor(positionComponent.y + velocityComponent.velY);

        let movementDirection: MovementDirection = MovementDirection.RIGHT;

        if (velocityComponent.velX > 0) {
            movementDirection = MovementDirection.RIGHT;
        } else if (velocityComponent.velX < 0) {
            movementDirection = MovementDirection.LEFT;
        } else if (velocityComponent.velY > 0) {
            movementDirection = MovementDirection.UP;
        } else if (velocityComponent.velY < 0) {
            movementDirection = MovementDirection.DOWN;
        }

        let animatedSpriteComponent: AnimatedSpriteComponent = gameEntity.getComponent("animatedSprite") as AnimatedSpriteComponent;


        if (tempX > positionComponent.x) {
            //  logger(LogType.info, "moving...");
        } else if (tempX < positionComponent.x) {
            //  logger(LogType.info, "moving...");
        } else if (tempY > positionComponent.y) {
            //   logger(LogType.info, "moving...");
        } else if (tempY < positionComponent.y) {
            //logger(LogType.info, "moving...");
        }

        if (this.canWalk(tempX, positionComponent.y, movementDirection)) {
            positionComponent.x += velocityComponent.velX;
        }
        if (this.canWalk(positionComponent.x, tempY, movementDirection)) {
            positionComponent.y += velocityComponent.velY;
        }

        /*
        if (this.canWalk(tempX, tempY, movementDirection)) {
            positionComponent.x += velocityComponent.velX;
            positionComponent.y += velocityComponent.velY;
            animatedSpriteComponent.animatedSprite.currentAction = "walking";


        } else {
            animatedSpriteComponent.animatedSprite.currentAction = "default";
        }

         */


    }

    canWalk(x: number, y: number, movementDirection: MovementDirection): boolean {
        let checkMapX: number = Math.floor(x);
        let checkMapY: number = Math.floor(y);

        let gameEntity: GameEntity = this._worldMap.getEntityAtPosition(checkMapX, checkMapY);

        return !gameEntity.hasComponent("wall");
    }
}
