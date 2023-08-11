import {Camera} from "./camera";


export class TransparentWall {

    private _xMap: number;
    private _yMap: number;
    private _side: number;
    private _xScreen;
    private _camera: Camera
    private _cameraXCoords;

    constructor(camera:Camera, xMap : number, yMap : number, side: number, xScreen : number, cameraXCoords: Array<number>) {

        this._camera =camera;
        this._xMap = xMap;
        this._yMap = yMap;
        this._side = side;
        this._xScreen = xScreen;
        this._cameraXCoords = cameraXCoords;
    }

    getRayDir(x: number, side: number) : number {
        if (side == 1) {
            return this._camera.yDir + this._camera.yPlane * this._cameraXCoords[x];
        } else {
            return this._camera.xDir + this._camera.xPlane * this._cameraXCoords[x];
        }
    }

    getPerpDist(x : number) : number {
        let step :number = 1;
        let rayDir :number = this.getRayDir(x, this._side);

        if (rayDir < 0) {
            step = -1;
        }

        if (this._side == 1) {
            return (this._yMap - this._camera.yPos + (0.5 * step) + (1 - step) / 2) / rayDir;
        } else {
            return (this._xMap - this._camera.xPos + (0.5 * step) + (1 - step) / 2) / rayDir;
        }
    }

    draw() : void {


        return;

        /*
        Renderer.saveContext();

        Renderer.setAlpha(0.5);


        for (let x=this._xScreen[0]; x<this._xScreen[0] + this._xScreen.length; x++) {
            let perpDist :number = this.getPerpDist(x);
            let lineHeight :number = Math.round(Renderer.getCanvasHeight() / perpDist);
            let drawStart :number = -lineHeight / 2 + Renderer.getCanvasHeight()/2;

            let wallX :number;
            if (this._side == 0) {
                wallX = this._camera.yPos + perpDist * this.getRayDir(x, 1);
            } else if (this._side == 1) {
                wallX = this._camera.xPos + perpDist * this.getRayDir(x, 0);
            }

            wallX -= Math.floor(wallX);


            let texX = Math.floor(wallX * mapForceFieldPic.width);
            Renderer.renderClippedImage(mapForceFieldPic, texX, 0, 1, mapForceFieldPic.height, x, drawStart, 1, lineHeight);


        }

        Renderer.restoreContext()

         */
    }

}
