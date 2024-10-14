import actionTypes from "../actionTypes";
export const openPromotion = ({ x, y, rank, file }) => {
  return {
    type: actionTypes.OPEN_PROMOTION,
    payload: { x, y, rank, file },
  };
};
export const closePromotionBox = () => {
  return {
    type: actionTypes.CLOSE_PROMOTION,
  };
};
