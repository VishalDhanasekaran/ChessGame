import arbiter from "../arbiter/arbiter";
import { copyPosition } from "../helper";
import { clearCandidateMoves, makeNewMove } from "../reducer/actions/move";

export const evaluateBoard = (board) => {
  let totalScore = 0;
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      totalScore += getPieceScore(board[i][j]);
    }
  }
  return totalScore;
};
const getPieceScore = (piece) => {
  let score = 0;
  switch (piece[0]) {
    case "p":
      score = 10;
      break;
    case "n":
      score = 50;
      break;
    case "b":
      score = 90;
      break;
    case "r":
      score = 130;
      break;
    case "q":
      score = 170;
      break;
    case "k":
      score = 1700;
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
    dispatch(makeNewMove({ newPosition: updatedPosition }));
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
        (getPieceScore(moves[i][0]) + 10) * (player === "W" ? 1 : -1);
    } else if (position[moves[i][3]][moves[i][4]].endsWith(player)) {
      moves[i][5] +=
        (getPieceScore(moves[i][0]) - 10) * (player === "W" ? 1 : -1);
    }
    if (
      arbiter.isPlayerInCheck({
        positionAfterMove: result,
        position: position,
        player: player,
      })
    ) {
      moves[i][5] = moves[i][5] * -1;
    } else if (
      arbiter.isPlayerInCheck({
        positionAfterMove: result,
        position: position,
        player: player === "W" ? "B" : "W",
      })
    ) {
      moves[i][5] = moves[i][5] + 1000 * (player === "W" ? 1 : -1);
    }
  }
  return moves.sort(function (a, b) {
    return a[5] - b[5];
  });
};
export const findBestMove = ({ position, player }) => {
  let moves = arbiter.getAllValidMoves({ position, player });
  moves = orderedMoves({
    position: position,
    moves: moves,
    player: player,
  });
  let lowestindex = -1;
  let lowestScore = +Infinity;
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
    const score = negaMax({
      position: result,
      depth: 5,
      alpha: -Infinity,
      beta: +Infinity,
      color: -1,
    });
    if (score < lowestScore) {
      lowestScore = score;
      lowestindex = i;
    }
  }
  if (moves.length > 0) {
    return moves[lowestindex];
  }
};
export const negaMax = ({ position, depth, alpha, beta, color }) => {
  if (depth === 0 || arbiter.insufficientMaterial(position)) {
    if (depth !== 0) {
      console.log("depth reach");
    }
    return evaluateBoard(position) * color;
  }
  const moves = arbiter.getAllValidMoves({
    position: position,
    player: color === 1 ? "W" : "B",
  });
  if (moves.length === 0) {
    return evaluateBoard(position) * color;
  }
  let value = -Infinity;
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
    if (i == 0) {
      value =
        -1 *
        negaMax({
          position: result,
          depth: depth - 1,
          beta: -1 * beta,
          alpha: -1 * alpha,
          color: color * -1,
        });
    } else {
      value =
        -1 *
        negaMax({
          position: result,
          depth: depth - 1,
          beta: -1 * alpha,
          alpha: -1 * alpha - 1,
          color: color * -1,
        });
      if (alpha < value && value < beta) {
        value =
          -1 *
          negaMax({
            position: result,
            depth: depth - 1,
            beta: -1 * beta,
            alpha: -1 * alpha,
            color: color * -1,
          });
      }
    }
    alpha = Math.max(alpha, value);
    if (alpha >= beta) {
      break;
    }
  }
  return alpha;

  /*  if (maximisePlayer) {
    let maxEval = -Infinity;
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
    let minEval = +Infinity;
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
