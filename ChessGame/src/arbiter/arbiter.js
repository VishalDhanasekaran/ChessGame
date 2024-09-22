import { getKingMoves, getPawnMoves, getQueenMoves, getBishopMoves, getKnightMoves, getRookMoves, getPawnCaptures } from "./getMoves"

const arbiter = {
    getRegularMoves : function({position, piece , rank , file })  {
        console.log(piece)
        switch(piece[0]){
            case 'k':
              return getKingMoves({position,rank,file}) 
            case 'p':
              return getPawnMoves({position,rank,file}) 
            case 'q':
                return getQueenMoves({position , rank , file });
            case 'n':
                return getKnightMoves({position , rank , file });
            case 'b':
                return getBishopMoves({position,rank,file})
            default:
                return getRookMoves({position , piece, rank , file });
            
        }
    }
    , 
    getValidMoves : function({position, prevPosition, piece, rank , file})  {
        let moves = this.getRegularMoves({position,piece, rank , file})

        if (piece.startsWith('p')){
            moves = [
                ...moves, 
                ...getPawnCaptures({position, prevPosition, piece, rank, file})
            ]

        }
        return moves
    }
}

export default arbiter;
