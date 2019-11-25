/**
 * The starting point of the application.
 *
 * @author Richard Persson
 * @version 1.0.0
 */

import Phaser from 'phaser'
import LoadingScene from './classes/LoadingScene'
import MenuScene from './classes/MenuScene'
import SnakeScene from './classes/SnakeScene'
import TetrisScene from './classes/TetrisScene'
import GameOverScene from './classes/GameOverScene'

// Game settings.
export const config = {
  // Rendering type. Priorities WebGL and fallback on Canvas.
  type: Phaser.AUTO,
  // The parent ID, i.e <div id="snaetris"></div>
  parent: 'snaetris',
  width: 900,
  height: 700,
  scene: [LoadingScene, MenuScene, SnakeScene, TetrisScene, GameOverScene],
  dom: {
    // Allows DOM-content inside the canvas/webgl.
    createContainer: true
  },
  render: {
    pixelArt: true
  },
  physics: {
    default: 'arcade'
  }
}

// Export and create an instance a game.
export const game = new Phaser.Game(config)
