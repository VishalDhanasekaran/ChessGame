import { Status } from "../constant";
import actionTypes from "./actionTypes";

export const reducer = (state, action) => {
  switch (action.type) {
    case actionTypes.NEW_MOVE: {
      let { turn, position, movesList } = state;

      turn = turn === "W" ? "B" : "W";

      position = [...position, action.payload.newPosition];
      movesList = [...movesList, action.payload.newMove];
      return { ...state, position, movesList, turn };
    }

    case actionTypes.GENERATE_CANDIDATE_MOVES: {
      return { ...state, candidateMoves: action.payload.candidateMoves };
    }
    /* Undo a move */
    case actionTypes.TAKE_BACK: {
      let { turn, position, movesList } = state;

      console.log(position.length, movesList.length);
      if (position.length > 1) {
        position = position.slice(0, position.length - 2);
        movesList = movesList.slice(0, movesList.length - 2);
        turn = turn === "W" ? "W" : "B";
      }
      console.log(position.length, movesList.length);

      return { ...state, turn, position, movesList };
    }

    case actionTypes.CLEAR_CANDIDATE_MOVES: {
      return { ...state, candidateMoves: [] };
    }
    case actionTypes.OPEN_PROMOTION: {
      return {
        ...state,
        status: Status.promoting,
        promotionSquare: { ...action.payload },
      };
    }

    case actionTypes.CLOSE_PROMOTION: {
      return { ...state, status: Status.ongoing, promotionSquare: null };
    }

    case actionTypes.CAN_CASTLE: {
      let { turn, castleDirection } = state;
      castleDirection[turn] = action.payload;
      return { ...state, castleDirection };
    }
    case actionTypes.STALEMATE: {
      return { ...state, status: Status.stalemate };
    }

    case actionTypes.INSUFFICIENT_MATERIAL: {
      return { ...state, status: Status.insufficient };
    }

    case actionTypes.WIN: {
      return {
        ...state,
        status: action.payload === "W" ? Status.white : Status.black,
      };
    }

    case actionTypes.NEW_GAME: {
      return { ...action.payload };
    }
    default:
      return state;
  }
};
