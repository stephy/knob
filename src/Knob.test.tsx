import Knob from "./Knob";
const SHIFTED_ANGLE = 120;
it("should convert degree angles to radians", () => {
  const knob = new Knob({
    min: 0,
    max: 20,
    currentValue: 20,
    size: 1
  });
  const half = knob.degreeToRad(180);
  const full = knob.degreeToRad(360);
  expect(half).toBe(3.141592653589793);
  expect(full).toBe(6.283185307179586);
});

it("should shift start angle", () => {
  const knob = new Knob({
    min: 0,
    max: 20,
    currentValue: 20,
    size: 1
  });
  let shiftedStartAngle = knob.getStartAngle(0);
  expect(shiftedStartAngle).toBe(SHIFTED_ANGLE);
  shiftedStartAngle = knob.getStartAngle(1);
  expect(shiftedStartAngle).toBe(SHIFTED_ANGLE + 1);
  shiftedStartAngle = knob.getStartAngle(30);
  expect(shiftedStartAngle).toBe(SHIFTED_ANGLE + 30);
});

it("should shift end angle given a value", () => {
  const knob = new Knob({
    min: 0,
    max: 20,
    currentValue: 20,
    size: 1
  });
  let endAngle = knob.getEndAngleFromValue(0);
  expect(endAngle).toBe(120);
  endAngle = knob.getEndAngleFromValue(20);
  expect(endAngle).toBe(420);
  endAngle = knob.getEndAngleFromValue(10);
  expect(endAngle).toBe(270);
});

it("should shift end angle given an x, y point", () => {
  const knob = new Knob({
    min: 0,
    max: 20,
    currentValue: 20,
    size: 1
  });
  knob.canvas = {
    height: 100,
    width: 100
  };
  let endAngle = knob.getEndAngleFromPoint(50, 50);
  expect(endAngle).toBe(180);
  endAngle = knob.getEndAngleFromPoint(70, 100);
  expect(endAngle).toBe(68.19859051364818);
});
