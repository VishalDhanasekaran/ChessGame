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
export default function Pieces() {
  const ref = useRef();
  const { appState, dispatch } = useAppContext();

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
    console.log("x:", x, " clix:", e.clientX, "y:", y, " cliy", e.clientY);
    return { x, y };
  };
  const move = (e) => {
    const { x, y } = returnCoords(e);
    const [piece, rank, file] = e.dataTransfer.getData("text").split(",");
    console.log(
      "Client log: ",
      appState.candidateMoves,
      "x:",
      x,
      "y:",
      y,
      piece,
      rank,
      file,
    );
    if (appState.candidateMoves.find((m) => m[0] === x && m[1] === y)) {
      const newPosition = arbiter.performMove({
        position: currentPosition,
        piece,
        rank,
        file,
        x,
        y,
      });
      dispatch(makeNewMove({ newPosition }));
    } else {
      console.log("Move iscarded ");
    }
    dispatch(clearCandidateMoves());
  };

  function onDrop(e) {
    console.log(currentPosition);
    e.preventDefault();
    console.log();
    move(e);
  }
  function onDragOver(e) {
    e.preventDefault();
  }
  const makeAutomatedMove = () => {
    // Retrieve the latest position
    const latestPosition = appState.position[appState.position.length - 1];

    // Create a deep copy of the position to avoid mutation
    const copiedPosition = copyPosition(latestPosition);
    console.log(copiedPosition);

    // Find a piece to move and generate valid moves
    let i = 9;
    while (appState.turn === "B") {
      console.log("inside while");
      const rank = Math.floor(Math.random() * 7);
      const file = Math.floor(Math.random() * 7);
      console.log(rank, file);
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
          candidateMoves.size === 0
        ) {
          continue;
        }
        const [targetX, targetY] = candidateMoves[0]; // Selecting the first valid move
        console.log("updating mov", candidateMoves);

        const updatedPosition = arbiter.performMove({
          position: copiedPosition,
          piece,
          rank,
          file,
          x: targetX,
          y: targetY,
        });

        if (updatedPosition) {
          console.log("updated auto");
          console.log("dispaching ", piece, "", updatedPosition);
          dispatch(makeNewMove({ newPosition: updatedPosition }));
          break;
        }
        dispatch(clearCandidateMoves());
      }
    }
  };

  useEffect(() => {
    if (appState.turn === "B") {
      makeAutomatedMove();
    }
  });
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
