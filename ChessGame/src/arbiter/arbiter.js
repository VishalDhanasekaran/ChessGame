import { getKingMoves, getPawnMoves, getQueenMoves, getBishopMoves, getKnightMoves, getRookMoves, getPawnCaptures } from "./getMoves"

const arbiter = {
    getRegularMoves : function({position, piece , rank , file })  {
        console.log(piece)
        switch(piece[0]){
            case 'k':
              return getKingMoves({position,rank,file}) 
            case 'p':
              return [
                    ...getPawnMoves({position,rank,file}) ,
                    ...getPawnCaptures({position,rank,file})
                    ]
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
}

export default arbiter;
