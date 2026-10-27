import { SHAPE_DEFINITIONS, COLORS } from './shape_definitions'

export default class Shape {
    constructor(container, definition = null, color = null) { //Shape baut sich selbst im übergebenen container auf
        this.container = container
        this.definition = definition
        this.color = color

        if (!definition) {
            const randomIndex = Math.floor(Math.random() * SHAPE_DEFINITIONS.length);
            this.definition = SHAPE_DEFINITIONS[randomIndex];
        }

        if (!color) {
            const randomColorIndex = Math.floor(Math.random() * COLORS.length);
            this.color = COLORS[randomColorIndex];
        }

        //Shape erstellen
    }
}