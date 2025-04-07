import actionTypes from "../actionTypes";
export const openPromotion = (moveData) => {
  return {
    type: actionTypes.OPEN_PROMOTION,
    payload: moveData, // Pass all move data for promotion completion
  };
};
export const closePromotionBox = () => {
  return {
    type: actionTypes.CLOSE_PROMOTION,
  };
};
