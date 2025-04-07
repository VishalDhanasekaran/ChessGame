import actionTypes from "../actionTypes";
export const makeNewMove = (move) => {
    return {
        type: actionTypes.NEW_MOVE,
        payload: {
            ...move,
            // Explicitly preserve capture flag
            capture: !!move.capture
        },
    }
}

export const generateCandidateMoves = (candidateMoves) => {
  return {
    type: actionTypes.GENERATE_CANDIDATE_MOVES,
    payload: { candidateMoves },
  };
};
export const clearCandidateMoves = (candidateMoves) => {
  return {
    type: actionTypes.CLEAR_CANDIDATE_MOVES,
  };
};

export const takeBack = () => {
    return {
            type: actionTypes.TAKE_BACK
           };
};
