"use strict";
// Kann weg!; zeigt Fehler besser auf

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

  get rows(){
    return this.cells.filter(row => row.some(cell=> cell!== 0)).length;
  }
  get  cols(){
  //What dda Kanpfheli
  }

}