import React from 'react';
import { useAppContext } from '../../contexts/Context';
import { setPlayerColor } from '../../reducer/actions/game';
import './ColorSelection.css';

/**
 * Component for selecting which color to play as (white or black)
 */
const ColorSelection = () => {
  const { appState, dispatch } = useAppContext();
  
  // Only show the color selection at the very beginning of the game
  // Hide it once a color has been selected
  if (appState.colorSelected) {
    return null;
  }
  
  const handleColorSelect = (color) => {
    console.log("Color selected:", color);
    // Dispatch action to set player color
    dispatch(setPlayerColor(color));
  };
  
  return (
    <div className="color-selection-overlay">
      <div className="color-selection-container">
        <h2>Choose Your Color</h2>
        <div className="color-options">
          <div 
            className="color-option white" 
            onClick={() => handleColorSelect('W')}
          >
            <div className="piece kW"></div>
            <p>Play as White</p>
            <small>You go first</small>
          </div>
          <div 
            className="color-option black" 
            onClick={() => handleColorSelect('B')}
          >
            <div className="piece kB"></div>
            <p>Play as Black</p>
            <small>Computer goes first</small>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColorSelection;
