import {GameSystem, processComponents} from "../../gameSystem";
import {GameEntity} from "../../gameEntity";
import {GameEntityRegistry} from "../../../registries/gameEntityRegistry";
import {PositionComponent} from "../../components/positionComponent";
import {VelocityComponent} from "../../components/velocityComponent";
import {AiComponent, MovementStyle} from "../../components/ai/aiComponent";
import {DistanceComponent} from "../../components/distanceComponent";
import {CameraComponent} from "../../components/rendering/cameraComponent";
import {Camera} from "../../../rendering/rayCaster/camera";
import {AStar} from "../../../pathFinding/aStar";
import {PathNode} from "../../../pathFinding/pathNode";


export class AiSystem implements GameSystem {

    private _gameEntityRegistry: GameEntityRegistry = GameEntityRegistry.getInstance();


    @processComponents(["ai"])
    processEntity(gameEntity: GameEntity): void {
        let player: GameEntity = this._gameEntityRegistry.getSingleton("player");
        let positionComponent: PositionComponent =
            gameEntity.getComponent("position") as PositionComponent;
        let velocityComponent: VelocityComponent = new VelocityComponent(0,0);
        let aiComponent: AiComponent = gameEntity.getComponent("ai") as AiComponent;
        gameEntity.addComponent(velocityComponent);


        switch (aiComponent.movementStyle) {
            case MovementStyle.wander:
                //wander(aiComponent, velocityComponent);
                break;
            case MovementStyle.follow:
                this.follow(velocityComponent, positionComponent, player);
                break;
        }

        if (!aiComponent.friend) {
            let distanceComponent: DistanceComponent = gameEntity.getComponent("distance") as DistanceComponent;

            /*
            if (distanceComponent.distance <= 2 && DateTime.now().millisecondsSinceEpoch >= aiComponent.attackCoolDown) {
                gameEntity.addComponent(AttackActionComponent());
                aiComponent.attackCoolDown = DateTime.now().millisecondsSinceEpoch + 1000;
            }*/
        }
    }

    follow(velocityComponent: VelocityComponent,
           positionComponent: PositionComponent, player: GameEntity) {
        let cameraComponent: CameraComponent =
            player.getComponent("camera") as CameraComponent;
        let camera: Camera = cameraComponent.camera;

        let aStar: AStar = new AStar(Math.floor(positionComponent.x),
            Math.floor(positionComponent.y), Math.floor(camera.xPos), Math.floor(camera.yPos));

        if (aStar.isPathFound()) {
            let pathNodes: Array<PathNode> = aStar.getPath();

            if (pathNodes.length == 0) {
                return;
            }

            try {
                if (Math.floor(pathNodes[0].x) > Math.floor(positionComponent.x)) {
                    velocityComponent.velX = 0.02;
                } else if (Math.floor(pathNodes[0].x) < Math.floor(positionComponent.x)) {
                    velocityComponent.velX = -0.02;
                }

                if (Math.floor(pathNodes[0].y) > Math.floor(positionComponent.y)) {
                    velocityComponent.velY = 0.02;
                } else if (Math.floor(pathNodes[0].y) < Math.floor(positionComponent.y)) {
                    velocityComponent.velY = -0.02;
                }
            } catch (e) {
                console.error(e);
            }

        } else {
            console.log("no path");
        }

    }

}
