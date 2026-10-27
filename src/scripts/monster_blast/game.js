import Shape from "./shape"
import { SHAPE_DEFINITIONS, COLORS } from './shape_definitions'

export default class Game {
    constructor(container) {
        this.container = container
        this.abortCon = new AbortController()
        this.signal = this.abortCon.signal
        this.boardMatrix = Array.from({ length: 8 }, () => Array(8).fill(0))

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
            const col= i% 8;
            const row= Math.floor(i/ 8);
            cell.dataset.col= col;
            cell.dataset.row= row;
            this.boardEle.appendChild(cell);
        }
        
        this.fillUpShapes()
    }

    cleanup() {
        this.abortCon.abort()

        //Sollte nur in react-dev wichtig sein wegen StrictMode. "Sollte"
        this.boardEle.innerHTML = ''
        this.shapePlaceEles.forEach((place) => place.innerHTML = '')
    }

    fillUpShapes() {
        this.shapePlaceEles.forEach((place) => {
            if (place.innerHTML !== '') return
            new Shape(place)
        })
    }
}