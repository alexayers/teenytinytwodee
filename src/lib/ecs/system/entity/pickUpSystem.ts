import {GameSystem} from "../../gameSystem";
import {GameEntityRegistry} from "../../../registries/gameEntityRegistry";
import {GameEntity} from "../../gameEntity";
import {DistanceComponent} from "../../components/distanceComponent";


export class PickUpSystem implements GameSystem {

    private _gameEntityRegistry: GameEntityRegistry = GameEntityRegistry.getInstance();

    processEntity(gameEntity: GameEntity): void {

        let gameEntities : Array<GameEntity> = this._gameEntityRegistry.getEntities();


        for (let i : number = 0; i < gameEntities.length; i++) {

            let gameEntity : GameEntity = gameEntities[i];
            let distance : DistanceComponent = gameEntity.getComponent("distance") as DistanceComponent;

            if (distance.distance < 1) {

                console.log(gameEntity.name);

            }

        }

    }

}
