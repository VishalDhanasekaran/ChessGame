import { createPosition } from "./helper";
export const Status = {
  ongoing: "Ongoing",
  promoting: "Promoting",
  white: "White is  wins",
  black: "Black is wins",
  stalemate : 'Game draws due to stalemate',
  insufficient : 'Game draws due to insufficient material', 
};
export const initGameState = {
  position: [createPosition()],
  turn: "W",
  candidateMoves: [],

  status: Status.ongoing,
  promotionSquare: null,
  castleDirection: {
    W: "both",
    B: "both",
  },
};
