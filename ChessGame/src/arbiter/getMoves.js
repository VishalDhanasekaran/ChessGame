
export const getKingMoves  = ({position, rank , file}) => {
    const moves = []
    const enemy = (position?.[rank]?.[file].endsWith('W'))?'B':'W'
    const player = (enemy === 'W')?'B':'W'
    console.log("Player knight: ",player," Enemy : ",enemy)
    const candidateMoves =[
        [1,1],[1,-1],[-1,1],[-1,-1],
      [-1,0],
      [1,0],
      [0,-1],
      [0,1]
    ]
    candidateMoves.forEach(
        (c) => {

            const cell = position?.[rank + c[0]]?.[file + c[1]]
            if ((cell !== undefined)  && (!cell.endsWith(player))){
                moves.push([rank+c[0],file+c[1]])
            }
        }
    )
    return moves
        }
export const getPawnMoves = ({position , rank , file }) => {
    const moves = []
    const enemy = (position?.[rank]?.[file].endsWith('W'))?'B':'W'
    const player = (enemy === 'W')?'B':'W'
    console.log("Player pawn: ",player," Enemy : ",enemy)
    const direction = (player === 'W')?1:-1
    
    if (!position?.[rank + direction]?.[file]){
      moves.push([rank+direction,file])
    }  

    if (rank % 5 === 1 ){
      console.log("two")
      if(position?.[rank + direction]?.[file] === '' && position?.[rank + (2*direction)]?.[file] === ''){
        console.log("sum")
        moves.push([rank + (2*direction) , file ])
      }
    } 
  return moves
}
export const getPawnCaptures= ({position , rank , file }) => {
    const moves = []
    const enemy = (position?.[rank]?.[file].endsWith('W'))?'B':'W'
    const player = (enemy === 'W')?'B':'W'
    console.log("Player pawn: ",player," Enemy : ",enemy)
    const direction = (player === 'W')?1:-1
    if (position?.[rank + direction ]?.[file - 1] && position?.[rank + direction]?.[file - 1].endsWith(enemy)){
      moves.push([rank + direction ,file -1])
    }
    if (position?.[rank + direction ]?.[file + 1] && position?.[rank + direction]?.[file + 1].endsWith(enemy)){
      moves.push([rank + direction ,file +1])
    }
    return moves

}

export const getQueenMoves  = ({position, rank , file}) => {
    const moves = []
    const enemy = (position?.[rank]?.[file].endsWith('W'))?'B':'W'
    const player = (enemy === 'W')?'B':'W'
    console.log("Player knight: ",player," Enemy : ",enemy)
    const candidateMoves =[
        [1,1],[1,-1],[-1,1],[-1,-1],
      [-1,0],
      [1,0],
      [0,-1],
      [0,1]
    ]
    candidateMoves.forEach(
        (c) => {

      for(var i = 1; i < 8 ; i++){
            const cell = position?.[rank + i*c[0]]?.[file + i*c[1]]
            if ((cell !== undefined)  && (!cell.endsWith(player))){
                moves.push([rank+(i*c[0]),file+(i*c[1])])
                if(cell.endsWith(enemy)){
                  break;
                }
            }else{
            break
        }
        }
        }
    )
    return moves
        }
export const getKnightMoves = ({position, rank , file}) => {
    const moves = []
    const enemy = (position?.[rank]?.[file].endsWith('W'))?'B':'W'
    const player = (enemy === 'W')?'B':'W'
    console.log("Player knight: ",player," Enemy : ",enemy)
    const candidateMoves =[
        [2,1],
        [2,-1],
        [-2,1],
        [-2,-1],
        [1,2],
        [1,-2],
        [-1,2],
        [-1,-2]
    ]
    candidateMoves.forEach(
        (c) => {
            const cell = position?.[rank + c[0]]?.[file + c[1]]
            if ((cell !== undefined)  && (!cell.endsWith(player))){
                moves.push([rank+c[0],file+c[1]])
            }
        }
    )
    return moves
}
export const getBishopMoves = ({position , piece, rank, file }) => {
    const moves = [] 
    const directions = [
        [1,1],[1,-1],[-1,1],[-1,-1]
    ]
    const enemy = (position?.[rank]?.[file].endsWith('W'))?'B':'W'
    const player = (enemy === 'W')?'B':'W'

    directions.forEach((dir)=> {
      for(var i = 1; i < 8 ; i++){
        
        console.log("index",i)
        const x = rank + (i*dir[0])
        const y = file + (i*dir[1])
        console.log("Currpos" ,position?.[x]?.[y]," ",dir[0]," ",dir[1], rank, file, x , y )
        if (position?.[x]?.[y] === undefined ){
          console.log("Undefined for ",x,y)
          break
        }
        if(position?.[x]?.[y].endsWith(enemy)){
          console.log("enemy for ",x,y)
          moves.push([x,y])
          break
        }
        if (position?.[x]?.[y].endsWith(player) ){
          console.log("Player for ",x,y)
          break
        }
        console.log('psuhing ')
          moves.push([x,y])
      }
    })
    

    return moves  
  }
export const getRookMoves = ({position, piece , rank , file}) =>  {
    const moves = []
    const player = piece[1]
    console.log("player",player)
    const enemy = (player === 'W')?'B':'W'
    console.log("Player : ",player," Enemy : ",enemy)
    const direction = [
      [-1,0],
      [1,0],
      [0,-1],
      [0,1]
    ]

    direction.forEach((dir)=> {
      for(var i = 1; i < 8 ; i++){
        
        console.log("index",i)
        const x = rank + (i*dir[0])
        const y = file + (i*dir[1])
        console.log("Currpos" ,position?.[x]?.[y]," ",dir[0]," ",dir[1], rank, file, x , y )
        if (position?.[x]?.[y] === undefined ){
          console.log("Undefined for ",x,y)
          break
        }
        if(position?.[x]?.[y].endsWith(enemy)){
          console.log("enemy for ",x,y)
          moves.push([x,y])
          break
        }
        if (position?.[x]?.[y].endsWith(player) ){
          console.log("Player for ",x,y)
          break
        }
        console.log('psuhing ')
          moves.push([x,y])
      }
    })
    

    return moves  
  }
