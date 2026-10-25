import Game  from './game'

export default function init(container) { //container: äußerster wrapper fürs game
  const game = new Game(container)
  game.init()
  return game.cleanup //cleanup func für infinite loops, global event listeners weil react die seite nie neulädt
}