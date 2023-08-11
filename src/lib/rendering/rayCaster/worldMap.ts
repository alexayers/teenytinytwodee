

import {Performance} from "./performance";
import {GameEntity} from "../../ecs/gameEntity";
import {DoorComponent} from "../../ecs/components/doorComponent";
import {PushWallComponent} from "../../ecs/components/pushWallComponent";

export enum DoorState {
    CLOSED = 0,
    OPENING = 1,
    OPEN = 2,
    CLOSING = 3
}

export class WorldMap {

    private static _instance: WorldMap = null;
    private _gameMap: Array<GameEntity>;
    private _worldWidth: number = 24;
    private _worldHeight: number = 24;
    private _doorOffsets: Array<number> = [];
    private _doorStates: Array<number> = [];

    static getInstance(): WorldMap {

        if (WorldMap._instance == null) {
            WorldMap._instance = new WorldMap();
        }

        return WorldMap._instance;
    }

    loadMap(grid: Array<number>,translationTable: Map<number, GameEntity>): void {

        this._worldHeight = 10;
        this._worldWidth = 10;
        this._gameMap = [];


        for (let y: number = 0; y < this._worldHeight; y++) {
            for (let x: number = 0; x < this._worldWidth; x++) {
                let pos: number = x + (y * this._worldWidth);
                let value: number = grid[pos];
                this._gameMap[pos] = translationTable.get(value);
            }
        }

        for (let i: number = 0; i < WorldMap._instance._worldWidth * WorldMap._instance._worldHeight; i++) {
            WorldMap._instance._doorOffsets.push(0);
            WorldMap._instance._doorStates.push(0);
        }
    }

    getPosition(x: number, y: number): GameEntity {
        return this._gameMap[(x + (y * this._worldWidth))];
    }

    get gameMap() {
        return this._gameMap;
    }

    getDoorState(x: number, y: number): number {
        return this._doorStates[x * (y * this._worldWidth)];
    }

    getDoorOffset(x: number, y: number): number {
        return this._doorOffsets[x * (y * this._worldWidth)];
    }

    setDoorState(x: number, y: number, state: number): void {
        this._doorStates[x * (y * this._worldWidth)] = state;
    }

    setDoorOffset(x: number, y: number, offset: number): void {
        this._doorOffsets[x * (y * this._worldWidth)] = offset;
    }

    moveDoors(): void {

        for (let y: number = 0; y < this._worldHeight; y++) {
            for (let x: number = 0; x < this._worldWidth; x++) {

                let gameEntity: GameEntity = this.getPosition(x, y);

                if (gameEntity.hasComponent("door")) { //Standard door
                    if (this.getDoorState(x, y) == DoorState.OPENING) {//Open doors
                        this.setDoorOffset(x, y, this.getDoorOffset(x, y) + Performance.deltaTime / 100);

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
                        this.setDoorOffset(x, y, this.getDoorOffset(x, y) - Performance.deltaTime / 100);

                        if (this.getDoorOffset(x, y) < 0) {
                            this.setDoorOffset(x, y, 0);
                            this.setDoorState(x, y, DoorState.CLOSED);

                            let door: DoorComponent = gameEntity.getComponent("door") as DoorComponent;
                            door.closeDoor();
                        }
                    }
                } else if (gameEntity.hasComponent("pushWall")) {
                    if (this.getDoorState(x, y) == DoorState.OPENING) {
                        this.setDoorOffset(x, y, this.getDoorOffset(x, y) + Performance.deltaTime / 100);

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




}
