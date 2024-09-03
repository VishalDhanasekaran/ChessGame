import { useState } from "react";
import Board from "./components/Board/Board";
import ToggleButton from "./components/ToggleButton/TogggleButton";
import "./App.css";
import AppContext from "./contexts/Context";
import { useReducer } from "react";
import { reducer } from "./reducer/reducer";
import { initGameState } from "./constant";

function App() {
  const [appState, dispatch] = useReducer(reducer, initGameState);
  const providerState = {
    appState,
    dispatch,
  };
  return (
    <AppContext.Provider value={providerState}>
      <div className="App">
        <Board />
      </div>
    </AppContext.Provider>
  );
}

export default App;
