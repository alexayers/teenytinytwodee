import {TeenyTinyTwoDeeApp} from "../lib/application/teenyTinyTwoDeeApp";
import {GameScreen} from "../lib/application/gameScreen";
import {MainGameScreen} from "./screens/mainGameScreen";
import './index.css';

export class Game extends TeenyTinyTwoDeeApp {

    init() {

        const gameScreens : Map<string, GameScreen> = new Map<string, GameScreen>();
        gameScreens.set("main", new MainGameScreen());

        this.run(gameScreens, "main");
    }

}

const game : Game = new Game();
game.init();
