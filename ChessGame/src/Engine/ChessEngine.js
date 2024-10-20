import { Chess } from "./chess.js";
var game = new Chess();
export const recordMove = (from, to) => {
  game.move({ from: from, to: to });
  console.log(game.ascii());
};
