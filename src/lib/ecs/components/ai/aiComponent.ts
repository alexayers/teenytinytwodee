import {GameComponent} from "../../gameComponent";

enum MovementStyle {
    wander,
    follow
}

export class AiComponent implements GameComponent {


    private _ticksSinceLastChange: number = 0;
    private _currentDirection: number  = 1;
    private _attackCoolDown: number  = 0;
    private friend:boolean;

    constructor(private _movementStyle: MovementStyle, private _friend: boolean) {
    }

    getName(): string {
        return "ai";
    }

}
