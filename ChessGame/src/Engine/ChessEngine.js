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
      score = 30;
      break;
    case "b":
      score = 50;
      break;
    case "r":
      score = 70;
      break;
    case "q":
      score = 90;
      break;
    case "k":
      score = 900;
      break;
    default:
      score = 0;
  }
  if (piece[1] == "W") {
    score *= -1;
  }
  return score;
};
