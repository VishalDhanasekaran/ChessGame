import {
  getKingMoves,
  getPawnMoves,
  getQueenMoves,
  getBishopMoves,
  getKnightMoves,
  getRookMoves,
  getPawnCaptures,
  getCastlingMoves,
  getKingPosition,
  getPieces,
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
    

    let notInCheckMoves = [];

    if (piece.startsWith("p")) {
      moves = [
        ...moves,
        ...getPawnCaptures({ position, prevPosition, piece, rank, file }),
      ];
    }
    if (piece.startsWith("k")) {

      moves = [
        ...moves,
        ...getCastlingMoves({ position, castleDirection, piece, rank, file }),
      ];
    }

    moves.forEach(([x, y]) => {
      const positionAfterMove = this.performMove({
        position,
        piece,
        rank,
        file,
        x,
        y,
      });
      if (
        !this.isPlayerInCheck({ positionAfterMove, position, player: piece[1] })
      ) {
        notInCheckMoves.push([x, y]);
      }
    });

    return notInCheckMoves;
  },

  performMove: function ({ position, piece, rank, file, x, y }) {
    if (piece.startsWith("p")) {
      return movePawn({ position, piece, rank, file, x, y });
    } else {
      return movePiece({ position, piece, rank, file, x, y });
    }
  },

  isPlayerInCheck: function ({ positionAfterMove, position, player }) {
    const enemy = player === "W" ? "B" : "W";
    let kingPos = getKingPosition(positionAfterMove, player);
    const enemyPieces = getPieces(positionAfterMove, enemy);
    
    

    const enemyMoves = enemyPieces.reduce(
      (acc, p) =>
        (acc = [
          ...acc,
          ...(p.piece.startsWith("p")
            ? getPawnCaptures({
                position: positionAfterMove,
                prevPosition: position,
                piece:p.piece,
                rank:p.rank,
                file:p.file
              })
            : this.getRegularMoves({
                position: positionAfterMove,
                piece:p.piece,
                rank:p.rank,
                file:p.file
              })),
        ]),
      [],
    );

    for (let i = 0; i < enemyMoves.length; i++) {
      const [x, y] = enemyMoves[i];
      if (x === kingPos[0] && y === kingPos[1]) {
        
        
        break;
      }
    }
    if (enemyMoves.some(([x, y]) => kingPos[0] === x && kingPos[1] === y))
      return true;
    else return false;
  },
};

export default arbiter;
