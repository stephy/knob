import React, { Component } from "react";
import { css } from "glamor";

const styles = {
  container: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  children: {
    position: "absolute",
    left: "30%",
    top: "30%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  },
  canvas: {
    position: "absolute"
  }
};
interface KnobType {}
class Knob extends Component<KnobType, {}> {
  componentDidMount() {
    this.updateCanvas();
  }

  getRadius = () => {
    const { radius, width } = this.props;
    return !radius ? width * 0.4 : radius;
  };

  updateCanvas = () => {
    const {
      items,
      colorFill,
      colorEmpty,
      colorOutline,
      colorMiddle,
      donut,
      fillWidth,
      reverse
    } = this.props;
    const r = this.getRadius();
    const itms = items ? Object.keys(items) : [];

    const percentages = new Array(itms.length);
    const colors = [];
    percentages.fill(100 / itms.length);
    const filled = [];
    const empty = [];
    itms.forEach(key => {
      if (items[key]) {
        filled.push(key);
      } else {
        empty.push(key);
      }
    });
    let sorted = [...filled, ...empty];
    if (reverse) {
      sorted = [...filled, ...empty].reverse();
    }
    sorted.forEach(key => {
      if (items[key]) {
        colors.push(colorFill);
      } else {
        colors.push(colorEmpty);
      }
    });

    const segmentMode = donut || true;
    const slices = {
      percentages,
      colors,
      elements: sorted
    };
    const canvas = this.canvas;
    const context = canvas.getContext("2d");

    const percentElements = slices.percentages;
    const colorElements = slices.colors;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    context.beginPath();
    const endAngle = 2 * Math.PI;

    let lastAngle = 0;

    for (let i = 0; i < percentElements.length; i++) {
      const percent = percentElements[i];
      const color = colorElements[i];

      const currentSegment = endAngle * (percent / 100);
      const currentAngle = currentSegment + lastAngle;

      context.beginPath();
      context.moveTo(centerX, centerY);
      context.arc(centerX, centerY, r, lastAngle, currentAngle, false);
      context.closePath();

      lastAngle = lastAngle + currentSegment;

      context.fillStyle = color;
      context.fill();

      if (segmentMode) {
        context.lineWidth = 2;
        context.strokeStyle = colorOutline || "transparent";
      } else {
        context.lineWidth = 1;
        context.strokeStyle = "transparent";
      }
      context.stroke();
      context.fill();
    }
    if (segmentMode) {
      context.beginPath();
      context.fillStyle = colorMiddle || colorOutline;
      context.arc(centerX, centerY, r - fillWidth, 0, 2 * Math.PI, false);
      context.fill();
    }
  };

  render() {
    const { children, width } = this.props;
    const dimensions = { width, height: width };
    const r = this.getRadius();
    return (
      <div {...css(styles.container, dimensions)}>
        <canvas
          {...css(styles.canvas)}
          ref={node => {
            this.canvas = node;
          }}
          width={width}
          height={width}
        />
        <div {...css(styles.children, { width: r, height: r })}>{children}</div>
      </div>
    );
  }
}

export default Progress;
