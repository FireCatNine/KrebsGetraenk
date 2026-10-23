import { SHAPE_DEFINITIONS } from "./shape_definitions.js";

export class Shape {
  static SIZE= 6;
  static DEFINITIONS= SHAPE_DEFINITIONS;

  
  cells;
  image;

  constructor(cells, image) {
    this.cells= cells;
    this.image= image;
  }

  draw(ctx, cellSize, offsetX= 0, offsetY= 0) {
    const size= this.cells.length;
    for (let i= 0; i< size; i++) {
      for (let j= 0; j< size; j++) {
        if (this.cells[i][j]=== 1) {
          ctx.fillStyle= this.image;
          ctx.fillRect(
            (this.x+ j+ offsetX)* cellSize, (this.y+ i+ offsetY)* cellSize, cellSize, cellSize
          );
          ctx.strokeStyle= '#000';
          ctx.strokeRect(
            (this.x+ j+ offsetX)* cellSize, (this.y+ i+ offsetY)* cellSize, cellSize, cellSize
          );
        }
      }
    }
  }
  
}