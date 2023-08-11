

export class GlobalState {

    private static _stateMap:Map<string, any> = new Map<string, any>();

    static createState(key: string, state: any) : void {
        GlobalState._stateMap.set(key, state);
    }

    static getState(key: string) : any {
        return GlobalState._stateMap.get(key);
    }

    static hasState(key: string) : boolean {
        return GlobalState._stateMap.has(key);
    }

    static clearState(key: string) : void {
        GlobalState._stateMap.delete(key);
    }

    static getStates() : Map<string, any> {
        return this._stateMap;
    }
}
