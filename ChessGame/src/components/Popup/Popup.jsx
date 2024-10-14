import { Status } from "../../constant.js";
import { useAppContext } from "../../contexts/Context.js";
import { closePromotionBox } from "../../reducer/actions/popup.js";
import "./Popup.css";
import Promotion from "./Promotion/Promotion.jsx";
const Popup = () => {
  const { appState, dispatch } = useAppContext();
  if (appState.status === Status.ongoing) {
    return null;
  }
  const closePopup = () => {
    dispatch(closePromotionBox());
  };
  return (
    <div className="popup">
      <Promotion closePopupCallback={closePopup} />
    </div>
  );
};
export default Popup;
