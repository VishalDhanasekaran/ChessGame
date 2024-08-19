import './Board.css'
import Files from './../Bits/Files'
import Ranks from '../Bits/Ranks'
import Pieces from '../Pieces/Pieces'
const Board = () => {

    const ranks = Array(8).fill().map((x,i) => 8-i)
    const files = Array(8).fill().map((x,i) => i+1) 
    const getTileClassName = (i,j) => {
        return (
            ((i+j)%2===0)?"tile--dark":"tile--light"
        )
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
                                        className={getTileClassName(9-i,j)}>{/*{rank}{file}*/}</div>
                                
                            )
                        )
                }
                    
                
            </div>
            <Pieces  key={Math.random()}/>
            <Files files={files}/>
            
        </div>
    )

}
export default Board;