import "./Board.css";
import Files from "./../Bits/Files";
import Ranks from "../Bits/Ranks";
import Pieces from "../Pieces/Pieces";
import { useAppContext } from "../../contexts/Context";
import Popup from "../Popup/Popup";
import arbiter from "../../arbiter/arbiter";
import { getKingPosition } from '../../arbiter/getMoves';

const Board = () => {
  const ranks = Array(8).fill().map((x, i) => 8 - i);
  const files = Array(8).fill().map((x, i) => i + 1);

  const { appState } = useAppContext();
  const position = appState.position[appState.position.length - 1]

  const isChecked = (() => {
    const isInCheck = (arbiter.isPlayerInCheck({positionAfterMove: position, player: appState.turn}))

    if(isInCheck)
    {
      let kingPos = getKingPosition(position, appState.turn);
      console.log("Check the king at: ", kingPos);
      return kingPos;
    }

    return null;
  })()

  console.log("POSITION", position);

  const getTileClassName = (i, j) => {


    let c = (i + j) % 2 === 0 ? " tile--dark " : " tile--light ";

    if (appState.candidateMoves?.find((m) => m[0] === i && m[1] === j)) 
    {
      if (position[i][j]) 
        c += " attacking";
      else
        c += " highlighting";
      
    }

    if(isChecked && isChecked[0] === i && isChecked[1] === j)
    {
      c += " checked";
      console.log("King at check: ", getKingPosition())
    }
    return c;
  }

  return (
    <div className="Board">
      <Ranks ranks={ranks} />
      <div className="tiles">
        {ranks.map((rank, i) =>
          files.map((file, j) => (
            <div key={rank + "-" + file} className={`${getTileClassName(7 - i, j)}`}/>
          )),
        )}
      </div>
      <Pieces />
      <Popup />
      <Files files={files} />
    </div>
  );
};
export default Board;
