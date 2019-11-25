/**
 * Loading scene
 *
 * @author Richard Persson
 * @version 1.0.0
 */

import Phaser from 'phaser'

/**
 * A scene representing a loading state.
 *
 * @export
 * @class LoadingScene
 * @extends {Phaser.Scene}
 */
export default class LoadingScene extends Phaser.Scene {
  constructor () {
    super('LoadingScene')
  }

  /**
   * Preload assets when starting the game.
   *
   * @memberof LoadingScene
   */
  preload () {
    // Load images
    this.load.image('background', 'src/assets/images/background.png')
    this.load.image('logo', 'src/assets/images/logo.png')
    this.load.image('start', 'src/assets/images/start.png')
    this.load.image('exit', 'src/assets/images/exit.png')
    this.load.image('howToPlay', 'src/assets/images/howToPlay.png')
    this.load.image('viewHighscores', 'src/assets/images/viewHighscores.png')
    this.load.image('apple', 'src/assets/images/apple.png')
    this.load.image('tileYellow', 'src/assets/images/tileYellow.png')
    this.load.image('tileBlue', 'src/assets/images/tileBlue.png')
    this.load.image('tileOrange', 'src/assets/images/tileOrange.png')
    this.load.image('tileCyan', 'src/assets/images/tileCyan.png')
    this.load.image('tileGrey', 'src/assets/images/tileGrey.png')
    this.load.image('tilePurple', 'src/assets/images/tilePurple.png')
    this.load.image('tileRed', 'src/assets/images/tileRed.png')
    this.load.image('usernameMenu', 'src/assets/images/usernameMenu.png')
    this.load.image('submit', 'src/assets/images/submit.png')
    this.load.image('snakeTetrisTiles', 'src/assets/images/snakeTetrisTiles.png')
    this.load.image('gameOverMenu', 'src/assets/images/gameOverMenu.png')
    this.load.image('highscoreMenu', 'src/assets/images/highscoreMenu.png')
    this.load.image('howToPlayMenu', 'src/assets/images/howToPlayMenu.png')
    this.load.image('keys', 'src/assets/images/keys.png')
    this.load.image('howToPlayRow', 'src/assets/images/howToPlayRow.png')
    this.load.image('poisonedApple', 'src/assets/images/poisonedApple.png')
    this.load.image('soundOnWhite', 'src/assets/images/soundOnWhite.png')
    this.load.image('soundOffWhite', 'src/assets/images/soundOffWhite.png')

    // Load spritesheets
    this.load.spritesheet('snakeAnim', 'src/assets/images/snakeSheet.png', {
      frameHeight: 32,
      frameWidth: 32
    })

    // Load html
    this.load.html('usernameInput', 'src/assets/html/username.html')

    // Load JSON
    this.load.tilemapTiledJSON('snakeMap', 'src/assets/tilemaps/snakeMap.json')
    this.load.tilemapTiledJSON('tetrisMap', 'src/assets/tilemaps/tetrisMap.json')

    // Load fonts
    this.load.bitmapFont('arcade', 'src/assets/fonts/arcade.png', 'src/assets/fonts/arcade.xml')

    // Load audio
    this.load.audio('audioMenu', [
      'src/assets/audio/menu.mp3',
      'src/assets/audio/menu.ogg'
    ])
    this.load.audio('audioGame', [
      'src/assets/audio/game.mp3',
      'src/assets/audio/game.ogg'
    ])
    this.load.audio('audioClick', [
      'src/assets/audio/click.mp3',
      'src/assets/audio/click.ogg'
    ])
    this.load.audio('audioBite', [
      'src/assets/audio/bite.mp3',
      'src/assets/audio/bite.ogg'
    ])
    this.load.audio('audioBadBite', [
      'src/assets/audio/badBite.mp3',
      'src/assets/audio/badBite.ogg'
    ])
    this.load.audio('audioMatch', [
      'src/assets/audio/match.mp3',
      'src/assets/audio/match.ogg'
    ])
    this.load.audio('audioGameOver', [
      'src/assets/audio/gameOver.mp3',
      'src/assets/audio/gameOver.ogg'
    ])
  }

  /**
   * Instantly called after preload function.
   *
   * @memberof LoadingScene
   */
  create () {
    // Add text
    this.add.text(20, 20, 'Loading game...')

    // Call the MenuScene.
    this.scene.start('MenuScene')
  }
}
