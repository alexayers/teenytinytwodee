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
import {RenderPerformance} from "../../lib/rendering/rayCaster/renderPerformance";
import {CameraSystem} from "../../lib/ecs/system/entity/cameraSystem";
import {InteractionSystem} from "../../lib/ecs/system/entity/interactionSystem";
import {PickUpSystem} from "../../lib/ecs/system/entity/pickUpSystem";
import {RayCastRenderSystem} from "../../lib/ecs/system/render/rayCastRenderSystem";
import {Color} from "../../lib/primatives/color";
import {ItemComponent} from "../../lib/ecs/components/itemComponent";
import {PositionComponent} from "../../lib/ecs/components/positionComponent";
import {DistanceComponent} from "../../lib/ecs/components/distanceComponent";
import {AnimatedSpriteComponent} from "../../lib/ecs/components/rendering/animatedSpriteComponent";
import {AnimatedSprite} from "../../lib/rendering/animatedSprite";
import {SpriteComponent} from "../../lib/ecs/components/rendering/spriteComponent";
import {CameraComponent} from "../../lib/ecs/components/rendering/cameraComponent";
import {AiSystem} from "../../lib/ecs/system/entity/aiSystem";
import {AiComponent, MovementStyle} from "../../lib/ecs/components/ai/aiComponent";
import {MovementSystem} from "../../lib/ecs/system/entity/movementSystem";
import {Renderer} from "../../lib/rendering/renderer";
import {Colors} from "../../lib/utils/colorUtils";
import {MistRenderSystem} from "../../lib/ecs/system/render/mistRenderSystem";
import {LightSourceComponent} from "../../lib/ecs/components/rendering/lightSourceComponent";
import {PushWallComponent} from "../../lib/ecs/components/pushWallComponent";
import {TileHeightComponent} from "../../lib/ecs/components/rendering/tileHeightComponent";
import {CubeSpriteComponent} from "../../lib/ecs/components/rendering/cubeSpriteComponent";
import {TransparentComponent} from "../../lib/ecs/components/transparentComponent";


export class TestScreen implements GameScreen {

    private _moveSpeed: number = 0.065;
    private _gameSystems: Array<GameSystem> = [];
    private _renderSystems: Array<GameRenderSystem> = [];
    private _gameEntityRegistry: GameEntityRegistry = GameEntityRegistry.getInstance();
    private _worldMap : WorldMap = WorldMap.getInstance();
    private _player: GameEntity;
    private _moveSway: number = 0;
    private _updateSway: boolean = false;
    private _moves: number = 0;
    private _camera:Camera;
    private _lastXPos: number;
    private _lastYPos: number;
    private holdingItemSprite: Sprite = new Sprite(256,256, require("../../assets/sword.png"));

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

        this._gameSystems.push(
            new AiSystem()
        );

        this._gameSystems.push(
            new MovementSystem()
        );

        this._renderSystems.push(
            new RayCastRenderSystem()
        );





        let wall: GameEntity = new GameEntityBuilder("wall")
            .addComponent(new WallComponent())
            .addComponent(new SpriteComponent(new Sprite(128,128, require("../../assets/wall.png"))))
            .build();

        let fence: GameEntity = new GameEntityBuilder("fence")
            .addComponent(new WallComponent())
            .addComponent(new TransparentComponent())
            .addComponent(new SpriteComponent(new Sprite(128,128, require("../../assets/fence.png"))))
            .build();

        let torch: GameEntity = new GameEntityBuilder("torch")
            .addComponent(new WallComponent())
            .addComponent(new LightSourceComponent(5))
            .addComponent(new PushWallComponent())
            .addComponent(new TileHeightComponent(1))
            .addComponent(new CubeSpriteComponent(
                [
                    new Sprite(128,128, require("../../assets/vendingFront.png")),
                    new Sprite(128,128, require("../../assets/vendingBack.png")),
                    new Sprite(128,128, require("../../assets/vendingLeft.png")),
                    new Sprite(128,128, require("../../assets/vendingRight.png")),
                ]
            ))

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

        let wallGrid: Array<number> = [];

        let worldWidth = 50;
        let worldHeight = 50;

        for (let y = 0; y < worldHeight; y++) {
            for (let x = 0; x < worldWidth; x++) {

                if (y == 0 || x == 0 || y == worldHeight - 1 || x == worldWidth - 1) {
                    wallGrid.push(1);
                } else {
                    wallGrid.push(0);
                }

            }
        }

        wallGrid[5+(6*worldWidth)] = 2;
        wallGrid[6+(6*worldWidth)] = 4;
        wallGrid[7+(6*worldWidth)] = 2;

        let wallTranslationTable: Map<number, GameEntity> = new Map<number, GameEntity>();

        wallTranslationTable.set(0, floor);
        wallTranslationTable.set(1, wall);
        wallTranslationTable.set(2, torch);
        wallTranslationTable.set(3, door);
        wallTranslationTable.set(4, fence);


        this._worldMap.loadMap({
            floorColor: new Color(74, 67, 57),
            wallGrid: wallGrid,
            height: worldHeight,
            width: worldWidth,
            lightRange: 50,
            skyColor: new Color(40, 40, 40),
            wallTranslationTable: wallTranslationTable,

            items: this.buildItems(),
            //     npcs: this.buildNpcs()

        });

        let fovDegrees = 66;
        let fovRadians = fovDegrees * (Math.PI / 180); // Convert to radians
        this._camera = new Camera(6, 2, 0, 1, Math.tan(fovRadians / 2));

        this._player = new GameEntityBuilder("player")
            .addComponent(new CameraComponent(this._camera))
            .addComponent(new VelocityComponent(0,0))
            .build();

        this._gameEntityRegistry.registerSingleton(this._player);
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
                16,32,"default")))
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

        animation.set("walking", []);
        animation.get("walking").push(require("../../assets/skeleton1.png"));
        animation.get("walking").push(require("../../assets/skeleton2.png"));
        animation.get("walking").push(require("../../assets/skeleton1.png"));
        animation.get("walking").push(require("../../assets/skeleton3.png"));


        gameEntities.push(new GameEntityBuilder("skeleton")
            .addComponent(new ItemComponent())
            .addComponent(new DistanceComponent())
            .addComponent(new PositionComponent(5,7))
            .addComponent(new DistanceComponent())
            .addComponent(new WallComponent())
            .addComponent(new AiComponent(MovementStyle.follow, false))
            .addComponent(new AnimatedSpriteComponent(new AnimatedSprite(
                animation,
                32,32,"default"
            )))
            .build()
        )

        return gameEntities;
    }

    keyboard(): void {
        let moveSpeed : number = this._moveSpeed * RenderPerformance.deltaTime;
        let moveX : number = 0;
        let moveY : number = 0;

        let player : GameEntity = this._gameEntityRegistry.getSingleton("player");

        let camera : CameraComponent = player.getComponent("camera") as CameraComponent;

        let velocity : VelocityComponent = player.getComponent("velocity") as VelocityComponent;

        if (GlobalState.getState(`KEY_${KeyboardInput.UP}`)) {
            moveX += camera.xDir;
            moveY += camera.yDir;
            this._updateSway = true;
            this._moves++;
        }

        if (isKeyDown(KeyboardInput.DOWN)) {
            moveX -= camera.xDir;
            moveY -= camera.yDir;
            this._updateSway = true;
            this._moves++;
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

        this._lastXPos = this._camera.xPos;
        this._lastYPos = this._camera.yPos;
    }


    logicLoop(): void {

        this.keyboard();

        let gameEntities : Array<GameEntity> = [];
        gameEntities.push(this._gameEntityRegistry.getSingleton("player"));

        gameEntities.push(...this._worldMap.getGameEntities());

        gameEntities.forEach(gameEntity => {
            this._gameSystems.forEach((gameSystem: GameSystem) => {
                gameSystem.processEntity(gameEntity);
            });
        });



        if (this._camera.xPos == this._lastXPos && this._camera.yPos == this._lastYPos) {
            this._updateSway = false;
            this._moves = 0;
        }

    }

    mouseClick(x: number, y: number, mouseButton : MouseButton): void {

    }

    mouseMove(x: number, y: number): void {

    }

    renderLoop(): void {


        this._renderSystems.forEach((renderSystem : GameRenderSystem) =>{
            renderSystem.process();
        });

        let xOffset: number = Math.sin(this._moveSway / 2) * 40,
            yOffset: number = Math.cos(this._moveSway) * 30;



        Renderer.rect(0, 0, Renderer.getCanvasWidth(), 70, Colors.BLACK());
        Renderer.rect(0, Renderer.getCanvasHeight()-100, Renderer.getCanvasWidth(), 90, Colors.BLACK());

        let cameraComponent: CameraComponent = this._player.getComponent("camera") as CameraComponent;

        /*
        Renderer.print(`xPos: ${Math.floor(cameraComponent.xPos)} yPos: ${Math.floor(cameraComponent.yPos)} xPlane: ${Math.floor(cameraComponent.xPlane)} yPlane: ${Math.floor(cameraComponent.yPlane)} xDir: ${Math.floor(cameraComponent.xDir)} yDir: ${Math.floor(cameraComponent.yDir)}`, 50, 50, {
            family: "Arial",
            size: 20,
            color: Colors.RED()
        });

         */

    }

    sway(): void {
        if (!this._updateSway) {

            let sway: number = this._moveSway % (Math.PI * 2);
            let diff: number = 0;
            if (sway - Math.PI <= 0) {
                diff = -Math.PI / 30;
            } else {
                diff = Math.PI / 30;
            }

            if (sway + diff < 0 || sway + diff > Math.PI * 2) {
                this._moveSway -= sway;
            } else {
                this._moveSway += diff;
            }
            return;
        }

        if (this._moves > 1) {
            this._moveSway += Math.PI / 25;
            this._moveSway %= Math.PI * 8;
        }

    }
}
