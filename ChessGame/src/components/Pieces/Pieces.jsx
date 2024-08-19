import './Pieces.css'
import Piece from './Piece.jsx'
import { useState,useRef,useLayoutEffect, useEffect } from 'react';
import { copyPosition, createPosition } from '../../helper.js';
import ReactDOM from react-dom
export default function Pieces  ()  {
 const [state,setState]= useState(createPosition())

 const ref = useRef();
 console.log()
 useLayoutEffect(()=>{
    console.log("w",ref)
 },[])

 const returnCoords = (e) => {

    const {width , left, top} = e.target.getBoundingClientRect()
    const size = width /8 ; 
    const y = Math.floor((e.clientX - left) / size) 
    const x = Math.floor((e.clientY - top ) / size) 
    console.log(e.clientX,e.clientY)
    return {x,y}
 }
 function onDrop(e){
    const newPosition = copyPosition(state)
    const {x,y} = returnCoords(e)
 
    const [p,rank,file] = e.dataTransfer.getData('text').split(',')
    console.log(p,rank,file)
    newPosition[rank][file] =''
    newPosition[x][y] =p
    setState(newPosition)

 }
 function onDragOver(e){
    e.preventDefault()
 }
 return (<div 
            onDrop={onDrop}
            onDragOver={onDragOver}
            className='pieces'
            ref={ref}
            >{
                state.map((r,rank) =>
                    r.map((f,file) => 
                        state[rank][file]
                        ? <Piece 
                            key = {rank+"-"+file}
                            rank ={rank}
                            file = {file}
                            piece = {state[rank][file]}

                         />
                        : null
                    )
                )
            }
        </div>
 )
 
}
