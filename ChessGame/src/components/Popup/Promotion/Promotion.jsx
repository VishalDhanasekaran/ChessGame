import "./Promotion.css";
import "./../Popup.css";
import { useAppContext } from "../../../contexts/Context";
import { copyPosition } from "../../../helper";
import {
  clearCandidateMoves,
  makeNewMove,
} from "../../../reducer/actions/move";

const Promotion = ({ closePopupCallback }) => {
  const options = ["q", "r", "b", "n"];
  const { appState, dispatch } = useAppContext();
  const { promotionSquare } = appState;
  if (!promotionSquare) {
    return;
  }
  const color = promotionSquare.x === 7 ? "W" : "B";
  const determinePromotionBoxPosition = () => {
    const style = {};
    if (promotionSquare.x === 7) {
      style.top = "-12.5%";
    } else {
      style.top = "97.5%";
    }
    if (promotionSquare.y <= 1) {
      style.left = "0%";
    } else if (promotionSquare.y >= 6) {
      style.right = "0%";
    } else {
      style.left = `${12.5 * promotionSquare.y - 20}%`;
    }
    return style;
  };

  const applySelection = (option) => () => {
    closePopupCallback();
    const newPosition = copyPosition(
      appState.position[appState.position.length - 1],
    );
    newPosition[promotionSquare.rank][promotionSquare.file] = "";
    newPosition[promotionSquare.x][promotionSquare.y] = `${option}${color}`;
    dispatch(clearCandidateMoves());

    //notation for promotion in score sheet
    const newMove = getNewMoveNotation({
      ...promotionSquare,
      piece: color + 'p',
      promotesTo: option,
      position: appState.position[appState.position.length - 1]
    })
    dispatch(makeNewMove({ newPosition, newMove }));
  };
  return (
    <div
      className="popup--inner promotion-choices"
      style={determinePromotionBoxPosition()}
    >
      {options.map((option) => (
        <div
          className={`piece ${option}${color}`}
          onClick={applySelection(option)}
          key={option}
        />
      ))}
    </div>
  );
};

export default Promotion;
