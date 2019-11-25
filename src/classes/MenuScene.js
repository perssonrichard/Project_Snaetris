/**
 * Menu scene
 *
 * @author Richard Persson
 * @version 1.0.0
 */

import Phaser from 'phaser'
import { config } from '../app'

/**
 * A scene representing a main menu state
 *
 * @export
 * @class MenuScene
 * @extends {Phaser.Scene}
 */
export default class MenuScene extends Phaser.Scene {
  constructor () {
    super('MenuScene')
  }

  /**
   * Instantly called when scene starts.
   *
   * @memberof MenuScene
   */
  create () {
    // Middle of game area.
    this.middleWidth = config.width / 2
    this.middleHeight = config.height / 2

    // Create menus
    this.createMainMenu()
    this.createUsernameMenu()
    this.createHowToPlayMenu()
    this.createHighscoreMenu()

    // Create animations
    this.createAnimations()

    // Create events
    this.hoverEvents()
    this.clickEvents()

    this.muted = false
  }

  /**
   * Creates a highscore menu.
   *
   * @memberof MenuScene
   */
  createHighscoreMenu () {
    // Images and text
    let menuBg = this.add.image(this.middleWidth, this.middleHeight, 'highscoreMenu')
    this.highscoreSnake = this.add.sprite(this.middleWidth + 190, this.middleHeight - 55, 'snakeAnim').setScale(2)
    this.highscoreBack = this.add.bitmapText(this.middleWidth - 232, this.middleHeight - 170, 'arcade', 'Back', 12).setOrigin(0.5).setInteractive().setTint(0xfffa65)
    let text = this.add.bitmapText(this.middleWidth - 250, this.middleHeight - 140, 'arcade', 'Highest local score', 20).setTint(0xffffff)

    // If first time playing no highscore, else fetch from local storage
    let highscore
    if (window.localStorage.getItem('bestScore') !== null) {
      let localStorageScore = window.localStorage.getItem('bestScore')
      let username = localStorageScore.split(' ')[0]
      let score = Number(localStorageScore.split(' ')[1])

      highscore = this.add.bitmapText(this.middleWidth - 250, this.middleHeight - 50, 'arcade', `Player: ${username}\n\nScore: ${score}`, 20)
    } else {
      highscore = this.add.bitmapText(this.middleWidth - 250, this.middleHeight - 50, 'arcade', 'No score available', 20)
    }

    // Highscore menu group
    this.highscoreMenuGroup = this.add.group()
    this.highscoreMenuGroup.addMultiple([menuBg, text, this.highscoreBack, highscore, this.highscoreSnake])
    this.highscoreMenuGroup.toggleVisible()
  }

  /**
   * Creates a username menu.
   *
   * @memberof MenuScene
   */
  createUsernameMenu () {
    // Images, text and DOM
    let menuBg = this.add.image(this.middleWidth, this.middleHeight, 'usernameMenu')
    this.usernameSnake = this.add.sprite(210, 440, 'snakeAnim').setScale(2).toggleFlipX()
    this.usernameInput = this.add.dom(this.middleWidth, this.middleHeight - 35).createFromCache('usernameInput').addListener('mouseover mouseout click')
    this.usernameBack = this.add.bitmapText(this.middleWidth - 238, this.middleHeight - 175, 'arcade', 'Back', 12).setOrigin(0.5).setInteractive().setTint(0xfffa65)
    let text = this.add.bitmapText(this.middleWidth, this.middleHeight - 130, 'arcade', 'Choose a username', 24).setOrigin(0.5).setTint(0xffffff)
    this.submit = this.add.bitmapText(this.middleWidth - 109, this.middleHeight - 13, 'arcade', 'Submit', 14).setOrigin(0.5).setTint(0xffffff)
    let text2 = this.add.bitmapText(this.submit.x, text.y + 45, 'arcade', 'A-Z, 0-9', 14).setOrigin(0.5)

    // Username menu group
    this.usernameMenuGroup = this.add.group()
    this.usernameMenuGroup.addMultiple([menuBg, this.usernameInput, this.usernameSnake, this.submit, text, this.usernameBack, text2])
    this.usernameMenuGroup.toggleVisible()
  }

  /**
   * Creates a how to play menu.
   *
   * @memberof MenuScene
   */
  createHowToPlayMenu () {
    // Images and text
    let menuBg = this.add.image(this.middleWidth, this.middleHeight, 'howToPlayMenu')
    this.howToPlayBack = this.add.bitmapText(this.middleWidth - 232, this.middleHeight - 170, 'arcade', 'Back', 12).setOrigin(0.5).setInteractive().setTint(0xfffa65)
    let text1 = this.add.bitmapText(this.middleWidth, this.middleHeight - 140, 'arcade', 'Use the arrow keys to move', 14).setOrigin(0.5)
    let text2 = this.add.bitmapText(text1.x, text1.y + 120, 'arcade', 'Eat red apples to upgrade the snake', 14).setOrigin(0.5)
    let text3 = this.add.bitmapText(text2.x, text2.y + 80, 'arcade', 'Match rows to collect your score', 14).setOrigin(0.5)
    let keys = this.add.image(this.middleWidth, this.middleHeight - 80, 'keys').setScale(0.8)
    let apple = this.add.image(this.middleWidth + 20, this.middleHeight + 20, 'apple')
    let snakePart1 = this.add.image(this.middleWidth - 20, this.middleHeight + 20, 'tileYellow')
    let snakePart2 = this.add.image(this.middleWidth - 40, this.middleHeight + 20, 'tileYellow')
    let snakePart3 = this.add.image(this.middleWidth - 60, this.middleHeight + 20, 'tileYellow')
    let row = this.add.image(text3.x, text3.y + 60, 'howToPlayRow')
    this.add.bitmapText(this.middleWidth, this.middleHeight + 330, 'arcade', 'Richard Persson 2019', 14).setOrigin(0.5).setTint(0xfffa65)

    // How to play menu group
    this.howToPlayMenuGroup = this.add.group()
    this.howToPlayMenuGroup.addMultiple([menuBg, this.howToPlayBack, text1, text2, text3, keys, snakePart1, snakePart2, snakePart3, apple, row])
    this.howToPlayMenuGroup.toggleVisible()

    // Create audio
    this.audioMenu = this.sound.add('audioMenu')
    this.audioMenu.play({ loop: true })
    this.audioClick = this.sound.add('audioClick')
  }

  /**
   * Creates the main menu.
   *
   * @memberof MenuScene
   */
  createMainMenu () {
    // Create images
    this.background = this.add.image(0, 0, 'background').setOrigin(0, 0)
    this.logo = this.add.image(this.middleWidth, this.middleHeight - 150, 'logo').setScale(1.2)
    this.soundOn = this.add.image(870, 30, 'soundOnWhite').setInteractive()
    this.soundOff = this.add.image(870, 30, 'soundOffWhite').setInteractive()
    this.soundOff.visible = false

    // Create sprites
    this.start = this.add.sprite(0, 0, 'start')
    this.viewHighscores = this.add.sprite(0, 0, 'viewHighscores')
    this.howToPlay = this.add.sprite(0, 0, 'howToPlay')
    this.exit = this.add.sprite(0, 0, 'exit')
    this.mainMenuSnake = this.add.sprite(0, 0, 'snakeAnim').setScale(3).setVisible(false)

    // Main menu group
    this.menuGroup = this.add.group([this.start, this.viewHighscores, this.howToPlay, this.exit])
    Phaser.Actions.SetXY(this.menuGroup.getChildren(), this.middleWidth, 350, 0, 70)
  }

  /**
   * Called when hovering over/out of certain content.
   *
   * @memberof MenuScene
   */
  hoverEvents () {
    // Shows an animated snake on pointer over.
    this.start.setInteractive().on('pointerover', () => {
      this.mainMenuSnake.setVisible(true)
      this.mainMenuSnake.x = this.start.x - this.start.width / 1.6
      this.mainMenuSnake.y = this.start.y - 34
    })
    this.viewHighscores.setInteractive().on('pointerover', () => {
      this.mainMenuSnake.setVisible(true)
      this.mainMenuSnake.x = this.viewHighscores.x - this.viewHighscores.width / 1.7
      this.mainMenuSnake.y = this.viewHighscores.y - 36
    })
    this.howToPlay.setInteractive().on('pointerover', () => {
      this.mainMenuSnake.setVisible(true)
      this.mainMenuSnake.x = this.howToPlay.x - this.howToPlay.width / 1.6
      this.mainMenuSnake.y = this.howToPlay.y - 37
    })
    this.exit.setInteractive().on('pointerover', () => {
      this.mainMenuSnake.setVisible(true)
      this.mainMenuSnake.x = this.exit.x - this.exit.width / 1.6
      this.mainMenuSnake.y = this.exit.y - 33
    })

    // Hide animated snake on pointer out.
    this.start.on('pointerout', () => { this.mainMenuSnake.setVisible(false) })
    this.viewHighscores.on('pointerout', () => { this.mainMenuSnake.setVisible(false) })
    this.howToPlay.on('pointerout', () => { this.mainMenuSnake.setVisible(false) })
    this.exit.on('pointerout', () => { this.mainMenuSnake.setVisible(false) })

    // Change color on back text when hovering over/out.
    this.usernameBack.on('pointerover', () => { this.usernameBack.setTint(0xffffff) }).on('pointerout', () => this.usernameBack.setTint(0xfffa65))
    this.highscoreBack.on('pointerover', () => { this.highscoreBack.setTint(0xffffff) }).on('pointerout', () => this.highscoreBack.setTint(0xfffa65))
    this.howToPlayBack.on('pointerover', () => { this.howToPlayBack.setTint(0xffffff) }).on('pointerout', () => this.howToPlayBack.setTint(0xfffa65))

    // Change color on submit text when hovering over/out.
    this.usernameInput.on('mouseover', (event) => {
      if (event.target.name === 'usernameSubmit') {
        this.submit.setTint(0xfffa65)
      }
    })
      .on('mouseout', (event) => {
        if (event.target.name === 'usernameSubmit') {
          this.submit.setTint(0xffffff)
        }
      })
  }

  /**
   * Called when clicking on certain content.
   *
   * @memberof MenuScene
   */
  clickEvents () {
    // Saves username to local variable.
    this.usernameInput.on('click', (event) => {
      event.preventDefault()

      if (event.target.name === 'usernameSubmit') {
        this.audioClick.play()
        let inputUsername = document.getElementById('usernameInput')

        let regex = /^[A-Z0-9-_]+$/i
        let username = inputUsername.value

        // Test the input using above regex.
        if (regex.test(username) && username.length <= 8 && username.length >= 2) {
          this.username = username

          // Stop menu music
          this.audioMenu.stop()

          // Start the active game scene.
          this.cameras.main.fade(1000, 0, 0, 0, false, (camera, progress) => {
            this.usernameInput.visible = false

            if (progress === 1) {
              this.scene.start('SnakeScene', [this.username, this.muted])
            }
          })
        } else {
          console.log('Invalid input!')
        }
      }
    })

    // Show username menu
    this.start.on('pointerdown', () => {
      this.audioClick.play()
      this.menuGroup.toggleVisible()
      this.usernameMenuGroup.toggleVisible()
    })

    // Show highscore menu
    this.viewHighscores.on('pointerdown', () => {
      this.audioClick.play()
      this.menuGroup.toggleVisible()
      this.highscoreMenuGroup.toggleVisible()
    })

    // Show how to play menu
    this.howToPlay.on('pointerdown', () => {
      this.audioClick.play()
      this.menuGroup.toggleVisible()
      this.howToPlayMenuGroup.toggleVisible()
    })

    // Back from username menu
    this.usernameBack.on('pointerdown', () => {
      this.audioClick.play()
      this.usernameMenuGroup.toggleVisible()
      this.menuGroup.toggleVisible()
    })

    // Back from highscore menu
    this.highscoreBack.on('pointerdown', () => {
      this.audioClick.play()
      this.highscoreMenuGroup.toggleVisible()
      this.menuGroup.toggleVisible()
    })

    // Back from how to play menu
    this.howToPlayBack.on('pointerdown', () => {
      this.audioClick.play()
      this.howToPlayMenuGroup.toggleVisible()
      this.menuGroup.toggleVisible()
    })

    // Toggle mute sound
    this.soundOn.on('pointerdown', () => {
      this.muted = true
      this.audioClick.play()
      this.audioMenu.stop()
      this.soundOn.visible = false
      this.soundOff.visible = true
    })
    this.soundOff.on('pointerdown', () => {
      this.muted = false
      this.audioClick.play()
      this.audioMenu.play()
      this.soundOff.visible = false
      this.soundOn.visible = true
    })

    // Exit game
    this.exit.on('pointerdown', () => { this.game.destroy(true) })
  }

  /**
   * Create animation from spritesheet.
   *
   * @memberof MenuScene
   */
  createAnimations () {
    this.anims.create({
      key: 'passive',
      frameRate: 10,
      repeat: -1,
      frames: this.anims.generateFrameNumbers('snakeAnim', {
        frames: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
      })
    })

    this.anims.create({
      key: 'walking',
      frameRate: 10,
      repeat: -1,
      frames: this.anims.generateFrameNumbers('snakeAnim', {
        frames: [20, 21, 22, 23, 24, 25, 26, 27, 28, 29]
      })
    })

    this.tweens.add({
      targets: this.usernameSnake,
      x: 690,
      duration: 8000,
      ease: 'Linear',
      yoyo: true,
      repeat: -1,
      onYoyo: () => { this.usernameSnake.toggleFlipX() },
      onRepeat: () => { this.usernameSnake.toggleFlipX() }
    })

    // Play animation.
    this.mainMenuSnake.anims.play('passive')
    this.usernameSnake.anims.play('walking')
    this.highscoreSnake.play('passive')
  }
}
