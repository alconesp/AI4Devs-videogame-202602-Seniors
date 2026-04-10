import Phaser from 'phaser';
import { gameConfig } from './game/config.js';
import './styles.css';

const game = new Phaser.Game(gameConfig);

window.phaserGame = game;