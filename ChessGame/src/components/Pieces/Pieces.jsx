import "./Pieces.css";
import Piece from "./Piece.jsx";
import { useState, useRef } from "react";
import { copyPosition, createPosition } from "../../helper.js";
import { useAppContext } from "../../contexts/Context.js";
import { makeNewMove } from "../../reducer/actions/move.js";
export default function Pieces() {
  const ref = useRef();
  const { appState, dispatch } = useAppContext();

  console.log("APSTATE:", appState);
  // to get the last position
  const currentPosition = appState.position[appState.position.length - 1];

  if (!currentPosition) {
    console.log("currentposition not defined");
    return;
  }
  console.log();

  const returnCoords = (e) => {
    const { width, left, top } = ref.current.getBoundingClientRect();
    const size = width / 8;
    const y = Math.floor((e.clientX - left) / size);
    const x = 7 - Math.floor((e.clientY - top) / size);
    console.log(e.clientX, e.clientY);
    return { x, y };
  };
  function onDrop(e) {
    const newPosition = copyPosition(currentPosition);
    const { x, y } = returnCoords(e);

    const [p, rank, file] = e.dataTransfer.getData("text").split(",");
    if (rank == x && file == y) {
      console.log("dont do shit");
    } else {
      newPosition[Number(x)][Number(y)] = p;
      newPosition[rank][file] = "";
      dispatch(makeNewMove({ newPosition }));
    }
  }
  function onDragOver(e) {
    e.preventDefault();
  }
  console.log("CURR", currentPosition);
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
