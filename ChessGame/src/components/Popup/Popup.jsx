import React from "react";
import { Status } from "../../constant";
import { useAppContext } from "../../contexts/Context";
import { closePromotionBox } from "../../reducer/actions/popup";
import "./Popup.css";
import Promotion from "./Promotion/Promotion.jsx";
const Popup = ({ children }) => {
  const { appState, dispatch } = useAppContext();
  if (appState.status === Status.ongoing) {
    return null;
  }
  const onClosePopup = () => {
    dispatch(closePromotionBox());
  };

  return (
    <div className="popup">
      {React.Children.toArray(children).map((child) =>
        React.cloneElement(child, { onClosePopup }),
      )}
    </div>
  );
};
export default Popup;
