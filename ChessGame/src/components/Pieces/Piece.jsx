import arbiter from "../../arbiter/arbiter.jsx";
import { useAppContext } from "../../contexts/Context";
import { generateCandidateMoves } from "../../reducer/actions/move";

const Piece = ({ rank, file, piece }) => {
  const { appState, dispatch } = useAppContext();

  const { turn, position } = appState;
  const currentPosition = position[position.length - 1];
  const prevPosition = position[position.length - 2];

  const onClick = (e) => {
    if (turn === piece[1]) {
      const CandidateMoves = arbiter.getValidMoves({
        position: currentPosition,
        prevPosition: prevPosition,
        piece: piece,
        rank,
        file,
      });
      dispatch(generateCandidateMoves(CandidateMoves));
    }
  };
  const onDragStart = (e) => {
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", `${piece},${rank},${file}`);

    setTimeout(() => {
      e.target.style.display = "none";
    }, 0);

    if (turn === piece[1]) {
      const CandidateMoves = arbiter.getValidMoves({
        position: currentPosition,
        prevPosition: prevPosition,
        piece: piece,
        rank,
        file,
      });
      dispatch(generateCandidateMoves(CandidateMoves));
    }
  };
  const onDragEnd = (e) => {
    e.target.style.display = "block";
  };
  return (
    <div
      className={`piece ${piece} p-${file}${rank}`}
      draggable={true}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={onClick}
    />
  );
};
export default Piece;
