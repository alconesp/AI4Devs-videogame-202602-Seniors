export const textureKeys = {
  background: 'background',
  speaker: 'speaker',
  playerNeutral1: 'player-neutral-1',
  playerNeutral2: 'player-neutral-2',
  playerAimCenter: 'player-aim-center',
  playerAimRight: 'player-aim-right',
  playerAimLeft: 'player-aim-left',
  playerVictory1: 'player-victory-1',
  playerVictory2: 'player-victory-2',
  plate: 'plate'
};

export const texturePaths = {
  [textureKeys.background]: '/fondo.png',
  [textureKeys.speaker]: '/speaker.svg',
  [textureKeys.playerNeutral1]: '/n1.png',
  [textureKeys.playerNeutral2]: '/n2.png',
  [textureKeys.playerAimCenter]: '/tc.png',
  [textureKeys.playerAimRight]: '/td.png',
  [textureKeys.playerAimLeft]: '/ti.png',
  [textureKeys.playerVictory1]: '/v1.png',
  [textureKeys.playerVictory2]: '/v2.png',
  [textureKeys.plate]: '/plate.svg'
};

export const criticalTextureKeys = [
  textureKeys.background,
  textureKeys.speaker,
  textureKeys.playerNeutral1,
  textureKeys.playerNeutral2,
  textureKeys.playerAimCenter,
  textureKeys.playerAimRight,
  textureKeys.playerAimLeft,
  textureKeys.playerVictory1,
  textureKeys.playerVictory2,
  textureKeys.plate
];