import "./Pieces.css";
import Piece from "./Piece.jsx";
import { useState, useRef } from "react";
import { copyPosition, createPosition } from "../../helper.js";
import { useAppContext } from "../../contexts/Context.js";
import { clearCandidateMoves, makeNewMove } from "../../reducer/actions/move.js";
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
    return { x, y };
  };
  function onDrop(e) {
    const newPosition = copyPosition(currentPosition);
    const { x, y } = returnCoords(e);

    const [p, rank, file] = e.dataTransfer.getData("text").split(",");
    if ((rank == x && file == y) || appState.turn != p[1]) {
    } else {
    if (appState.candidateMoves?.find(m => m[0] == x && m[1] == y)){
      if(p.startsWith('p') && !newPosition[x][y]  && x !== rank && y !== file){
        // checks for a pawn ,to move into an empty space, with the destination coords not being the same as the current position 
        // removes the enemy pawn that has moved adjacent with our pawn
        newPosition[rank][y] = ''

      }
      newPosition[Number(x)][Number(y)] = p;
      newPosition[rank][file] = "";
      dispatch(makeNewMove({ newPosition }));
    }
  }
  dispatch(clearCandidateMoves())
  }
  function onDragOver(e) {
    e.preventDefault();
  }
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
