export const getChar = (number) => String.fromCharCode(number + 96);

export const createPosition = () => {
  const position = new Array(8).fill("").map((x) => new Array(8).fill(""));

  position[0][0] = "rW";
  position[0][1] = "nW";
  position[0][2] = "bW";
  position[0][3] = "qW";
  position[0][4] = "kW";
  position[0][5] = "bW";
  position[0][6] = "nW";
  position[0][7] = "rW";
  position[7][0] = "rB";
  position[7][7] = "rB";
  position[7][1] = "nB";
  position[7][6] = "nB";
  position[7][2] = "bB";
  position[7][5] = "bB";
  position[7][4] = "kB";
  position[7][3] = "qB";


  for (let index = 0; index < 8; index++) {
    position[1][index] = "pW";
    position[7 - 1][index] = "pB";
  }
  return position;
};

export const copyPosition = (oldposition) => {
  const newPosition = new Array(8).fill("").map((x) => new Array(8).fill(""));

  for (let rank = 0; rank < 8; rank++) {
    for (let file = 0; file < 8; file++) {
      newPosition[rank][file] = oldposition[rank][file];
    }
  }

  return newPosition;
};

export const areSameColorTiles = (coords1, coords2) =>
  (coords1.x + coords1.y) % 2 === coords2.x + coords2.y;

export const findPieceCoords = (position, type) => {
  let results = [];
  position.forEach((rank, i) => {
    rank.forEach((pos, j) => {
      if (pos === type) results.push({ x: i, y: j });
    });
  });
  return results;
};

