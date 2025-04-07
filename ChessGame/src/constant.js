import { initialBitboards, calculateCombinedBitboards, PIECES } from "./bitboard";
export const Status = {
  ongoing: "Ongoing",
  promoting: "Promoting",
  white: "White is  wins",
  black: "Black is wins",
  stalemate : 'Game draws due to stalemate',
  insufficient : 'Game draws due to insufficient material',
};

// Initialize bitboards
const startingBitboards = { ...initialBitboards };
// Removed duplicate line: const startingBitboards = { ...initialBitboards };
const startingCombined = calculateCombinedBitboards(startingBitboards);
const initialTurn = 'W';
const initialCastleDirection = { W: "both", B: "both" };
const initialEnPassantTargetSq = null;
const initialStatus = Status.ongoing;
const initialPromotionSquare = null;

// The first entry in history needs the full state snapshot
const initialHistoryEntry = {
  bitboards: startingBitboards,
  occupied: startingCombined.occupied,
  whitePieces: startingCombined.whitePieces,
  blackPieces: startingCombined.blackPieces,
  turn: initialTurn,
  castleDirection: initialCastleDirection,
  enPassantTargetSq: initialEnPassantTargetSq,
  status: initialStatus,
  promotionSquare: initialPromotionSquare,
};

export const initGameState = {
  // History array starts with the complete initial state
  history: [initialHistoryEntry],
  // Other non-board-state properties
  movesList : [],
  candidateMoves: [],
  can_automate: false, // This seems separate from board state history
  // Player color - default to white
  playerColor: 'W',
  // Flag to indicate if color has been selected
  colorSelected: false,
  // Flag to indicate if AI should make a move automatically
  shouldAutomate: false,
  // Flag to indicate if board should be flipped (black's perspective)
  boardFlipped: false,
  // Spread the initial board state properties into the top level for easy access
  ...initialHistoryEntry
};
