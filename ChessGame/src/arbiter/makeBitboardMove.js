import { PIECES, ONE, ZERO, clearBit, setBit, calculateCombinedBitboards } from '../bitboard.js';

/**
 * Updates the bitboard state after a move is made.
 * Handles piece movement, captures, and promotions.
 * Does NOT handle castling or en passant capture side effects (removing the captured pawn in EP).
 * Does NOT handle updating castling rights. These should be handled separately.
 *
 * @param {object} currentBitboards - The current state of all piece bitboards.
 * @param {number} fromSq - The starting square index (0-63).
 * @param {number} toSq - The ending square index (0-63).
 * @param {number} movedPieceType - The PIECES enum value for the piece being moved.
 * @param {number} capturedPieceType - The PIECES enum value for the captured piece (or PIECES.EMPTY if none).
 * @param {number | null} promotionPieceType - The PIECES enum value for the promotion piece (or null if not a promotion).
 * @returns {object} - The new bitboard state after the move.
 */
export const makeMove = (currentBitboards, fromSq, toSq, movedPieceType, capturedPieceType, promotionPieceType) => {
    // Create a copy to modify
    const newBitboards = { ...currentBitboards };

    const fromBB = ONE << BigInt(fromSq);
    const toBB = ONE << BigInt(toSq);

    // 1. Remove the moved piece from its starting square
    newBitboards[movedPieceType] &= ~fromBB;

    // 2. Handle captures: Remove the captured piece from the target square
    if (capturedPieceType !== PIECES.EMPTY) {
        newBitboards[capturedPieceType] &= ~toBB;
    }

    // 3. Place the moved piece on the target square OR the promotion piece
    const pieceToPlace = promotionPieceType !== null ? promotionPieceType : movedPieceType;
    newBitboards[pieceToPlace] |= toBB;


    // Note: This function doesn't update combined bitboards (occupied, whitePieces, blackPieces).
    // The caller (e.g., the reducer or move generation loop) should recalculate those
    // using calculateCombinedBitboards(newBitboards).

    // using calculateCombinedBitboards(newBitboards).

    return newBitboards;
};


/**
 * Executes a validated legal move and updates the game state.
 * Handles piece movement, captures, promotions, castling, en passant,
 * updating castling rights, and setting the next en passant target square.
 *
 * @param {object} currentGameState - The current game state (bitboards, occupied, turn, castleDirection, enPassantTargetSq, etc.).
 * @param {object} move - The legal move object (e.g., from getValidMoves: { from, to, piece, promotion?, capture?, enPassant?, castle? }).
 * @returns {object} - The new game state after the move.
 */
export const executeMove = (currentGameState, move) => {
    const { bitboards: currentBitboards, turn, castleDirection: currentCastleDirection } = currentGameState;
    const { from, to, piece, promotion, capture, enPassant, castle } = move;

    // Validate required move properties
    if (from === undefined || to === undefined || piece === undefined) {
        throw new Error(`Invalid move object: ${JSON.stringify(move)}`);
    }

    let newBitboards = { ...currentBitboards };
    let newCastleDirection = { ...currentCastleDirection };
    let newEnPassantTargetSq = null; // Default: clear EP square

    const fromBB = ONE << BigInt(from);
    const toBB = ONE << BigInt(to);
    const player = turn;
    const opponent = player === 'W' ? 'B' : 'W';

    // --- Update Bitboards ---

    // 1. Remove moved piece from original square
    const currentPieceBB = BigInt(newBitboards[piece] || 0n);
    newBitboards[piece] = currentPieceBB & ~fromBB;

    // 2. Handle captures
    if (capture) {
        console.group('Capture Debugging');
        
        // Get exact capture square
        const capturedSq = enPassant ? (player === 'W' ? to - 8 : to + 8) : to;
        console.log(`Capture at square ${capturedSq} (enPassant: ${enPassant})`);
        
        // Create capture bitmask
        const captureBB = ONE << BigInt(capturedSq);
        
        // Find which piece is being captured
        let capturedPieceType = null;
        for (const [pt, bb] of Object.entries(newBitboards)) {
            if (pt !== PIECES.EMPTY && (BigInt(bb) & captureBB) !== 0n) {
                capturedPieceType = pt;
                break;
            }
        }
        
        console.log(`Found piece to capture: ${capturedPieceType}`);
        
        // Remove the captured piece
        if (capturedPieceType) {
            console.log(`Before removal: ${newBitboards[capturedPieceType].toString(16)}`);
            newBitboards[capturedPieceType] = BigInt(newBitboards[capturedPieceType]) & ~captureBB;
            console.log(`After removal: ${newBitboards[capturedPieceType].toString(16)}`);
            console.log(`Successfully removed ${capturedPieceType} from square ${capturedSq}`);
        } else {
            // Fallback: clear that square from all bitboards
            console.log('No specific piece found, clearing square from all bitboards');
            for (const pt in newBitboards) {
                if (pt !== PIECES.EMPTY) {
                    newBitboards[pt] = BigInt(newBitboards[pt]) & ~captureBB;
                }
            }
        }
        
        // Verify the square is now empty
        const combined = calculateCombinedBitboards(newBitboards);
        const stillOccupied = (combined.occupied & captureBB) !== 0n;
        console.log(`After capture, square ${capturedSq} is ${stillOccupied ? 'still occupied!' : 'empty'}`);
        
        if (stillOccupied) {
            console.error('CRITICAL ERROR: Square still occupied after capture!');
            // Force clear the square again
            for (const pt in newBitboards) {
                if (pt !== PIECES.EMPTY) {
                    newBitboards[pt] = BigInt(newBitboards[pt]) & ~captureBB;
                }
            }
        }
        
        console.groupEnd();
    }

    // 3. Place piece on new square
    const pieceToPlace = promotion || piece;
    newBitboards[pieceToPlace] = BigInt(newBitboards[pieceToPlace] || 0n) | toBB;

    // 4. Handle Castling Rook Movement
    let rookFromSq = -1n, rookToSq = -1n;
    if (castle === 'k') { // King side
        rookFromSq = BigInt(player === 'W' ? 7 : 63);
        rookToSq = BigInt(player === 'W' ? 5 : 61);
    } else if (castle === 'q') { // Queen side
        rookFromSq = BigInt(player === 'W' ? 0 : 56);
        rookToSq = BigInt(player === 'W' ? 3 : 59);
    }
    if (rookFromSq !== -1n) {
        const rookType = (player === 'W') ? PIECES.wR : PIECES.bR;
        newBitboards[rookType] = BigInt(newBitboards[rookType] || 0n) & ~(ONE << rookFromSq); // Remove rook from start
        newBitboards[rookType] = BigInt(newBitboards[rookType] || 0n) | (ONE << rookToSq);   // Place rook at end
    }

    // --- Update Game State Properties ---

    // 1. Update Castling Rights
    // If King moved, lose both side rights
    if (piece === PIECES.wK) {
        newCastleDirection.W = 'none';
    } else if (piece === PIECES.bK) {
        newCastleDirection.B = 'none';
    }
    // If Rook moved from starting square, lose that side's rights
    if (piece === PIECES.wR) {
        if (from === 0 && (currentCastleDirection.W === 'both' || currentCastleDirection.W === 'left')) { // A1
            newCastleDirection.W = (currentCastleDirection.W === 'both') ? 'right' : 'none';
        } else if (from === 7 && (currentCastleDirection.W === 'both' || currentCastleDirection.W === 'right')) { // H1
             newCastleDirection.W = (currentCastleDirection.W === 'both') ? 'left' : 'none';
        }
    } else if (piece === PIECES.bR) {
         if (from === 56 && (currentCastleDirection.B === 'both' || currentCastleDirection.B === 'left')) { // A8
            newCastleDirection.B = (currentCastleDirection.B === 'both') ? 'right' : 'none';
        } else if (from === 63 && (currentCastleDirection.B === 'both' || currentCastleDirection.B === 'right')) { // H8
             newCastleDirection.B = (currentCastleDirection.B === 'both') ? 'left' : 'none';
        }
    }
     // If a Rook is captured on its starting square, lose that side's rights for the opponent
     if (capture && !enPassant) { // Check standard captures only
        const capturedPieceType = Object.entries(newBitboards).find(
            ([_, bb]) => (BigInt(bb) & toBB) !== 0n
        )?.[0] || PIECES.EMPTY;
        if (to === 0 && capturedPieceType === PIECES.wR) { // A1 captured
             if (newCastleDirection.W === 'both') newCastleDirection.W = 'right';
             else if (newCastleDirection.W === 'left') newCastleDirection.W = 'none';
        } else if (to === 7 && capturedPieceType === PIECES.wR) { // H1 captured
             if (newCastleDirection.W === 'both') newCastleDirection.W = 'left';
             else if (newCastleDirection.W === 'right') newCastleDirection.W = 'none';
        } else if (to === 56 && capturedPieceType === PIECES.bR) { // A8 captured
             if (newCastleDirection.B === 'both') newCastleDirection.B = 'right';
             else if (newCastleDirection.B === 'left') newCastleDirection.B = 'none';
        } else if (to === 63 && capturedPieceType === PIECES.bR) { // H8 captured
             if (newCastleDirection.B === 'both') newCastleDirection.B = 'left';
             else if (newCastleDirection.B === 'right') newCastleDirection.B = 'none';
        }
     }


    // 2. Set En Passant Target Square
    // If a pawn moved two squares, set the square behind it as the EP target
    if (piece === PIECES.wP && to - from === 16) {
        newEnPassantTargetSq = from + 8;
    } else if (piece === PIECES.bP && from - to === 16) {
        newEnPassantTargetSq = from - 8;
    }

    // 3. Calculate new combined bitboards
    const newCombined = calculateCombinedBitboards(newBitboards);

    // 4. Return the *relevant parts* of the new state for the reducer
    // The reducer will handle history and turn change
    return {
        newBitboards: newBitboards,
        newOccupied: newCombined.occupied,
        newWhitePieces: newCombined.whitePieces,
        newBlackPieces: newCombined.blackPieces,
        newCastleDirection: newCastleDirection,
        newEnPassantTargetSq: newEnPassantTargetSq,
        // Move notation generation needs to be updated/added
        newMoveNotation: generateMoveNotation(currentGameState, move) // Placeholder for notation generation
    };
};

// Placeholder for move notation generation - needs implementation
const generateMoveNotation = (gameState, move) => {
    // TODO: Implement proper algebraic notation generation based on the move object and game state
    const fromAlg = toAlgebraic(move.from);
    const toAlg = toAlgebraic(move.to);
    return `${fromAlg}${toAlg}`; // Very basic notation
};

const toAlgebraic = (square) => {
    const file = String.fromCharCode(97 + (square % 8));
    const rank = Math.floor(square / 8) + 1;
    return `${file}${rank}`;
};
