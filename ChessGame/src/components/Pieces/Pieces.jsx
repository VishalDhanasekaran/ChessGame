import "./Pieces.css";
import Piece from "./Piece.jsx";
import { useRef, useEffect , useState } from "react"; // Removed useState
import { useAppContext } from "../../contexts/Context.js";
import { PIECES, pieceSymbols, ONE, ZERO, bitScanForward, toSquareIndex, RANK_1, RANK_8 } from '../../bitboard.js'; // Import bitboard constants/utils
import {
  clearCandidateMoves,
  makeNewMove,
  generateCandidateMoves
} from "../../reducer/actions/move.js";
import arbiter from "../../arbiter/arbiter.js";
import { openPromotion } from "../../reducer/actions/popup.js";

export default function Pieces({ automateCallBack, boardFlipped }) {
  const ref = useRef();
  const [boardSize, setBoardSize] = useState(0);
  const { appState, dispatch } = useAppContext();
  // Get state directly from the latest history entry for board rendering
  const latestState = appState.history[appState.history.length - 1];
  const { bitboards } = latestState || {}; // Only need bitboards from history here
  // Get turn and candidateMoves directly from the top-level appState
  const { turn, candidateMoves } = appState;
  
  // Log for debugging
  console.log("Pieces.jsx - Rendering with boardFlipped:", boardFlipped);
  
  // Measure the board size once it's mounted
  useEffect(() => {
    if (ref.current) {
      const { width } = ref.current.getBoundingClientRect();
      setBoardSize(width);
      console.log("Board size measured:", width);
    }
  }, []);

  // Helper to calculate square index from drop coordinates
  const getSquareIndexFromCoords = (e) => {
    if (!ref.current) return null;
    const { width, left, top } = ref.current.getBoundingClientRect();
    const size = width / 8;
    
    // Calculate visual position (0-7, 0-7) based on mouse coordinates
    let visualFile = Math.floor((e.clientX - left) / size); // 0..7
    let visualRank = Math.floor((e.clientY - top) / size); // 0..7
    
    console.log(`Drop coordinates: visual (${visualFile},${visualRank})`);
    
    // Convert visual position to logical position based on board orientation
    let rank, file;
    if (boardFlipped) {
      // When playing as black: visual (0,0) is logical (0,7)
      // Bottom-left corner is a1 for black's perspective
      rank = visualRank;
      file = 7 - visualFile;
    } else {
      // When playing as white: visual (0,0) is logical (7,0)
      // Top-left corner is a8 for white's perspective
      rank = 7 - visualRank;
      file = visualFile;
    }
    
    console.log(`Converted to logical position: (${file},${rank}), index: ${rank * 8 + file}`);
    
    if (rank < 0 || rank > 7 || file < 0 || file > 7) return null; // Outside board
    return rank * 8 + file; // Square index 0..63
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const toSq = getSquareIndexFromCoords(e);
    if (toSq === null) {
        dispatch(clearCandidateMoves());
        return;
    }

    const transferData = e.dataTransfer.getData("text");
    if (!transferData) {
        console.error("Drag data missing!");
        dispatch(clearCandidateMoves());
        return;
    }

    const [pieceTypeStr, fromSqStr] = transferData.split(",");
    const fromSq = parseInt(fromSqStr);
    const pieceType = parseInt(pieceTypeStr); // Piece type from PIECES enum
    
    console.log(`Attempting to move piece from ${fromSq} to ${toSq}, pieceType: ${pieceType}`);
    
    // Check if it's the right player's turn
    // White pieces have pieceType from 1 to 6
    // Black pieces have pieceType from 7 to 12
    const pieceIsWhite = pieceType >= 1 && pieceType <= 6;
    const pieceIsBlack = pieceType >= 7 && pieceType <= 12;
    const isPlayersTurn = (turn === 'W' && pieceIsWhite) || (turn === 'B' && pieceIsBlack);
    
    console.log(`Dragged piece: ${pieceType}, isWhite: ${pieceIsWhite}, isBlack: ${pieceIsBlack}, turn: ${turn}, canMove: ${isPlayersTurn}`);
    
    if (!isPlayersTurn) {
        console.log(`Cannot move ${pieceIsWhite ? 'white' : 'black'} piece when it's ${turn}'s turn`);
        dispatch(clearCandidateMoves());
        return;
    }

    // Find the move in candidate moves
    const move = candidateMoves.find(m => m.from === fromSq && m.to === toSq);
    console.log("Candidate moves:", candidateMoves);
    console.log("Found move:", move);

    if (move && typeof move === 'object' && move.from !== undefined && move.to !== undefined && move.piece !== undefined) {
      const isPromotion =
        (pieceType === PIECES.wP && (toSq >= 56)) || // Rank 8
        (pieceType === PIECES.bP && (toSq <= 7));   // Rank 1

      // Check if this is a capture move
      const toBB = ONE << BigInt(toSq);
      const isCapture = Object.entries(bitboards).some(([pieceType, bb]) => {
        if (pieceType === PIECES.EMPTY.toString()) return false;
        return (BigInt(bb) & toBB) !== 0n;
      });

      // Check for en passant capture
      const isPawnDiagonalMove = (pieceType === PIECES.wP || pieceType === PIECES.bP) && 
                                Math.abs(fromSq % 8 - toSq % 8) === 1;
      const isEnPassantCapture = latestState.enPassantTargetSq === toSq && isPawnDiagonalMove;

      if (isPromotion) {
        console.log('Opening promotion popup with data:', {
          from: fromSq,
          to: toSq,
          piece: pieceType
        });
        
        // Open promotion popup, passing necessary move info for later completion
        dispatch(openPromotion({
          from: fromSq,
          to: toSq,
          piece: pieceType,
          capture: isCapture || isEnPassantCapture,
          enPassant: isEnPassantCapture
        }));
      } else {
        // Ensure move object is properly structured before dispatch
        const structuredMove = {
          from: move.from,
          to: move.to,
          piece: move.piece,
          capture: isCapture || isEnPassantCapture,
          enPassant: isEnPassantCapture
        };
        console.log("Dispatching makeNewMove with move:", structuredMove, 
                   "isCapture=", isCapture, 
                   "isEnPassantCapture=", isEnPassantCapture); 
        dispatch(makeNewMove(structuredMove));
      }
    } else {
      console.log("Invalid move attempted:", { fromSq, toSq, pieceType });
      console.log("Available candidate moves:", candidateMoves);
    }

    dispatch(clearCandidateMoves());
  };

  const handleDragOver = (e) => {
    e.preventDefault(); // Necessary to allow drop
  };

  // --- Render Pieces from Bitboards ---
  // Handle piece click to show candidate moves
  const handlePieceClick = (squareIndex, pieceType) => {
    // Log the piece type for debugging
    console.log(`Clicked piece at square ${squareIndex}, pieceType: ${pieceType}, PIECES.wP: ${PIECES.wP}, PIECES.wK: ${PIECES.wK}`);
    
    // Only allow clicking pieces of the current player's turn
    // White pieces have pieceType from 1 to 6
    // Black pieces have pieceType from 7 to 12
    const pieceIsWhite = pieceType >= 1 && pieceType <= 6;
    const pieceIsBlack = pieceType >= 7 && pieceType <= 12;
    const pieceColor = pieceIsWhite ? 'W' : 'B';
    
    console.log(`Piece color detected: ${pieceColor}, Current turn: ${turn}, Can move: ${(turn === 'W' && pieceIsWhite) || (turn === 'B' && pieceIsBlack)}`);
    
    // Check if it's this piece's turn to move
    if ((turn === 'W' && !pieceIsWhite) || (turn === 'B' && !pieceIsBlack)) {
      console.log(`Cannot move ${pieceColor} piece when it's ${turn}'s turn`);
      dispatch(clearCandidateMoves()); // Clear any existing candidate moves
      return;
    }
    
    console.log(`Getting valid moves for ${pieceColor} piece at square ${squareIndex}...`);
    
    // Get valid moves for the clicked piece
    const validMoves = arbiter.getValidMoves(squareIndex, latestState);
    console.log(`Valid moves for piece at ${squareIndex}:`, validMoves);
    
    // Dispatch the candidate moves to update the UI
    dispatch(generateCandidateMoves(validMoves));
  };
  
  const piecesToRender = [];

  if (bitboards && boardSize > 0) { // Check if bitboards exist and board size is measured
      const squareSize = boardSize / 8; // Calculate the size of each square
      
      for (const pieceEnum in PIECES) {
          const pieceType = PIECES[pieceEnum];
          if (pieceType === PIECES.EMPTY) continue;

          let bb = bitboards[pieceType];
          while (bb > 0n) {
              const squareIndex = bitScanForward(bb);
              const rank = Math.floor(squareIndex / 8); // 0-7, 0 is the 8th rank (top)
              const file = squareIndex % 8; // 0-7, 0 is the a-file (left)
              
              // We'll use the position class to position the pieces
              // This works with the CSS transforms in Board.css
              const positionClass = `p-${file}${rank}`;
              
              // For debugging
              if (pieceType === PIECES.wK || pieceType === PIECES.bK) {
                  console.log(`King at (${file},${rank}), pieceType: ${pieceType}, boardFlipped: ${boardFlipped}`);
              }
              
              // Calculate absolute position in pixels based on board orientation
              // When playing as white, white pieces should be at the bottom
              // When playing as black, black pieces should be at the bottom
              let left, top;
              
              if (boardFlipped) {
                  // For black's perspective
                  left = (7 - file) * squareSize;
                  top = rank * squareSize;
              } else {
                  // For white's perspective
                  left = file * squareSize;
                  top = (7 - rank) * squareSize;
              }
              
              const style = {
                  position: 'absolute',
                  left: `${left}px`,
                  top: `${top}px`,
                  width: `${squareSize}px`,
                  height: `${squareSize}px`,
                  backgroundSize: 'contain',
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'center',
                  // No need for backgroundImage here as we're using CSS classes
                  zIndex: 10, // Ensure pieces are above the board
              };
              
              // Determine if this piece can be moved based on turn and piece color
              // White pieces have pieceType from 1 to 6
              // Black pieces have pieceType from 7 to 12
              const pieceIsWhite = pieceType >= 1 && pieceType <= 6;
              const pieceIsBlack = pieceType >= 7 && pieceType <= 12;
              const canMove = (turn === 'W' && pieceIsWhite) || (turn === 'B' && pieceIsBlack);
              
              // Log for debugging
              console.log(`Rendering piece at ${squareIndex} (${file},${rank}): ${pieceSymbols[pieceType]}`);
              console.log(`Piece type: ${pieceType}, isWhite: ${pieceIsWhite}, isBlack: ${pieceIsBlack}, turn: ${turn}, canMove: ${canMove}`);
              
              // Additional debug info for move validation
              if (canMove) {
                  console.log(`This piece (${pieceSymbols[pieceType]}) can be moved because it's ${turn}'s turn`);
              } else {
                  console.log(`This piece (${pieceSymbols[pieceType]}) cannot be moved because it's ${turn}'s turn`);
              }
              
              piecesToRender.push(
                  <div 
                      key={`${pieceType}-${squareIndex}`}
                      className={`piece ${pieceSymbols[pieceType]}`}
                      style={style}
                      draggable={canMove}
                      onDragStart={(e) => {
                          e.dataTransfer.effectAllowed = "move";
                          e.dataTransfer.setData("text/plain", `${pieceType},${squareIndex}`);
                          setTimeout(() => {
                              e.target.style.display = "none";
                          }, 0);
                          
                          // Only get valid moves if this piece can move
                          if (canMove) {
                              console.log(`Getting valid moves for ${pieceSymbols[pieceType]} at ${squareIndex}`);
                              const validMoves = arbiter.getValidMoves(squareIndex, latestState);
                              dispatch(generateCandidateMoves(validMoves));
                          } else {
                              dispatch(clearCandidateMoves());
                          }
                      }}
                      onDragEnd={(e) => {
                          e.target.style.display = "block";
                      }}
                      onClick={() => {
                          if (canMove) {
                              handlePieceClick(squareIndex, pieceType);
                          } else {
                              console.log(`Cannot move ${pieceSymbols[pieceType]} at ${squareIndex} - not your turn`);
                              dispatch(clearCandidateMoves());
                          }
                      }}
                  />
              );
              bb &= bb - 1n; // Clear the least significant bit
          }
      }
  }

  return (
    <div onDrop={handleDrop} onDragOver={handleDragOver} className="pieces" ref={ref}>
      {piecesToRender}
    </div>
  );
}
