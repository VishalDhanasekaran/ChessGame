import "./Board.css";
import Files from "./../Bits/Files";
import Ranks from "../Bits/Ranks";
import Pieces from "../Pieces/Pieces";
import { useAppContext } from "../../contexts/Context";
import Popup from "../Popup/Popup";
import arbiter from "../../arbiter/arbiter";
import { getKingPosition } from "../../arbiter/getMoves";
import { copyPosition } from "../../helper";
import Promotion from "../Popup/Promotion/Promotion";
import GameEnds from "../Popup/GameEnds/GameEnds";
import { useEffect, useState } from "react";
import { evaluateBoard, makeAutomatedMove } from "../../Engine/ChessEngine";

const Board = () => {
  const [shouldAutomate, setShouldAutomate] = useState(false);
  const ranks = Array(8)
    .fill()
    .map((x, i) => 8 - i);
  const files = Array(8)
    .fill()
    .map((x, i) => i + 1);

  const { appState, dispatch } = useAppContext();
  const position = appState.position[appState.position.length - 1];

  const isChecked = (({ checkposition }) => {
    const isInCheck = arbiter.isPlayerInCheck({
      positionAfterMove: checkposition,
      player: appState.turn,
    });

    if (isInCheck) {
      return getKingPosition(checkposition, appState.turn);
    }
  })({ checkposition: position });

  const getTileClassName = (i, j) => {
    let c = (i + j) % 2 === 0 ? " tile--dark " : " tile--light ";

    if (appState.candidateMoves?.find((m) => m[0] === i && m[1] === j)) {
      if (position[i][j]) c += " attacking";
      else c += " highlighting";
    }

    if (isChecked && isChecked[0] === i && isChecked[1] === j) {
      c += " checked";
    }

    return c;
  };

  useEffect(() => {
    if (shouldAutomate) {
      makeAutomatedMove(appState, dispatch);
      setShouldAutomate(false); // Reset after making the move
    }
  }, [shouldAutomate]);

  return (
    <div className="Board">
      <Ranks ranks={ranks} />
      <div className="tiles">
        {ranks.map((rank, i) =>
          files.map((file, j) => (
            <div
              key={rank + "-" + file}
              className={`${getTileClassName(7 - i, j)}`}
            />
          )),
        )}
      </div>
      <Pieces automateCallBack={setShouldAutomate} />

      <Popup callback={setShouldAutomate}>
        <Promotion />
        <GameEnds />
      </Popup>
      <Files files={files} />
    </div>
  );
};
export default Board;
