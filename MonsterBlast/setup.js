import { Shape } from "./game/shape.js";

const board= document.getElementById("board");
const boardMatrix= Array.from({ length: 8 }, ()=> Array(8).fill(0));

//Spielfeld
for (let i= 0; i< 64; i++){
  const cell= document.createElement("div");
  cell.className= "cell";
  const col= i% 8;
  const row= Math.floor(i/ 8);
  cell.dataset.col= col;
  cell.dataset.row= row;
  board.appendChild(cell);
}


//Biilder

const blockImages= [
  "img/white.png",
  "img/gruen.png"
];



function generateRandomShape(){
  const randomIndex= Math.floor(Math.random()* Shape.DEFINITIONS.length);
  const cells= Shape.DEFINITIONS[randomIndex];
  const randomImage= blockImages[Math.floor(Math.random()* blockImages.length)];
  return new Shape(cells, randomImage);
}