import {GameEntity} from "../ecs/gameEntity";
import {DistanceComponent} from "../ecs/components/distanceComponent";

export class GameEntityRegistry {

    private static _instance: GameEntityRegistry = null;
    private _entities: Array<GameEntity>;
    private _singletonEntities:Map<string, GameEntity>;


    private constructor() {
    }

    static getInstance() : GameEntityRegistry {
        if (GameEntityRegistry._instance == null) {
            GameEntityRegistry._instance = new GameEntityRegistry();
            GameEntityRegistry._instance._entities = [];
            GameEntityRegistry._instance._singletonEntities = new Map<string, GameEntity>();
        }

        return GameEntityRegistry._instance;
    }

    register(gameEntity: GameEntity) : void {

        gameEntity.addComponent(new DistanceComponent());
        this._entities.push(gameEntity);
    }

    registerSingleton(gameEntity: GameEntity) : void {
        this._singletonEntities.set(gameEntity.name, gameEntity);
    }

    getSingleton(name: string) : GameEntity {
        return this._singletonEntities.get(name);
    }

    getEntities() : Array<GameEntity> {
        return this._entities;
    }




}
