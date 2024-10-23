import "./Pieces.css";
import Piece from "./Piece.jsx";
import { useRef } from "react";
import { copyPosition } from "../../helper.js";
import { useAppContext } from "../../contexts/Context.js";
import {
  clearCandidateMoves,
  makeNewMove,
} from "../../reducer/actions/move.js";
import arbiter from "../../arbiter/arbiter.js";
import { useEffect } from "react";
import { useState } from "react";
import { openPromotion } from "../../reducer/actions/popup.js";

import {
  getCastleDirection,
  getCastlingMoves,
} from "../../arbiter/getMoves.js";



import {
  detectStalemate,
  updateCastling,
  detectInsufficientMaterial,
  detectCheckMate,
} from "../../reducer/game.js";
//import { evaluateBoard, recordMove } from "../../Engine/ChessEngine.js";


export default function Pieces() {
  const ref = useRef();
  const { appState, dispatch } = useAppContext();
  const [shouldAutomate, setShouldAutomate] = useState(false);

  // to get the last position
  const currentPosition = appState.position[appState.position.length - 1];

  if (!currentPosition) {
    return;
  }

  const returnCoords = (e) => {
    const { width, left, top } = ref.current.getBoundingClientRect();
    const size = width / 8;
    const y = Math.floor((e.clientX - left) / size);
    const x = 7 - Math.floor((e.clientY - top) / size);

    return { x, y };
  };
  const openPromotionPopup = ({ x, y, rank, file }) => {
    dispatch(openPromotion({ x, y, rank: Number(rank), file: Number(file) }));
  };
  const updateCastlingState = ({ piece, rank, file }) => {
    const direction = getCastleDirection({
      castleDirection: appState.castleDirection,
      piece,
      rank,
      file,
    });
    if (direction) {
      dispatch(updateCastling(direction));
    }
  };
  const move = (e) => {
    const { x, y } = returnCoords(e);
    const [piece, rank, file] = e.dataTransfer.getData("text").split(",");

    if (appState.candidateMoves.find((m) => m[0] === x && m[1] === y)) {
      const opponent = piece.endsWith("B") ? "W" : "B";
      const castleDirection =
        appState.castleDirection[`${piece.endsWith("B") ? "W" : "B"}`];

      if ((piece === "pW" && x === 7) || (piece === "pB" && x === 0)) {
        openPromotionPopup({ x, y, rank, file });
        return;
      }
      if (piece.startsWith("r") || piece.startsWith("k")) {
        updateCastlingState({ piece, rank, file });
      }
      const newPosition = arbiter.performMove({
        position: currentPosition,
        piece,
        rank,
        file,
        x,
        y,
      });
     
      //geting the notation for new move
      const newMove = getNewMoveNotation({
        piece, rank, file, x, y, position:currentPosition
      })


      if(newPosition)
      {
        dispatch(makeNewMove({ newPosition, newMove }));
        if(arbiter.insufficientMaterial(newPosition)) 

          dispatch(detectInsufficientMaterial());
        else if (arbiter.isStalemate(newPosition, opponent, castleDirection))
          dispatch(detectStalemate());
        else if (arbiter.isCheckMate(newPosition, opponent, castleDirection))
          dispatch(detectCheckMate(piece[1]));
      }
    }

    dispatch(clearCandidateMoves());
  };

  function onDrop(e) {
    e.preventDefault();
    move(e);
  }
  function onDragOver(e) {
    e.preventDefault();
  }

  useEffect(() => {
    if (shouldAutomate || appState.can_automate == true) {
      console.log("isit automated?");
      makeAutomatedMove(appState, dispatch);
      setShouldAutomate(false); // Reset after making the move
    } else {
      console.log("notdetected ", appState.turn);
    }
    console.log("App statu", appState);
    console.log(
      "Score of board is ",
      evaluateBoard(appState.position[appState.position.length - 1]),
    );
  }, [shouldAutomate]);

  return (
    <div onDrop={onDrop} onDragOver={onDragOver} className="pieces" ref={ref}>
      {currentPosition.map((r, rank) =>
        r.map((f, file) =>
          currentPosition[rank][file] ? (
            <Piece
              key={rank + "-" + file}
              rank={rank}
              file={file}
              piece={currentPosition[rank][file]}
            />
          ) : null,
        ),
      )}
    </div>
  );
}
export const makeAutomatedMove = (appState, dispatch) => {
  if (appState.turn !== "B") {
    console.log("mo", appState.can_automate);
    return;
  }
  // Retrieve the latest position
  const latestPosition = appState.position[appState.position.length - 1];

  // Create a deep copy of the position to avoid mutation
  let copiedPosition = copyPosition(latestPosition);

  // Find a piece to move and generate valid moves
  let i = 1000;
  while (i > 0) {
    i -= 1;

    const rank = Math.floor(Math.random() * 8);
    const file = Math.floor(Math.random() * 8);

    const piece = copiedPosition[rank][file];
    if (piece.endsWith("B")) {
      // Assuming 'a' denotes the automated player's pieces
      const candidateMoves = arbiter.getValidMoves({
        position: copiedPosition,
        prevPosition: copiedPosition,
        piece,
        rank,
        file,
      });

      if (
        candidateMoves === undefined ||
        candidateMoves[0] === undefined ||
        candidateMoves.length === 0
      ) {
        continue;
      }
      const [targetX, targetY] = candidateMoves[0]; // Selecting the first valid move

      const updatedPosition = arbiter.performMove({
        position: copiedPosition,
        piece,
        rank,
        file,
        x: targetX,
        y: targetY,
      });

      if (updatedPosition.length > 0) {
        console.log("calling record move from automated player");

        dispatch(makeNewMove({ newPosition: updatedPosition }));
        break;
      }
      dispatch(clearCandidateMoves());
    }
  }
  if (i <= 0) {
    alert("No valid moves for automated player");
  }
};
