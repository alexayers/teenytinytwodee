import {GameScreen} from "../../lib/application/gameScreen";
import {MouseButton} from "../../lib/input/mouse";
import {Sprite} from "../../lib/rendering/sprite";
import {GameSystem} from "../../lib/ecs/gameSystem";
import {GameRenderSystem} from "../../lib/ecs/gameRenderSystem";
import {GameEntityRegistry} from "../../lib/registries/gameEntityRegistry";
import {WorldMap} from "../../lib/rendering/rayCaster/worldMap";
import {GameEntityBuilder} from "../../lib/ecs/gameEntityBuilder";
import {WallComponent} from "../../lib/ecs/components/wallComponent";
import {GameEntity} from "../../lib/ecs/gameEntity";
import {FloorComponent} from "../../lib/ecs/components/floorComponent";
import {DoorComponent} from "../../lib/ecs/components/doorComponent";
import {Camera} from "../../lib/rendering/rayCaster/camera";
import {VelocityComponent} from "../../lib/ecs/components/velocityComponent";
import {isKeyDown, KeyboardInput} from "../../lib/input/keyboard";
import {GlobalState} from "../../lib/application/globalState";
import {InteractionComponent} from "../../lib/ecs/components/interactionComponent";
import {ScreenChangeEvent} from "../../lib/gameEvent/screenChangeEvent";
import {GameEventBus} from "../../lib/gameEvent/gameEventBus";
import {Performance} from "../../lib/rendering/rayCaster/performance";
import {CameraSystem} from "../../lib/ecs/system/entity/cameraSystem";
import {InteractionSystem} from "../../lib/ecs/system/entity/interactionSystem";
import {PickUpSystem} from "../../lib/ecs/system/entity/pickUpSystem";
import {RayCastRenderSystem} from "../../lib/ecs/system/render/rayCastRenderSystem";
import {Color} from "../../lib/primatives/color";
import {Game} from "../main";
import {ItemComponent} from "../../lib/ecs/components/itemComponent";
import {PositionComponent} from "../../lib/ecs/components/positionComponent";
import {DistanceComponent} from "../../lib/ecs/components/distanceComponent";
import {AnimatedSpriteComponent} from "../../lib/ecs/components/rendering/animatedSpriteComponent";
import {AnimatedSprite} from "../../lib/rendering/animatedSprite";
import {SpriteComponent} from "../../lib/ecs/components/rendering/spriteComponent";
import {CameraComponent} from "../../lib/ecs/components/rendering/cameraComponent";


export class MainGameScreen implements GameScreen {

    private _moveSpeed: number = 0.065;
    private _gameSystems: Array<GameSystem> = [];
    private _renderSystems: Array<GameRenderSystem> = [];
    private _gameEntityRegistry: GameEntityRegistry = GameEntityRegistry.getInstance();

    onEnter(): void {

    }
    onExit(): void {

    }

    init(): void {

        this._gameSystems.push(
            new CameraSystem()
        );

        this._gameSystems.push(
            new InteractionSystem()
        );

        this._gameSystems.push(
            new PickUpSystem()
        );

        this._renderSystems.push(
            new RayCastRenderSystem()
        );

        let worldMap : WorldMap = WorldMap.getInstance();

        let wall: GameEntity = new GameEntityBuilder("wall")
            .addComponent(new WallComponent())
            .addComponent(new SpriteComponent(new Sprite(128,128, require("../../assets/wall.png"))))
            .build();

        let floor: GameEntity = new GameEntityBuilder("floor")
            .addComponent(new FloorComponent())
            .build();

        let door: GameEntity = new GameEntityBuilder("door")
            .addComponent(new DoorComponent())
            .addComponent(new SpriteComponent(new Sprite(128,128, require("../../assets/door.png"))))
            .build();

        let doorFrame: GameEntity = new GameEntityBuilder("doorFrame")
            .addComponent(new WallComponent())
            .addComponent(new SpriteComponent(new Sprite(128,128, require("../../assets/doorFrame.png"))))
            .build();

        this._gameEntityRegistry.registerSingleton(doorFrame);

        let wallGrid: Array<number> = [
            1, 1, 1, 1, 1, 1, 1, 1, 1, 1, // no format
            1, 0, 0, 0, 1, 0, 0, 0, 0, 1,
            1, 0, 0, 0, 3, 0, 0, 0, 0, 1,
            1, 0, 0, 0, 1, 0, 0, 0, 0, 1,
            1, 1, 1, 0, 1, 1, 1, 3, 1, 1,
            1, 0, 1, 0, 1, 0, 0, 0, 0, 1,
            1, 0, 1, 0, 1, 1, 1, 0, 0, 1,
            1, 0, 1, 0, 0, 0, 0, 0, 0, 1,
            1, 0, 0, 0, 1, 0, 1, 0, 0, 1,
            1, 1, 1, 1, 1, 1, 1, 1, 1, 1];



        let wallTranslationTable: Map<number, GameEntity> = new Map<number, GameEntity>();

        wallTranslationTable.set(3, door);
        wallTranslationTable.set(1, wall);
        wallTranslationTable.set(0, floor);


        worldMap.loadMap({
            floorColor: new Color(74, 67, 57),
            wallGrid: wallGrid,
            height: 10,
            lightRange: 8,
            skyColor: new Color(40, 40, 40),
            wallTranslationTable: wallTranslationTable,
            width: 10,
            items: this.buildItems(),
            npcs: this.buildNpcs()

        });

        let player : GameEntity = new GameEntityBuilder("player")
            .addComponent(new CameraComponent(new Camera(2, 2, 0, 1, 0.66)))
            .addComponent(new VelocityComponent(0,0))
            .build();

        this._gameEntityRegistry.registerSingleton(player);
    }

    buildItems() : Array<GameEntity> {
        let gameEntities : Array<GameEntity> =[];

        let animation: Map<string, Array<string>> = new Map<string, Array<string>>();

        animation.set("default", []);
        animation.get("default").push(require("../../assets/flowers.png"));

        gameEntities.push(new GameEntityBuilder("flowers")
            .addComponent(new ItemComponent())
            .addComponent(new DistanceComponent())
            .addComponent(new PositionComponent(3,3))
            .addComponent(new AnimatedSpriteComponent(new AnimatedSprite(animation,
                32,32,"default")))
            .build()
        )

        return gameEntities;
    }

    buildNpcs() : Array<GameEntity> {
        let gameEntities : Array<GameEntity> =[];

        let animation: Map<string, Array<string>> = new Map<string, Array<string>>();

        animation.set("default", []);
        animation.get("default").push(require("../../assets/skeleton1.png"));
        animation.get("default").push(require("../../assets/skeleton2.png"));
        animation.get("default").push(require("../../assets/skeleton1.png"));
        animation.get("default").push(require("../../assets/skeleton3.png"));

        gameEntities.push(new GameEntityBuilder("skeleton")
            .addComponent(new ItemComponent())
            .addComponent(new DistanceComponent())
            .addComponent(new PositionComponent(2,2))
            .addComponent(new DistanceComponent())
            .addComponent(new AnimatedSpriteComponent(new AnimatedSprite(
                animation,
                32,32,"default"
            )))
            .build()
        )

        return gameEntities;
    }

    keyboard(): void {
        let moveSpeed : number = this._moveSpeed * Performance.deltaTime;
        let moveX : number = 0;
        let moveY : number = 0;

        let player : GameEntity = this._gameEntityRegistry.getSingleton("player");

        let camera : CameraComponent = player.getComponent("camera") as CameraComponent;

        let velocity : VelocityComponent = player.getComponent("velocity") as VelocityComponent;

        if (GlobalState.getState(`KEY_${KeyboardInput.UP}`)) {
            moveX += camera.xDir;
            moveY += camera.yDir;
        }

        if (isKeyDown(KeyboardInput.DOWN)) {
            moveX -= camera.xDir;
            moveY -= camera.yDir;
        }
        if (isKeyDown(KeyboardInput.LEFT)) {
            velocity.rotateLeft = true;
        }

        if (isKeyDown(KeyboardInput.RIGHT)) {
            velocity.rotateRight = true;
        }

        if (isKeyDown(KeyboardInput.SPACE)) {
            player.addComponent(new InteractionComponent())
        }

        if (isKeyDown(KeyboardInput.ESCAPE)) {
            GameEventBus.publish(new ScreenChangeEvent("computer"));
        }


        moveX *= moveSpeed;
        moveY *= moveSpeed;

        velocity.velX = moveX;
        velocity.velY = moveY;
    }


    logicLoop(): void {

        this.keyboard();
        let player : GameEntity = this._gameEntityRegistry.getSingleton("player");

        this._gameSystems.forEach((gameSystem: GameSystem) => {
            gameSystem.processEntity(player)
        });
    }

    mouseClick(x: number, y: number, mouseButton : MouseButton): void {

    }

    mouseMove(x: number, y: number): void {

    }

    renderLoop(): void {
        this._renderSystems.forEach((renderSystem : GameRenderSystem) =>{
            renderSystem.process();
        });


    }
}
