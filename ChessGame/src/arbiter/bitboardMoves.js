import {
    PIECES,
    ONE, ZERO,
    setBit, clearBit, getBit, countBits, bitScanForward, toSquareIndex, toRankFile, printBitboard,
    FILE_A, FILE_B, FILE_C, FILE_D, FILE_E, FILE_F, FILE_G, FILE_H,
    RANK_1, RANK_2, RANK_3, RANK_4, RANK_5, RANK_6, RANK_7, RANK_8,
    NOT_FILE_A, NOT_FILE_H, NOT_FILE_AB, NOT_FILE_GH,
    NOT_RANK_1, NOT_RANK_8,
    KNIGHT_ATTACKS, KING_ATTACKS
} from '../bitboard.js';

// Note: These functions generate pseudo-legal moves (they don't check for checks)
// The main arbiter will need to filter these for legality.

// --- Pawn Moves ---

/**
 * Generates pseudo-legal moves and captures for white pawns.
 * @param {bigint} pawnBB - Bitboard of white pawns.
 * @param {bigint} occupiedBB - Bitboard of all occupied squares.
 * @param {bigint} blackPiecesBB - Bitboard of all black pieces.
 * @param {number | null} enPassantTargetSq - The target square for en passant (0-63), or null.
 * @returns {{moves: bigint, captures: bigint}} - Bitboards for possible moves and captures.
 */
export const getWhitePawnMovesAndCaptures = (pawnBB, occupiedBB, blackPiecesBB, enPassantTargetSq) => {
    let moves = ZERO;
    let captures = ZERO;
    const enemyPiecesBB = blackPiecesBB; // Alias for clarity

    // 1. Single Push: Shift pawns north, exclude occupied squares
    const singlePushTargets = (pawnBB << 8n) & ~occupiedBB;
    moves |= singlePushTargets;

    // 2. Double Push: From rank 2, shift pawns north twice, exclude occupied squares
    const doublePushTargets = ((singlePushTargets & RANK_3) << 8n) & ~occupiedBB;
    moves |= doublePushTargets;

    // 3. Captures Left (North-West): Shift pawns NW, only include squares occupied by enemy
    const captureTargetsLeft = ((pawnBB & NOT_FILE_A) << 7n) & enemyPiecesBB;
    captures |= captureTargetsLeft;

    // 4. Captures Right (North-East): Shift pawns NE, only include squares occupied by enemy
    const captureTargetsRight = ((pawnBB & NOT_FILE_H) << 9n) & enemyPiecesBB;
    captures |= captureTargetsRight;

    // 5. En Passant
    if (enPassantTargetSq !== null) {
        const enPassantTargetBB = ONE << BigInt(enPassantTargetSq);
        // Check pawns that could attack the en passant target square
        // Pawn on left attacks EP target: shift EP target SE
        const epAttackersLeft = ((enPassantTargetBB & NOT_FILE_A) >> 9n) & pawnBB;
        // Pawn on right attacks EP target: shift EP target SW
        const epAttackersRight = ((enPassantTargetBB & NOT_FILE_H) >> 7n) & pawnBB;

        if (epAttackersLeft !== ZERO) {
            captures |= enPassantTargetBB;
        }
        if (epAttackersRight !== ZERO) {
            captures |= enPassantTargetBB;
        }
    }

    return { moves, captures };
};

/**
 * Generates pseudo-legal moves and captures for black pawns.
 * @param {bigint} pawnBB - Bitboard of black pawns.
 * @param {bigint} occupiedBB - Bitboard of all occupied squares.
 * @param {bigint} whitePiecesBB - Bitboard of all white pieces.
 * @param {number | null} enPassantTargetSq - The target square for en passant (0-63), or null.
 * @returns {{moves: bigint, captures: bigint}} - Bitboards for possible moves and captures.
 */
export const getBlackPawnMovesAndCaptures = (pawnBB, occupiedBB, whitePiecesBB, enPassantTargetSq) => {
    let moves = ZERO;
    let captures = ZERO;
    const enemyPiecesBB = whitePiecesBB; // Alias for clarity

    // 1. Single Push: Shift pawns south, exclude occupied squares
    const singlePushTargets = (pawnBB >> 8n) & ~occupiedBB;
    moves |= singlePushTargets;

    // 2. Double Push: From rank 7, shift pawns south twice, exclude occupied squares
    const doublePushTargets = ((singlePushTargets & RANK_6) >> 8n) & ~occupiedBB;
    moves |= doublePushTargets;

    // 3. Captures Left (South-West): Shift pawns SW, only include squares occupied by enemy
    const captureTargetsLeft = ((pawnBB & NOT_FILE_A) >> 9n) & enemyPiecesBB;
    captures |= captureTargetsLeft;

    // 4. Captures Right (South-East): Shift pawns SE, only include squares occupied by enemy
    const captureTargetsRight = ((pawnBB & NOT_FILE_H) >> 7n) & enemyPiecesBB;
    captures |= captureTargetsRight;

    // 5. En Passant
    if (enPassantTargetSq !== null) {
        const enPassantTargetBB = ONE << BigInt(enPassantTargetSq);
         // Check pawns that could attack the en passant target square
        // Pawn on left attacks EP target: shift EP target NE
        const epAttackersLeft = ((enPassantTargetBB & NOT_FILE_A) << 7n) & pawnBB;
        // Pawn on right attacks EP target: shift EP target NW
        const epAttackersRight = ((enPassantTargetBB & NOT_FILE_H) << 9n) & pawnBB;

        if (epAttackersLeft !== ZERO) {
            captures |= enPassantTargetBB;
        }
        if (epAttackersRight !== ZERO) {
            captures |= enPassantTargetBB;
        }
    }

    return { moves, captures };
};


// --- Knight Moves ---
/**
 * Generates pseudo-legal moves for knights.
 * @param {bigint} knightBB - Bitboard of knights of the current player.
 * @param {bigint} friendlyPiecesBB - Bitboard of all pieces of the current player.
 * @returns {bigint} - Bitboard of possible knight moves (including captures).
 */
export const getKnightMoves = (knightBB, friendlyPiecesBB) => {
    let allKnightMoves = ZERO;
    let knights = knightBB;

    while (knights !== ZERO) {
        const knightSq = bitScanForward(knights);
        const knightMoves = KNIGHT_ATTACKS[knightSq] & ~friendlyPiecesBB;
        allKnightMoves |= knightMoves;
        knights &= knights - ONE; // Clear the LSB
    }
    return allKnightMoves;
};

// --- King Moves ---
/**
 * Generates pseudo-legal moves for the king. Castling is handled separately.
 * @param {bigint} kingBB - Bitboard containing the king (should only have one bit set).
 * @param {bigint} friendlyPiecesBB - Bitboard of all pieces of the current player.
 * @returns {bigint} - Bitboard of possible king moves (including captures).
 */
export const getKingMoves = (kingBB, friendlyPiecesBB) => {
    if (kingBB === ZERO) return ZERO;
    const kingSq = bitScanForward(kingBB);
    return KING_ATTACKS[kingSq] & ~friendlyPiecesBB;
};


// --- Sliding Pieces (Rook, Bishop, Queen) ---

/**
 * Generates pseudo-legal moves for sliding pieces (Rook, Bishop, Queen) from a single square.
 * @param {number} square - The starting square index (0-63).
 * @param {bigint} occupiedBB - Bitboard of all occupied squares.
 * @param {bigint} friendlyPiecesBB - Bitboard of all pieces of the current player.
 * @param {Array<Array<number>>} directions - Array of direction vectors (e.g., [[0, 1], [1, 0], ...]).
 * @returns {bigint} - Bitboard of possible moves (including captures).
 */
const getSlidingMovesForSquare = (square, occupiedBB, friendlyPiecesBB, directions) => {
    let moves = ZERO;
    const startRank = Math.floor(square / 8);
    const startFile = square % 8;

    directions.forEach(([rankDir, fileDir]) => {
        for (let i = 1; i < 8; i++) {
            const targetRank = startRank + i * rankDir;
            const targetFile = startFile + i * fileDir;

            // Check if the target square is on the board
            if (targetRank < 0 || targetRank >= 8 || targetFile < 0 || targetFile >= 8) {
                break; // Off board
            }

            const targetSquare = toSquareIndex(targetRank, targetFile);
            const targetSquareBB = ONE << BigInt(targetSquare);

            // Check if the target square is occupied by a friendly piece
            if (targetSquareBB & friendlyPiecesBB) {
                break; // Blocked by friendly piece
            }

            moves |= targetSquareBB; // Add the square to moves

            // Check if the target square is occupied by an enemy piece
            if (targetSquareBB & occupiedBB) {
                break; // Capture and stop in this direction
            }
        }
    });
    return moves;
};

/**
 * Generates pseudo-legal moves for Rooks.
 * @param {bigint} rookBB - Bitboard of rooks of the current player.
 * @param {bigint} occupiedBB - Bitboard of all occupied squares.
 * @param {bigint} friendlyPiecesBB - Bitboard of all pieces of the current player.
 * @returns {bigint} - Bitboard of possible rook moves (including captures).
 */
export const getRookMoves = (rookBB, occupiedBB, friendlyPiecesBB) => {
    let allRookMoves = ZERO;
    let rooks = rookBB;
    const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]]; // Horizontal and Vertical

    while (rooks !== ZERO) {
        const rookSq = bitScanForward(rooks);
        allRookMoves |= getSlidingMovesForSquare(rookSq, occupiedBB, friendlyPiecesBB, directions);
        rooks &= rooks - ONE; // Clear the LSB
    }
    return allRookMoves;
};

/**
 * Generates pseudo-legal moves for Bishops.
 * @param {bigint} bishopBB - Bitboard of bishops of the current player.
 * @param {bigint} occupiedBB - Bitboard of all occupied squares.
 * @param {bigint} friendlyPiecesBB - Bitboard of all pieces of the current player.
 * @returns {bigint} - Bitboard of possible bishop moves (including captures).
 */
export const getBishopMoves = (bishopBB, occupiedBB, friendlyPiecesBB) => {
    let allBishopMoves = ZERO;
    let bishops = bishopBB;
    const directions = [[1, 1], [1, -1], [-1, 1], [-1, -1]]; // Diagonal

    while (bishops !== ZERO) {
        const bishopSq = bitScanForward(bishops);
        allBishopMoves |= getSlidingMovesForSquare(bishopSq, occupiedBB, friendlyPiecesBB, directions);
        bishops &= bishops - ONE; // Clear the LSB
    }
    return allBishopMoves;
};

/**
 * Generates pseudo-legal moves for Queens.
 * @param {bigint} queenBB - Bitboard of queens of the current player.
 * @param {bigint} occupiedBB - Bitboard of all occupied squares.
 * @param {bigint} friendlyPiecesBB - Bitboard of all pieces of the current player.
 * @returns {bigint} - Bitboard of possible queen moves (including captures).
 */
export const getQueenMoves = (queenBB, occupiedBB, friendlyPiecesBB) => {
    let allQueenMoves = ZERO;
    let queens = queenBB;
    const directions = [
        [0, 1], [0, -1], [1, 0], [-1, 0], // Horizontal and Vertical
        [1, 1], [1, -1], [-1, 1], [-1, -1]  // Diagonal
    ];

    while (queens !== ZERO) {
        const queenSq = bitScanForward(queens);
        allQueenMoves |= getSlidingMovesForSquare(queenSq, occupiedBB, friendlyPiecesBB, directions);
        queens &= queens - ONE; // Clear the LSB
    }
    return allQueenMoves;
};


// TODO: Implement getCastlingMoves (requires checking attacked squares)
