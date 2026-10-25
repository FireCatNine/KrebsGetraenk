export default class Game {
    constructor(container) {
        this.container = container
        this.abortCon = new AbortController()
        this.signal = this.abortCon.signal
    }

    init() {
        //Init Game
    }

    cleanup() {
        this.abortCon.abort()
        this.container.innerHTML = ''
    }
}