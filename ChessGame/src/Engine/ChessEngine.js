import { createPosition } from "../helper.js";
// choose a random chess coin

export const initEngine = () => {
  const boardstate = createPosition();
  return { position: boardstate, piece: "pB", rank: 3, file: 4, x: 4, y: 5 };
};
