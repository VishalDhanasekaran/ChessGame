export const getChar = (number) => String.fromCharCode(number + 96);

export const createPosition = () => {
  const position = new Array(8).fill("").map((x) => new Array(8).fill(""));
  // if(defaultVal === "White"){
  console.log("Option white");
  position[0][0] = "rW";
  position[0][7] = "rW";
  position[7][0] = "rB";
  position[7][7] = "rB";
  position[0][1] = "nW";
  position[0][6] = "nW";
  position[7][1] = "nB";
  position[7][6] = "nB";
  position[0][2] = "bW";
  position[0][5] = "bW";
  position[7][2] = "bB";
  position[7][5] = "bB";
  position[0][3] = "qW";
  position[0][4] = "kW";
  position[7][3] = "kB";
  position[7][4] = "qB";

  for (let index = 0; index < 8; index++) {
    position[1][index] = "pW";
    position[7 - 1][index] = "pB";
  }
  return position;
};

export const copyPosition = (oldposition) => {
  console.log(oldposition.slice() === oldposition);
  return oldposition.slice();
};
