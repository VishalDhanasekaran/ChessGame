import arbiter from "../../arbiter/arbiter";
import { useAppContext } from "../../contexts/Context";
import { generateCandidateMoves } from "../../reducer/actions/move";


const Piece = ({ rank, file, piece }) => {

  const {appState, dispatch } = useAppContext();

  const {turn , position } = appState;
  const currentPosition = position[position.length -1 ]

  

  const onDragStart = (e) => {
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", `${piece},${rank},${file}`);

    setTimeout(() => {
      e.target.style.display = "none";
    }, 0);

    if (turn === piece[1]){
    console.log("piece: ",piece[1]," turn : ",turn)
        const CandidateMoves = arbiter.getRegularMoves({position:currentPosition,piece:piece, rank, file})
        console.log("Candidate Moves" ,CandidateMoves)
        dispatch(generateCandidateMoves(CandidateMoves))
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
    />
  );
};
export default Piece;
