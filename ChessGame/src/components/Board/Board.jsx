import "./Board.css";
import Files from "./../Bits/Files";
import Ranks from "../Bits/Ranks";
import Pieces from "../Pieces/Pieces";
import { useAppContext } from "../../contexts/Context";
import Popup from "../Popup/Popup";
import arbiter from "../../arbiter/arbiter";
// Removed: import { getKingPosition } from "../../arbiter/getMoves";
// Removed: import { copyPosition } from "../../helper";
import { PIECES, bitScanForward, ONE } from '../../bitboard'; // Import bitboard helpers
import Promotion from "../Popup/Promotion/Promotion";
import GameEnds from "../Popup/GameEnds/GameEnds";
import { useEffect, useState } from "react";
import { evaluateBoard, makeAutomatedMove } from "../../Engine/ChessEngine";

const Board = () => {
  console.log("--- Board Component Render Start ---"); // Log start
  const [shouldAutomate, setShouldAutomate] = useState(false);
  const ranks = Array(8)
    .fill()
    .map((x, i) => 8 - i);
  const files = Array(8)
    .fill()
    .map((x, i) => i + 1);

  const { appState, dispatch } = useAppContext();
  console.log("Board.jsx - appState received:", appState); // Log received state
  // Get state directly from the latest history entry
  const latestState = appState.history[appState.history.length - 1];
  console.log("Board.jsx - latestState from history:", latestState); // Log latest state
  // Destructure needed properties from the latest state, provide defaults
  const { bitboards, occupied, turn, candidateMoves } = latestState || {};
  console.log("Board.jsx - Destructured:", { bitboards, occupied, turn }); // Log destructured values

  // Calculate if the current player is in check
  const kingInCheckSq = (() => {
      console.log("Board.jsx - Calculating kingInCheckSq..."); // Log calculation start
      // Ensure latestState and bitboards are available
      if (!latestState || !bitboards) {
          console.log("Board.jsx - kingInCheckSq: No latestState or bitboards");
          return null;
      }
      const kingPiece = turn === 'W' ? PIECES.wK : PIECES.bK;
      const kingBB = bitboards[kingPiece];
      if (!kingBB || kingBB === 0n) {
           console.log(`Board.jsx - kingInCheckSq: King bitboard not found or zero for ${turn}`);
           return null; // King not on board?
      }

      const kingSq = bitScanForward(kingBB);
       // Check kingSq is valid before calling isPlayerInCheck
      if (kingSq === -1) {
          console.error("Board.jsx: Could not find king square via bitScanForward.");
          return null;
      }
      // --- Log before calling isPlayerInCheck ---
      console.log(`Board.jsx - Calling isPlayerInCheck: turn=${turn} (type: ${typeof turn}), bitboards=${typeof bitboards}, occupied=${occupied} (type: ${typeof occupied})`);
      // --- End Log ---
      if (arbiter.isPlayerInCheck(turn, bitboards, occupied)) {
          return kingSq; // Return the square index of the king in check
      }
      return null;
  })();

  const getTileClassName = (rankIndex, fileIndex) => { // rankIndex 0-7 (maps to rank 8-1), fileIndex 0-7 (maps to file a-h)
    const squareIndex = rankIndex * 8 + fileIndex;
    let c = (rankIndex + fileIndex) % 2 === 0 ? " tile--dark " : " tile--light ";

    // Check candidate moves (highlighting the 'to' square)
    if (candidateMoves?.find(move => move.to === squareIndex)) {
        // Check if the target square is occupied (for capture indication)
        if ((occupied & (ONE << BigInt(squareIndex))) !== 0n) {
             c += " attacking";
        } else {
             c += " highlighting";
        }
    }

    // Add 'checked' class if the king is on this square and in check
    if (kingInCheckSq === squareIndex) {
      c += " checked";
    }

    return c;
  };

  // Single useEffect for handling all automated moves
  useEffect(() => {
    // Only run this effect if a color has been selected
    if (!appState.colorSelected) {
      return;
    }
    
    // Extract only the necessary state to reduce re-renders
    const { playerColor, turn, history } = appState;
    const historyLength = history.length;
    
    // Prevent AI vs AI by checking if it's the player's turn
    const isAITurn = playerColor !== turn;
    
    // Determine if AI should move
    let shouldMakeMove = false;
    let moveDescription = "";
    
    // Case 1: First move when player selects black
    if (playerColor === 'B' && historyLength === 1 && turn === 'W') {
      shouldMakeMove = true;
      moveDescription = "Initial move for White (AI) after player selected Black";
    }
    // Case 2: Regular AI turn during gameplay
    else if (historyLength > 1 && isAITurn) {
      shouldMakeMove = true;
      moveDescription = `Regular move for ${turn} (AI)`;
    }
    
    // Make the move if needed
    if (shouldMakeMove) {
      console.log(`Making automated move: ${moveDescription}`);
      
      // Add a small delay to make the move feel more natural
      const timeoutId = setTimeout(() => {
        try {
          makeAutomatedMove(appState, dispatch);
        } catch (error) {
          console.error("Error making automated move:", error);
        }
      }, 500);
      
      // Clean up timeout if component unmounts or dependencies change
      return () => clearTimeout(timeoutId);
    }
  }, [appState.turn, appState.playerColor, appState.colorSelected, appState.history.length, dispatch]);

  // Get the board orientation flag and player color
  const { boardFlipped, playerColor } = appState;
  
  console.log("Board rendering with boardFlipped:", boardFlipped, "playerColor:", playerColor, "turn:", turn);
  
  // Prepare ranks and files based on orientation
  // When playing as black, we want files to go from h to a and ranks from 1 to 8
  const displayRanks = boardFlipped ? [...ranks].reverse() : ranks;
  const displayFiles = boardFlipped ? [...files].reverse() : files;
  
  // Log the current game state for debugging
  console.log("Current game state - playerColor:", playerColor, "boardFlipped:", boardFlipped, "turn:", turn);
  console.log("History length:", appState.history.length);
  
  return (
    <div className={`Board ${boardFlipped ? 'board-flipped' : ''}`}>
      <Ranks ranks={displayRanks} />
      <div className="tiles">
        {ranks.map((rank, i) =>
          files.map((file, j) => {
            // Calculate the logical board index based on the player's perspective
            let rankIndex, fileIndex;
            
            if (boardFlipped) {
              // When playing as black, we want to see the board from black's perspective
              // For black: a1 is bottom-left, h8 is top-right
              rankIndex = i; // 0 is the bottom rank (rank 1)
              fileIndex = 7 - j; // 0 is the rightmost file (file h)
            } else {
              // When playing as white, we see the board from white's perspective
              // For white: a8 is top-left, h1 is bottom-right
              rankIndex = 7 - i; // 0 is the top rank (rank 8)
              fileIndex = j; // 0 is the leftmost file (file a)
            }
            
            // Calculate the square index (0-63) from rank and file indices
            const squareIndex = rankIndex * 8 + fileIndex;
            
            console.log(`Tile at visual (${j},${i}) -> logical (${fileIndex},${rankIndex}), squareIndex: ${squareIndex}`);
            
            return (
              <div
                key={`${rank}-${file}`}
                className={`${getTileClassName(rankIndex, fileIndex)}`}
              />
            );
          }),
        )}
      </div>
      <Pieces automateCallBack={setShouldAutomate} boardFlipped={boardFlipped} />

      <Popup callback={setShouldAutomate}>
        <Promotion />
        <GameEnds />
      </Popup>
      <Files files={files} />
    </div>
  );
};
export default Board;
