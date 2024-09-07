import './Board.css'
import Files from './../Bits/Files'
import Ranks from '../Bits/Ranks'
import Pieces from '../Pieces/Pieces'
import { useAppContext } from '../../contexts/Context'
const Board = () => {

    const ranks = Array(8).fill().map((x,i) => 8-i)
    const files = Array(8).fill().map((x,i) => i+1) 
    const {appState } = useAppContext()
    const position = appState.position[appState.position.length -1]
    console.log("POSITION",position)
    const getTileClassName = (i,j) => {
        let c = ((i+j)%2===0)?" tile--dark ":" tile--light "

        if (appState.candidateMoves?.find(m => m[0] == i && m[1] == j)){
            if (position[i][j]){
                c += ' attacking '
            }else{
                c += ' highlighting '
            }
        }
        return c
        
    }
    return (
        <div className="Board">
            <Ranks ranks={ranks}/>
            <div className='tiles'>
                {
                    ranks.map(
                        (rank,i) => 
                            files.map(
                                (file,j) => 
                                    <div key={ rank + "-" + file }
                                        className={getTileClassName(7-i,j)}>{/*{rank}{file}*/}</div>
                                
                            )
                        )
                }
                    
                
            </div>
            <Pieces  />
            <Files files={files}/>
            
        </div>
    )

}
export default Board;