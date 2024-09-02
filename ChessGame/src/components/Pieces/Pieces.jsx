import "./Pieces.css";
import Piece from "./Piece.jsx";
import { useState, useRef } from "react";
import { copyPosition, createPosition } from "../../helper.js";
export default function Pieces() {
  const [state, setState] = useState(createPosition());

  const ref = useRef();
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
    const newPosition = copyPosition(state);
    const { x, y } = returnCoords(e);

    const [p, rank, file] = e.dataTransfer.getData("text").split(",");
    console.log(p, rank, file);
    console.log(rank, x, file, y);
    if (rank == x && file == y) {
      console.log("dont do shit");
    } else {
      newPosition[x][y] = p;
      newPosition[rank][file] = "";
    }
    setState(newPosition);
  }
  function onDragOver(e) {
    e.preventDefault();
  }
  return (
    <div onDrop={onDrop} onDragOver={onDragOver} className="pieces" ref={ref}>
      {state.map((r, rank) =>
        r.map((f, file) =>
          state[rank][file] ? (
            <Piece
              key={rank + "-" + file}
              rank={rank}
              file={file}
              piece={state[rank][file]}
            />
          ) : null,
        ),
      )}
    </div>
  );
}
