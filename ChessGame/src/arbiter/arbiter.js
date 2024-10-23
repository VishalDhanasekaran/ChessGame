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
  getAllValidMoves: function ({ position, player }) {
    let totalMoves = [];
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        const piece = position[i][j];
        if (piece.endsWith(player)) {
          const moves = this.getValidMoves({
            position: position,
            prevPosition: position,
            piece: piece,
            rank: i,
            file: j,
          });
          totalMoves = [
            ...totalMoves,
            ...moves.map(([x, y]) => [piece, i, j, x, y]),
          ];
        }
      }
    }
    return totalMoves;
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
                piece: p.piece,
                rank: p.rank,
                file: p.file,
              })
            : this.getRegularMoves({
                position: positionAfterMove,
                piece: p.piece,
                rank: p.rank,
                file: p.file,
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

  isStalemate: function (position, player, castleDirection) {
    //console.log("stalement check function called!!");
    const isInCheck = this.isPlayerInCheck({
      positionAfterMove: position,
      player,
    });

    if (isInCheck) return false;

    const pieces = getPieces(position, player);
    const moves = pieces.reduce(
      (acc, p) =>
        (acc = [
          ...acc,
          ...this.getValidMoves({
            position,
            castleDirection,
            ...p,
          }),
        ]),
      [],
    );

    return !isInCheck && moves.length === 0;
  },

  insufficientMaterial: function (position) {
    const pieces = position.reduce(
      (acc, rank) => (acc = [...acc, ...rank.filter((spot) => spot)]),
      [],
    );

    // King vs. king
    if (pieces.length === 2) return true;

    // King and bishop vs. king
    // King and knight vs. king
    if (
      pieces.length === 3 &&
      pieces.some((p) => p.startsWith("b") || p.startsWith("n"))
    )
      return true;

    // King and bishop vs. king and bishop of the same color as the opponent's bishop
    if (
      pieces.length === 4 &&
      pieces.every((p) => p.startsWith("b") || p.startsWith("k")) &&
      new Set(pieces).size === 4 &&
      areSameColorTiles(
        findPieceCoords(position, "bW")[0],
        findPieceCoords(position, "bB")[0],
      )
    )
      return true;

    return false;
  },

  isCheckMate: function (position, player, castleDirection) {
    const isInCheck = this.isPlayerInCheck({
      positionAfterMove: position,
      player,
    });

    if (!isInCheck) return false;

    const pieces = getPieces(position, player);
    const moves = pieces.reduce(
      (acc, p) =>
        (acc = [
          ...acc,
          ...this.getValidMoves({
            position,
            castleDirection,
            ...p,
          }),
        ]),
      [],
    );

    return isInCheck && moves.length === 0;
  },
};

export default arbiter;
