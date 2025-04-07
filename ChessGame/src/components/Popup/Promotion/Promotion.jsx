import "./Promotion.css";
import "./../Popup.css";
import { useAppContext } from "../../../contexts/Context";
import { PIECES } from "../../../bitboard";
import {
  clearCandidateMoves,
  makeNewMove,
} from "../../../reducer/actions/move";
import { closePromotionBox } from "../../../reducer/actions/popup";

const Promotion = ({ onClosePopup, callback }) => {
  const options = ["q", "r", "b", "n"];
  const { appState, dispatch } = useAppContext();
  const { promotionSquare } = appState;
  
  if (!promotionSquare) {
    return null;
  }

  console.log('Promotion data:', promotionSquare);
  
  // Determine the color based on the piece type (PIECES enum)
  // PIECES.wP = 0, PIECES.bP = 6
  const isPieceWhite = promotionSquare.piece < 6;
  const color = isPieceWhite ? "W" : "B";
  
  // Calculate position for the promotion popup
  const determinePromotionBoxPosition = () => {
    const style = {};
    const file = promotionSquare.to % 8;
    const rank = Math.floor(promotionSquare.to / 8);
    
    // Position based on rank (row)
    if (rank === 7) { // White promoting
      style.top = "87.5%";
    } else if (rank === 0) { // Black promoting
      style.top = "12.5%";
    } else {
      style.top = "50%";
    }
    
    // Position based on file (column)
    if (file <= 1) {
      style.left = "0%";
    } else if (file >= 6) {
      style.right = "0%";
    } else {
      style.left = `${12.5 * file - 20}%`;
    }
    
    return style;
  };

  // Handle promotion piece selection
  const applySelection = (option) => () => {
    if (onClosePopup) {
      onClosePopup();
    }
    
    // Map the selected option to the corresponding piece type
    let promotionPieceType;
    if (isPieceWhite) {
      // White pieces
      switch (option) {
        case 'q': promotionPieceType = PIECES.wQ; break;
        case 'r': promotionPieceType = PIECES.wR; break;
        case 'b': promotionPieceType = PIECES.wB; break;
        case 'n': promotionPieceType = PIECES.wN; break;
        default: promotionPieceType = PIECES.wQ;
      }
    } else {
      // Black pieces
      switch (option) {
        case 'q': promotionPieceType = PIECES.bQ; break;
        case 'r': promotionPieceType = PIECES.bR; break;
        case 'b': promotionPieceType = PIECES.bB; break;
        case 'n': promotionPieceType = PIECES.bN; break;
        default: promotionPieceType = PIECES.bQ;
      }
    }
    
    // Create the move object with the promotion piece
    const moveObject = {
      from: promotionSquare.from,
      to: promotionSquare.to,
      piece: promotionSquare.piece,
      promotion: promotionPieceType,
      capture: promotionSquare.capture || false,
      enPassant: promotionSquare.enPassant || false,
      castle: null
    };
    
    console.log('Dispatching promotion move:', moveObject);
    
    // Dispatch the move with the selected promotion piece
    dispatch(makeNewMove(moveObject));
    dispatch(clearCandidateMoves());
    
    if (callback) {
      callback();
    }
  };
  
  return (
    <div
      className="popup--inner promotion-choices"
      style={determinePromotionBoxPosition()}
    >
      {options.map((option) => (
        <div
          className={`piece ${option}${color}`}
          onClick={applySelection(option)}
          key={option}
        />
      ))}
    </div>
  );
};

export default Promotion;
