import {GameComponent} from "../gameComponent";

export class ItemComponent implements GameComponent {
    getName(): string {
        return "item";
    }

}
