// Represents the 64 squares of the chessboard
// 0 corresponds to A1, 7 to H1, 8 to A2, ..., 63 to H8

// Piece Types (using integer constants for clarity in bitboard arrays)
export const PIECES = {
    EMPTY: 0,
    wP: 1, wN: 2, wB: 3, wR: 4, wQ: 5, wK: 6,
    bP: 7, bN: 8, bB: 9, bR: 10, bQ: 11, bK: 12,
};

// Piece Symbols for mapping (can potentially replace array representation later)
export const pieceSymbols = {
    [PIECES.wP]: 'pW', [PIECES.wN]: 'nW', [PIECES.wB]: 'bW', [PIECES.wR]: 'rW', [PIECES.wQ]: 'qW', [PIECES.wK]: 'kW',
    [PIECES.bP]: 'pB', [PIECES.bN]: 'nB', [PIECES.bB]: 'bB', [PIECES.bR]: 'rB', [PIECES.bQ]: 'qB', [PIECES.bK]: 'kB',
};

// --- Bitboard Constants ---
export const ZERO = 0n;
export const ONE = 1n;

// --- Initial Bitboard Positions ---
// Using BigInt literals (n)
export const initialBitboards = {
    [PIECES.wP]: 0xFF00n,                     // Rank 2
    [PIECES.wN]: 0x42n,                       // B1, G1
    [PIECES.wB]: 0x24n,                       // C1, F1
    [PIECES.wR]: 0x81n,                       // A1, H1
    [PIECES.wQ]: 0x8n,                        // D1
    [PIECES.wK]: 0x10n,                       // E1
    [PIECES.bP]: 0xFF000000000000n,           // Rank 7
    [PIECES.bN]: 0x4200000000000000n,         // B8, G8
    [PIECES.bB]: 0x2400000000000000n,         // C8, F8
    [PIECES.bR]: 0x8100000000000000n,         // A8, H8
    [PIECES.bQ]: 0x800000000000000n,          // D8
    [PIECES.bK]: 0x1000000000000000n,         // E8
};

// --- Combined Bitboards ---
export const calculateCombinedBitboards = (boards) => {
    let whitePieces = ZERO;
    let blackPieces = ZERO;

    for (let i = PIECES.wP; i <= PIECES.wK; i++) {
        whitePieces |= boards[i] || ZERO;
    }
    for (let i = PIECES.bP; i <= PIECES.bK; i++) {
        blackPieces |= boards[i] || ZERO;
    }

    const occupied = whitePieces | blackPieces;

    return { whitePieces, blackPieces, occupied };
};

// --- Bitboard Utility Functions ---

// Set a bit at a given square index (0-63)
export const setBit = (bitboard, square) => bitboard | (ONE << BigInt(square));

// Clear a bit at a given square index (0-63)
export const clearBit = (bitboard, square) => bitboard & ~(ONE << BigInt(square));

// Get the value of a bit at a given square index (0-63)
export const getBit = (bitboard, square) => (bitboard >> BigInt(square)) & ONE;

// Count the number of set bits (population count)
export const countBits = (bitboard) => {
    let count = 0;
    while (bitboard > ZERO) {
        bitboard &= (bitboard - ONE); // Clears the least significant set bit
        count++;
    }
    return count;
};

// Find the index of the least significant bit (LSB)
export const bitScanForward = (bitboard) => {
    if (bitboard === ZERO) return -1;
    // A simple loop-based approach for JS BigInt
    let index = 0;
    while (((bitboard >> BigInt(index)) & ONE) === ZERO) {
        index++;
    }
    return index;
};

// Convert rank (0-7) and file (0-7) to square index (0-63)
export const toSquareIndex = (rank, file) => rank * 8 + file;

// Convert square index (0-63) to rank (0-7) and file (0-7)
export const toRankFile = (square) => ({
    rank: Math.floor(square / 8),
    file: square % 8,
});

// Print a bitboard visually (for debugging)
export const printBitboard = (bitboard) => {
    console.log("Bitboard:", bitboard);
    let boardStr = "  a b c d e f g h\n";
    for (let rank = 7; rank >= 0; rank--) {
        boardStr += (rank + 1) + " ";
        for (let file = 0; file < 8; file++) {
            const square = toSquareIndex(rank, file);
            boardStr += (getBit(bitboard, square) ? "1" : ".") + " ";
        }
        boardStr += (rank + 1) + "\n";
    }
    boardStr += "  a b c d e f g h";
    console.log(boardStr);
};

// --- Pre-calculated Masks/Tables (Example) ---
// You would add masks for files, ranks, diagonals, knight moves, king moves etc.
// Example: File A mask
// --- File Masks ---
export const FILE_A = 0x0101010101010101n;
export const FILE_B = FILE_A << 1n;
export const FILE_C = FILE_A << 2n;
export const FILE_D = FILE_A << 3n;
export const FILE_E = FILE_A << 4n;
export const FILE_F = FILE_A << 5n;
export const FILE_G = FILE_A << 6n;
export const FILE_H = FILE_A << 7n;
export const NOT_FILE_A = ~FILE_A;
export const NOT_FILE_H = ~FILE_H;
export const NOT_FILE_AB = ~(FILE_A | FILE_B);
export const NOT_FILE_GH = ~(FILE_G | FILE_H);

// --- Rank Masks ---
export const RANK_1 = 0xFFn;
export const RANK_2 = RANK_1 << 8n;
export const RANK_3 = RANK_1 << 16n;
export const RANK_4 = RANK_1 << 24n;
export const RANK_5 = RANK_1 << 32n;
export const RANK_6 = RANK_1 << 40n;
export const RANK_7 = RANK_1 << 48n;
export const RANK_8 = RANK_1 << 56n;
export const NOT_RANK_1 = ~RANK_1;
export const NOT_RANK_8 = ~RANK_8;

// --- Other Useful Masks ---
export const CENTER_FILES = FILE_C | FILE_D | FILE_E | FILE_F;
export const CENTER = (RANK_3 | RANK_4 | RANK_5 | RANK_6) & CENTER_FILES;
export const KING_SIDE = FILE_E | FILE_F | FILE_G | FILE_H;
export const QUEEN_SIDE = FILE_A | FILE_B | FILE_C | FILE_D;
export const LIGHT_SQUARES = 0x55AA55AA55AA55AAn;
export const DARK_SQUARES = ~LIGHT_SQUARES;

// --- Pre-calculated Attack Tables (Placeholders - Need actual generation) ---
// These would ideally be generated or loaded, not hardcoded like this example
export const KNIGHT_ATTACKS = new Array(64).fill(ZERO); // Placeholder
export const KING_ATTACKS = new Array(64).fill(ZERO);   // Placeholder
// Sliding piece attacks (bishop, rook, queen) are more complex, often using techniques
// like Magic Bitboards or pre-calculated lookup tables based on occupancy.

// --- Helper function to initialize attack tables (Example for Knight) ---
const initializeKnightAttacks = () => {
    for (let sq = 0; sq < 64; sq++) {
        let attacks = ZERO;
        const { rank, file } = toRankFile(sq);

        const potentialTargets = [
           { r: rank + 2, f: file + 1 }, { r: rank + 2, f: file - 1 },
           { r: rank - 2, f: file + 1 }, { r: rank - 2, f: file - 1 },
           { r: rank + 1, f: file + 2 }, { r: rank + 1, f: file - 2 },
           { r: rank - 1, f: file + 2 }, { r: rank - 1, f: file - 2 },
        ];

        potentialTargets.forEach(pt => {
           if (pt.r >= 0 && pt.r < 8 && pt.f >= 0 && pt.f < 8) {
               attacks |= (ONE << BigInt(toSquareIndex(pt.r, pt.f)));
           }
        });
        KNIGHT_ATTACKS[sq] = attacks;
    }
};

const initializeKingAttacks = () => {
     for (let sq = 0; sq < 64; sq++) {
        let attacks = ZERO;
        const { rank, file } = toRankFile(sq);
        const potentialTargets = [
            { r: rank + 1, f: file }, { r: rank + 1, f: file + 1 },
            { r: rank + 1, f: file - 1 }, { r: rank, f: file + 1 },
            { r: rank, f: file - 1 }, { r: rank - 1, f: file },
            { r: rank - 1, f: file + 1 }, { r: rank - 1, f: file - 1 },
        ];
         potentialTargets.forEach(pt => {
            if (pt.r >= 0 && pt.r < 8 && pt.f >= 0 && pt.f < 8) {
                attacks |= (ONE << BigInt(toSquareIndex(pt.r, pt.f)));
            }
         });
        KING_ATTACKS[sq] = attacks;
     }
};

// Call initialization functions
initializeKnightAttacks();
initializeKingAttacks();
// Initialize other attack tables here...
