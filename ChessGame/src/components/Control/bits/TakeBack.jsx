import { Status } from "../../../constant";
import { useAppContext } from "../../../contexts/Context";
import { takeBack } from "../../../reducer/actions/move";

const TakeBack = () => {
  const { appState, dispatch } = useAppContext();

  return (
    <div>
      <button
        onClick={() => {
          console.log(appState.Status);
          if (
            appState.Status === Status.ongoing ||
            appState.Status === undefined
          ) {
            dispatch(takeBack());
          }
        }}
      >
        Take Back
      </button>
    </div>
  );
};

export default TakeBack;
