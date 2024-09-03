import actionTypes from "./actionTypes";

export const reducer = (state, action) => {
  switch (action.type) {
    case actionTypes.NEW_MOVE: {
      let { turn, position } = state;

      turn = turn === "W" ? "B" : "W";

      position = [...position, action.payload.newPosition];
      return {
        ...state,
        turn,
        position,
      };
    }
    default:
      return state;
  }
};
