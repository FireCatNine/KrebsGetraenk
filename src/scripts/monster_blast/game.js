import Shape from "./shape"
import { COLORS, SHAPE_DEFINITIONS } from "./shape_definitions"

const BOARD_SIZE = 8
const STORAGE_KEY = "monster-blast-save"
const RESTORE_DURATION = 360
const EPIC_CLEAR_DURATION = 3200
const LEGENDARY_CLEAR_DURATION = 5600
const OVERLAY_CLEANUP_DELAY = 200
const EPIC_CLEAR_EFFECT = { className: "line-clear-epic", animationName: "monsterBlastLineClearEpic" }
const LEGENDARY_CLEAR_EFFECT = { className: "line-clear-legendary", animationName: "monsterBlastLineClearLegendary" }
const QUICK_LEGENDARY_CLEAR_EFFECT = {
    className: "line-clear-legendary-quick",
    animationName: "monsterBlastLineClearLegendaryQuick",
}
const LINE_CLEAR_EFFECTS = [
    { className: "line-clear-implode", animationName: "monsterBlastLineClearImplode" },
    { className: "line-clear-slice", animationName: "monsterBlastLineClearSlice" },
    QUICK_LEGENDARY_CLEAR_EFFECT,
]
const EPIC_CLEAR_PALETTES = [
    { primary: "#b6ff00", secondary: "#00ffc8" },
    { primary: "#ff3d8d", secondary: "#ffb000" },
    { primary: "#30a8ff", secondary: "#d8ff3e" },
    { primary: "#c56bff", secondary: "#ff5a36" },
]
const EPIC_CLEAR_THRESHOLD = 2
const EPIC_CLEAR_MESSAGES = [
    "WIESO NICHT?",
    "WER NIE ANFÄNGT WIRD AUCH NIE FERTIG",
    "FRAGEN ODER ANTWORTEN?"
]
const LEGENDARY_CLEAR_THRESHOLD = 3
const LEGENDARY_CLEAR_MESSAGES = [
    "DIE X-ACHSE",
    "KREBS-GETRÄNK",
    "FRISCHLUFT-SCHNEISE"
]
const EMPTY_BOARD = () => Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(null))

export default class Game {
    constructor(container) {
        this.container = container
        this.abortCon = new AbortController()
        this.abortSignal = this.abortCon.signal
        this.boardMatrix = EMPTY_BOARD()
        this.boardEleMatrix = Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(null))
        this.shapeInstances = [null, null, null]
        this.restoreTimers = new Set()
        this.fillingTimers = new Set()
        this.counterTimers = new Map()
        this.activeDrag = null
        this.previewFrame = null
        this.previewPoint = null
        this.score = 0
        this.highScore = 0
        this.gameOver = false
        this.isFillingBoard = false
        this.isResolvingTurn = false
        this.lastLineClearEffectIndex = -1
        this.epicClearTimer = null
        this.epicClearOverlay = null

        this.highScoreValEle = this.container.querySelector("#highScoreVal")
        this.scoreEle = this.container.querySelector("#score")
        this.boardEle = this.container.querySelector("#board")
        this.shapePlaceEles = [0, 1, 2].map((index) => this.container.querySelector(`#place${index}`))
    }

    init() {
        for (let row = 0; row < BOARD_SIZE; row++) {
            for (let col = 0; col < BOARD_SIZE; col++) {
                const cell = document.createElement("div")
                cell.className = "cell"
                this.boardEleMatrix[row][col] = cell
                this.boardEle.appendChild(cell)
            }
        }

        this.boardEle.addEventListener("click", this.handleBoardClick, { signal: this.abortSignal })
        window.addEventListener("pointermove", this.handlePointerMove, { signal: this.abortSignal })
        window.addEventListener("pointerup", this.handlePointerUp, { signal: this.abortSignal })
        window.addEventListener("pointercancel", this.handlePointerCancel, { signal: this.abortSignal })
        window.addEventListener("pointerout", this.handlePointerOut, { signal: this.abortSignal })
        window.addEventListener("blur", this.handleWindowBlur, { signal: this.abortSignal })
        window.addEventListener("resize", this.handleResize, { signal: this.abortSignal })

        const savedState = this.loadState()
        if (savedState) {
            this.boardMatrix = savedState.board
            this.score = savedState.score
            this.highScore = savedState.highScore
            this.gameOver = savedState.gameOver
            this.renderBoard()
            this.updateScoreDisplay()
            savedState.shapes.forEach((shapeData, index) => {
                if (shapeData) this.createShape(index, shapeData.definitionIndex, shapeData.color)
                else this.createSlotPlaceholder(this.shapePlaceEles[index])
            })
            if (this.gameOver) {
                this.shapePlaceEles.forEach((place) => place.classList.add("game-over"))
                this.shapeInstances.forEach((shape) => {
                    if (shape) shape.shapeEle.classList.add("disabled")
                })
                this.fillLostBoard()
            }
            return
        }

        this.fillUpShapes()
        this.saveState()
    }

    cleanup() {
        this.abortCon.abort()
        this.cancelDrag(false)
        this.restoreTimers.forEach((timer) => window.clearTimeout(timer))
        this.fillingTimers.forEach((timer) => window.clearTimeout(timer))
        this.counterTimers.forEach((timer) => window.clearTimeout(timer))
        this.counterTimers.clear()
        if (this.epicClearTimer !== null) window.clearTimeout(this.epicClearTimer)
        this.epicClearTimer = null
        this.clearEpicClearOverlay()
        this.restoreTimers.clear()
        this.fillingTimers.clear()
        if (this.previewFrame !== null) window.cancelAnimationFrame(this.previewFrame)
        this.previewFrame = null
        this.boardEle.innerHTML = ""
        this.shapePlaceEles.forEach((place) => {
            place.innerHTML = ""
            place.classList.remove("game-over")
        })
    }

    loadState() {
        let rawState
        try {
            rawState = window.localStorage.getItem(STORAGE_KEY)
        } catch (error) {
            console.error("Unable to read Monster Blast save data.", error)
            return null
        }
        if (!rawState) return null

        try {
            const state = JSON.parse(rawState)
            const validBoard = Array.isArray(state.board)
                && state.board.length === BOARD_SIZE
                && state.board.every((row) => Array.isArray(row)
                    && row.length === BOARD_SIZE
                    && row.every((cell) => cell === null || COLORS.includes(cell)))
            const validShapes = Array.isArray(state.shapes)
                && state.shapes.length === 3
                && state.shapes.every((shape) => shape === null
                    || (Number.isInteger(shape.definitionIndex)
                        && shape.definitionIndex >= 0
                        && shape.definitionIndex < SHAPE_DEFINITIONS.length
                        && COLORS.includes(shape.color)))

            if (!validBoard || !validShapes
                || !Number.isInteger(state.score) || state.score < 0
                || !Number.isInteger(state.highScore) || state.highScore < 0
                || typeof state.gameOver !== "boolean") {
                throw new Error("Saved Monster Blast game state has an invalid shape.")
            }
            return state
        } catch (error) {
            console.error("Unable to restore Monster Blast save data.", error)
            return null
        }
    }

    saveState() {
        const state = {
            board: this.boardMatrix,
            shapes: this.shapeInstances.map((shape) => shape ? {
                definitionIndex: shape.definitionIndex,
                color: shape.color,
            } : null),
            score: this.score,
            highScore: this.highScore,
            gameOver: this.gameOver,
        }
        try {
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
        } catch (error) {
            console.error("Unable to save Monster Blast game state.", error)
        }
    }

    fillUpShapes() {
        this.shapePlaceEles.forEach((place, index) => {
            if (this.shapeInstances[index]) return
            this.createShape(index)
        })
    }

    createSlotPlaceholder(place) {
        if (place.querySelector(".shape-slot-placeholder")) return
        const placeholder = document.createElement("div")
        placeholder.className = "shape shape-slot-placeholder"
        placeholder.setAttribute("aria-hidden", "true")
        placeholder.style.gridTemplateRows = "repeat(6, 1fr)"
        placeholder.style.gridTemplateColumns = "repeat(6, 1fr)"
        place.appendChild(placeholder)
    }

    createShape(index, definitionIndex = null, color = null) {
        this.shapePlaceEles[index].querySelector(".shape-slot-placeholder")?.remove()
        const selectedDefinitionIndex = definitionIndex ?? this.selectShapeDefinition()
        const selectedColor = color ?? this.selectShapeColor()
        const definition = SHAPE_DEFINITIONS[selectedDefinitionIndex]
        const shape = new Shape(this.shapePlaceEles[index], this.abortSignal, definition, selectedColor)
        shape.definitionIndex = selectedDefinitionIndex
        this.shapeInstances[index] = shape
        shape.shapeEle.addEventListener("pointerdown", (event) => this.startDrag(event, index), {
            signal: this.abortSignal,
        })
    }

    selectShapeDefinition() { //Wählt die nächsten Shapes aus
        return Math.floor(Math.random() * SHAPE_DEFINITIONS.length)
    }

    selectShapeColor() {
        return COLORS[Math.floor(Math.random() * COLORS.length)]
    }

    setDragGeometry(element, rect) {
        element.style.setProperty("--drag-left", `${rect.left}px`)
        element.style.setProperty("--drag-top", `${rect.top}px`)
        element.style.setProperty("--drag-width", `${rect.width}px`)
        element.style.setProperty("--drag-height", `${rect.height}px`)
    }

    startDrag(event, index) {
        if (this.gameOver || this.isFillingBoard || this.isResolvingTurn || this.activeDrag || event.button !== 0) return
        const shape = this.shapeInstances[index]
        if (!shape || shape.shapeEle.classList.contains("is-restoring")) return
        event.preventDefault()

        const shapeElement = shape.shapeEle
        const originalRect = shapeElement.getBoundingClientRect()
        const gridSize = shape.definition.length
        const grabbedCell = this.getGrabbedCell(shape, event)
        const grabCol = grabbedCell.col
        const grabRow = grabbedCell.row
        const anchorRatioX = (grabCol + 0.5) / gridSize
        const anchorRatioY = (grabRow + 0.5) / gridSize
        const target = this.getDragMetrics()
        if (!target) return
        const targetSize = target.pitch * gridSize
        const originalPadding = shapeElement.style.padding
        const placeholder = shapeElement.cloneNode(true)
        placeholder.className = "shape shape-slot-placeholder"
        placeholder.setAttribute("aria-hidden", "true")
        shapeElement.parentElement.insertBefore(placeholder, shapeElement)
        this.activeDrag = {
            index,
            shape,
            shapeElement,
            origin: shapeElement.parentElement,
            pointerId: event.pointerId,
            grabCol,
            grabRow,
            anchorRatioX,
            anchorRatioY,
            pointerX: event.clientX,
            pointerY: event.clientY,
            originalRect,
            originalPadding,
            placeholder,
        }

        this.setDragGeometry(shapeElement, originalRect)
        shapeElement.style.setProperty("--drag-padding", originalPadding)
        shapeElement.style.setProperty("--drag-anchor-x", `${anchorRatioX * 100}%`)
        shapeElement.style.setProperty("--drag-anchor-y", `${anchorRatioY * 100}%`)
        shapeElement.style.setProperty("--drag-scale-x", `${originalRect.width / targetSize}`)
        shapeElement.style.setProperty("--drag-scale-y", `${originalRect.height / targetSize}`)
        shapeElement.classList.add("is-dragging")
        document.body.classList.add("noScroll")

        const targetLeft = event.clientX - anchorRatioX * targetSize
        const targetTop = event.clientY - anchorRatioY * targetSize
        this.setDragGeometry(shapeElement, {
            left: targetLeft,
            top: targetTop,
            width: targetSize,
            height: targetSize,
        })
        this.updatePreview(event.clientX, event.clientY)
        requestAnimationFrame(() => {
            if (!this.activeDrag || this.activeDrag.shape !== shape) return
            shapeElement.classList.add("is-scaling-up")
            window.setTimeout(() => {
                if (this.activeDrag?.shape !== shape) return
                shapeElement.style.setProperty("--drag-scale-x", "1")
                shapeElement.style.setProperty("--drag-scale-y", "1")
                shapeElement.classList.remove("is-scaling-up")
                this.moveDrag(this.activeDrag.pointerX, this.activeDrag.pointerY)
            }, 190)
        })
    }

    handlePointerMove = (event) => {
        if (!this.activeDrag || event.pointerId !== this.activeDrag.pointerId) return
        this.moveDrag(event.clientX, event.clientY)
    }

    getGrabbedCell(shape, event) {
        const targetBlock = event.target.closest(".shapeBlock")
        if (targetBlock && shape.shapeEle.contains(targetBlock)) {
            const index = Array.prototype.indexOf.call(shape.shapeEle.children, targetBlock)
            const row = Math.floor(index / shape.definition.length)
            const col = index % shape.definition.length
            if (shape.definition[row][col] === 1) return { row, col }
        }

        let closestCell = null
        let closestDistance = Infinity
        Array.from(shape.shapeEle.children).forEach((block, index) => {
            const row = Math.floor(index / shape.definition.length)
            const col = index % shape.definition.length
            if (shape.definition[row][col] !== 1) return

            const rect = block.getBoundingClientRect()
            const distance = Math.hypot(
                event.clientX - (rect.left + rect.width / 2),
                event.clientY - (rect.top + rect.height / 2),
            )
            if (distance < closestDistance) {
                closestDistance = distance
                closestCell = { row, col }
            }
        })

        return closestCell
    }

    moveDrag(clientX, clientY) {
        const drag = this.activeDrag
        const metrics = this.getDragMetrics()
        if (!drag || !metrics) {
            this.cancelDrag()
            return
        }
        drag.pointerX = clientX
        drag.pointerY = clientY
        const gridSize = drag.shape.definition.length
        const size = metrics.pitch * gridSize
        const left = clientX - drag.anchorRatioX * size
        const top = clientY - drag.anchorRatioY * size
        this.setDragGeometry(drag.shapeElement, { left, top, width: size, height: size })
        this.updatePreview(clientX, clientY)
    }

    updatePreview(clientX, clientY, immediate = false) {
        this.previewPoint = { x: clientX, y: clientY }
        if (immediate) {
            if (this.previewFrame !== null) window.cancelAnimationFrame(this.previewFrame)
            this.previewFrame = null
            this.renderPreview(clientX, clientY)
            return
        }
        if (this.previewFrame !== null) return

        this.previewFrame = window.requestAnimationFrame(() => {
            this.previewFrame = null
            if (this.activeDrag && this.previewPoint) {
                this.renderPreview(this.previewPoint.x, this.previewPoint.y)
            }
        })
    }

    renderPreview(clientX, clientY) {
        this.clearPreview()
        const drag = this.activeDrag
        if (drag) drag.placement = null
        const metrics = this.getDragMetrics()
        if (!drag || !metrics) return

        const anchorCol = Math.round(
            (clientX - metrics.firstCell.left - metrics.firstCell.width / 2) / metrics.pitch,
        ) - drag.grabCol
        const anchorRow = Math.round(
            (clientY - metrics.firstCell.top - metrics.firstCell.height / 2) / metrics.pitch,
        ) - drag.grabRow
        const placement = this.getPlacement(drag.shape.definition, anchorRow, anchorCol)
        if (!placement) return

        const previewBoard = this.boardMatrix.map((row) => row.slice())
        placement.cells.forEach(([row, col]) => {
            previewBoard[row][col] = drag.shape.color
        })
        const lines = this.getCompletedLines(previewBoard)
        const clearingCells = new Set()
        lines.rows.forEach((row) => {
            for (let col = 0; col < BOARD_SIZE; col++) clearingCells.add(`${row}:${col}`)
        })
        lines.cols.forEach((col) => {
            for (let row = 0; row < BOARD_SIZE; row++) clearingCells.add(`${row}:${col}`)
        })

        placement.cells.forEach(([row, col]) => this.showPreviewCell(row, col, drag.shape.color, true))
        clearingCells.forEach((position) => {
            const [row, col] = position.split(":").map(Number)
            this.showPreviewCell(row, col, drag.shape.color, false)
        })
        drag.placement = { row: anchorRow, col: anchorCol }
    }

    showPreviewCell(row, col, color, valid) {
        const cell = this.boardEleMatrix[row][col]
        cell.classList.add("preview")
        cell.classList.toggle("preview-valid", valid)
        cell.classList.toggle("preview-clear", !valid)
        cell.style.setProperty("--preview-color", this.getColorValue(color))
    }

    getColorValue(color) {
        const colors = {
            blue: "rgb(37, 147, 206)",
            gold: "rgb(245, 180, 26)",
            green: "rgb(111, 179, 56)",
            mint: "rgb(63, 206, 186)",
            orange: "rgb(196, 95, 23)",
            pink: "rgb(221, 72, 114)",
            purple: "rgb(99, 56, 136)",
            red: "rgb(180, 15, 31)",
            white: "rgb(229, 231, 230)",
        }
        return colors[color]
    }

    getDragMetrics() {
        const firstCell = this.boardEleMatrix[0][0]
        const nextCell = this.boardEleMatrix[0][1]
        if (!firstCell || !nextCell) return null
        const firstRect = firstCell.getBoundingClientRect()
        const nextRect = nextCell.getBoundingClientRect()
        return { firstCell: firstRect, pitch: nextRect.left - firstRect.left }
    }

    getPlacement(definition, rowOffset, colOffset) {
        const cells = []
        for (let row = 0; row < definition.length; row++) {
            for (let col = 0; col < definition[row].length; col++) {
                if (definition[row][col] !== 1) continue
                const boardRow = rowOffset + row
                const boardCol = colOffset + col
                if (boardRow < 0 || boardRow >= BOARD_SIZE || boardCol < 0 || boardCol >= BOARD_SIZE) return null
                if (this.boardMatrix[boardRow][boardCol] !== null) return null
                cells.push([boardRow, boardCol])
            }
        }
        return cells.length ? { cells } : null
    }

    handlePointerUp = (event) => {
        if (!this.activeDrag || event.pointerId !== this.activeDrag.pointerId) return
        this.moveDrag(event.clientX, event.clientY)
        this.updatePreview(event.clientX, event.clientY, true)
        const drag = this.activeDrag
        if (drag.placement) {
            this.placeShape(drag)
        } else {
            this.cancelDrag()
        }
    }

    handlePointerCancel = (event) => {
        if (this.activeDrag && event.pointerId === this.activeDrag.pointerId) this.cancelDrag()
    }

    handlePointerOut = (event) => {
        if (event.relatedTarget === null && this.activeDrag) this.cancelDrag()
    }

    handleWindowBlur = () => this.cancelDrag()
    handleResize = () => this.cancelDrag()

    clearPreview() {
        if (this.previewFrame !== null) window.cancelAnimationFrame(this.previewFrame)
        this.previewFrame = null
        this.boardEle.querySelectorAll(".preview").forEach((cell) => {
            cell.classList.remove("preview", "preview-valid", "preview-clear")
            cell.style.removeProperty("--preview-color")
        })
    }

    async placeShape(drag) {
        const placement = drag.placement
        if (!placement) {
            this.cancelDrag()
            return
        }
        this.isResolvingTurn = true
        try {
            this.clearPreview()
            const { row, col } = placement
            drag.shape.definition.forEach((shapeRow, shapeRowIndex) => {
                shapeRow.forEach((filled, shapeColIndex) => {
                    if (filled) this.boardMatrix[row + shapeRowIndex][col + shapeColIndex] = drag.shape.color
                })
            })

            this.shapeInstances[drag.index] = null
            drag.shapeElement.remove()
            this.resetDragElement(drag.shapeElement)
            this.activeDrag = null
            document.body.classList.remove("noScroll")

            const completedLines = this.getCompletedLines()
            const lineCells = this.getLineClearCells(completedLines)
            this.addScore(this.calculateTurnScore(drag.shape, completedLines))
            this.renderBoard()
            if (lineCells.length) this.clearCompletedLines(completedLines)

            if (this.shapeInstances.every((shape) => shape === null)) this.fillUpShapes()
            this.saveState()
            if (lineCells.length) {
                await this.animateLineClear(lineCells, completedLines.rows.length + completedLines.cols.length)
                this.renderBoard()
            }
            if (!this.hasAnyValidMove()) this.endGame()
        } finally {
            this.isResolvingTurn = false
        }
    }

    calculateTurnScore(shape, lines) { //Berechnet Score aus platzierter Shape und zerstörten Linien
        const placedBlockPoints = shape.definition.flat().filter(Boolean).length
        const clearedLinePoints = (lines.rows.length + lines.cols.length) * 10
        return placedBlockPoints + clearedLinePoints
    }

    addScore(points) {
        this.score += points
        this.updateHighScore()
    }

    getLineClearCells({ rows, cols }) {
        const clearedCells = new Set()
        rows.forEach((row) => {
            for (let col = 0; col < BOARD_SIZE; col++) clearedCells.add(`${row}:${col}`)
        })
        cols.forEach((col) => {
            for (let row = 0; row < BOARD_SIZE; row++) clearedCells.add(`${row}:${col}`)
        })
        return Array.from(clearedCells, (position) => position.split(":").map(Number))
    }

    clearCompletedLines({ rows, cols }) {
        const clearedCells = this.getLineClearCells({ rows, cols })
        clearedCells.forEach((position) => {
            const [row, col] = position
            this.boardMatrix[row][col] = null
        })
    }

    animateLineClear(cells, lineCount) {
        const center = (BOARD_SIZE - 1) / 2
        const effect = this.chooseLineClearEffect(lineCount)
        if (lineCount >= LEGENDARY_CLEAR_THRESHOLD) this.playEpicClearOverlay(true)
        else if (lineCount >= EPIC_CLEAR_THRESHOLD) this.playEpicClearOverlay()

        return Promise.all(cells.map(([row, col]) => new Promise((resolve) => {
            const cell = this.boardEleMatrix[row][col]
            let fallbackTimer
            const finish = (event) => {
                if (event && event.animationName !== effect.animationName) return
                window.clearTimeout(fallbackTimer)
                cell.removeEventListener("animationend", finish)
                cell.removeEventListener("animationcancel", finish)
                cell.classList.remove(...COLORS)
                cell.classList.remove("line-clearing", effect.className)
                cell.style.removeProperty("--line-clear-delay")
                resolve()
            }
            const distance = Math.abs(row - center) + Math.abs(col - center)
            const delay = effect === LEGENDARY_CLEAR_EFFECT
                ? Math.round(distance * 18)
                : effect === EPIC_CLEAR_EFFECT
                    ? Math.round(distance * 4)
                    : Math.round(distance * 10)
            cell.style.setProperty("--line-clear-delay", `${delay}ms`)
            cell.addEventListener("animationend", finish)
            cell.addEventListener("animationcancel", finish)
            cell.classList.add("line-clearing", effect.className)
            const animationTimeout = effect === LEGENDARY_CLEAR_EFFECT
                ? 2400
                : effect === QUICK_LEGENDARY_CLEAR_EFFECT ? 1200 : 900
            fallbackTimer = window.setTimeout(() => finish(), animationTimeout)
        })))
    }

    chooseLineClearEffect(lineCount) {
        if (lineCount >= LEGENDARY_CLEAR_THRESHOLD) return LEGENDARY_CLEAR_EFFECT
        if (lineCount >= EPIC_CLEAR_THRESHOLD) return EPIC_CLEAR_EFFECT

        const availableIndexes = LINE_CLEAR_EFFECTS
            .map((_, index) => index)
            .filter((index) => index !== this.lastLineClearEffectIndex)
        const effectIndex = availableIndexes[Math.floor(Math.random() * availableIndexes.length)]
        this.lastLineClearEffectIndex = effectIndex
        return LINE_CLEAR_EFFECTS[effectIndex]
    }

    playEpicClearOverlay(isLegendary = false) {
        this.clearEpicClearOverlay()
        const palette = EPIC_CLEAR_PALETTES[Math.floor(Math.random() * EPIC_CLEAR_PALETTES.length)]
        const messages = isLegendary ? LEGENDARY_CLEAR_MESSAGES : EPIC_CLEAR_MESSAGES
        const message = messages[Math.floor(Math.random() * messages.length)]
        const overlay = document.createElement("div")
        overlay.className = `epic-clear-overlay${isLegendary ? " legendary-clear" : ""}`
        overlay.style.setProperty("--epic-primary", palette.primary)
        overlay.style.setProperty("--epic-secondary", palette.secondary)
        const title = document.createElement("div")
        title.className = "epic-clear-message"
        title.textContent = message
        overlay.appendChild(title)
        this.container.appendChild(overlay)
        this.epicClearOverlay = overlay
        this.boardEle.classList.add("epic-clear")
        this.epicClearTimer = window.setTimeout(() => {
            this.clearEpicClearOverlay()
            this.epicClearTimer = null
        }, (isLegendary ? LEGENDARY_CLEAR_DURATION : EPIC_CLEAR_DURATION) + OVERLAY_CLEANUP_DELAY)
    }

    clearEpicClearOverlay() {
        if (this.epicClearTimer !== null) window.clearTimeout(this.epicClearTimer)
        this.epicClearTimer = null
        this.epicClearOverlay?.remove()
        this.epicClearOverlay = null
        this.boardEle.classList.remove("epic-clear")
    }

    getCompletedLines(board = this.boardMatrix) {
        return {
            rows: board
                .map((row, index) => row.every((cell) => cell !== null) ? index : -1)
                .filter((index) => index >= 0),
            cols: Array.from({ length: BOARD_SIZE }, (_, col) => col)
                .filter((col) => board.every((row) => row[col] !== null)),
        }
    }

    hasAnyValidMove() {
        for (const shape of this.shapeInstances) {
            if (!shape) continue
            for (let rowOffset = 1 - shape.definition.length; rowOffset < BOARD_SIZE; rowOffset++) {
                for (let colOffset = 1 - shape.definition[0].length; colOffset < BOARD_SIZE; colOffset++) {
                    if (this.getPlacement(shape.definition, rowOffset, colOffset)) return true
                }
            }
        }
        return false
    }

    endGame() {
        this.gameOver = true
        this.shapePlaceEles.forEach((place) => place.classList.add("game-over"))
        this.shapeInstances.forEach((shape) => {
            if (shape) shape.shapeEle.classList.add("disabled")
        })
        this.saveState()
        this.fillLostBoard()
    }

    fillLostBoard() {
        const emptyPositions = []
        this.boardMatrix.forEach((row, rowIndex) => {
            row.forEach((color, colIndex) => {
                if (color === null) emptyPositions.push([rowIndex, colIndex])
            })
        })
        this.isFillingBoard = emptyPositions.length > 0

        emptyPositions.forEach(([row, col], index) => {
            const timer = window.setTimeout(() => {
                this.fillingTimers.delete(timer)
                const color = COLORS[Math.floor(Math.random() * COLORS.length)]
                this.boardMatrix[row][col] = color
                const cell = this.boardEleMatrix[row][col]
                cell.classList.add(color, "loss-fill")
                if (index === emptyPositions.length - 1) {
                    this.isFillingBoard = false
                    this.saveState()
                }
            }, index * 24)
            this.fillingTimers.add(timer)
        })
        if (emptyPositions.length === 0) this.saveState()
    }

    handleBoardClick = () => {
        if (!this.gameOver || this.isFillingBoard) return
        this.resetGame()
    }

    resetGame() {
        this.gameOver = false
        this.score = 0
        this.boardMatrix = EMPTY_BOARD()
        this.shapeInstances.forEach((shape) => {
            if (shape) shape.shapeEle.remove()
        })
        this.shapeInstances = [null, null, null]
        this.shapePlaceEles.forEach((place) => place.classList.remove("game-over"))
        this.boardEleMatrix.flat().forEach((cell) => cell.classList.remove("loss-fill"))
        this.renderBoard()
        this.updateScoreDisplay()
        this.fillUpShapes()
        this.saveState()
    }

    cancelDrag(animate = true) {
        const drag = this.activeDrag
        if (!drag) return
        this.clearPreview()
        this.activeDrag = null
        document.body.classList.remove("noScroll")
        if (animate) {
            this.restoreShape(drag)
        } else {
            drag.placeholder.remove()
            this.resetDragElement(drag.shapeElement)
        }
    }

    restoreShape(drag) {
        const element = drag.shapeElement
        const originRect = drag.origin.getBoundingClientRect()
        element.classList.remove("is-dragging", "is-scaling-up")
        element.classList.add("is-restoring")
        element.style.setProperty("--drag-padding", drag.originalPadding)
        this.setDragGeometry(element, originRect)
        const timer = window.setTimeout(() => {
            this.restoreTimers.delete(timer)
            this.resetDragElement(element)
            element.classList.remove("is-restoring")
            drag.placeholder.remove()
        }, RESTORE_DURATION)
        this.restoreTimers.add(timer)
    }

    resetDragElement(element) {
        element.classList.remove("is-dragging", "is-scaling-up", "is-restoring")
        const dragProperties = [
            "--drag-left",
            "--drag-top",
            "--drag-width",
            "--drag-height",
            "--drag-padding",
            "--drag-anchor-x",
            "--drag-anchor-y",
            "--drag-scale-x",
            "--drag-scale-y",
        ]
        dragProperties.forEach((property) => element.style.removeProperty(property))
    }

    updateHighScore() {
        const previousHighScore = this.highScore
        this.highScore = Math.max(this.highScore, this.score)
        const displayedScore = Number.parseInt(this.scoreEle.textContent, 10) || 0
        this.animateCounter(this.scoreEle, displayedScore, this.score)
        if (this.highScore !== previousHighScore) {
            this.animateCounter(this.highScoreValEle, previousHighScore, this.highScore)
        }
    }

    updateScoreDisplay() {
        this.counterTimers.forEach((timer) => window.clearTimeout(timer))
        this.counterTimers.clear()
        this.scoreEle.textContent = this.score
        this.highScoreValEle.textContent = this.highScore
    }

    animateCounter(element, from, to) {
        const previousTimer = this.counterTimers.get(element)
        if (previousTimer !== undefined) window.clearTimeout(previousTimer)
        if (from === to || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            element.textContent = to
            this.counterTimers.delete(element)
            return
        }

        const direction = Math.sign(to - from)
        const stepDuration = Math.max(16, Math.min(140, 420 / Math.abs(to - from)))
        const update = () => {
            from += direction
            element.textContent = from
            if (from === to) {
                this.counterTimers.delete(element)
                return
            }
            this.counterTimers.set(element, window.setTimeout(update, stepDuration))
        }
        this.counterTimers.set(element, window.setTimeout(update, stepDuration))
    }

    renderBoard() {
        this.boardMatrix.forEach((row, rowIndex) => {
            row.forEach((color, colIndex) => {
                const cell = this.boardEleMatrix[rowIndex][colIndex]
                cell.classList.remove(...COLORS, "preview", "preview-valid", "preview-clear", "loss-fill", "line-clearing")
                cell.style.removeProperty("--preview-color")
                cell.style.removeProperty("--line-clear-delay")
                if (color) cell.classList.add(color)
            })
        })
    }

    syncHighScore() {
        this.highScore = Math.max(this.highScore, this.score)
        this.updateScoreDisplay()
    }
}