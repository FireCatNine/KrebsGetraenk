const board= document.getElementById("board");
  for (let i= 0; i< 64; i++) {
    const cell= document.createElement("div");
    cell.className= "cell";
    board.appendChild(cell);
  }