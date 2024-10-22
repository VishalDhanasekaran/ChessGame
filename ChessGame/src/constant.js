import { createPosition } from "./helper";
export const Status = {
  ongoing: "Ongoing",
  promoting: "Promoting",
  white: "White is  victorious",
  black: "Black is victorious",
};
export const initGameState = {
  position: [createPosition()],
  turn: "W",
  candidateMoves: [],

  can_automate: false,
  status: Status.ongoing,
  promotionSquare: null,
  castleDirection: {
    W: "both",
    B: "both",
  },
};
