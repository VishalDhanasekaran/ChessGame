import arbiter from "./arbiter";

export const getCastleDirection = ({ castleDirection, piece, rank, file }) => {
  rank = Number(rank);
  file = Number(file);
  
  const direction = castleDirection[piece[1]];
  if (piece.startsWith("k")) {
    return "none";
  }
  if (file === 0 && rank === 0) {
    if (direction === "both") {
      return "right";
    }
    if (direction === "left") {
      return "none";
    }
  }
  if (file === 7 && rank === 0) {
    if (direction === "both") {
      return "left";
    }
    if (direction === "right") {
      return "none";
    }
  }
  if (file === 0 && rank === 7) {
    if (direction === "both") {
      return "right";
    }
    if (direction === "left") {
      return "none";
    }
  }
  if (file === 7 && rank === 7) {
    if (direction === "both") {
      return "left";
    }
    if (direction === "right") {
      return "none";
    }
  }
};
export const getKingMoves = ({ position, rank, file }) => {
  const moves = [];
  const enemy = position?.[rank]?.[file].endsWith("W") ? "B" : "W";
  const player = enemy === "W" ? "B" : "W";
  
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

  const moves = [];
  if (file !== 4 || rank % 7 !== 0 || castleDirection === "none") {
    
    return moves;
  }
  if (piece.endsWith("W")) {
      if (arbiter.isPlayerInCheck({ positionAfterMove: position, player: "W" }))
        return moves;
    if (
      ["left", "both"].includes(castleDirection) &&
      position[0][0] === "rW" &&
      !position[0][1] &&
      !position[0][2] &&
      !position[0][3] &&
      !arbiter.isPlayerInCheck({
        positionAfterMove: arbiter.performMove({
          position,
          piece,
          rank,
          file,
          x: 0,
          y: 3,
        }),
        player: "W",
      }) &&
      !arbiter.isPlayerInCheck({
        positionAfterMove: arbiter.performMove({
          position,
          piece,
          rank,
          file,
          x: 0,
          y: 2,
        }),
        player: "W",
      })
    ) {
      moves.push([0, 2]);
    }
    if (
      ["right", "both"].includes(castleDirection) &&
      !position[0][5] &&
      !position[0][6] &&
      position[0][7] === "rW" &&
      !arbiter.isPlayerInCheck({
        positionAfterMove: arbiter.performMove({
          position,
          piece,
          rank,
          file,
          x: 0,
          y: 5,
        }),
        player: "W",
      }) &&
      !arbiter.isPlayerInCheck({
        positionAfterMove: arbiter.performMove({
          position,
          piece,
          rank,
          file,
          x: 0,
          y: 6,
        }),
        player: "W",
      })
    ) {
      
      moves.push([0, 6]);
    }
  } else {
    if (arbiter.isPlayerInCheck({ positionAfterMove: position, player: "B" }))
      return moves;

    if (
      ["left", "both"].includes(castleDirection) &&
      position[7][0] === "rB" &&
      !position[7][1] &&
      !position[7][2] &&
      !position[7][3]  &&
       !arbiter.isPlayerInCheck({
        positionAfterMove: arbiter.performMove({
          position,
          piece,
          rank,
          file,
          x: 7,
          y: 3,
        }),
        player: "B",
      }) &&
      !arbiter.isPlayerInCheck({
        positionAfterMove: arbiter.performMove({
          position,
          piece,
          rank,
          file,
          x: 7,
          y: 2,
        }),
        player: "B",
      })
   
    ) {
      moves.push([7, 2]);
    }
    if (
      ["right", "both"].includes(castleDirection) &&
      !position[7][5] &&
      !position[7][6] &&
      position[7][7] === "rB"
      &&   !arbiter.isPlayerInCheck({
        positionAfterMove: arbiter.performMove({
          position,
          piece,
          rank,
          file,
          x: 7,
          y: 5,
        }),
        player: "B",
      }) &&
      !arbiter.isPlayerInCheck({
        positionAfterMove: arbiter.performMove({
          position,
          piece,
          rank,
          file,
          x: 7,
          y: 6,
        }),
        player: "B",
      })
      
    ) {
      
      moves.push([7, 6]);
    }
  }
  return moves;
};
export const getPawnMoves = ({ position, rank, file }) => {
  const moves = [];
  
  const enemy = position?.[rank]?.[file].endsWith("W") ? "B" : "W";
  const player = enemy === "W" ? "B" : "W";
  
  const direction = player === "W" ? 1 : -1;

  if (!position?.[rank + direction]?.[file]) {
    if (rank + direction >= 0 && rank + direction < 9) {
      
      moves.push([rank + direction, file]);
    }
  }

  if (rank % 5 === 1) {
    if (
      position?.[rank + direction]?.[file] === "" &&
      position?.[rank + 2 * direction]?.[file] === ""
    ) {
      moves.push([rank + 2 * direction, file]);
    }
  }
  
  return moves;
};
export const getPawnCaptures = ({ position, prevPosition, rank, file }) => {
  const moves = [];
  const enemy = position?.[rank]?.[file].endsWith("W") ? "B" : "W";
  const player = enemy === "W" ? "B" : "W";
  
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
    
    if ((direction === 1 && rank === 4) || (direction === -1 && rank === 3)) {
      
      adjacentFiles.forEach((F) => {
        
        

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
    
  }
  return moves;
};

export const getQueenMoves = ({ position, rank, file }) => {
  const moves = [];
  const enemy = position?.[rank]?.[file].endsWith("W") ? "B" : "W";
  const player = enemy === "W" ? "B" : "W";
  
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
      
      const x = rank + i * dir[0];
      const y = file + i * dir[1];
      if (position?.[x]?.[y] === undefined) {
        
        break;
      }
      if (position?.[x]?.[y].endsWith(enemy)) {
        
        moves.push([x, y]);
        break;
      }
      if (position?.[x]?.[y].endsWith(player)) {
        
        break;
      }
      
      moves.push([x, y]);
    }
  });

  return moves;
};
export const getRookMoves = ({ position, piece, rank, file }) => {
  const moves = [];
  const player = piece[1];
  
  
  const enemy = player === "W" ? "B" : "W";
  
  const direction = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
  ];

  direction.forEach(dir => {
    for (var i = 1; i <= 8; i++) {
      const x = rank + (i * dir[0]);
      const y = file + (i * dir[1]);

      if (position?.[x]?.[y] === undefined) {
        
        break;
      }
      if (position?.[x]?.[y].endsWith(enemy)) {
        
        moves.push([x, y]);
        break;
      }
      if (position?.[x]?.[y].endsWith(player)) {
        break;
      }
      moves.push([x, y]);
    }
  });
  

  return moves;
};

export const getKingPosition = (position, player) => {
  if (!position)
    return null;
  let kingPos;
  position.forEach((rank, x) => {
    rank.forEach((file, y) => {
      if (position[x][y].endsWith(player) && position[x][y].startsWith("k"))
        kingPos = [x, y];
    });
  });

  return kingPos;
};

export const getPieces = (position, enemy) => {
  const enemyPieces = [];

  position.forEach((rank, x) => {
    rank.forEach((file, y) => {
      if (position[x][y].endsWith(enemy))
        enemyPieces.push({
          piece: position[x][y],
          file: y,
          rank: x,
        });
    });
  });

  return enemyPieces;
};
