import { PIECES, ONE, ZERO, bitScanForward, setBit, clearBit, toSquareIndex, toRankFile, calculateCombinedBitboards, RANK_1, RANK_8, LIGHT_SQUARES, NOT_FILE_A, NOT_FILE_H, KNIGHT_ATTACKS, KING_ATTACKS } from '../bitboard.js';
import * as bbMoves from './bitboardMoves.js'; // Import all move functions
import { makeMove } from './makeBitboardMove.js'; // Import the function to simulate moves

// Helper function to get the piece type at a square from bitboards
const getPieceAtSquare = (bitboards, square) => {
    if (!bitboards || typeof square !== 'number' || square < 0 || square > 63) return PIECES.EMPTY;
    const squareBB = ONE << BigInt(square);
    // Use nullish coalescing for safety in case a bitboard is missing
    if (((bitboards[PIECES.wP] ?? ZERO) & squareBB) !== ZERO) return PIECES.wP;
    if (((bitboards[PIECES.wN] ?? ZERO) & squareBB) !== ZERO) return PIECES.wN;
    if (((bitboards[PIECES.wB] ?? ZERO) & squareBB) !== ZERO) return PIECES.wB;
    if (((bitboards[PIECES.wR] ?? ZERO) & squareBB) !== ZERO) return PIECES.wR;
    if (((bitboards[PIECES.wQ] ?? ZERO) & squareBB) !== ZERO) return PIECES.wQ;
    if (((bitboards[PIECES.wK] ?? ZERO) & squareBB) !== ZERO) return PIECES.wK;
    if (((bitboards[PIECES.bP] ?? ZERO) & squareBB) !== ZERO) return PIECES.bP;
    if (((bitboards[PIECES.bN] ?? ZERO) & squareBB) !== ZERO) return PIECES.bN;
    if (((bitboards[PIECES.bB] ?? ZERO) & squareBB) !== ZERO) return PIECES.bB;
    if (((bitboards[PIECES.bR] ?? ZERO) & squareBB) !== ZERO) return PIECES.bR;
    if (((bitboards[PIECES.bQ] ?? ZERO) & squareBB) !== ZERO) return PIECES.bQ;
    if (((bitboards[PIECES.bK] ?? ZERO) & squareBB) !== ZERO) return PIECES.bK;
    return PIECES.EMPTY;
};


const arbiter = {

  /**
   * Checks if a given square is attacked by the specified player.
   * @param {number} square - The square index (0-63) to check.
   * @param {string} player - The player ('W' or 'B') who might be attacking the square.
   * @param {object} bitboards - The current bitboard state.
   * @param {bigint} occupiedBB - Bitboard of all occupied squares.
   * @returns {boolean} - True if the square is attacked by the player, false otherwise.
   */
  isSquareAttacked: function (square, player, bitboards, occupiedBB) {
      console.log(`--- isSquareAttacked START ---`); // Log entry
      console.log(`Inputs: square=${square} (type: ${typeof square}), player=${player}, bitboards=${typeof bitboards}, occupiedBB=${occupiedBB} (type: ${typeof occupiedBB})`);

      // --- Add Guard for invalid square index ---
      if (typeof square !== 'number' || !Number.isInteger(square) || square < 0 || square > 63) {
          console.error(`isSquareAttacked: Invalid square index detected: ${square} (type: ${typeof square})`);
          return false; // Cannot determine attack on invalid square
      }
      // --- End Guard ---
       if (!bitboards || typeof bitboards !== 'object') {
           console.error(`isSquareAttacked: Invalid bitboards object received.`);
           return false; // Cannot proceed without valid bitboards
      }
       if (typeof occupiedBB !== 'bigint') {
            console.error(`isSquareAttacked: Invalid occupiedBB received (type: ${typeof occupiedBB})`);
            return false; // Or handle appropriately
       }


      const targetBB = ONE << BigInt(square);
      // Ensure combined bitboards exist, default to ZERO if not
      const friendlyPiecesBB = (player === 'W' ? bitboards.whitePieces : bitboards.blackPieces) ?? ZERO;
      const enemyPiecesBB = (player === 'W' ? bitboards.blackPieces : bitboards.whitePieces) ?? ZERO;
      console.log(`isSquareAttacked: targetBB=${targetBB}, friendlyPiecesBB=${friendlyPiecesBB}, enemyPiecesBB=${enemyPiecesBB}`);

      // Check attacks by pawns of the attacking player
      console.log(`isSquareAttacked: Checking pawn attacks by ${player}`);
      if (player === 'W') { // Check attacks BY White pawns
          const whitePawnBB = bitboards[PIECES.wP] ?? ZERO;
          console.log(`  -> White Pawn Check: whitePawnBB=${whitePawnBB} (type: ${typeof whitePawnBB})`);
          if (whitePawnBB !== ZERO) {
              // Check SW attack (Shift target SE, AND with white pawns)
              const potentialAttacker_SW = (targetBB & NOT_FILE_A) >> 9n;
              console.log(`    Potential SW Attacker: ${potentialAttacker_SW}`);
              if ((potentialAttacker_SW & whitePawnBB) !== ZERO) {
                  console.log(`  -> Pawn Attack DETECTED (W attacking from SW)`); return true;
              }
              // Check SE attack (Shift target SW, AND with white pawns)
              const potentialAttacker_SE = (targetBB & NOT_FILE_H) >> 7n;
               console.log(`    Potential SE Attacker: ${potentialAttacker_SE}`);
              if ((potentialAttacker_SE & whitePawnBB) !== ZERO) {
                   console.log(`  -> Pawn Attack DETECTED (W attacking from SE)`); return true;
              }
          }
      } else { // Check attacks BY Black pawns
          const blackPawnBB = bitboards[PIECES.bP] ?? ZERO;
           console.log(`  -> Black Pawn Check: blackPawnBB=${blackPawnBB} (type: ${typeof blackPawnBB})`);
          if (blackPawnBB !== ZERO) {
              // Check NW attack (Shift target NE, AND with black pawns)
              const potentialAttacker_NW = (targetBB & NOT_FILE_A) << 7n;
              console.log(`    Potential NW Attacker: ${potentialAttacker_NW}`);
              if ((potentialAttacker_NW & blackPawnBB) !== ZERO) {
                  console.log(`  -> Pawn Attack DETECTED (B attacking from NW)`); return true;
              }
              // Check NE attack (Shift target NW, AND with black pawns)
              const potentialAttacker_NE = (targetBB & NOT_FILE_H) << 9n;
              console.log(`    Potential NE Attacker: ${potentialAttacker_NE}`);
              if ((potentialAttacker_NE & blackPawnBB) !== ZERO) {
                  console.log(`  -> Pawn Attack DETECTED (B attacking from NE)`); return true;
              }
          }
      }

      // Check attacks by knights of the attacking player
      console.log(`isSquareAttacked: Checking knight attacks by ${player}`);
      const knightType = player === 'W' ? PIECES.wN : PIECES.bN;
      const knightBB = bitboards[knightType] ?? ZERO;
      const knightAttacks = KNIGHT_ATTACKS[square] ?? ZERO; // Use direct import
      console.log(`  -> Knight Check: square=${square}, knightAttacks=${knightAttacks} (type: ${typeof knightAttacks}), knightBB=${knightBB} (type: ${typeof knightBB})`);
      if (knightBB !== ZERO && (knightAttacks & knightBB)) { console.log(`  -> Knight Attack DETECTED`); return true; }

      // Check attacks by king of the attacking player
      console.log(`isSquareAttacked: Checking king attacks by ${player}`);
      const kingType = player === 'W' ? PIECES.wK : PIECES.bK;
      const kingBB = bitboards[kingType] ?? ZERO;
      const kingAttacks = KING_ATTACKS[square] ?? ZERO; // Use direct import
      console.log(`  -> King Check: square=${square}, kingAttacks=${kingAttacks} (type: ${typeof kingAttacks}), kingBB=${kingBB} (type: ${typeof kingBB})`);
      if (kingBB !== ZERO && (kingAttacks & kingBB)) { console.log(`  -> King Attack DETECTED`); return true; }

      // Check attacks by bishops/queen of the attacking player (diagonal)
      console.log(`isSquareAttacked: Checking diagonal attacks by ${player}`);
      const bishopType = player === 'W' ? PIECES.wB : PIECES.bB;
      const queenType = player === 'W' ? PIECES.wQ : PIECES.bQ;
      const bishopQueenBB = (bitboards[bishopType] ?? ZERO) | (bitboards[queenType] ?? ZERO);
      console.log(`  -> Diagonal Check: bishopQueenBB=${bishopQueenBB} (type: ${typeof bishopQueenBB})`);
      if (bishopQueenBB !== ZERO) {
          const bishopAttacks = bbMoves.getBishopMoves(bishopQueenBB, occupiedBB, friendlyPiecesBB);
          console.log(`  -> Diagonal Check: bishopAttacks=${bishopAttacks} (type: ${typeof bishopAttacks}), targetBB=${targetBB}`);
          if ((bishopAttacks ?? ZERO) & targetBB) { console.log(`  -> Diagonal Attack DETECTED`); return true; }
      }

      // Check attacks by rooks/queen of the attacking player (horizontal/vertical)
      console.log(`isSquareAttacked: Checking rank/file attacks by ${player}`);
      const rookType = player === 'W' ? PIECES.wR : PIECES.bR;
      // queenType already defined
      const rookQueenBB = (bitboards[rookType] ?? ZERO) | (bitboards[queenType] ?? ZERO);
       console.log(`  -> Rank/File Check: rookQueenBB=${rookQueenBB} (type: ${typeof rookQueenBB})`);
      if (rookQueenBB !== ZERO) {
          const rookAttacks = bbMoves.getRookMoves(rookQueenBB, occupiedBB, friendlyPiecesBB);
          console.log(`  -> Rank/File Check: rookAttacks=${rookAttacks} (type: ${typeof rookAttacks}), targetBB=${targetBB}`);
          if ((rookAttacks ?? ZERO) & targetBB) { console.log(`  -> Rank/File Attack DETECTED`); return true; }
      }

      console.log(`--- isSquareAttacked END (returning false) ---`);
      return false;
  },

  /**
   * Generates all legal moves for the current player.
   * @param {number|null} fromSquare - Optional specific square to get moves from, or null for all moves
   * @param {object} gameState - The current game state including bitboards, occupied, turn, castling rights, enPassantTargetSq etc.
   * @returns {Array<object>} - An array of legal move objects, e.g., [{ from, to, piece, promotion?, capture?, special? }]
   */
  getValidMoves: function (fromSquare, gameState) {
    // Handle the case where only one parameter is passed (backward compatibility)
    if (arguments.length === 1) {
      gameState = fromSquare;
      fromSquare = null;
    }
    
    // Validate gameState
    if (!gameState || !gameState.bitboards || typeof gameState.occupied !== 'bigint' || !gameState.turn || !gameState.castleDirection) {
      console.error("getValidMoves: Invalid gameState received", gameState);
      return [];
    }
    const { bitboards, occupied, whitePieces, blackPieces, turn, castleDirection, enPassantTargetSq } = gameState;
    const legalMoves = [];
    const player = turn;
    const opponent = player === 'W' ? 'B' : 'W';
    const friendlyPiecesBB = player === 'W' ? (whitePieces ?? ZERO) : (blackPieces ?? ZERO);
    const enemyPiecesBB = player === 'W' ? (blackPieces ?? ZERO) : (whitePieces ?? ZERO);

    const pieceTypes = player === 'W'
      ? [PIECES.wP, PIECES.wN, PIECES.wB, PIECES.wR, PIECES.wQ, PIECES.wK]
      : [PIECES.bP, PIECES.bN, PIECES.bB, PIECES.bR, PIECES.bQ, PIECES.bK];

    pieceTypes.forEach(pieceType => {
      let pieceBB = bitboards[pieceType] ?? ZERO;
      
      // If a specific fromSquare is provided, only consider moves from that square
      if (fromSquare !== null && fromSquare !== undefined) {
        // Check if the piece type exists on the specified square
        const fromSqBB = ONE << BigInt(fromSquare);
        if ((pieceBB & fromSqBB) === 0n) {
          // This piece type doesn't exist on the specified square, skip it
          return;
        }
        // Only consider the specified square
        pieceBB = fromSqBB;
      }

      while (pieceBB !== ZERO) {
        const fromSq = bitScanForward(pieceBB);
        if (fromSq === -1) { console.error("bitScanForward returned -1 for non-zero bitboard:", pieceBB); break; }
        const fromSqBB = ONE << BigInt(fromSq);
        let pseudoLegalMovesBB = ZERO;

        try {
            switch (pieceType) {
                case PIECES.wP: { const { moves, captures } = bbMoves.getWhitePawnMovesAndCaptures(fromSqBB, occupied, enemyPiecesBB, enPassantTargetSq); pseudoLegalMovesBB = moves | captures; break; }
                case PIECES.bP: { const { moves, captures } = bbMoves.getBlackPawnMovesAndCaptures(fromSqBB, occupied, enemyPiecesBB, enPassantTargetSq); pseudoLegalMovesBB = moves | captures; break; }
                case PIECES.wN: case PIECES.bN: pseudoLegalMovesBB = bbMoves.getKnightMoves(fromSqBB, friendlyPiecesBB); break;
                case PIECES.wB: case PIECES.bB: pseudoLegalMovesBB = bbMoves.getBishopMoves(fromSqBB, occupied, friendlyPiecesBB); break;
                case PIECES.wR: case PIECES.bR: pseudoLegalMovesBB = bbMoves.getRookMoves(fromSqBB, occupied, friendlyPiecesBB); break;
                case PIECES.wQ: case PIECES.bQ: pseudoLegalMovesBB = bbMoves.getQueenMoves(fromSqBB, occupied, friendlyPiecesBB); break;
                case PIECES.wK: case PIECES.bK: pseudoLegalMovesBB = bbMoves.getKingMoves(fromSqBB, friendlyPiecesBB); break;
            }
        } catch (error) { console.error(`Error generating pseudo-legal moves for piece ${pieceType} at square ${fromSq}:`, error); pseudoLegalMovesBB = ZERO; }

        while (pseudoLegalMovesBB !== ZERO) {
            const toSq = bitScanForward(pseudoLegalMovesBB);
            if (toSq === -1) { console.error("bitScanForward returned -1 for non-zero pseudoLegalMovesBB:", pseudoLegalMovesBB); break; }
            const toSqBB = ONE << BigInt(toSq);
            let isEnPassant = false;
            let capturedPieceType = getPieceAtSquare(bitboards, toSq);
            let promotionPieceType = null;

            if ((pieceType === PIECES.wP || pieceType === PIECES.bP) && toSq === enPassantTargetSq) {
                isEnPassant = true;
                capturedPieceType = (player === 'W') ? PIECES.bP : PIECES.wP;
            }
            // Check for pawn promotion
            const isPromotion = (pieceType === PIECES.wP && (toSqBB & RANK_8)) || (pieceType === PIECES.bP && (toSqBB & RANK_1));
            if (isPromotion) {
                // For move generation, default to queen promotion
                // The actual promotion piece will be selected by the user in the UI
                promotionPieceType = (player === 'W') ? PIECES.wQ : PIECES.bQ;
            }

            try {
                let nextBitboards = makeMove(bitboards, fromSq, toSq, pieceType, isEnPassant ? PIECES.EMPTY : capturedPieceType, promotionPieceType);
                if (isEnPassant) {
                    const capturedPawnSq = (player === 'W') ? toSq - 8 : toSq + 8;
                    const capturedPawnBB = ONE << BigInt(capturedPawnSq);
                    const actualCapturedType = (player === 'W') ? PIECES.bP : PIECES.wP;
                    if (nextBitboards[actualCapturedType]) { nextBitboards[actualCapturedType] &= ~capturedPawnBB; }
                    else { console.warn(`Attempted to remove captured en passant pawn of type ${actualCapturedType}, but bitboard was undefined.`); }
                }
                const nextCombined = calculateCombinedBitboards(nextBitboards);
                if (!this.isPlayerInCheck(player, nextBitboards, nextCombined.occupied)) {
                    // Check if destination has an enemy piece (standard capture)
                const toBB = ONE << BigInt(toSq);
                const isCapture = (gameState.occupied & toBB) !== 0n;
                
                // For pawns, diagonal moves are always captures
                const isPawnDiagonalMove = (pieceType === PIECES.wP || pieceType === PIECES.bP) && 
                                          Math.abs(fromSq % 8 - toSq % 8) === 1;
                
                // En passant is a special capture
                const isEnPassantCapture = isEnPassant && isPawnDiagonalMove;
                
                // Create move object with correct capture flag
                const move = { 
                    from: fromSq, 
                    to: toSq, 
                    piece: pieceType, 
                    promotion: promotionPieceType, 
                    capture: isCapture || isEnPassantCapture, 
                    enPassant: isEnPassant, 
                    castle: null 
                };
                
                // Debug log
                console.log(`Generated move: ${JSON.stringify(move)}`, 
                           `isCapture=${isCapture}`, 
                           `isPawnDiagonalMove=${isPawnDiagonalMove}`, 
                           `isEnPassantCapture=${isEnPassantCapture}`);
                    legalMoves.push(move);
                }
            } catch (error) { console.error(`Error checking legality for move ${fromSq}->${toSq} (piece ${pieceType}):`, error); }

            pseudoLegalMovesBB &= pseudoLegalMovesBB - ONE;
        }
        pieceBB &= pieceBB - ONE;
      }
    });

    // --- Castling Move Generation and Validation ---
    const kingPieceType = player === 'W' ? PIECES.wK : PIECES.bK;
    const kingStartSq = player === 'W' ? 4 : 60;
    const currentKingBB = bitboards[kingPieceType] ?? ZERO;

    if ((currentKingBB & (ONE << BigInt(kingStartSq))) !== ZERO) {
        if (!this.isPlayerInCheck(player, bitboards, occupied)) {
            const canCastle = castleDirection[player];
            const opponent = player === 'W' ? 'B' : 'W';

            // White King Side (O-O)
            if (player === 'W' && (canCastle === 'both' || canCastle === 'right')) {
                if (!(occupied & 0x60n) && !this.isSquareAttacked(5, opponent, bitboards, occupied) && !this.isSquareAttacked(6, opponent, bitboards, occupied)) {
                     legalMoves.push({ from: kingStartSq, to: 6, piece: kingPieceType, promotion: null, capture: false, enPassant: false, castle: 'k' });
                }
            }
            // White Queen Side (O-O-O)
            if (player === 'W' && (canCastle === 'both' || canCastle === 'left')) {
                if (!(occupied & 0xEn) && !this.isSquareAttacked(2, opponent, bitboards, occupied) && !this.isSquareAttacked(3, opponent, bitboards, occupied)) {
                      legalMoves.push({ from: kingStartSq, to: 2, piece: kingPieceType, promotion: null, capture: false, enPassant: false, castle: 'q' });
                 }
            }
            // Black King Side (O-O)
            if (player === 'B' && (canCastle === 'both' || canCastle === 'right')) {
                if (!(occupied & 0x6000000000000000n) && !this.isSquareAttacked(61, opponent, bitboards, occupied) && !this.isSquareAttacked(62, opponent, bitboards, occupied)) {
                      legalMoves.push({ from: kingStartSq, to: 62, piece: kingPieceType, promotion: null, capture: false, enPassant: false, castle: 'k' });
                 }
            }
            // Black Queen Side (O-O-O)
            if (player === 'B' && (canCastle === 'both' || canCastle === 'left')) {
                if (!(occupied & 0xE00000000000000n) && !this.isSquareAttacked(58, opponent, bitboards, occupied) && !this.isSquareAttacked(59, opponent, bitboards, occupied)) {
                      legalMoves.push({ from: kingStartSq, to: 58, piece: kingPieceType, promotion: null, capture: false, enPassant: false, castle: 'q' });
                }
            }
        }
    }

    return legalMoves;
  }, // End of getValidMoves

   /**
    * Checks if the given player is in check using bitboards.
    * @param {string} player - The player to check ('W' or 'B').
    * @param {object} bitboards - The current bitboard state.
    * @param {bigint} occupiedBB - Bitboard of all occupied squares.
    * @returns {boolean} - True if the player is in check, false otherwise.
    */
   isPlayerInCheck: function (player, bitboards, occupiedBB) {
     if (!bitboards || typeof bitboards !== 'object') {
         console.error(`isPlayerInCheck: Invalid bitboards object received.`);
         return true;
     }
      if (typeof occupiedBB !== 'bigint') {
            console.error(`isPlayerInCheck: Invalid occupiedBB received (type: ${typeof occupiedBB})`);
            return true;
       }

     const kingPiece = player === 'W' ? PIECES.wK : PIECES.bK;
     const kingBB = bitboards[kingPiece] ?? ZERO;

     if (kingBB === ZERO) {
         // console.error(`Cannot find ${player} king on the board!`);
         return true;
     }
     const kingSq = bitScanForward(kingBB);
     if (kingSq === -1) {
        console.error(`bitScanForward failed to find king for ${player} despite non-zero bitboard! Bitboard:`, kingBB);
        return true;
     }
     const opponent = player === 'W' ? 'B' : 'W';
     return this.isSquareAttacked(kingSq, opponent, bitboards, occupiedBB);
   },

  /**
   * Checks if the current player is in stalemate.
   * @param {object} gameState - The current game state.
   * @returns {boolean} - True if the player is in stalemate.
   */
  isStalemate: function (gameState) {
    if (!gameState || !gameState.bitboards) return false;
    const { turn, bitboards, occupied } = gameState;
    if (this.isPlayerInCheck(turn, bitboards, occupied)) {
        return false;
    }
    const legalMoves = this.getValidMoves(gameState);
    return legalMoves.length === 0;
  },

  /**
   * Checks for insufficient mating material.
   * @param {object} bitboards - The current bitboard state.
   * @returns {boolean} - True if neither side has enough material to force checkmate.
   */
  insufficientMaterial: function (bitboards) {
       if (!bitboards) return false;
      const numWhitePawns = bbMoves.countBits(bitboards[PIECES.wP] ?? ZERO);
      const numBlackPawns = bbMoves.countBits(bitboards[PIECES.bP] ?? ZERO);
      const numWhiteRooks = bbMoves.countBits(bitboards[PIECES.wR] ?? ZERO);
      const numBlackRooks = bbMoves.countBits(bitboards[PIECES.bR] ?? ZERO);
      const numWhiteQueens = bbMoves.countBits(bitboards[PIECES.wQ] ?? ZERO);
      const numBlackQueens = bbMoves.countBits(bitboards[PIECES.bQ] ?? ZERO);

      if (numWhitePawns > 0 || numBlackPawns > 0 || numWhiteRooks > 0 || numBlackRooks > 0 || numWhiteQueens > 0 || numBlackQueens > 0) {
          return false;
      }

      const numWhiteKnights = bbMoves.countBits(bitboards[PIECES.wN] ?? ZERO);
      const numBlackKnights = bbMoves.countBits(bitboards[PIECES.bN] ?? ZERO);
      const numWhiteBishops = bbMoves.countBits(bitboards[PIECES.wB] ?? ZERO);
      const numBlackBishops = bbMoves.countBits(bitboards[PIECES.bB] ?? ZERO);
      const numWhiteMinors = numWhiteKnights + numWhiteBishops;
      const numBlackMinors = numBlackKnights + numBlackBishops;
      const totalMinors = numWhiteMinors + numBlackMinors;

      if (totalMinors === 0) return true; // K vs K
      if (numWhiteMinors === 1 && numBlackMinors === 0) return true; // K+N/B vs K
      if (numBlackMinors === 1 && numWhiteMinors === 0) return true; // K vs K+N/B

      if (numWhiteMinors === 1 && numWhiteKnights === 0 && numBlackMinors === 1 && numBlackKnights === 0) {
          const whiteBishopBB = bitboards[PIECES.wB] ?? ZERO;
          const blackBishopBB = bitboards[PIECES.bB] ?? ZERO;
          if (whiteBishopBB === ZERO || blackBishopBB === ZERO) return false;
          const whiteBishopSq = bitScanForward(whiteBishopBB);
          const blackBishopSq = bitScanForward(blackBishopBB);
           if (whiteBishopSq === -1 || blackBishopSq === -1) return false;
          const whiteBishopIsLight = (LIGHT_SQUARES & (ONE << BigInt(whiteBishopSq))) !== ZERO;
          const blackBishopIsLight = (LIGHT_SQUARES & (ONE << BigInt(blackBishopSq))) !== ZERO;
          if (whiteBishopIsLight === blackBishopIsLight) return true; // KB vs KB same color
      }
      return false;
  },

  /**
   * Checks if the current player is in checkmate.
   * @param {object} gameState - The current game state.
   * @returns {boolean} - True if the player is in checkmate.
   */
  isCheckMate: function (gameState) {
    if (!gameState || !gameState.bitboards) return false;
    const { turn, bitboards, occupied } = gameState;
    if (!this.isPlayerInCheck(turn, bitboards, occupied)) {
        return false;
    }
    const legalMoves = this.getValidMoves(gameState);
    return legalMoves.length === 0;
  },
};

export default arbiter;
