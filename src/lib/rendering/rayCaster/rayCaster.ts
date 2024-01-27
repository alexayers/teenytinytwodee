import {Renderer} from "../renderer";
import {Camera} from "./camera";
import {DoorState, WorldMap} from "./worldMap";
import {TransparentWall} from "./transparentWall";
import {GameEntity} from "../../ecs/gameEntity";
import {GameEntityRegistry} from "../../registries/gameEntityRegistry";
import {Sprite} from "../sprite";
import {PositionComponent} from "../../ecs/components/positionComponent";
import {DistanceComponent} from "../../ecs/components/distanceComponent";
import {Color} from "../../primatives/color";
import {SpriteComponent} from "../../ecs/components/rendering/spriteComponent";
import {AnimatedSprite} from "../animatedSprite";
import {AnimatedSpriteComponent} from "../../ecs/components/rendering/animatedSpriteComponent";

enum WallSide {
    X_SIDE,
    Y_SIDE
}

export class RayCaster {

    private _cameraXCoords: Array<number> = [];
    private _zBuffer: Array<number> = [];
    private _transparentWall: Array<TransparentWall> = [];
    private _worldMap: WorldMap = WorldMap.getInstance();
    private _floor: HTMLImageElement;
    private _ceiling: HTMLImageElement;


    constructor(floor: HTMLImageElement, ceiling: HTMLImageElement) {
        for (let x: number = 0; x < Renderer.getCanvasWidth(); x++) {
            let cameraX: number = 2 * x / Renderer.getCanvasWidth() - 1;
            this._cameraXCoords.push(cameraX);
        }

        this._floor = floor;
        this._ceiling = ceiling;
    }

    // Function to draw a wall from the perspective of the camera at a given screen X-coordinate
    drawWall(camera: Camera, x: number): void {
        // Calculate the direction of the ray from the camera's position and direction
        let rayDirX: number = camera.xDir + camera.xPlane * this._cameraXCoords[x];
        let rayDirY: number = camera.yDir + camera.yPlane * this._cameraXCoords[x];

        // Determine the map grid cell the camera is in
        let mapX: number = Math.floor(camera.xPos);
        let mapY: number = Math.floor(camera.yPos);

        // Calculate the distance the ray travels between each x or y grid line
        let deltaDistX: number = Math.abs(1 / rayDirX);
        let deltaDistY: number = Math.abs(1 / rayDirY);

        let perpWallDist: number;
        let hasHitWall: boolean = false;
        let side: number;
        let wallXOffset: number = 0;
        let wallYOffset: number = 0;
        let wallX: number;
        let rayTex: number;
        let gameEntity: GameEntity;

        // Initialize step and side distances for ray traversal
        let {
            stepX,
            stepY,
            sideDistX,
            sideDistY
        } = this.initializeRayStepDistances(camera, Math.floor(camera.xPos), Math.floor(camera.yPos), rayDirX, rayDirY);

        // Loop until a wall hit is detected
        while (!hasHitWall) {

            // Determine whether to step in the x or y direction
            if (sideDistX < sideDistY) {
                sideDistX += deltaDistX;
                mapX += stepX;
                side = WallSide.X_SIDE;
            } else {
                sideDistY += deltaDistY;
                mapY += stepY;
                side = WallSide.Y_SIDE;
            }

            // Get the game entity at the new map position
            gameEntity = this._worldMap.getEntityAtPosition(mapX, mapY);

            if (!gameEntity.hasComponent("floor")) {
                if (gameEntity.hasComponent("door") &&
                    this._worldMap.getDoorState(mapX, mapY) != DoorState.OPEN) {
                    hasHitWall = true;
                    if (side == WallSide.Y_SIDE) {
                        wallYOffset = 0.5 * stepY;
                        perpWallDist = (mapY - camera.yPos + wallYOffset + (1 - stepY) / 2) / rayDirY;
                        wallX = camera.xPos + perpWallDist * rayDirX;
                        wallX -= Math.floor(wallX);

                        if (sideDistY - (deltaDistY / 2) < sideDistX) {
                            if (1.0 - wallX <= this._worldMap.getDoorOffset(mapX, mapY)) {
                                hasHitWall = false;
                                wallYOffset = 0;
                            } else {
                                hasHitWall = true;
                            }

                        } else {
                            mapX += stepX;
                            side = WallSide.X_SIDE;
                            rayTex = 4;
                            wallYOffset = 0;
                        }
                    } else {
                        wallXOffset = 0.5 * stepX;
                        perpWallDist = (mapX - camera.xPos + wallXOffset + (1 - stepX) / 2) / rayDirX;
                        wallX = camera.yPos + perpWallDist * rayDirY;
                        wallX -= Math.floor(wallX);
                        if (sideDistX - (deltaDistX / 2) < sideDistY) {
                            if (1.0 - wallX < this._worldMap.getDoorOffset(mapX, mapY)) {
                                hasHitWall = false;
                                wallXOffset = 0;
                            } else {
                                hasHitWall = true;
                            }
                        } else {
                            mapY += stepY;
                            side = WallSide.Y_SIDE;
                            rayTex = 4;
                            wallXOffset = 0;
                        }
                    }
                } else if (gameEntity.hasComponent("pushWall") && this._worldMap.getDoorState(mapX, mapY) != DoorState.OPEN) {
                    if (side == WallSide.Y_SIDE && sideDistY - (deltaDistY * (1 - this._worldMap.getDoorOffset(mapX, mapY))) < sideDistX) {
                        hasHitWall = true;
                        wallYOffset = this._worldMap.getDoorOffset(mapX, mapY) * stepY;
                    } else if (side == WallSide.X_SIDE && sideDistX - (deltaDistX * (1 - this._worldMap.getDoorOffset(mapX, mapY))) < sideDistY) {
                        hasHitWall = true;
                        wallXOffset = this._worldMap.getDoorOffset(mapX, mapY) * stepX;
                    }
                } else if (gameEntity.hasComponent("transparent")) {
                    if (side == WallSide.Y_SIDE) {
                        if (sideDistY - (deltaDistY / 2) < sideDistX) {
                           this.processTransparentWall(camera,side, mapX, mapY, x);
                        }
                    } else {
                        if (sideDistX - (deltaDistX / 2) < sideDistY) {
                            this.processTransparentWall(camera,side, mapX, mapY, x);
                        }
                    }
                } else if (!gameEntity.hasComponent("door")
                    && !gameEntity.hasComponent("pushWall")) {

                    let adjacentGameEntityUp: GameEntity = this._worldMap.getEntityAtPosition(mapX, mapY - stepY);
                    let adjacentGameEntityAcross: GameEntity = this._worldMap.getEntityAtPosition(mapX - stepX, mapY)

                    if (side == WallSide.Y_SIDE && adjacentGameEntityUp.hasComponent("door")) {
                        rayTex = 4;
                    } else if (side == WallSide.X_SIDE && adjacentGameEntityAcross.hasComponent("door")) {
                        rayTex = 4;
                    }

                    hasHitWall = true;
                }
            }
        }

        // Calculate perpendicular wall distance to avoid fisheye effect
        perpWallDist = this.calculatePerpWall(side, mapX, mapY, camera, wallXOffset, wallYOffset, stepX, stepY, rayDirX, rayDirY);

        // Store the perpendicular distance for later use in Z-buffering
        this._zBuffer[x] = perpWallDist;

        // Calculate the height of the wall slice to be drawn on screen
        let lineHeight: number = Math.round(Renderer.getCanvasHeight() / perpWallDist);
        let drawStart: number = -lineHeight / 2 + Math.round(Renderer.getCanvasHeight() / 2);

        // Calculate the exact position where the wall is hit
        if (side == WallSide.X_SIDE) {
            wallX = camera.yPos + perpWallDist * rayDirY;
        } else if (side == WallSide.Y_SIDE) {
            wallX = camera.xPos + perpWallDist * rayDirX;
        }

        wallX -= Math.floor(wallX);

        // Adjust the wall hit position if it's a door
        if (gameEntity.hasComponent("door")) {
            wallX += this._worldMap.getDoorOffset(mapX, mapY);
        }

        // If the texture is a door frame, get the door frame entity
        if (rayTex == 4) {
            gameEntity = GameEntityRegistry.getInstance().getSingleton("doorFrame");
        }

        // Render the wall slice on screen
        this.renderWall(gameEntity, wallX, side, rayDirX, rayDirY, drawStart, lineHeight, x);

        // Render shadows based on the wall distance
        this.renderShadows(perpWallDist, x, drawStart, lineHeight);
    }

    renderWall(gameEntity: GameEntity, wallX: number, side: number, rayDirX: number, rayDirY: number, drawStart: number, lineHeight: number, x: number) {
        let sprite: SpriteComponent = gameEntity.getComponent("sprite") as SpriteComponent
        let wallTex: Sprite = sprite.sprite;

        let texX: number = Math.floor(wallX * wallTex.image.width);

        if (side == WallSide.X_SIDE && rayDirX > 0) {
            texX = wallTex.image.width - texX - 1;
        } else if (side == WallSide.Y_SIDE && rayDirY < 0) {
            texX = wallTex.image.width - texX - 1;
        }

        Renderer.renderClippedImage(wallTex.image,
            texX,
            0,
            1,
            wallTex.image.height,
            x,
            drawStart,
            1,
            lineHeight);

    }

    private initializeRayStepDistances(camera: Camera, mapX: number, mapY: number, rayDirX: number, rayDirY: number): {
        stepX: number,
        stepY: number,
        sideDistX: number,
        sideDistY: number
    } {

        // Calculate the absolute distance the ray travels between each x or y grid line.
        let deltaDistX: number = Math.abs(1 / rayDirX);
        let deltaDistY: number = Math.abs(1 / rayDirY);

        let sideDistX: number;
        let sideDistY: number;
        let stepX: number;
        let stepY: number;

        // Determine the step direction and initial side distance in the X direction.
        // If the ray is facing left, step left; if right, step right.
        if (rayDirX < 0) {
            stepX = -1;
            sideDistX = (camera.xPos - mapX) * deltaDistX;
        } else {
            stepX = 1;
            sideDistX = (mapX + 1.0 - camera.xPos) * deltaDistX;
        }
        if (rayDirY < 0) {
            stepY = -1;
            sideDistY = (camera.yPos - mapY) * deltaDistY;
        } else {
            stepY = 1;
            sideDistY = (mapY + 1.0 - camera.yPos) * deltaDistY;
        }

        // Return the calculated step and side distances for both X and Y directions.
        return {stepX, stepY, sideDistX, sideDistY};
    }

    renderShadows(perpWallDist: number, x: number, drawStart: number, lineHeight: number): void {
        let lightRange: number = this._worldMap.worldDefinition.lightRange;
        let calculatedAlpha: number = Math.max((perpWallDist + 0.002) / lightRange, 0);

        Renderer.rect(
            x | 0, drawStart | 0, 1, lineHeight + 1, new Color(0, 0, 0, calculatedAlpha)
        );
    }

    /**
     * Calculates the perpendicular distance from the camera to the wall. This is essential
     * for rendering the walls in a way that avoids the fisheye effect, which occurs if
     * the direct distance to the wall is used.
     *
     * @param side Indicates which side of the wall the ray hit (x-side or y-side).
     * @param mapX The x-coordinate of the map grid cell where the wall was hit.
     * @param mapY The y-coordinate of the map grid cell where the wall was hit.
     * @param camera The camera from which the ray is cast.
     * @param wallXOffset The horizontal offset of the wall hit, used for walls that are not aligned with the grid.
     * @param wallYOffset The vertical offset of the wall hit, used for walls that are not aligned with the grid.
     * @param stepX The horizontal step direction of the ray (-1 for left, 1 for right).
     * @param stepY The vertical step direction of the ray (-1 for down, 1 for up).
     * @param rayDirX The x-component of the ray's direction.
     * @param rayDirY The y-component of the ray's direction.
     * @returns The perpendicular distance from the camera to the wall.
     */
    calculatePerpWall(side: number, mapX: number, mapY: number, camera: Camera, wallXOffset: number, wallYOffset: number, stepX: number, stepY: number, rayDirX: number, rayDirY: number) {
        let perpWallDist: number = 0;

        // Calculate distance for x-side wall hit
        if (side == WallSide.X_SIDE) {
            perpWallDist = (mapX - camera.xPos + wallXOffset + (1 - stepX) / 2) / rayDirX;// Calculate distance for y-side wall hit
            // Calculate distance for y-side wall hit
        } else if (side == WallSide.Y_SIDE) {
            perpWallDist = (mapY - camera.yPos + wallYOffset + (1 - stepY) / 2) / rayDirY;
        }

        return perpWallDist;
    }

    /**
     * Renders sprites and transparent walls in the game world based on the camera's perspective.
     * @param {Camera} camera - The camera object used to determine the view perspective.
     */
    drawSpritesAndTransparentWalls(camera: Camera): void {

        // Arrays for storing distances of sprites from the camera, their order, and the game entities.
        const gameEntities: Array<GameEntity> = this._worldMap.getGameEntities();

        // Calculate distance of each game entity from the camera and store their sprite components.
        const { sprites, spriteDistance, order } = this.prepareSprites(gameEntities, camera);

        // Sort sprites based on their distance from the camera.
        this.combSort(order, spriteDistance);


        this.renderSpritesAndWalls(sprites, spriteDistance, order, camera);
    }

    renderSpritesAndWalls(sprites: Array<AnimatedSprite>, spriteDistance: Array<number>, order: Array<number>, camera: Camera): void {
        let transparentIdx: number = -1;
        if (this._transparentWall.length > 0) {
            transparentIdx = this._transparentWall.length - 1;
        }

        for (let i: number = 0; i < sprites.length; i++) {

            // Calculate sprite position relative to the camera.
            let spriteX: number = sprites[order[i]].x - camera.xPos;
            let spriteY: number = sprites[order[i]].y - camera.yPos;

            let invDet: number = 1.0 / (camera.xPlane * camera.yDir - camera.xDir * camera.yPlane);
            let transformX: number = invDet * (camera.yDir * spriteX - camera.xDir * spriteY);
            let transformY: number = invDet * (-camera.yPlane * spriteX + camera.xPlane * spriteY);

            let spriteScreenX: number = Math.floor(Renderer.getCanvasWidth() / 2) * (1 + transformX / transformY);


            // Render the sprite if it's in front of the camera.
            if (transformY > 0) {
                for (transparentIdx; transparentIdx >= 0; transparentIdx--) {
                    let tpDist: number = ((camera.xPos - this._transparentWall[transparentIdx].xMap) * (camera.xPos - this._transparentWall[transparentIdx].xMap)) + ((camera.yPos - this._transparentWall[transparentIdx].yMap) * (camera.yPos - this._transparentWall[transparentIdx].yMap));
                    if (spriteDistance[i] < tpDist) {
                        this._transparentWall[transparentIdx].draw();
                    } else {
                        break;
                    }
                }

                // Calculate dimensions and positions for rendering the sprite.
                let spriteHeight: number = Math.abs(Math.floor(Renderer.getCanvasHeight() / transformY));
                let drawStartY: number = -spriteHeight / 2 + Math.round(Renderer.getCanvasHeight() / 2);

                let spriteWidth: number = Math.abs(Math.floor(Renderer.getCanvasHeight() / transformY));
                let drawStartX: number = Math.floor(-spriteWidth / 2 + spriteScreenX);

                let drawEndX: number = drawStartX + spriteWidth;


                // Clipping calculations to render only the visible part of the sprite.
                let clipStartX: number = drawStartX;
                let clipEndX: number = drawEndX;

                if (drawStartX < -spriteWidth) {
                    drawStartX = -spriteWidth;
                }
                if (drawEndX > Renderer.getCanvasWidth() + spriteWidth) {
                    drawEndX = Renderer.getCanvasWidth() + spriteWidth;
                }

                console.log(`drawStartX: ${drawStartX} drawEndX: ${drawEndX}` );

                // This ensures we don't draw sprites the player can't actually see.
                for (let stripe: number = drawStartX; stripe <= drawEndX; stripe++) {
                    if (transformY > this._zBuffer[stripe]) {
                        if (stripe - clipStartX <= 1) {
                            clipStartX = stripe;
                        } else {
                            clipEndX = stripe;
                            break;
                        }
                    }
                }


                // Render clipped image of the sprite.
                if (clipStartX != clipEndX && clipStartX < Renderer.getCanvasWidth() && clipEndX > 0) {
                    let scaleDelta: number = sprites[order[i]].width / spriteWidth;
                    let drawXStart: number = Math.floor((clipStartX - drawStartX) * scaleDelta);
                    if (drawXStart < 0) {
                        drawXStart = 0;
                    }
                    let drawXEnd: number = Math.floor((clipEndX - clipStartX) * scaleDelta) + 1;
                    if (drawXEnd > sprites[order[i]].width) {
                        drawEndX = sprites[order[i]].width;
                    }
                    let drawWidth: number = clipEndX - clipStartX;
                    if (drawWidth < 0) {
                        drawWidth = 0;
                    }

                    drawXStart = 0;
                    drawXEnd = 32;

                    Renderer.renderClippedImage(sprites[order[i]].currentImage(), drawXStart, 0, drawXEnd, sprites[order[i]].height, clipStartX, drawStartY, drawWidth, spriteHeight);
                }
            }
        }

        for (transparentIdx; transparentIdx >= 0; transparentIdx--) {
            this._transparentWall[transparentIdx].draw();
        }
        this._transparentWall.length = 0;
    }



    prepareSprites(gameEntities: Array<GameEntity>, camera: Camera): { sprites: Array<AnimatedSprite>, spriteDistance: Array<number>, order: Array<number> } {
        let spriteDistance: Array<number> = [];
        let order: Array<number> = [];
        let sprites: Array<AnimatedSprite> = [];

        for (let i: number = 0; i < gameEntities.length; i++) {
            order[i] = i;

            let gameEntity: GameEntity = gameEntities[i];


            let animatedSpriteComponent: AnimatedSpriteComponent = gameEntity.getComponent("animatedSprite") as AnimatedSpriteComponent;
            let position: PositionComponent = gameEntity.getComponent("position") as PositionComponent;
            spriteDistance[i] = ((camera.xPos - position.x) * (camera.xPos - position.x)) + ((camera.yPos - position.y) * (camera.yPos - position.y));

            let distance: DistanceComponent = gameEntity.getComponent("distance") as DistanceComponent;

            distance.distance = spriteDistance[i];

            animatedSpriteComponent.animatedSprite.x = position.x;
            animatedSpriteComponent.animatedSprite.y = position.y;

            sprites.push(animatedSpriteComponent.animatedSprite);
        }

        return { sprites, spriteDistance, order };
    }

    drawSkyBox(camera: Camera): void {


        /*
                // Ground
                Renderer.rectGradient(
                    0,
                    Renderer.getCanvasHeight() / 2,
                    Renderer.getCanvasWidth(),
                    Renderer.getCanvasHeight(),
                    this._worldMap.worldDefinition.floorColor,
                    Colors.BLACK(),
                );

                 */

        this.renderFloorsAndCeiling(
            camera.xDir,
            camera.yDir,
            camera.xPlane,
            camera.yPlane,
            camera.xPos,
            camera.yPos,
            32,
            32
        );

        /*
        // Sky
        Renderer.rectGradient(
            0,
            0,
            Renderer.getCanvasWidth(),
            Renderer.getCanvasHeight() / 2,
            Colors.BLACK(),
            this._worldMap.worldDefinition.skyColor,
        );


         */
    }

    preRenderTexture(texture: HTMLImageElement, texWidth: number, texHeight: number): ImageData {
        let offscreenCanvas = document.createElement('canvas');
        offscreenCanvas.width = texWidth;
        offscreenCanvas.height = texHeight;
        let offCtx = offscreenCanvas.getContext('2d');
        offCtx.drawImage(texture, 0, 0);
        return offCtx.getImageData(0, 0, texWidth, texHeight);
    }

    renderFloorsAndCeiling(dirX: number, dirY: number, planeX: number, planeY: number, posX: number, posY: number, texWidth: number, texHeight: number) {

        let floor: ImageData = this.preRenderTexture(this._floor, 32, 32);
        let ceiling: ImageData = this.preRenderTexture(this._ceiling, 32, 32);

        let canvasWidth: number = Renderer.getCanvasWidth();
        let canvasHeight: number = Renderer.getCanvasHeight();

        let imageData: ImageData = Renderer.createImageData(canvasWidth, canvasHeight);
        let buffer: Uint32Array = new Uint32Array(imageData.data.buffer);


        for (let y: number = 0; y < Renderer.getCanvasHeight(); y++) {
            let rayDirX0: number = dirX - planeX;
            let rayDirY0: number = dirY - planeY;
            let rayDirX1: number = dirX + planeX;
            let rayDirY1: number = dirY + planeY;

            let p: number = y - Renderer.getCanvasHeight() / 2;
            let posZ: number = 0.5 * Renderer.getCanvasHeight();
            let rowDistance: number = posZ / p;

            let floorStepX: number = rowDistance * (rayDirX1 - rayDirX0) / Renderer.getCanvasWidth();
            let floorStepY: number = rowDistance * (rayDirY1 - rayDirY0) / Renderer.getCanvasWidth();

            let floorX: number = posX + rowDistance * rayDirX0;
            let floorY: number = posY + rowDistance * rayDirY0;

            for (let x: number = 0; x < Renderer.getCanvasWidth(); x++) {
                let cellX: number = Math.floor(floorX);
                let cellY: number = Math.floor(floorY);

                let tx: number = Math.floor(texWidth * (floorX - cellX)) & (texWidth - 1);
                let ty: number = Math.floor(texHeight * (floorY - cellY)) & (texHeight - 1);

                floorX += floorStepX;
                floorY += floorStepY;

                let distance : number = this.calculateDistance(x, y, canvasWidth, canvasHeight) / Renderer.getCanvasHeight();
                buffer[y * canvasWidth + x] = this.getColorFromTexture(floor, tx, ty, texWidth, distance);
                buffer[(canvasHeight - y - 1) * canvasWidth + x] = this.getColorFromTexture(ceiling, tx, ty, texWidth, distance);
            }
        }

        Renderer.putImageData(imageData, 0, 0);
    }

    private calculateDistance(x: number, y: number, canvasWidth: number, canvasHeight: number): number {
        // Example calculation - this may need to be adjusted based on your camera setup and desired effect
        let dx = x - canvasWidth / 2;
        let dy = y - canvasHeight / 2;
        let distance = Math.sqrt(dx * dx + dy * dy); // Euclidean distance from the center of the screen
        return distance;
    }

    getColorFromTexture(textureData: ImageData, tx: number, ty: number, texWidth: number, distance: number): number {
        let baseIndex: number = (ty * texWidth + tx) * 4; // 4 for RGBA
        let data: Uint8ClampedArray = textureData.data;

        // Extract RGBA components
        let r: number = data[baseIndex + 0];
        let g: number = data[baseIndex + 1];
        let b: number = data[baseIndex + 2];
        let a: number = data[baseIndex + 3];

        // Apply distance-based attenuation to RGB components
        // Assuming 'distance' is a value that increases with distance from the viewer
        const attenuation = Math.max(1.0 - distance, 0); // 'someFactor' determines how quickly it darkens with distance
        r *= attenuation;
        g *= attenuation;
        b *= attenuation;

        // Combine back into an integer
        return (r << 16) | (g << 8) | b | (a << 24);
    }

    combSort(order: Array<number>, dist: Array<number>): void {

        let amount: number = order.length;
        let gap: number = amount;
        let swapped: boolean = false;

        while (gap > 1 || swapped) {

            gap = Math.floor((gap * 10) / 13);
            if (gap == 9 || gap == 10) {
                gap = 11;
            }
            if (gap < 1) {
                gap = 1;
            }
            swapped = false;
            for (let i: number = 0; i < amount - gap; i++) {
                let j: number = i + gap;

                if (dist[i] < dist[j]) {
                    [dist[i], dist[j]] = [dist[j], dist[i]];
                    [order[i], order[j]] = [order[j], order[i]];
                    swapped = true;
                }
            }
        }
    }

    private processTransparentWall(camera: Camera, side: number,mapX: number, mapY: number, x: number) {
        let wallDefined: boolean = false;
        for (let i: number = 0; i < this._transparentWall.length; i++) {
            if (this._transparentWall[i].xMap == mapX && this._transparentWall[i].yMap == mapY) {
                this._transparentWall[i].xScreen = x;
                wallDefined = true;
                break;
            }
        }

        if (!wallDefined) {
            let tpWall: TransparentWall = new TransparentWall(camera, mapX, mapY, side, x, this._cameraXCoords);
            this._transparentWall.push(tpWall);
        }
    }
}
