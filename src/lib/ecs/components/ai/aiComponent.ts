import {GameComponent} from "../../gameComponent";

export enum MovementStyle {
    wander,
    follow
}

export class AiComponent implements GameComponent {

    private _ticksSinceLastChange: number = 0;
    private _currentDirection: number  = 1;
    private _attackCoolDown: number  = 0;

    constructor(private _movementStyle: MovementStyle, private _friend: boolean) {
    }

    get movementStyle() : MovementStyle {
        return this._movementStyle;
    }

    get isFriend() :boolean {
        return this._friend;
    }

    get ticksSinceLastChange(): number {
        return this._ticksSinceLastChange;
    }

    set ticksSinceLastChange(value: number) {
        this._ticksSinceLastChange = value;
    }

    get currentDirection(): number {
        return this._currentDirection;
    }

    set currentDirection(value: number) {
        this._currentDirection = value;
    }

    get attackCoolDown(): number {
        return this._attackCoolDown;
    }

    set attackCoolDown(value: number) {
        this._attackCoolDown = value;
    }

    get friend(): boolean {
        return this._friend;
    }

    set friend(value: boolean) {
        this._friend = value;
    }

    getName(): string {
        return "ai";
    }

}
