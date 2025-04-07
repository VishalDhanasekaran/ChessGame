import actionTypes from "../actionTypes";

/**
 * Sets the player's color (white or black)
 * @param {string} color - The player's color ('W' for white, 'B' for black)
 * @returns {Object} - Action object
 */
export const setPlayerColor = (color) => {
  return {
    type: actionTypes.SET_PLAYER_COLOR,
    payload: { playerColor: color }
  };
};

/**
 * Starts a new game
 * @returns {Object} - Action object
 */
export const newGame = () => {
  return {
    type: actionTypes.NEW_GAME
  };
};
