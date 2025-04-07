import arbiter from "../../arbiter/arbiter";
import { useAppContext } from "../../contexts/Context";
import { generateCandidateMoves, clearCandidateMoves } from "../../reducer/actions/move";
import { PIECES } from "../../bitboard"; // Import PIECES

// Props now include pieceType (enum), squareIndex, and onClick handler
const Piece = ({ piece, pieceType, squareIndex, onClick }) => {
  const { appState, dispatch } = useAppContext();
  const { turn } = appState; // Only need turn and the full appState for arbiter

  const onDragStart = (e) => {
    e.dataTransfer.effectAllowed = "move";
    // Set data transfer: pieceType enum value and squareIndex
    e.dataTransfer.setData("text/plain", `${pieceType},${squareIndex}`);

    setTimeout(() => {
      e.target.style.display = "none"; // Hide original piece while dragging
    }, 0);

    // Check if the dragged piece belongs to the current player
    const pieceIsWhite = pieceType >= PIECES.wP && pieceType <= PIECES.wK;
    const pieceIsBlack = pieceType >= PIECES.bP && pieceType <= PIECES.bK;

    if ((turn === 'W' && pieceIsWhite) || (turn === 'B' && pieceIsBlack)) {
      // Generate all legal moves for the current state
      const allLegalMoves = arbiter.getValidMoves(appState);
      // Filter moves originating from the dragged piece's square
      const candidateMovesForPiece = allLegalMoves.filter(move => move.from === squareIndex);

      dispatch(generateCandidateMoves(candidateMovesForPiece));
    } else {
      // If dragging opponent's piece, clear any existing candidate moves
      dispatch(clearCandidateMoves());
    }
  };

  const onDragEnd = (e) => {
    e.target.style.display = "block"; // Show piece again when drag ends
  };

  return (
    <div
      // Use piece string ('pW', 'nB') for image class
      className={`piece ${piece}`}
      draggable={true}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={onClick} // Add onClick handler for candidate move generation
    />
  );
};
export default Piece;
