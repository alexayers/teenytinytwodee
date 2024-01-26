import {Color} from "../primatives/color";
import {ConfigurationManager} from "../application/configuration";
import {logger, LogType} from "../utils/loggerUtils";
import {Font} from "../rendering/font";
import {ColorUtils} from "../utils/colorUtils";


export class Renderer {
    private static _canvas: HTMLCanvasElement;
    private static _ctx: CanvasRenderingContext2D;
    private static _calculationCanvas: HTMLCanvasElement;

    private static _dataCanvas: HTMLCanvasElement;
    private static _dataContext: CanvasRenderingContext2D;

    public static init(): void {

        let container: HTMLDivElement = document.createElement('div');
        container.id = "container";

        let resolution = ConfigurationManager.getValue("resolution");

        logger(LogType.INFO, `Resolution W: ${resolution.width} H: ${resolution.height} `)

        Renderer._canvas = document.createElement('canvas');
        Renderer._canvas.id = "game";
        Renderer._canvas.width = resolution.width;
        Renderer._canvas.height = resolution.height;
        container.appendChild(Renderer._canvas);
        document.body.appendChild(container);

        Renderer._ctx = Renderer._canvas.getContext("2d");
        Renderer._ctx.imageSmoothingEnabled = false;
        Renderer._calculationCanvas = document.createElement("canvas");

        this._dataCanvas = document.createElement('canvas');
        this._dataCanvas.width = 1024;
        this._dataCanvas.height = 1024;
        this._dataContext = this._dataCanvas.getContext("2d");
    }


    static getImageData(image: HTMLImageElement): Uint8ClampedArray {

        this._dataContext.drawImage(image, 0, 0);

        let imageData: ImageData = this._dataContext.getImageData(0, 0, image.width, image.height);
        return imageData.data;
    }


    static clearScreen(): void {
        Renderer._ctx.clearRect(0, 0, Renderer._canvas.width, Renderer._canvas.height);
    }

    static setColor(color: Color): void {
        Renderer._ctx.fillStyle = ColorUtils.RGBtoHex(color.red, color.green, color.blue);
    }

    public static resize(): void {
        if (Renderer._canvas !== undefined) {
            Renderer._canvas.width = window.innerWidth;
            Renderer._canvas.height = window.innerHeight;
            Renderer._ctx.imageSmoothingEnabled = false;
        }
    }

    static renderImage(image: HTMLImageElement, x: number, y: number, width: number, height: number, flip: boolean = false) {

        if (flip) {

            Renderer._ctx.translate(x + width, y);
            Renderer._ctx.scale(-1, 1);

            Renderer._ctx.drawImage(
                image,
                0, 0, width, height
            );

            Renderer._ctx.setTransform(1, 0, 0, 1, 0, 0);

        } else {
            Renderer._ctx.drawImage(
                image,
                x,
                y,
                width,
                height
            );
        }
    }

    static renderClippedImage(image: HTMLImageElement,
                              sx: number,
                              sy: number,
                              swidth: number,
                              sheight: number,
                              x: number,
                              y: number,
                              width: number,
                              height: number,
                              shouldFlip: boolean = false): void {

        // Save the current state of the context
        Renderer._ctx.save();

        if (shouldFlip) {
            // Flip the context horizontally around the image's vertical axis
            Renderer._ctx.scale(-1, 1);
            Renderer._ctx.translate(-x - width, 0);
        }

        // Draw the image with adjusted context
        Renderer._ctx.drawImage(
            image,
            sx, sy, swidth, sheight, x, y, width, height
        );

        // Restore the context to its original state
        Renderer._ctx.restore();

    }


    static calculateTextWidth(text: string, font: string): number {
        const context = Renderer._calculationCanvas.getContext("2d");
        context.font = font;
        const metrics = context.measureText(text);
        return metrics.width;
    }

    static print(msg: string, x: number, y: number, font: Font): void {

        if (font.style) {
            Renderer._ctx.font = `${font.style} ${font.size}px ${font.family}`;
        } else {
            Renderer._ctx.font = `${font.size}px ${font.family}`;
        }

        if (font.color) {
            Renderer._ctx.fillStyle = ColorUtils.RGBtoHex(font.color.red, font.color.green, font.color.blue);
        } else {
            Renderer._ctx.fillStyle = "#000000";
        }

        if (font.color && font.color.alpha) {
            Renderer.setAlpha(font.color.alpha);
        }

        Renderer._ctx.fillText(msg, x, y);
        Renderer.setAlpha(1);
    }

    static getLines(text: string, maxWidth: number): Array<string> {
        let words: string [] = text.split(" ");
        let lines: Array<string> = [];
        let currentLine: string = words[0];

        for (let i: number = 1; i < words.length; i++) {
            let word: string = words[i];
            let width: number = Renderer._ctx.measureText(currentLine + " " + word).width;
            if (width < maxWidth) {
                currentLine += " " + word;
            } else {
                lines.push(currentLine);
                currentLine = word;
            }
        }
        lines.push(currentLine);
        return lines;
    }

    static fillAndClosePath(): void {
        Renderer._ctx.fill();
        Renderer._ctx.closePath();
    }

    static beginPath(): void {
        Renderer._ctx.beginPath();
    }

    static circle(x: number, y: number, radius: number, color: Color): void {
        Renderer._ctx.beginPath();

        Renderer.setColor(color);
        Renderer.setAlpha(color.alpha);

        Renderer._ctx.arc(x, y, radius, 0, 2 * Math.PI, false)

        Renderer._ctx.fill();
        Renderer._ctx.closePath();
        Renderer.setAlpha(1);
    }

    static line(x1: number, y1: number, x2: number, y2: number, width: number, color: Color): void {
        Renderer._ctx.beginPath();

        Renderer._ctx.moveTo(x1, y1);
        Renderer._ctx.lineTo(x2, y2);
        Renderer._ctx.lineWidth = width;
        Renderer._ctx.strokeStyle = ColorUtils.RGBtoHex(color.red, color.green, color.blue);
        Renderer._ctx.stroke();
    }

    static rect(x: number, y: number, width: number, height: number, color: Color): void {

        Renderer._ctx.beginPath();

        Renderer.setColor(color);
        Renderer.setAlpha(color.alpha);

        Renderer._ctx.rect(
            x,
            y,
            width,
            height
        );

        Renderer._ctx.fill();
        Renderer._ctx.closePath();
        Renderer.setAlpha(1);
    }

    static setAlpha(alpha: number): void {
        Renderer._ctx.globalAlpha = alpha;
    }

    static getCanvasWidth(): number {
        return Renderer._canvas.width;
    }

    static getCanvasHeight(): number {
        return Renderer._canvas.height;
    }

    static saveContext(): void {
        Renderer._ctx.save();
    }

    static restoreContext(): void {
        Renderer._ctx.restore();
    }

    static enableImageSmoothing(): void {
        Renderer._ctx.imageSmoothingEnabled = true;
    }

    static disableImageSmoothing(): void {
        Renderer._ctx.imageSmoothingEnabled = false;
    }

    static translate(x: number, y: number): void {
        Renderer._ctx.translate(x, y);
    }

    static rotate(angle: number) {
        Renderer._ctx.rotate(-(angle - Math.PI * 0.5));
    }

    static rectGradient(x: number, y: number, width: number, height: number, startColor: Color, endColor: Color) {

        // Create a vertical linear gradient
        let gradient = Renderer._ctx.createLinearGradient(x, y, width, height);
        gradient.addColorStop(0, startColor.toString());
        gradient.addColorStop(1, endColor.toString());

        // Use the gradient to fill the rectangle
        Renderer._ctx.fillStyle = gradient;
        Renderer._ctx.fillRect(x, y, width, height);
    }

    static createImageData(canvasWidth: number, canvasHeight: number): ImageData {
        return Renderer._ctx.createImageData(canvasWidth, canvasHeight);
    }

    static putImageData(imageData: ImageData, x: number, y: number) {
        Renderer._ctx.putImageData(imageData, x, y);
    }
}
