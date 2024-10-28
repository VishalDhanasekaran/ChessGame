import { copyPosition } from "../helper";

export const movePawn = ({ position, piece, rank, file, x, y }) => {
  const newPosition = copyPosition(position);
  if (newPosition[rank] === undefined) {
    console.log("undefined for rank", rank);
  }
  if (!newPosition[x][y] && x !== rank && y !== file) {
    newPosition[rank][y] = "";
  }
  newPosition[rank][file] = "";
  newPosition[x][y] = piece;
  return newPosition;
};
export const movePiece = ({ position, piece, rank, file, x, y }) => {
  const newPosition = copyPosition(position);

  if (piece.startsWith("k") && Math.abs(y - file) > 1) {
    if (y === 2) {
      newPosition[rank][0] = "";
      newPosition[rank][3] = piece.endsWith("W") ? "rW" : "rB";
    }
    if (y === 6) {
      newPosition[rank][7] = "";
      newPosition[rank][5] = piece.endsWith("W") ? "rW" : "rB";
    }
  }
  newPosition[rank][file] = "";
  newPosition[x][y] = piece;
  return newPosition;
};
