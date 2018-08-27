import * as React from "react";
import { render } from "react-dom";
import { css } from "glamor";
import Knob from "./Knob.tsx";
const styles = {
  fontFamily: "sans-serif",
  textAlign: "center",
  backgroundColor: "black",
  height: "100vh"
};

const App = () => (
  <div style={styles}>
    <div
      {...css({
        transform: "translate rotate(90deg)"
      })}
    >
      <Knob min={0} max={100} currentValue={10} size={4} />
    </div>
  </div>
);

render(<App />, document.getElementById("root"));
