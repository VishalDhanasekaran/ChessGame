import React from "react";
import './Chessboard.css'

const horizontalAxis = [1,2,3,4,5,6,7,8];
const verticalAxis = ['a','b','c','d','e','f','g','h'];

const Chessboard = () =>{
    let board = []
    for(let i = 0 ; i < horizontalAxis.length ; i ++ ){
        for (let j = 0 ; j < verticalAxis.length ; j++ ){
            board.push(
                <div className = {(i+j)%2==0?"black-tile":"tile"}>
                </div>
            )

            }
        }
    return (
        <div id="chessBoard">{board}</div>
    )
}
export default Chessboard;