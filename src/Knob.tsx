import * as React from "react";
import { css } from "glamor";

const START_ANGLE = 120;
const END_ANGLE = 60;
const PROGRESS_FILL_STROKE_WIDTH = 3;
const KNOB_BACKGROUND_COLOR = "#303030";
//const PROGRESS_COLOR = "#c3ff00";
const PROGRESS_COLOR = "#42f462";
const KNOB_COLOR = "#222";
const KNOB_SIZE = 3;
const CLICK_TYPE = "click";
const INPUT_TYPE = "input";

const styles = {
  container: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent"
  },
  canvas: {
    position: "absolute",
    top: 0,
    left: 0
  },
  handle: {
    width: "10px",
    height: "10px",
    backgroundColor: "green",
    position: "absolute",
    top: 0,
    left: 0,
    borderRadius: "50%"
  },
  input: {
    backgroundColor: "transparent",
    border: 0,
    color: "grey",
    outline: "none",
    position: "absolute",
    "::-webkit-inner-spin-button": {
      /* display: none; <- Crashes Chrome on hover */
      "-webkit-appearance": "none",
      margin: 0 /* <-- Apparently some margin are still there even though it's hidden */
    }
  }
};
interface KnobPropType {
  min: number;
  max: number;
  currentValue: number;
  size: number;
}

interface KnobStateType {
  value: number;
  x: number;
  y: number;
  type: string;
  direction: string | null;
}
class Knob extends React.Component<KnobPropType, KnobStateType> {
  private canvas: React.RefObject<HTMLCanvasElement>;
  private ghostImage: React.RefObject<HTMLImageElement>;

  constructor(props: KnobPropType) {
    super(props);
    this.ghostImage = React.createRef();
    this.canvas = React.createRef();
    this.state = {
      type: "input",
      value: props.currentValue || 0,
      x: 0,
      y: 0,
      direction: null
    };
  }
  componentWillReceiveProps(nextProps: KnobPropType) {
    if (nextProps.currentValue !== this.props.currentValue) {
      this.setState({
        value: nextProps.currentValue
      });
    }
  }
  componentDidMount() {
    this.updateCanvas(this.state);
  }

  componentWillUpdate(nextProps: KnobPropType, nextState: KnobStateType) {
    this.updateCanvas(nextState);
  }

  drawMarkers = (context, x, y, r) => {
    let theta;
    for (theta = 0.1; theta < 6.3; theta += 0.5) {
      context.moveTo(x, y);
      context.lineTo(x + r * Math.cos(theta), y + r * Math.sin(theta));
      context.stroke();
    }
  };
  getStartAngle = (degreeStartAngle: number) => {
    return degreeStartAngle + START_ANGLE;
  };

  getEndAngleFromPoint = (x: number, y: number) => {
    // returns the angle in defrees
    const canvas = this.canvas;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    var dx = centerX - x;
    var dy = centerY - y;
    var theta = Math.atan2(-dy, -dx); // [0, Ⲡ] then [-Ⲡ, 0]; clockwise; 0° = east
    theta *= 180 / Math.PI; // [0, 180] then [-180, 0]; clockwise; 0° = east
    if (theta < 0) theta += 360; // [0, 360]; clockwise; 0° = east
    return theta;
  };

  getEndAngleFromValue = (value: number) => {
    const { max } = this.props;
    if (value !== undefined && value >= 0) {
      let angleFromValue = (360 - END_ANGLE) * (value / max) + START_ANGLE;
      return angleFromValue;
    }
    return START_ANGLE;
  };

  degreeToRad = (deg: number) => {
    return (deg * Math.PI) / 180;
  };

  getValueFromPoint = (x: number, y: number) => {
    const { max } = this.props;
    let degreeAngle = this.getEndAngleFromPoint(x, y);
    if (degreeAngle < END_ANGLE) {
      degreeAngle = 360 + degreeAngle;
    }
    let angle = this.degreeToRad(degreeAngle);
    let value =
      ((angle - this.degreeToRad(START_ANGLE)) /
        this.degreeToRad(360 - END_ANGLE)) *
      max;
    if (value < 0) {
      value = max;
    }
    return parseInt(value);
  };

  drawArc = (
    context: any,
    x: number,
    y: number,
    r: number,
    startAngle: number,
    endAngle: number,
    color: string
  ) => {
    context.beginPath();
    context.fillStyle = color;
    context.moveTo(x, y);
    context.arc(x, y, r, startAngle, endAngle, false);
    context.fill();
    context.closePath();
  };
  updateCanvas = ({ value, x, y, type, direction }: KnobStateType) => {
    const { size } = this.props;
    const canvas = this.canvas;
    const context = canvas.getContext("2d");
    if (!context) return;
    const r = canvas.width / 2;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const startAngle = this.degreeToRad(120);
    let endAngle = 0;

    if (type === INPUT_TYPE) {
      endAngle = this.degreeToRad(this.getEndAngleFromValue(value));
    } else {
      const angle = this.getEndAngleFromPoint(x, y);
      endAngle = this.degreeToRad(this.getEndAngleFromPoint(x, y));
      // adjust the angle to a fixed angle for max and min
      // TODO: take into account direction, so it doesn't jump to the other side
      if (angle >= END_ANGLE && angle <= 90) {
        endAngle = this.degreeToRad(END_ANGLE);
      } else if (angle > 90 && angle <= START_ANGLE) {
        endAngle = this.degreeToRad(START_ANGLE);
      }
    }

    // clear for redraw
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.save();
    context.beginPath();
    context.fillStyle = PROGRESS_COLOR;
    context.moveTo(centerX, centerY);
    context.arc(centerX, centerY, r, startAngle, endAngle, false);
    context.fill();
    context.closePath();
    context.save();
    // DRAW MARKERS
    context.beginPath();
    // this.drawMarkers(context, centerX, centerY, r);
    // context.closePath();
    // context.save();
    // DRAW KNOB BACKGROUND
    context.shadowBlur = 10 * (size / 2);
    context.shadowColor = "black";
    this.drawArc(
      context,
      centerX,
      centerY,
      r - PROGRESS_FILL_STROKE_WIDTH * size,
      0,
      this.degreeToRad(360),
      KNOB_BACKGROUND_COLOR
    );
    context.save();
    // DRAW KNOB
    // uniform circular motion
    //x = radius * cosine(angle)
    //y = radius * sine(angle)
    const knobSize = KNOB_SIZE * (size / 1.5);
    const knobX =
      centerX - Math.cos(endAngle + 3) * (r - (10 * (size / 2) + KNOB_SIZE));
    const knobY =
      centerY - Math.sin(endAngle + 3) * (r - (10 * (size / 2) + KNOB_SIZE));

    context.shadowBlur = 0;
    this.drawArc(
      context,
      knobX,
      knobY,
      knobSize,
      0,
      this.degreeToRad(360),
      KNOB_COLOR
    );

    context.restore();
  };
  handleInputChange = (e: any) => {
    const { min, max } = this.props;
    let value = parseInt(e.target.value);
    if (value > max) {
      value = max;
    } else if (value < min) {
      value = min;
    }
    this.setState({
      type: INPUT_TYPE,
      value
    });
  };
  handleChange = (e: any) => {
    e.stopPropagation();
    const { x } = this.state;
    let xDirection = "right";
    if (x < e.pageX) {
      xDirection = "right";
    } else {
      xDirection = "left";
    }

    const xPos = e.clientX;
    const yPos = e.clientY;
    //const value = this.getValueFromPoint(x, y);
    this.setState({
      type: CLICK_TYPE,
      x: xPos,
      y: yPos,
      direction: xDirection,
      value: this.getValueFromPoint(xPos, yPos)
    });
  };

  setGhostImage = (e: any) => {
    e.dataTransfer.setDragImage(this.ghostImage, 0, 0);
  };
  render() {
    const { value } = this.state;
    const { min, max, size } = this.props;
    const width = 50 * size;
    const height = 50 * size;
    return (
      <div>
        <img
          ref={node => {
            this.ghostImage = node;
          }}
          src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
        />
        <div
          {...css(styles.container, { width, height })}
          draggable
          onDragStart={this.setGhostImage}
          onDragEnd={this.handleChange}
          onDrag={this.handleChange}
          onClick={this.handleChange}
        >
          <canvas
            {...css(styles.canvas)}
            ref={node => {
              this.canvas = node;
            }}
            width={width}
            height={width}
          />
          <input
            {...css(styles.input, {
              width: "30px",
              appearance: "none",
              margin: 0,
              textAlign: "center",
              top: height,
              left: (width - 30) / 2
            })}
            type="number"
            max={max}
            min={min}
            onChange={this.handleInputChange}
            value={value}
          />
        </div>
      </div>
    );
  }
}

export default Knob;
