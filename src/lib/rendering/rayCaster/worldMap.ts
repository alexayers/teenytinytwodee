import {RenderPerformance} from "./renderPerformance";
import {GameEntity} from "../../ecs/gameEntity";
import {DoorComponent} from "../../ecs/components/doorComponent";
import {PushWallComponent} from "../../ecs/components/pushWallComponent";
import {Sprite} from "../sprite";
import {Color} from "../../primatives/color";

export enum DoorState {
    CLOSED = 0,
    OPENING = 1,
    OPEN = 2,
    CLOSING = 3
}


interface WorldDefinition {
    wallGrid: Array<number>
    items?: Array<GameEntity>
    npcs?: Array<GameEntity>
    skyBox?: Sprite;
    skyColor: Color
    floorColor: Color
    wallTranslationTable: Map<number, GameEntity>
    lightRange: number
    width: number
    height: number
}

export class WorldMap {

    private static _instance: WorldMap = null;
    private _gameMap: Array<GameEntity>;
    private _doorOffsets: Array<number> = [];
    private _doorStates: Array<number> = [];
    private _worldDefinition: WorldDefinition;

    static getInstance(): WorldMap {

        if (WorldMap._instance == null) {
            WorldMap._instance = new WorldMap();
        }

        return WorldMap._instance;
    }

    loadMap(worldDefinition: WorldDefinition): void {

        this._worldDefinition = worldDefinition;
        this._gameMap = [];



        for (let y: number = 0; y < this._worldDefinition.height; y++) {
            for (let x: number = 0; x < this._worldDefinition.width; x++) {
                let pos: number = x + (y * this._worldDefinition.width);
                let value: number = worldDefinition.wallGrid[pos];
                this._gameMap[pos] = worldDefinition.wallTranslationTable.get(value);
            }
        }

        for (let i: number = 0; i < worldDefinition.width * worldDefinition.height; i++) {
            WorldMap._instance._doorOffsets.push(0);
            WorldMap._instance._doorStates.push(DoorState.CLOSED);
        }

    }

    getEntityAtPosition(x: number, y: number): GameEntity {
        return this._gameMap[x + (y * this._worldDefinition.width)];
    }

    get gameMap() {
        return this._gameMap;
    }

    getDoorState(x: number, y: number): number {
        return this._doorStates[x + (y * this._worldDefinition.width)];
    }

    getDoorOffset(x: number, y: number): number {
        return this._doorOffsets[x + (y * this._worldDefinition.width)];
    }

    setDoorState(x: number, y: number, state: number): void {
        this._doorStates[x + (y * this._worldDefinition.width)] = state;
    }

    setDoorOffset(x: number, y: number, offset: number): void {
        this._doorOffsets[x + (y * this._worldDefinition.width)] = offset;
    }

    moveDoors(): void {

        for (let y: number = 0; y < this._worldDefinition.width; y++) {
            for (let x: number = 0; x < this._worldDefinition.width; x++) {

                let gameEntity: GameEntity = this.getEntityAtPosition(x, y);

                if (gameEntity.hasComponent("door")) { //Standard door
                    if (this.getDoorState(x, y) == DoorState.OPENING) {//Open doors
                        this.setDoorOffset(x, y, this.getDoorOffset(x, y) + RenderPerformance.deltaTime / 100);

                        if (this.getDoorOffset(x, y) > 1) {
                            this.setDoorOffset(x, y, 1);
                            this.setDoorState(x, y, DoorState.OPEN);//Set state to open

                            let door: DoorComponent = gameEntity.getComponent("door") as DoorComponent;
                            door.openDoor();

                            setTimeout((): void => {
                                this.setDoorState(x, y, DoorState.CLOSING);

                                let door: DoorComponent = gameEntity.getComponent("door") as DoorComponent;
                                door.closeDoor();

                            }, 5000);//TO DO: Don't close when player is in tile
                        }
                    } else if (this.getDoorState(x, y) == DoorState.CLOSING) {
                        this.setDoorOffset(x, y, this.getDoorOffset(x, y) - RenderPerformance.deltaTime / 100);

                        if (this.getDoorOffset(x, y) < 0) {
                            this.setDoorOffset(x, y, 0);
                            this.setDoorState(x, y, DoorState.CLOSED);

                            let door: DoorComponent = gameEntity.getComponent("door") as DoorComponent;
                            door.closeDoor();
                        }
                    }
                } else if (gameEntity.hasComponent("pushWall")) {
                    if (this.getDoorState(x, y) == DoorState.OPENING) {
                        this.setDoorOffset(x, y, this.getDoorOffset(x, y) + RenderPerformance.deltaTime / 100);

                        if (this.getDoorOffset(x, y) > 2) {
                            this.setDoorOffset(x, y, 2);
                            this.setDoorState(x, y, DoorState.OPEN);

                            let pushWall: PushWallComponent = gameEntity.getComponent("pushWall") as PushWallComponent;
                            pushWall.openWall();
                        }
                    }
                }
            }
        }
    }

    getGameEntities(): Array<GameEntity> {
        let gameEntities: Array<GameEntity> = [];
        if (this._worldDefinition.items) {
            gameEntities.push(...this._worldDefinition.items);
        }
        if (this._worldDefinition.npcs) {
            gameEntities.push(...this._worldDefinition.npcs);
        }
        return gameEntities;
    }


    get worldDefinition(): WorldDefinition {
        return this._worldDefinition;
    }
}
