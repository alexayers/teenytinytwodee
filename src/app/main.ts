import {TeenyTinyTwoDeeApp} from "../lib/application/teenyTinyTwoDeeApp";
import {GameScreen} from "../lib/application/gameScreen";
import {MainGameScreen} from "./screens/mainGameScreen";
import './index.css';
import {TestScreen} from "./screens/testScreen";

export class Game extends TeenyTinyTwoDeeApp {

    init() {

        const gameScreens : Map<string, GameScreen> = new Map<string, GameScreen>();
        gameScreens.set("test", new TestScreen());

        this.run(gameScreens, "test");
    }

}

const game : Game = new Game();
game.init();
