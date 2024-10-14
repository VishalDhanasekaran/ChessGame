import { Status } from "../constant";
import actionTypes from "./actionTypes";

export const reducer = (state, action) => {
  switch (action.type) {
    case actionTypes.NEW_MOVE: {
      let { turn, position } = state;

      turn = turn === "W" ? "B" : "W";

      console.log(
        "turn: ",
        turn,
        "oldie",
        position,
        "newie",
        action.payload.newPosition,
      );
      position = [...position, action.payload.newPosition];
      return {
        ...state,
        turn,
        position,
      };
    }
    case actionTypes.GENERATE_CANDIDATE_MOVES: {
      return {
        ...state,
        candidateMoves: action.payload.candidateMoves,
      };
    }
    case actionTypes.CLEAR_CANDIDATE_MOVES: {
      return {
        ...state,
        candidateMoves: [],
      };
    }
    case actionTypes.OPEN_PROMOTION: {
      return {
        ...state,
        status: Status.promoting,
        promotionSquare: { ...action.payload },
      };
    }
    case actionTypes.CLOSE_PROMOTION: {
      return {
        ...state,
        status: Status.ongoing,
        promotionSquare: null,
      };
    }
    default:
      return state;
  }
};
