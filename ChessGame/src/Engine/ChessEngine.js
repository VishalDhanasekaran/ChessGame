import arbiter from "../arbiter/arbiter";
import { clearCandidateMoves, makeNewMove, generateCandidateMoves } from "../reducer/actions/move";
import { PIECES, bitScanForward, toSquareIndex, ONE } from '../bitboard';
import { executeMove } from "../arbiter/makeBitboardMove.js";

/**
 * Evaluates the current board position and returns a score
 * @param {Object} bitboards - Bitboard representation of the chess position
 * @returns {number} - Score of the position (positive favors white, negative favors black)
 */
export const evaluateBoard = (bitboards) => {
  if (!bitboards) return 0;
  
  let materialScore = 0;
  let positionalScore = 0;
  let mobilityScore = 0;
  let kingSafetyScore = 0;
  
  // Track piece counts for both sides
  const pieceCounts = {
    white: { pawns: 0, knights: 0, bishops: 0, rooks: 0, queens: 0 },
    black: { pawns: 0, knights: 0, bishops: 0, rooks: 0, queens: 0 }
  };
  
  // Evaluate material and position for each piece type
  for (const pieceType in PIECES) {
    if (pieceType === 'EMPTY') continue;
    
    const bb = bitboards[PIECES[pieceType]];
    if (!bb || bb === 0n) continue;
    
    // Clone the bitboard for iteration
    let tempBB = BigInt(bb);
    
    // Process each piece of this type
    while (tempBB > 0n) {
      const squareIndex = bitScanForward(tempBB);
      const rank = Math.floor(squareIndex / 8);
      const file = squareIndex % 8;
      
      // Get piece symbol (e.g., 'p' for pawn)
      const pieceSymbol = pieceType.charAt(1).toLowerCase();
      // Get piece color (e.g., 'W' for white)
      const pieceColor = pieceType.charAt(0);
      
      // Create piece notation like 'pW' for white pawn
      const piece = pieceSymbol + pieceColor;
      
      // Update piece counts
      if (pieceColor === 'W') {
        switch (pieceSymbol) {
          case 'p': pieceCounts.white.pawns++; break;
          case 'n': pieceCounts.white.knights++; break;
          case 'b': pieceCounts.white.bishops++; break;
          case 'r': pieceCounts.white.rooks++; break;
          case 'q': pieceCounts.white.queens++; break;
        }
      } else {
        switch (pieceSymbol) {
          case 'p': pieceCounts.black.pawns++; break;
          case 'n': pieceCounts.black.knights++; break;
          case 'b': pieceCounts.black.bishops++; break;
          case 'r': pieceCounts.black.rooks++; break;
          case 'q': pieceCounts.black.queens++; break;
        }
      }
      
      // Add piece value and position score
      const pieceScore = getPieceScore(piece, rank, file);
      materialScore += pieceScore;
      
      // Clear the least significant bit to move to the next piece
      tempBB &= tempBB - 1n;
    }
  }
  
  // Bonus for bishop pair
  if (pieceCounts.white.bishops >= 2) materialScore += 50;
  if (pieceCounts.black.bishops >= 2) materialScore -= 50;
  
  // Penalize having no pawns
  if (pieceCounts.white.pawns === 0) materialScore -= 100;
  if (pieceCounts.black.pawns === 0) materialScore += 100;
  
  // Endgame detection - no queens or less than 3 pieces excluding pawns and kings
  const whiteMinorPieces = pieceCounts.white.knights + pieceCounts.white.bishops;
  const blackMinorPieces = pieceCounts.black.knights + pieceCounts.black.bishops;
  const whiteMajorPieces = pieceCounts.white.rooks + pieceCounts.white.queens;
  const blackMajorPieces = pieceCounts.black.rooks + pieceCounts.black.queens;
  
  const isEndgame = (pieceCounts.white.queens + pieceCounts.black.queens === 0) || 
                   (whiteMinorPieces + whiteMajorPieces <= 2 && blackMinorPieces + blackMajorPieces <= 2);
  
  // In endgame, prioritize pushing pawns
  if (isEndgame) {
    // Add endgame-specific evaluation here
    // For example, centralize king in endgame
  }
  
  // Combine all evaluation components
  const totalScore = materialScore + positionalScore + mobilityScore + kingSafetyScore;
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
  return piece[1] === "W" ? score : -score;
};

/**
 * Makes an automated move for the AI player
 * @param {Object} appState - Current application state
 * @param {Function} dispatch - Redux dispatch function
 */
export const makeAutomatedMove = (appState, dispatch) => {
  console.log('Making automated move for AI');
  
  // Get the latest game state from history
  const latestState = appState.history[appState.history.length - 1];
  const { bitboards, turn } = latestState;
  
  if (!bitboards || !turn) {
    console.error('Invalid game state for automated move');
    return;
  }
  
  // Get all valid moves for the current player
  const validMoves = arbiter.getValidMoves(null, latestState);
  
  if (!validMoves || validMoves.length === 0) {
    console.log('No valid moves available for AI');
    // Check if this is a checkmate or stalemate
    if (arbiter.isPlayerInCheck(turn, bitboards, latestState.occupied)) {
      console.log(`Checkmate! ${turn === 'W' ? 'Black' : 'White'} wins!`);
    } else {
      console.log('Stalemate! Game is a draw.');
    }
    return;
  }
  
  console.log(`AI found ${validMoves.length} valid moves to choose from`);
  
  // Use findBestMove to select a good move instead of random selection
  console.log('AI is thinking...');
  const bestMove = findBestMove(latestState);
  console.log('AI selected best move:', bestMove);
  
  // If findBestMove fails for some reason, fall back to random selection
  const selectedMove = bestMove || validMoves[Math.floor(Math.random() * validMoves.length)];
  
  // Check if the move is a capture
  const toBB = ONE << BigInt(selectedMove.to);
  const isCapture = (latestState.occupied & toBB) !== 0n;
  
  // Check for en passant capture
  const isPawnDiagonalMove = (selectedMove.piece === PIECES.wP || selectedMove.piece === PIECES.bP) && 
                            Math.abs(selectedMove.from % 8 - selectedMove.to % 8) === 1;
  const isEnPassantCapture = latestState.enPassantTargetSq === selectedMove.to && isPawnDiagonalMove;
  
  // Create the move object
  const moveObject = {
    from: selectedMove.from,
    to: selectedMove.to,
    piece: selectedMove.piece,
    promotion: selectedMove.promotion || null,
    capture: isCapture || isEnPassantCapture,
    enPassant: isEnPassantCapture,
    castle: selectedMove.castle || null
  };
  
  // Dispatch the move
  dispatch(makeNewMove(moveObject));
  dispatch(clearCandidateMoves());
};

/**
 * Finds the best move for the current player using a simplified evaluation
 * @param {Object} gameState - Current game state with bitboards
 * @returns {Object} - Best move object
 */
export const findBestMove = (gameState) => {
  // Get all valid moves for the current player
  let moves = arbiter.getValidMoves(null, gameState);
  
  if (!moves || moves.length === 0) {
    return null;
  }
  
  // Basic move scoring function
  const scoreMoves = (moves, gameState) => {
    return moves.map(move => {
      let score = 0;
      
      // Prioritize captures based on captured piece value
      if (move.capture) {
        // Find what piece might be captured at the target square
        const targetSquareBB = ONE << BigInt(move.to);
        for (const pieceType in PIECES) {
          if (pieceType === 'EMPTY') continue;
          
          // Check if this piece type is on the target square
          if (gameState.bitboards[PIECES[pieceType]] && 
              (BigInt(gameState.bitboards[PIECES[pieceType]]) & targetSquareBB) !== 0n) {
            // Add value based on piece type
            score += getPieceBaseValue(pieceType);
            break;
          }
        }
      }
      
      // Prioritize promotions
      if (move.promotion) {
        score += 900; // Queen value
      }
      
      // Prioritize center control for pawns and knights
      if ((move.piece === PIECES.wP || move.piece === PIECES.bP || 
           move.piece === PIECES.wN || move.piece === PIECES.bN) && 
          (move.to === 27 || move.to === 28 || move.to === 35 || move.to === 36)) {
        score += 10;
      }
      
      return { move, score };
    });
  };
  
  // Score and sort the moves
  const scoredMoves = scoreMoves(moves, gameState);
  scoredMoves.sort((a, b) => b.score - a.score);
  
  // Return the highest scored move
  return scoredMoves[0].move;
};

/**
 * MiniMax algorithm with alpha-beta pruning for chess AI
 * @param {Object} params - Parameters for minimax
 * @returns {number} - Evaluation score
 */
export const miniMax = ({ gameState, depth, alpha, beta, maximizePlayer }) => {
  // Terminal conditions
  if (depth === 0) {
    return evaluateBoard(gameState.bitboards);
  }
  
  // Get current player
  const currentPlayer = maximizePlayer ? 'W' : 'B';
  
  // Get valid moves for current player
  const validMoves = arbiter.getValidMoves(null, {
    ...gameState,
    turn: currentPlayer
  });
  
  // Order moves for better pruning
  const moves = orderedMoves({
    gameState,
    moves: validMoves,
    player: currentPlayer
  });
  
  // No moves available - checkmate or stalemate
  if (moves.length === 0) {
    // Check if king is in check (checkmate)
    if (arbiter.isPlayerInCheck(currentPlayer, gameState.bitboards, gameState.occupied)) {
      return maximizePlayer ? -100000 : 100000; // Checkmate
    }
    return 0; // Stalemate
  }
  
  if (maximizePlayer) {
    let bestScore = -Infinity;
    
    for (let i = 0; i < moves.length; i++) {
      // Create a deep copy of the game state
      const nextGameState = JSON.parse(JSON.stringify(gameState));
      nextGameState.bitboards = {};
      
      // Copy BigInt values properly
      for (const pieceType in gameState.bitboards) {
        nextGameState.bitboards[pieceType] = BigInt(gameState.bitboards[pieceType].toString());
      }
      
      // Execute the move
      const { newBitboards } = executeMove(nextGameState, moves[i]);
      nextGameState.bitboards = newBitboards;
      
      // Recursive evaluation
      const score = miniMax({
        gameState: nextGameState,
        depth: depth - 1,
        alpha,
        beta,
        maximizePlayer: !maximizePlayer
      });
      
      bestScore = Math.max(bestScore, score);
      alpha = Math.max(alpha, bestScore);
      
      // Alpha-beta pruning
      if (beta <= alpha) {
        break;
      }
    }
    
    return bestScore;
  } else {
    let bestScore = Infinity;
    
    for (let i = 0; i < moves.length; i++) {
      // Create a deep copy of the game state
      const nextGameState = JSON.parse(JSON.stringify(gameState));
      nextGameState.bitboards = {};
      
      // Copy BigInt values properly
      for (const pieceType in gameState.bitboards) {
        nextGameState.bitboards[pieceType] = BigInt(gameState.bitboards[pieceType].toString());
      }
      
      // Execute the move
      const { newBitboards } = executeMove(nextGameState, moves[i]);
      nextGameState.bitboards = newBitboards;
      
      // Recursive evaluation
      const score = miniMax({
        gameState: nextGameState,
        depth: depth - 1,
        alpha,
        beta,
        maximizePlayer: !maximizePlayer
      });
      
      bestScore = Math.min(bestScore, score);
      beta = Math.min(beta, bestScore);
      
      // Alpha-beta pruning
      if (beta <= alpha) {
        break;
      }
    }
    
    return bestScore;
  }
};

/**
 * Orders moves for better alpha-beta pruning efficiency
 * @param {Object} params - Parameters for move ordering
 * @returns {Array} - Ordered moves
 */
export const orderedMoves = ({ gameState, moves, player }) => {
  if (!moves || moves.length === 0) return [];
  
  const scoredMoves = moves.map(move => {
    let score = 0;
    
    // Prioritize captures based on piece values
    if (move.capture) {
      // Find which piece is being captured
      const toBB = ONE << BigInt(move.to);
      for (const pieceType in PIECES) {
        if (pieceType === 'EMPTY') continue;
        
        if (gameState.bitboards[PIECES[pieceType]] && 
            (gameState.bitboards[PIECES[pieceType]] & toBB) !== 0n) {
          // Add captured piece value to score
          score += getPieceBaseValue(pieceType);
          break;
        }
      }
    }
    
    // Prioritize promotions
    if (move.promotion) {
      score += 900; // Queen value
    }
    
    // Prioritize center control for pawns and knights in opening
    if ((move.piece === PIECES.wP || move.piece === PIECES.bP || 
         move.piece === PIECES.wN || move.piece === PIECES.bN) && 
        (move.to === 27 || move.to === 28 || move.to === 35 || move.to === 36)) {
      score += 10;
    }
    
    return { move, score };
  });
  
  // Sort moves by score (descending)
  scoredMoves.sort((a, b) => b.score - a.score);
  
  return scoredMoves.map(m => m.move);
};

/**
 * Gets the base value of a piece type
 * @param {string} pieceType - Type of piece (e.g., 'wP', 'bQ')
 * @returns {number} - Base value of the piece
 */
const getPieceBaseValue = (pieceType) => {
  const piece = pieceType.charAt(1).toLowerCase();
  
  switch (piece) {
    case 'p': return 100;  // Pawn
    case 'n': return 320;  // Knight
    case 'b': return 330;  // Bishop
    case 'r': return 500;  // Rook
    case 'q': return 900;  // Queen
    case 'k': return 20000; // King
    default: return 0;
  }
};
