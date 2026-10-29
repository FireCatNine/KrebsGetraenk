import Shape from "./shape"

export default class Game {
    constructor(container) {
        this.container = container
        this.abortCon = new AbortController()
        this.abortSignal = this.abortCon.signal
        this.boardMatrix = Array.from({ length: 8 }, () => Array(8).fill(0)) //[Row][Column]
        this.boardEleMatrix = Array.from({ length: 8 }, () => Array(8).fill(null))

        this.highScoreValEle = this.container.querySelector("#highScoreVal")
        this.scoreEle = this.container.querySelector("#score")

        this.boardEle = this.container.querySelector("#board")

        this.place0Ele = this.container.querySelector("#place0")
        this.place1Ele = this.container.querySelector("#place1")
        this.place2Ele = this.container.querySelector("#place2")
        this.shapePlaceEles = [this.place0Ele, this.place1Ele, this.place2Ele]
    }

    init() {
        for (let i= 0; i< 64; i++){
            const cell= document.createElement("div");
            cell.className= "cell";
            const row= Math.floor(i/ 8);
            const col= i% 8;
            this.boardEleMatrix[row][col]
            this.boardEle.appendChild(cell);
        }
        
        //Load or create playable game state
        this.fillUpShapes()
    }

    cleanup() {
        this.abortCon.abort()

        //Sollte nur in react-dev wichtig sein wegen StrictMode
        this.boardEle.innerHTML = ''
        this.shapePlaceEles.forEach((place) => place.innerHTML = '')
    }

    fillUpShapes() {
        this.shapePlaceEles.forEach((place) => {
            if (place.innerHTML !== '') return
            new Shape(place, this.abortSignal)
        })
    }

    syncHighScore() {
        
    }
}