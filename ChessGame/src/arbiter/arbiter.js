import {
  getKingMoves,
  getPawnMoves,
  getQueenMoves,
  getBishopMoves,
  getKnightMoves,
  getRookMoves,
  getPawnCaptures,
  getCastlingMoves,
} from "./getMoves";
import { movePawn, movePiece } from "./move";

const arbiter = {
  getRegularMoves: function ({ position, piece, rank, file }) {
    switch (piece[0]) {
      case "k":
        return getKingMoves({ position, rank, file });
      case "p":
        return getPawnMoves({ position, rank, file });
      case "q":
        return getQueenMoves({ position, rank, file });
      case "n":
        return getKnightMoves({ position, rank, file });
      case "b":
        return getBishopMoves({ position, rank, file });
      case "r":
        return getRookMoves({ position, piece, rank, file });
      default:
        console.log("Invalid piece: ", piece);
        return [];
    }
  },
  getValidMoves: function ({
    position,
    prevPosition,
    castleDirection,
    piece,
    rank,
    file,
  }) {
    let moves = this.getRegularMoves({ position, piece, rank, file });
    console.log("Valid Moves: ", moves);
    if (piece.startsWith("p")) {
      moves = [
        ...moves,
        ...getPawnCaptures({ position, prevPosition, piece, rank, file }),
      ];
    }
    if (piece.startsWith("k")) {
      console.log(
        "Thois is avar pastion",
        position,
        castleDirection,
        piece,
        rank,
        file,
      );
      moves = [
        ...moves,
        ...getCastlingMoves({ position, castleDirection, piece, rank, file }),
      ];
    }
    return moves;
  },
  performMove: function ({ position, piece, rank, file, x, y }) {
    if (piece.startsWith("p")) {
      return movePawn({ position, piece, rank, file, x, y });
    } else {
      return movePiece({ position, piece, rank, file, x, y });
    }
  },
};

export default arbiter;
