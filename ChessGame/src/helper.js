export const getChar = (number) => String.fromCharCode(number + 96);

export const createPosition = () => {
  const position = new Array(8).fill("").map((x) => new Array(8).fill(""));
  // if(defaultVal === "White"){
  console.log("Option white");
  position[0][0] = "rw";

  position[0][7] = "rw";
  position[7][0] = "rb";
  position[7][7] = "rb";
  position[0][1] = "nw";
  position[0][6] = "nw";
  position[7][1] = "nb";
  position[7][6] = "nb";
  position[0][2] = "bw";
  position[0][5] = "bw";
  position[7][2] = "bb";
  position[7][5] = "bb";
  position[0][3] = "qw";
  position[0][4] = "kw";
  position[7][3] = "kb";
  position[7][4] = "qb";

  for (let index = 0; index < 8; index++) {
    position[1][index] = "pw";
    position[7 - 1][index] = "pb";
  }
  return position;
};

export const copyPosition = (oldposition) => {
  console.log(oldposition.slice() === oldposition);
  return oldposition.slice();
};
