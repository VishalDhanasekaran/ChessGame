import actionTypes from "../actionTypes";

export const makeNewMove = ({ newPosition }) => {
  console.log("NEWPOSITIONATMAKENEWMOVE", newPosition);
  return {
    type: actionTypes.NEW_MOVE,
    payload: { newPosition },
  };
};
