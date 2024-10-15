export const getKingMoves = ({ position, rank, file }) => {
  const moves = [];
  const enemy = position?.[rank]?.[file].endsWith("W") ? "B" : "W";
  const player = enemy === "W" ? "B" : "W";
  console.log("Player knight: ", player, " Enemy : ", enemy);
  const candidateMoves = [
    [1, 1],
    [1, -1],
    [-1, 1],
    [-1, -1],
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
  ];
  candidateMoves.forEach((c) => {
    const cell = position?.[rank + c[0]]?.[file + c[1]];
    if (cell !== undefined && !cell.endsWith(player)) {
      moves.push([rank + c[0], file + c[1]]);
    }
  });
  return moves;
};
export const getCastlingMoves = ({
  position,
  castleDirection,
  piece,
  rank,
  file,
}) => {
  console.log(
    "in get castling moves",
    position,
    castleDirection,
    piece,
    rank,
    file,
  );
  const moves = [];
  if (file !== 4 || rank % 7 !== 0 || castleDirection === "none") {
    console.log("nothing", file, rank, castleDirection);
    return moves;
  }
  if (piece.endsWith("W")) {
    if (
      ["left", "both"].includes(castleDirection) &&
      position[0][0] === "rW" &&
      !position[0][1] &&
      !position[0][2] &&
      !position[0][3]
    ) {
      moves.push([0, 2]);
    }
    if (
      ["right", "both"].includes(castleDirection) &&
      !position[0][5] &&
      !position[0][6] &&
      position[0][7] === "rW"
    ) {
      console.log("pushed?");
      moves.push([0, 6]);
    }
  } else {
    console.log("THISI SI JWKHEJWHEJKW HEJWK HEWJKEHWJEK WJE WD");
    if (
      ["left", "both"].includes(castleDirection) &&
      position[7][0] === "rB" &&
      !position[7][1] &&
      !position[7][2] &&
      !position[7][3]
    ) {
      moves.push([7, 2]);
    }
    if (
      ["right", "both"].includes(castleDirection) &&
      !position[7][5] &&
      !position[7][6] &&
      position[7][7] === "rB"
    ) {
      console.log("pushed?");
      moves.push([7, 6]);
    }
  }
  return moves;
};
export const getPawnMoves = ({ position, rank, file }) => {
  const moves = [];
  console.log(rank, file);
  const enemy = position?.[rank]?.[file].endsWith("W") ? "B" : "W";
  const player = enemy === "W" ? "B" : "W";
  console.log("Player pawn: ", player, " Enemy : ", enemy);
  const direction = player === "W" ? 1 : -1;

  if (!position?.[rank + direction]?.[file]) {
    if (rank + direction > 0 && rank + direction < 9) {
      console.log("pushed");
      moves.push([rank + direction, file]);
    }
  }

  if (rank % 5 === 1) {
    console.log("two");
    if (
      position?.[rank + direction]?.[file] === "" &&
      position?.[rank + 2 * direction]?.[file] === ""
    ) {
      console.log("sum");
      moves.push([rank + 2 * direction, file]);
    }
  }
  console.log("moves", moves);
  return moves;
};
export const getPawnCaptures = ({ position, prevPosition, rank, file }) => {
  const moves = [];
  const enemy = position?.[rank]?.[file].endsWith("W") ? "B" : "W";
  const player = enemy === "W" ? "B" : "W";
  console.log("Player pawn: ", player, " Enemy : ", enemy);
  const direction = player === "W" ? 1 : -1;
  if (
    position?.[rank + direction]?.[file - 1] &&
    position?.[rank + direction]?.[file - 1].endsWith(enemy)
  ) {
    moves.push([rank + direction, file - 1]);
  }
  if (
    position?.[rank + direction]?.[file + 1] &&
    position?.[rank + direction]?.[file + 1].endsWith(enemy)
  ) {
    moves.push([rank + direction, file + 1]);
  }

  const enemyPawn = direction === 1 ? "pB" : "pW";
  const adjacentFiles = [file - 1, file + 1];
  if (prevPosition) {
    console.log("prevposreach");
    if ((direction === 1 && rank === 4) || (direction === -1 && rank === 3)) {
      console.log("direcheck");
      adjacentFiles.forEach((F) => {
        console.log("fareach", F);
        console.log(
          "enemy  pawn is adjacent: ",
          position?.[rank]?.[F] === enemyPawn,
        );
        console.log(
          "enemy pawn took two steps: ",
          position?.[rank + direction + direction]?.[F] === "",
        );
        console.log(
          "prev the place occupied was empty : ",
          prevPosition?.[rank]?.[F] === "",
        );
        console.log(
          "enemy pawn was two steps behind: ",
          prevPosition?.[rank + direction + direction]?.[F] === enemyPawn,
        );
        console.log("current : ", position, "prev", prevPosition);

        if (
          position?.[rank]?.[F] === enemyPawn && // means the enemy pawn is adjacent
          position?.[rank + direction + direction]?.[F] === "" && // means the enemy pawn has taken two steps
          prevPosition?.[rank]?.[F] === "" && // previously the place occupied now was empty
          prevPosition?.[rank + direction + direction]?.[F] === enemyPawn
        ) {
          // means the enemy pawn was two steps behind, confirming the valid move for en-passant
          moves.push([rank + direction, F]);
        }
      });
    }
  } else {
    console.log("undev", prevPosition);
  }
  return moves;
};

export const getQueenMoves = ({ position, rank, file }) => {
  const moves = [];
  const enemy = position?.[rank]?.[file].endsWith("W") ? "B" : "W";
  const player = enemy === "W" ? "B" : "W";
  console.log("Player knight: ", player, " Enemy : ", enemy);
  const candidateMoves = [
    [1, 1],
    [1, -1],
    [-1, 1],
    [-1, -1],
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
  ];
  candidateMoves.forEach((c) => {
    for (var i = 1; i < 8; i++) {
      const cell = position?.[rank + i * c[0]]?.[file + i * c[1]];
      if (cell !== undefined && !cell.endsWith(player)) {
        moves.push([rank + i * c[0], file + i * c[1]]);
        if (cell.endsWith(enemy)) {
          break;
        }
      } else {
        break;
      }
    }
  });
  return moves;
};
export const getKnightMoves = ({ position, rank, file }) => {
  const moves = [];
  const enemy = position?.[rank]?.[file].endsWith("W") ? "B" : "W";
  const player = enemy === "W" ? "B" : "W";
  console.log("Player knight: ", player, " Enemy : ", enemy);
  const candidateMoves = [
    [2, 1],
    [2, -1],
    [-2, 1],
    [-2, -1],
    [1, 2],
    [1, -2],
    [-1, 2],
    [-1, -2],
  ];
  candidateMoves.forEach((c) => {
    const cell = position?.[rank + c[0]]?.[file + c[1]];
    if (cell !== undefined && !cell.endsWith(player)) {
      moves.push([rank + c[0], file + c[1]]);
    }
  });
  return moves;
};
export const getBishopMoves = ({ position, piece, rank, file }) => {
  if (piece === null) {
    console.log("piece is null at getMoves.js");
  }
  const moves = [];
  const directions = [
    [1, 1],
    [1, -1],
    [-1, 1],
    [-1, -1],
  ];
  const enemy = position?.[rank]?.[file].endsWith("W") ? "B" : "W";
  const player = enemy === "W" ? "B" : "W";

  directions.forEach((dir) => {
    for (var i = 1; i < 8; i++) {
      console.log("index", i);
      const x = rank + i * dir[0];
      const y = file + i * dir[1];
      console.log(
        "Currpos",
        position?.[x]?.[y],
        " ",
        dir[0],
        " ",
        dir[1],
        rank,
        file,
        x,
        y,
      );
      if (position?.[x]?.[y] === undefined) {
        console.log("Undefined for ", x, y);
        break;
      }
      if (position?.[x]?.[y].endsWith(enemy)) {
        console.log("enemy for ", x, y);
        moves.push([x, y]);
        break;
      }
      if (position?.[x]?.[y].endsWith(player)) {
        console.log("Player for ", x, y);
        break;
      }
      console.log("psuhing ");
      moves.push([x, y]);
    }
  });

  return moves;
};
export const getRookMoves = ({ position, piece, rank, file }) => {
  const moves = [];
  const player = piece[1];
  console.log("player", player);
  const enemy = player === "W" ? "B" : "W";
  console.log("Player : ", player, " Enemy : ", enemy);
  const direction = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
  ];

  direction.forEach((dir) => {
    for (var i = 1; i < 8; i++) {
      console.log("index", i);
      const x = rank + i * dir[0];
      const y = file + i * dir[1];
      console.log(
        "Currpos",
        position?.[x]?.[y],
        " ",
        dir[0],
        " ",
        dir[1],
        rank,
        file,
        x,
        y,
      );
      if (position?.[x]?.[y] === undefined) {
        console.log("Undefined for ", x, y);
        break;
      }
      if (position?.[x]?.[y].endsWith(enemy)) {
        console.log("enemy for ", x, y);
        moves.push([x, y]);
        break;
      }
      if (position?.[x]?.[y].endsWith(player)) {
        console.log("Player for ", x, y);
        break;
      }
      console.log("psuhing ");
      moves.push([x, y]);
    }
  });

  return moves;
};
