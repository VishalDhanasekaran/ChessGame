import arbiter from "../arbiter/arbiter";
import { copyPosition, getNewMoveNotation } from "../helper";
import { clearCandidateMoves, makeNewMove } from "../reducer/actions/move";

export const evaluateBoard = (board) => {
  let totalScore = 0;
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      totalScore += getPieceScore(board[i][j], i, j);
    }
  }
  return totalScore;
};
const getPieceScore = (piece, row, col) => {
  const reverseArray = function (array) {
    return array.slice().reverse();
  };

  const pawnEvalWhite = [
    [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
    [5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0],
    [1.0, 1.0, 2.0, 3.0, 3.0, 2.0, 1.0, 1.0],
    [0.5, 0.5, 1.0, 2.5, 2.5, 1.0, 0.5, 0.5],
    [0.0, 0.0, 0.0, 2.0, 2.0, 0.0, 0.0, 0.0],
    [0.5, -0.5, -1.0, 0.0, 0.0, -1.0, -0.5, 0.5],
    [0.5, 1.0, 1.0, -2.0, -2.0, 1.0, 1.0, 0.5],
    [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
  ];

  const pawnEvalBlack = reverseArray(pawnEvalWhite);

  const knightEval = [
    [-5.0, -4.0, -3.0, -3.0, -3.0, -3.0, -4.0, -5.0],
    [-4.0, -2.0, 0.0, 0.0, 0.0, 0.0, -2.0, -4.0],
    [-3.0, 0.0, 1.0, 1.5, 1.5, 1.0, 0.0, -3.0],
    [-3.0, 0.5, 1.5, 2.0, 2.0, 1.5, 0.5, -3.0],
    [-3.0, 0.0, 1.5, 2.0, 2.0, 1.5, 0.0, -3.0],
    [-3.0, 0.5, 1.0, 1.5, 1.5, 1.0, 0.5, -3.0],
    [-4.0, -2.0, 0.0, 0.5, 0.5, 0.0, -2.0, -4.0],
    [-5.0, -4.0, -3.0, -3.0, -3.0, -3.0, -4.0, -5.0],
  ];

  const bishopEvalWhite = [
    [-2.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -2.0],
    [-1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, -1.0],
    [-1.0, 0.0, 0.5, 1.0, 1.0, 0.5, 0.0, -1.0],
    [-1.0, 0.5, 0.5, 1.0, 1.0, 0.5, 0.5, -1.0],
    [-1.0, 0.0, 1.0, 1.0, 1.0, 1.0, 0.0, -1.0],
    [-1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0],
    [-1.0, 0.5, 0.0, 0.0, 0.0, 0.0, 0.5, -1.0],
    [-2.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -2.0],
  ];

  const bishopEvalBlack = reverseArray(bishopEvalWhite);

  const rookEvalWhite = [
    [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
    [0.5, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 0.5],
    [-0.5, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, -0.5],
    [-0.5, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, -0.5],
    [-0.5, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, -0.5],
    [-0.5, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, -0.5],
    [-0.5, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, -0.5],
    [0.0, 0.0, 0.0, 0.5, 0.5, 0.0, 0.0, 0.0],
  ];

  const rookEvalBlack = reverseArray(rookEvalWhite);

  const evalQueen = [
    [-2.0, -1.0, -1.0, -0.5, -0.5, -1.0, -1.0, -2.0],
    [-1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, -1.0],
    [-1.0, 0.0, 0.5, 0.5, 0.5, 0.5, 0.0, -1.0],
    [-0.5, 0.0, 0.5, 0.5, 0.5, 0.5, 0.0, -0.5],
    [0.0, 0.0, 0.5, 0.5, 0.5, 0.5, 0.0, -0.5],
    [-1.0, 0.5, 0.5, 0.5, 0.5, 0.5, 0.0, -1.0],
    [-1.0, 0.0, 0.5, 0.0, 0.0, 0.0, 0.0, -1.0],
    [-2.0, -1.0, -1.0, -0.5, -0.5, -1.0, -1.0, -2.0],
  ];

  const kingEvalWhite = [
    [-3.0, -4.0, -4.0, -5.0, -5.0, -4.0, -4.0, -3.0],
    [-3.0, -4.0, -4.0, -5.0, -5.0, -4.0, -4.0, -3.0],
    [-3.0, -4.0, -4.0, -5.0, -5.0, -4.0, -4.0, -3.0],
    [-3.0, -4.0, -4.0, -5.0, -5.0, -4.0, -4.0, -3.0],
    [-2.0, -3.0, -3.0, -4.0, -4.0, -3.0, -3.0, -2.0],
    [-1.0, -2.0, -2.0, -2.0, -2.0, -2.0, -2.0, -1.0],
    [2.0, 2.0, 0.0, 0.0, 0.0, 0.0, 2.0, 2.0],
    [2.0, 3.0, 1.0, 0.0, 0.0, 1.0, 3.0, 2.0],
  ];

  const kingEvalBlack = reverseArray(kingEvalWhite);

  let score = 0;
  if (piece === undefined) {
    console.log("undefined");
  }
  switch (piece[0]) {
    case "p":
      score =
        100 +
        (piece[1] === "W" ? pawnEvalWhite[row][col] : pawnEvalBlack[row][col]);
      break;
    case "n":
      score = 320 + knightEval[row][col];
      break;
    case "b":
      score =
        330 +
        (piece[1] === "W"
          ? bishopEvalWhite[row][col]
          : bishopEvalBlack[row][col]);
      break;
    case "r":
      score =
        500 +
        (piece[1] === "W" ? rookEvalWhite[row][col] : rookEvalBlack[row][col]);
      break;
    case "q":
      score = 900 + evalQueen[row][col];
      break;
    case "k":
      score =
        20000 +
        (piece[1] === "W" ? kingEvalWhite[row][col] : kingEvalBlack[row][col]);
      break;
    default:
      score = 0;
  }
  if (piece[1] === "B") {
    score *= -1;
  }
  return score;
};

export const makeAutomatedMove = (appState, dispatch) => {
  if (appState.turn !== "B") {
    return;
  }
  // Retrieve the latest position
  const latestPosition = appState.position[appState.position.length - 1];

  // Create a deep copy of the position to avoid mutation
  let copiedPosition = copyPosition(latestPosition);

  // Find a piece to move and generate valid moves

  /*
    const rank = Math.floor(Math.random() * 8);
    const file = Math.floor(Math.random() * 8);

    const piece = copiedPosition[rank][file];
    if (piece.endsWith("B")) {
      const candidateMoves = arbiter.getValidMoves({
        position: copiedPosition,
        prevPosition: copiedPosition,
        piece,
        rank,
        file,
      });
      if (
        candidateMoves === undefined ||
        candidateMoves[0] === undefined ||
        candidateMoves.length === 0
      ) {
        continue;
      }
      const [targetX, targetY] = candidateMoves[0]; // Selecting the first valid move

      */
  const move = findBestMove({ position: copiedPosition, player: "B" });
  if (move.length === 0) {
    alert("No moves left");
    return;
  }
  const updatedPosition = arbiter.performMove({
    position: copiedPosition,
    piece: move[0],
    rank: move[1],
    file: move[2],
    x: move[3],
    y: move[4],
  });

  if (updatedPosition.length > 0) {
    const newMove = getNewMoveNotation({
      piece: move[0],
      rank: move[1],
      file: move[2],
      x: move[3],
      y: move[4],
      position: updatedPosition,
    });
    dispatch(makeNewMove({ newPosition: updatedPosition, newMove: newMove }));
  }
  dispatch(clearCandidateMoves());
};
export const orderedMoves = ({ position, moves, player }) => {
  for (let i = 0; i < moves.length; i++) {
    const result = arbiter.performMove({
      position: position,
      piece: moves[i][0],
      rank: moves[i][1],
      file: moves[i][2],
      x: moves[i][3],
      y: moves[i][4],
    });
    moves[i].push(evaluateBoard(result));

    if (
      position[moves[i][3]][moves[i][4]].endsWith(player === "W" ? "B" : "W")
    ) {
      moves[i][5] +=
        getPieceScore(moves[i][0], moves[i][3], moves[i][4]) *
        (player === "W" ? 1 : -1);
    } else if (position[moves[i][3]][moves[i][4]].endsWith(player)) {
      moves[i][5] -= getPieceScore(moves[i][0], moves[i][3], moves[i][4]);
    }
    if (
      arbiter.isPlayerInCheck({
        positionAfterMove: result,
        position: position,
        player: player,
      })
    ) {
      moves[i][5] -= 20000;
    } else if (
      arbiter.isPlayerInCheck({
        positionAfterMove: result,
        position: position,
        player: player === "W" ? "B" : "W",
      })
    ) {
      moves[i][5] = moves[i][5] + 2000;
    }
  }
  return moves.sort(function (a, b) {
    return (a[5] - b[5]) * (player === "W" ? 1 : -1);
  });
};
export const findBestMove = ({ position, player }) => {
  let moves = arbiter.getAllValidMoves({ position, player });
  moves = orderedMoves({
    position: position,
    moves: moves,
    player: player,
  });
  let lowestindex = 0;
  let lowestScore = +0;
  const prevpos = copyPosition(position);
  for (let i = 0; i < moves.length; i++) {
    const result = arbiter.performMove({
      position: prevpos,
      piece: moves[i][0],
      rank: moves[i][1],
      file: moves[i][2],
      x: moves[i][3],
      y: moves[i][4],
    });
    const score = miniMax({
      position: result,
      depth: 1,
      alpha: -Infinity,
      beta: +Infinity,
      maximisePlayer: player === "W" ? true : false,
    });
    if (score > lowestScore) {
      lowestScore = score;
      lowestindex = i;
    }
  }
  return moves[lowestindex];
};
export const miniMax = ({ position, depth, alpha, beta, maximisePlayer }) => {
  if (depth === 0 || arbiter.insufficientMaterial(position)) {
    if (depth !== 0) {
      console.log("depth reach");
    }
    return evaluateBoard(position) * -1;
  }
  const moves = orderedMoves({
    position: position,
    moves: arbiter.getAllValidMoves({
      position: position,
      player: maximisePlayer ? "W" : "B",
    }),
    player: maximisePlayer ? "W" : "B",
  });
  if (moves.length === 0) {
    return evaluateBoard(position) * -1;
  }
  if (maximisePlayer) {
    let bestmove = -Infinity;
    const prevPos = copyPosition(position);
    for (let i = 0; i < moves.length; i++) {
      const result = arbiter.performMove({
        position: prevPos,
        piece: moves[i][0],
        rank: moves[i][1],
        file: moves[i][2],
        x: moves[i][3],
        y: moves[i][4],
      });

      bestmove = Math.max(
        bestmove,
        miniMax({
          position: result,
          depth: depth - 1,
          alpha: alpha,
          beta: beta,
          maximisePlayer: !maximisePlayer,
        }),
      );
      alpha = Math.max(alpha, bestmove);
      if (beta <= alpha) {
        return bestmove;
      }
    }
    return bestmove;
  } else {
    let bestmove = +Infinity;

    ////////////////////
    const prevPos = copyPosition(position);
    for (let i = 0; i < moves.length; i++) {
      const result = arbiter.performMove({
        position: prevPos,
        piece: moves[i][0],
        rank: moves[i][1],
        file: moves[i][2],
        x: moves[i][3],
        y: moves[i][4],
      });

      bestmove = Math.min(
        bestmove,
        miniMax({
          position: result,
          depth: depth - 1,
          alpha: alpha,
          beta: beta,
          maximisePlayer: !maximisePlayer,
        }),
      );
      beta = Math.min(beta, bestmove);
      if (beta <= alpha) {
        return bestmove;
      }
    }
    return bestmove;
  }

  /*  if (maximisePlayer) {
    let maxEval = -30000;
    for (let i = 0; i < moves.length; i++) {
    position = arbiter.performMove({
            position: position,
            piece: moves[i][0],
            rank: moves[i][1],
            file: moves[i][2],
            x: moves[i][3],
            y: moves[i][4],
          });
      maxEval = Math.max(
        maxEval,
        negaMax({
          position: position,

          depth: depth - 1,
          maximisePlayer: !maximisePlayer,
        }),
      );
      if (maxEval >= beta) {
        break;
      }
      alpha = Math.max(alpha, maxEval);
    }
    return maxEval;
  } else {
    let minEval = +30000;
    for (let i = 0; i < moves.length; i++) {
      position = arbiter.performMove({
        position: position,
        piece: moves[i][0],
        rank: moves[i][1],
        file: moves[i][2],
        x: moves[i][3],
        y: moves[i][4],
      });
      minEval = Math.min(
        minEval,
        negaMax({
          position: position,
          depth: depth - 1,
          maximisePlayer: !maximisePlayer,
        }),
      );
      if (minEval <= alpha) {
        break;
      }
      beta = Math.min(beta, minEval);
    }
    return minEval;
  }*/
};
