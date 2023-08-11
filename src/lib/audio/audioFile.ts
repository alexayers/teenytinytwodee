

export class AudioFile {
    private _audio: HTMLAudioElement;

    constructor(fileName: string, loop: boolean) {
        this._audio = new Audio(fileName);
        this._audio.loop = loop;
    }

    public setVolume(volume: number) : void {
        this._audio.volume = volume;
    }

    public isLooped() : boolean {
        return this._audio.loop;
    }

    public play() : void {
        if (!this._audio.paused) {
            this._audio.pause();
        }

        try {
            this._audio.play();
        } catch (e) {

        }
    }

    public pause() : void {
        this._audio.pause();
    }

    public stop() : void {
        this._audio.pause();
        this._audio.currentTime = 0;
    }
}
