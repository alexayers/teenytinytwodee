import {PathNode} from "./pathNode";
import {WorldMap} from "../rendering/rayCaster/worldMap";


export class AStar {

    private _closedSet: Map<number, PathNode> = new Map<number, PathNode>();
    private _openSet: Map<number, PathNode> = new Map<number, PathNode>();
    private _path: Array<PathNode> = new Array<PathNode>();
    private _currentNode: PathNode = new PathNode(0, 0);

    private readonly _startX: number;
    private readonly _startY: number;
    private readonly _endX: number;
    private readonly _endY: number;

    private readonly _worldMap: WorldMap = WorldMap.getInstance();


    public constructor(startX: number, startY: number, endX: number, endY: number) {
        this._startX = startX;
        this._startY = startY;
        this._endX = endX;
        this._endY = endY;

        let idx: number = this.translateCoordinatesToIdx(startX, startY);

        let n: PathNode = new PathNode(startX, startY);
        n.idx = idx;
        n.parent = 0;
        n.g = 0;
        n.h = this.getManhattanDistance(n.x, n.y);
        n.f = (n.g + n.h);

        this._openSet.set(idx, n);
    }

    private translateCoordinatesToIdx(x: number, y: number): number {
        return x + (y * this._worldMap.worldDefinition.width);
    }


    private getManhattanDistance(x: number, y: number): number {
        return ((Math.abs(x - this._endX) + Math.abs(y - this._endY)) * 10);
    }

    private isOnClosedList(idx: number): boolean {
        return this._closedSet.has(idx);
    }

    private isOnOpenedList(idx: number): boolean {
        return this._openSet.has(idx);
    }

    private addToOpenedList(n: PathNode): void {
        this._openSet.set(n.idx, n);
    }

    private addToClosedList(idx: number, n: PathNode): void {
        this._closedSet.set(idx, n);
    }

    private findLowestCost(): PathNode {
        let f: number = Number.MAX_VALUE;
        let lowestCostIdx: number | null = null;

        for (let [k, pathNode] of this._openSet) {
            if (pathNode.f < f) {
                f = pathNode.f;
                lowestCostIdx = pathNode.idx;
            }
        }

        if (lowestCostIdx !== null) {
            let lowestNode: PathNode | undefined = this._openSet.get(lowestCostIdx);
            if (lowestNode) {
                this._openSet.delete(lowestCostIdx);
                return lowestNode;
            }
        }

        return null;
    }

    private calculateGValue(x: number, y: number): number {
        // Checking behind me
        if (x == (this._currentNode.x - 1) && y == this._currentNode.y) {
            let wall: boolean = this.isWall(this._currentNode.x - 1, this._currentNode.y);
            return this.getTileWeight(wall);
            // Checking in front of me
        } else if (x == (this._currentNode.x + 1) && y == this._currentNode.y) {
            let wall: boolean = this.isWall(this._currentNode.x + 1, this._currentNode.y);
            return this.getTileWeight(wall);
            // Checking above me
        } else if (x == this._currentNode.x && y == this._currentNode.y + 1) {
            let wall: boolean = this.isWall(this._currentNode.x, this._currentNode.y + 1);
            return this.getTileWeight(wall);
            // Checking below me
        } else if (x == this._currentNode.x && y == this._currentNode.y - 1) {
            let wall: boolean = this.isWall(this._currentNode.x, this._currentNode.y - 1);
            return this.getTileWeight(wall);
            // Checking top-left diagonal
        } else if (x == this._currentNode.x - 1 && y == this._currentNode.y - 1) {
            let wall: boolean = this.isWall(x, y);
            return this.getTileWeight(wall);
            // Checking top-right diagonal
        } else if (x == this._currentNode.x + 1 && y == this._currentNode.y - 1) {
            let wall: boolean = this.isWall(x, y);
            return this.getTileWeight(wall);
            // Checking bottom-left diagonal
        } else if (x == this._currentNode.x - 1 && y == this._currentNode.y + 1) {
            let wall: boolean = this.isWall(x, y);
            return this.getTileWeight(wall);
            // Checking bottom-right diagonal
        } else if (x == this._currentNode.x + 1 && y == this._currentNode.y + 1) {
            let wall: boolean = this.isWall(x, y);
            return this.getTileWeight(wall);
        } else {
            // Default case for other nodes (if any)
            return Number.MAX_VALUE;
        }
    }

    private getTileWeight(wall: boolean): number {

        if (!wall) {
            return 10;
        } else {
            return Number.MAX_VALUE;
        }
    }

    private buildNodeList(): void {
        for (let y: number = (this._currentNode.y - 1); y <= (this._currentNode.y + 1); y++) {
            for (let x: number = (this._currentNode.x - 1); x <= (this._currentNode.x + 1); x++) {

                if (x == this._currentNode.x && y == this._currentNode.y) {
                    continue;
                } else if (y >= 0 && x >= 0 && x <= this._worldMap.worldDefinition.width - 1 && y <= this._worldMap.worldDefinition.height - 1) {
                    let idx: number = this.translateCoordinatesToIdx(x, y);

                    if (this.isOnClosedList(idx) || this.isWall(x, y) || this.isDiagonalMoveThroughWall(x, y, this._currentNode)) {
                        continue; // Skip nodes that are on the closed list, are walls, or are diagonal moves through walls
                    }

                    let cost: number = this._currentNode.g + this.calculateGValue(x, y);

                    if (this.isOnOpenedList(idx) && cost < this._openSet.get(idx).g) {
                        let nodeToUpdate : PathNode = this._openSet.get(idx);
                        nodeToUpdate.g = cost;
                        nodeToUpdate.f = cost + nodeToUpdate.h;
                        nodeToUpdate.parent = this._currentNode.idx;
                    } else if (!this.isOnOpenedList(idx)) {
                        let h: number = this.getManhattanDistance(x, y);
                        let n: PathNode = new PathNode(x, y);

                        n.h = h;
                        n.g = cost;
                        n.idx = idx;
                        n.parent = this._currentNode.idx;
                        n.f = (n.g + n.h);

                        this.addToOpenedList(n);
                    }
                }
            }
        }
    }

    private buildRoute(): void {
        let startIdx: number = this.translateCoordinatesToIdx(this._startX, this._startY);
        let idx: number = this.translateCoordinatesToIdx(this._endX, this._endY);

        while (idx != startIdx) {
            this._path.push(this._closedSet.get(idx));
            idx = this._closedSet.get(idx).parent;
        }
    }

    public getPath(): Array<PathNode> {

        let path = this._path.reverse();

        console.log(path);
        return path;
    }

    public isPathFound(): boolean {
        let pathFound: boolean = false;

        while (this._openSet.size != 0) {
            this._currentNode = this.findLowestCost();

            if (this._currentNode === null) {
                break;
            }

            this.addToClosedList(this._currentNode.idx, this._currentNode);

            if (this._currentNode.idx == this.translateCoordinatesToIdx(this._endX, this._endY)) {
                this.buildRoute();
                pathFound = true;
                break;
            } else {
                this.buildNodeList();
            }
        }

        return pathFound;
    }


    private isWall(x: number, y: number) {

        let pos: number = x + (y * this._worldMap.worldDefinition.width);


        if (pos < 0 || pos >= (this._worldMap.worldDefinition.width * this._worldMap.worldDefinition.height)) {
            return true;
        }



        return this._worldMap.getEntityAtPosition(x, y).hasComponent("wall") ||
            this._worldMap.getEntityAtPosition(x, y).hasComponent("transparent");
    }

    private isDiagonalMoveThroughWall(x: number, y: number, currentNode: PathNode): boolean {
        return this.isWall(x, currentNode.y) && this.isWall(currentNode.x, y);
    }

}
