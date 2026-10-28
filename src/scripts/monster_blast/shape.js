import { SHAPE_DEFINITIONS, COLORS } from './shape_definitions'

export default class Shape {
    constructor(container, definition = null, color = null) { //Shape baut sich selbst im übergebenen container auf
        this.container = container
        this.definition = definition
        this.color = color
        this.shape = Array.from({ length: 6 }, () => Array(6).fill(null))

        if (!definition) {
            const randomIndex = Math.floor(Math.random() * SHAPE_DEFINITIONS.length);
            this.definition = SHAPE_DEFINITIONS[randomIndex];
        }

        if (!color) {
            const randomColorIndex = Math.floor(Math.random() * COLORS.length);
            this.color = COLORS[randomColorIndex];
        }

        this.shapeEle = document.createElement("div")
        this.shapeEle.className = "shape"
        const gridSize = this.definition.length
        this.shapeEle.style.gridTemplateRows = `repeat(${gridSize}, 1fr)`
        this.shapeEle.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`
        this.shapeEle.style.padding = Math.max((3 - gridSize) * 10 , 0) + "%"

        for (let i = 0; i < gridSize; i++) {
            for (let j = 0; j < gridSize; j++) {
                const block = document.createElement("div")
                block.className = "shapeBlock"
                this.shape[i][j] = block
                if (this.definition[i][j] === 1) block.classList.add(this.color, "active")
                this.shapeEle.appendChild(block)
            }
        }

        this.container.appendChild(this.shapeEle)  
    }
}