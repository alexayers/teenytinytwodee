import {GameRenderSystem} from "../../gameRenderSystem";
import {Particle} from "../../../rendering/particle";
import {Renderer} from "../../../rendering/renderer";
import {MathUtils} from "../../../utils/mathUtils";
import {Color} from "../../../primatives/color";


export class MistRenderSystem implements GameRenderSystem {

    private _particles: Array<Particle> = [];

    constructor() {

        for (let i = 0; i < 1000; i++) {
            this._particles.push(this.refreshParticle(new Particle()))
        }

    }


    refreshParticle(particle: Particle): Particle {


        particle.x = MathUtils.getRandomBetween(-100, Renderer.getCanvasWidth() + 100);
        particle.y = MathUtils.getRandomBetween(-100, Renderer.getCanvasHeight() + 100);
        particle.width = MathUtils.getRandomBetween(25, 125);
        particle.height = MathUtils.getRandomBetween(25, 125);
        particle.color = new Color(45, 45, 45, 0.4);
        particle.lifeSpan = MathUtils.getRandomBetween(5, 100);
        particle.velX = MathUtils.getRandomBetween(1, 4) * MathUtils.positiveNegative();



        particle.velY = 0;
        particle.decayRate = MathUtils.getRandomBetween(1, 5) / 1000;

        return particle;
    }

    process(): void {

        this._particles.forEach((particle) => {

            Renderer.rect(particle.x, particle.y, particle.width, particle.height,particle.color);


            particle.x += particle.velX;
            particle.y += particle.velY;
            particle.color.alpha -= particle.decayRate;
            particle.lifeSpan -= particle.decayRate;

            if (particle.lifeSpan < 0 || particle.color.alpha <= 0) {
                this.refreshParticle(particle);
            }

        });

    }

}
