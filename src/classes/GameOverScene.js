/**
 * Game over scene
 *
 * @author Richard Persson
 * @version 1.0.0
 */

import Phaser from 'phaser'
import { config } from '../app'

/**
 * A scene representing a game over state.
 *
 * @export
 * @class GameOverScene
 * @extends {Phaser.Scene}
 */
export default class GameOverScene extends Phaser.Scene {
  constructor () {
    super('GameOverScene')
  }

  /**
   * Called when the scene starts. Creates
   *
   * @param {Array} data // Data passed from other scenes.
   * @memberof GameOverScene
   */
  create (data) {
    // Middle of game area.
    this.middleWidth = config.width / 2
    this.middleHeight = config.height / 2

    // Username and score
    this.username = data[0]
    this.score = data[1]

    // Create images and text
    this.add.image(this.middleWidth, this.middleHeight, 'gameOverMenu')
    this.add.bitmapText(this.middleWidth, this.middleHeight - 175, 'arcade', 'Game Over!', 32).setOrigin(0.5).setTint(0xF20D0D)
    this.add.bitmapText(this.middleWidth, this.middleHeight - 110, 'arcade', 'Your Score', 22).setOrigin(0.5).setTint(0xfffa65)
    this.add.bitmapText(this.middleWidth - 200, this.middleHeight - 85, 'arcade', `Player: ${this.username}`, 18)
    this.add.bitmapText(this.middleWidth - 200, this.middleHeight - 60, 'arcade', `Score: ${this.score}`, 18)
    this.snakeAnim = this.add.sprite(this.middleWidth, this.middleHeight + 100, 'snakeAnim').setScale(4)

    let highscore = this.getHighscore()
    this.add.bitmapText(this.middleWidth, this.middleHeight, 'arcade', 'Highest Score', 22).setOrigin(0.5).setTint(0xfffa65)
    this.add.bitmapText(this.middleWidth - 200, this.middleHeight + 25, 'arcade', `Player: ${highscore[0]}`, 18)
    this.add.bitmapText(this.middleWidth - 200, this.middleHeight + 50, 'arcade', `Score: ${highscore[1]}`, 18)
    this.backToMenu = this.add.bitmapText(this.middleWidth, this.middleHeight + 200, 'arcade', 'Back to main menu', 20).setOrigin(0.5).setInteractive().setTint(0xF20D0D)

    // Border
    this.border = this.add.rectangle(220, 120, 460, 460).setOrigin(0)
    this.border.setStrokeStyle(2, 0x000000)

    this.createEvents()
    this.createAnims()

    // Create and play sound
    this.sound.add('audioGameOver').play()
  }

  /**
   * Creates events.
   *
   * @memberof GameOverScene
   */
  createEvents () {
    // Back to main menu. Creates a new game due to framework limits as to completely restart a scene.
    this.backToMenu.once('pointerdown', () => {
      this.game.destroy(true)

      setTimeout(() => {
        this.newGame = new Phaser.Game(config)
      }, 300)
    })
    // Change color on "back" hwne hovering over/out.
    this.backToMenu.on('pointerover', () => { this.backToMenu.setTint(0xffffff) })
      .on('pointerout', () => { this.backToMenu.setTint(0xF20D0D) })
  }

  /**
   * Create animations.
   *
   * @memberof GameOverScene
   */
  createAnims () {
    this.anims.create({
      key: 'death',
      frameRate: 6,
      repeat: -1,
      frames: this.anims.generateFrameNumbers('snakeAnim', {
        frames: [40, 41, 42, 43, 44, 45, 46, 47, 48, 49]
      })
    })
    // Play "death" animation.
    this.snakeAnim.anims.play('death')
  }

  /**
   * Get and set highscore from/to local storage.
   *
   * @returns {Array} An array of strings
   * @memberof GameOverScene
   */
  getHighscore () {
    let highscore

    // If first time playing fetch best score, else create a new.
    window.localStorage.getItem('bestScore') !== null
      ? highscore = window.localStorage.getItem('bestScore')
      : highscore = `${this.username} ${this.score}`

    let username = highscore.split(' ')[0]
    let score = Number(highscore.split(' ')[1])

    if (this.score > score) {
      score = this.score
      username = this.username
    }

    // Set score to local storage
    window.localStorage.setItem('bestScore', `${username} ${score}`)

    return [username, score]
  }
}
