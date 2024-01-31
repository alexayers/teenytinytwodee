import {WorldMap} from "./worldMap";
import {GameEntity} from "../../ecs/gameEntity";
import {DoorComponent} from "../../ecs/components/doorComponent";
import {Point} from "../../primatives/point";
import {MathUtils} from "../../utils/mathUtils";
import {DistanceComponent} from "../../ecs/components/distanceComponent";
import {PushWallComponent} from "../../ecs/components/pushWallComponent";


export class Camera {

    private _xPos: number;
    private _yPos: number;
    private _xDir: number;
    private _yDir: number;
    private _fov: number;
    private _xPlane: number;
    private _yPlane: number;
    private _worldMap : WorldMap = WorldMap.getInstance();
    private _time = 0; // Initialize time
    private readonly _amplitude = 0.5; // Height of the bob, adjust as needed
    private readonly _frequency = 0.5; // Speed of the bob, adjust as needed

    constructor(xPos: number, yPos: number, xDir: number, yDir: number, fov: number) {

        this._xPos = xPos;
        this._yPos = yPos;
        this._xDir = xDir;
        this._yDir = yDir;
        this._fov = fov;

        this._xPlane = MathUtils.rotateVector(this._xDir, this._yDir, -Math.PI / 2).x * fov;
        this._yPlane = MathUtils.rotateVector(this._xDir, this._yDir, -Math.PI / 2).y * fov;


    }

    move(moveX: number, moveY: number): void {


        let moved: boolean = false;
        let gameEntity : GameEntity = this._worldMap.getEntityAtPosition(Math.floor(this._xPos + moveX),Math.floor(this._yPos));

        if (!gameEntity) {
            return;
        }

        if (this.npcPresent()) {
            return;
        }

        if (gameEntity.hasComponent("floor")) {
            this._xPos += moveX;
        }

        if (gameEntity.hasComponent("door")) {
            let door : DoorComponent = gameEntity.getComponent("door") as DoorComponent;

            if (door.isOpen()) {
                this._xPos += moveX;
            }
        } else if (gameEntity.hasComponent("pushWall")) {
            let pushWallComponent : PushWallComponent = gameEntity.getComponent("pushWall") as PushWallComponent;

            if (pushWallComponent.isWallOpen()) {
                this._xPos += moveX;
            }
        }

        gameEntity = this._worldMap.getEntityAtPosition(Math.floor(this._xPos),Math.floor(this._yPos + moveY))

        if (gameEntity.hasComponent("floor")) {
            this._yPos += moveY;
        }

        if (gameEntity.hasComponent("door")) {
            let door : DoorComponent = gameEntity.getComponent("door") as DoorComponent;

            if (door.isOpen()) {
                this._yPos += moveY;
            }
        } else if (gameEntity.hasComponent("pushWall")) {
            let pushWallComponent : PushWallComponent = gameEntity.getComponent("pushWall") as PushWallComponent;

            if (pushWallComponent.isWallOpen()) {
                this._xPos += moveX;
            }
        }


    }



    private npcPresent() {
       let gameEntities:Array<GameEntity>= this._worldMap.getGameEntities();

       for (const gameEntity of gameEntities) {
           if (gameEntity.hasComponent("wall")) {

               let distance : DistanceComponent = gameEntity.getComponent("distance") as DistanceComponent;
               if (distance.distance <= 1) {
                    console.log(distance.distance);
                   return false;
               }

           }
       }

       return false;
    }

    rotate(angle: number): void {
        let rDir: Point = MathUtils.rotateVector(this._xDir, this._yDir, angle);
        this._xDir = rDir.x;
        this._yDir = rDir.y;

        let rPlane: Point = MathUtils.rotateVector(this._xPlane, this._yPlane, angle);
        this._xPlane = rPlane.x;
        this._yPlane = rPlane.y;
    }


    get xPos(): number {
        return this._xPos;
    }

    set xPos(value: number) {
        this._xPos = value;
    }

    get yPos(): number {
        return this._yPos;
    }

    set yPos(value: number) {
        this._yPos = value;
    }

    get xDir(): number {
        return this._xDir;
    }

    set xDir(value: number) {
        this._xDir = value;
    }

    get yDir(): number {
        return this._yDir;
    }

    set yDir(value: number) {
        this._yDir = value;
    }

    get fov(): number {
        return this._fov;
    }

    set fov(value: number) {
        this._fov = value;
    }

    get xPlane(): number {
        return this._xPlane;
    }

    set xPlane(value: number) {
        this._xPlane = value;
    }

    get yPlane(): number {
        return this._yPlane;
    }

    set yPlane(value: number) {
        this._yPlane = value;
    }
}
