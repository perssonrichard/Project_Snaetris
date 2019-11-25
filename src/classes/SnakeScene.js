/**
 * Snake scene
 *
 * @author Richard Persson
 * @version 1.0.0
 */

import Phaser from 'phaser'
import { config } from '../app'
import { range } from '../helpers/range'

/**
 * Represents the Snake part of the game.
 *
 * @export
 * @class SnakeScene
 * @extends {Phaser.Scene}
 */
export default class SnakeScene extends Phaser.Scene {
  constructor () {
    super('SnakeScene')
  }

  /**
   * Instantly called when the scene starts.
   *
   * @memberof SnakeScene
   */
  create (data) {
    this.username = data[0]
    this.muted = data[1]

    // Create content
    this.createVariables()
    this.createVisualContent()
    this.createNonVisualContent()
    this.createTimers()

    this.spawnSnake()
    this.onResume()
    this.clickEvents()
  }

  /**
   * Called when this scene is resumed.
   *
   * @memberof SnakeScene
   */
  onResume () {
    this.events.on('resume', (sys, data) => {
      this.scene.pause('TetrisScene')

      // Reset keys in case they were hold down before pause
      this.input.keyboard.resetKeys()

      // Score passed from snake scene.
      this.score = data[0]

      // Check if up one level
      this.levelHandler()

      // Reset data
      this.snakeExists = false
      this.poisonedApplesExists = false
      this.appleExists = false
      this.direction = this.right
      this.heading = this.right
      this.appleCounter = 0
      this.appleValue = 0
      this.snakeValue = 0
      this._timeLeft = 10
      this.timeLeftText.setText(this._timeLeft)
      this.snakeValueText.setText(this.snakeValue)

      this.newTimeLeftTimer()
      this.newSnakeTimer()
      this.snakeTimer.paused = false
      this.timeLeftTimer.paused = false
    })
  }

  /**
   * Create local variables.
   *
   * @memberof SnakeScene
   */
  createVariables () {
    this.middleWidth = config.width / 2
    this.middleHeight = config.height / 2

    this.right = 'RIGHT'
    this.left = 'LEFT'
    this.up = 'UP'
    this.down = 'DOWN'

    // The direction of the snake and the heading to turn to.
    this.direction = this.right
    this.heading = this.right

    this.snakeExists = true
    this.poisonedApplesExists = false
    this.appleExists = false

    this._level = 1
    this._blockCounter = 0
    this._timeLeft = 10

    // Level 1
    this.speed = 170

    // Counter before game starts
    this.count = 3

    this.colors = ['tileGrey', 'tileBlue', 'tileYellow', 'tileRed', 'tilePurple', 'tileOrange', 'tileCyan']

    // Score, lives, count apples, apple score value
    this.score = 0
    this.lives = 3
    this.appleCounter = 0
    this.appleValue = 0
    this.snakeValue = 0
  }

  /**
   * Handles current level.
   *
   * @memberof SnakeScene
   */
  levelHandler () {
    // Max level 10
    if (this._level === 10) { this._blockCounter = 0 }

    // One level per tenth block
    if (this._blockCounter === 10) {
      this._level++
      this.speed -= 10
      this.levelText.setText(this._level)
      this._blockCounter = 0
    }
  }

  /**
   * Create timers.
   *
   * @memberof SnakeScene
   */
  createTimers () {
    // Timer before the game starts
    this.gameStartsTimer = this.time.addEvent({
      delay: 1000,
      callback: this.startGame,
      callbackScope: this,
      repeat: 3
    })

    this.newTimeLeftTimer()
    this.newSnakeTimer()
  }

  /**
   * Creates a new time left timer.
   *
   * @memberof SnakeScene
   */
  newTimeLeftTimer () {
    this.timeLeftTimer = this.time.addEvent({
      delay: 1000,
      callback: this.timeLeft,
      callbackScope: this,
      repeat: this._timeLeft - 1,
      paused: true
    })
  }

  /**
   * Creates a new snake timer.
   *
   * @memberof SnakeScene
   */
  newSnakeTimer () {
    // Timer for auto moving the snake
    this.snakeTimer = this.time.addEvent({
      delay: this.speed,
      callback: this.snakeAutoMove,
      callbackScope: this,
      loop: true,
      paused: true
    })
  }

  /**
   * Callback function for time left timer.
   *
   * @memberof SnakeScene
   */
  timeLeft () {
    this._timeLeft -= 1
    this.timeLeftText.setText(this._timeLeft)

    if (this._timeLeft === 0) {
      this.snakeTimer.destroy()
      this.timeLeftTimer.destroy()
      this.apple.destroy()
      this.poisonedApples.destroy(true)
      this.collider.destroy()
      this.poisonCollider.destroy()

      this._blockCounter++

      // Change scene
      this.scene.resume('TetrisScene', [this.bgLayer, this.snake, this.speed, this.username])
    }
  }

  /**
   * Creates non visual content such as tilemaps and layers.
   *
   * @memberof SnakeScene
   */
  createNonVisualContent () {
    // Create a cursor key object to prevent default dom actions
    this.input.keyboard.createCursorKeys()

    // Create tilemap, tilesets and layers
    this.snakeMap = this.make.tilemap({ key: 'snakeMap' })
    this.snakeMap.addTilesetImage('snakeTetrisTiles')
    this.bgLayer = this.snakeMap.createStaticLayer('background', 'snakeTetrisTiles')
    let bglayer1 = this.snakeMap.createStaticLayer('background1', 'snakeTetrisTiles')

    // Config layers
    this.bgLayer.x = this.middleWidth - (this.bgLayer.width / 2)
    this.bgLayer.y = 50
    bglayer1.x = this.bgLayer.x
    bglayer1.y = this.bgLayer.y

    // Sound
    this.audioGame = this.sound.add('audioGame')
    this.audioBite = this.sound.add('audioBite')
    this.audioBadBite = this.sound.add('audioBadBite')
    if (this.muted === false) {
      this.audioGame.play({ loop: true })
    } else {
      this.soundOff.visible = true
      this.soundOn.visible = false
    }
  }

  /**
   * Create visual content.
   *
   * @memberof SnakeScene
   */
  createVisualContent () {
    // Create images
    this.background = this.add.image(0, 0, 'background')
    this.background.setOrigin(0, 0)
    this.soundOn = this.add.image(870, 30, 'soundOnWhite').setInteractive()
    this.soundOff = this.add.image(870, 30, 'soundOffWhite').setInteractive()
    this.soundOff.visible = false

    // Create a rectangle border
    this.border = this.add.rectangle(this.middleWidth, this.middleHeight, 402, 602)
    this.border.setStrokeStyle(2, 0x000000)

    // Create Tetris content
    this.scene.launch('TetrisScene')
    this.scene.pause('TetrisScene')

    // Create text
    let leftPosX = this.border.getBounds().left / 2
    let rightPosX = ((900 - this.border.getBounds().right) / 2) + this.border.getBounds().right
    let posY = this.border.getTopLeft().y + 20

    this.countdownText = this.add.bitmapText(this.middleWidth, this.middleHeight - 200, 'arcade', this.count, 40).setOrigin(0.5).setTint(0xfffa65)
    this.countdownText.depth = 2

    this.snakeValueHeader = this.add.bitmapText(leftPosX, posY + 100, 'arcade', 'Snake\nValue', 24).setTint(0xfffa65).setOrigin(0.5)
    this.snakeValueText = this.add.bitmapText(this.snakeValueHeader.x, this.snakeValueHeader.y + 45, 'arcade', this.snakeValue, 24).setOrigin(0.5)

    this.timeLeftHeader = this.add.bitmapText(rightPosX, posY, 'arcade', 'Time Left', 24).setOrigin(0.5).setTint(0xfffa65)
    this.timeLeftText = this.add.bitmapText(this.timeLeftHeader.x, this.timeLeftHeader.y + 35, 'arcade', this._timeLeft, 24).setOrigin(0.5)

    this.levelHeader = this.add.bitmapText(this.timeLeftHeader.x, this.timeLeftHeader.y + 100, 'arcade', 'Level', 24).setOrigin(0.5).setTint(0xfffa65)
    this.levelText = this.add.bitmapText(this.levelHeader.x, this.levelHeader.y + 35, 'arcade', this._level, 24).setOrigin(0.5)

    this.livesHeader = this.add.bitmapText(this.levelHeader.x, this.levelHeader.y + 100, 'arcade', 'Lives', 24).setOrigin(0.5).setTint(0xfffa65)
    this.livesText = this.add.bitmapText(this.livesHeader.x, this.livesHeader.y + 35, 'arcade', this.lives, 24).setOrigin(0.5)
  }

  clickEvents () {
    // Toggle mute sound
    this.soundOn.on('pointerdown', () => {
      this.audioGame.stop()
      this.soundOn.visible = false
      this.soundOff.visible = true
    })
    this.soundOff.on('pointerdown', () => {
      this.audioGame.play()
      this.soundOff.visible = false
      this.soundOn.visible = true
    })
  }

  /**
   * Callback function for start game timer. Start the game on 0.
   *
   * @memberof SnakeScene
   */
  startGame () {
    this.countdownText.setText(this.count)
    if (this.count === 0) {
      this.countdownText.destroy()
      this.snakeTimer.paused = false
      this.timeLeftTimer.paused = false
      this.moveSnake()
    }
    this.count -= 1
  }

  /**
   * Spawns a snake block.
   *
   * @memberof SnakeScene
   */
  spawnSnake () {
    this.snake = this.add.group()
    this.snakeHead = this.physics.add.image(250, 50, 'tileGrey').setOrigin(0, 0)
    this.snake.add(this.snakeHead)
  }

  /**
   * Grow the snake by adding a tile to its tail.
   *
   * @memberof SnakeScene
   */
  growSnake () {
    // Dont grow snake if 7 or more apples.
    if (this.appleCounter === 7) {
      this.appleValue += 4
    } else {
      let [lastTile] = this.snake.getChildren().slice(-1)
      let color = lastTile.texture.key
      let part = this.physics.add.image(lastTile.x, lastTile.y, color).setOrigin(0, 0)

      this.snake.add(part)
    }
  }
  /**
   * Spawns five poisoned apples.
   *
   * @memberof SnakeScene
   */
  spawnPoisonedApples () {
    this.poisonedApples = this.add.group()
    let allX = range(270, 610, 20)
    let allY = range(70, 210, 20)

    // Shuffle arr and get the first five number.
    let xArr = allX.sort(() => { return 0.5 - Math.random() }).slice(0, 5)
    let yArr = allY.sort(() => { return 0.5 - Math.random() }).slice(0, 5)

    for (let i = 0; i < 5; i++) {
      this.poisonedApples.add(this.physics.add.image(xArr[i], yArr[i], 'poisonedApple').setOrigin(0))
    }

    // Add a collider to the snake and the poisoned apples.
    this.poisonCollider = this.physics.add.collider(this.snake, this.poisonedApples.getChildren(), this.snakeAtePoisonedApple, null, this)
  }

  /**
   * Spawns an apple at a random position inside the snake layer.
   *
   * @memberof SnakeScene
   */
  spawnApple () {
    let xArr = range(270, 610, 20)
    let yArr = range(70, 210, 20)

    // Remove poisoned apple coordinates from array to prevent them being spawned on top of eachother.
    if (this.poisonedApples !== undefined) {
      if (this.poisonedApples.children !== undefined) {
        this.poisonedApples.children.iterate(i => {
          xArr.splice(xArr.indexOf(i.x), 1)
          yArr.splice(yArr.indexOf(i.y), 1)
        })
      }
    }

    let randomSpawnX = xArr[Math.floor(Math.random() * xArr.length)]
    let randomSpawnY = yArr[Math.floor(Math.random() * yArr.length)]

    // Don't spawn on top of snake.
    this.snake.children.iterate(tile => {
      while (tile.x === randomSpawnX && tile.y === randomSpawnY) {
        randomSpawnX = xArr[Math.floor(Math.random() * xArr.length)]
        randomSpawnY = yArr[Math.floor(Math.random() * yArr.length)]
      }
    })

    this.apple = this.physics.add.image(randomSpawnX, randomSpawnY, 'apple').setOrigin(0, 0)

    // Add a collider to the snake and the apple.
    this.collider = this.physics.add.collider(this.snake, this.apple, this.snakeAteApple, null, this)
  }

  /**
   * Called when snake eats poisoned apple. Minus one life.
   *
   * @param {object} snake
   * @param {object} apple
   * @memberof SnakeScene
   */
  snakeAtePoisonedApple (snake, apple) {
    this.audioBadBite.play()
    this.lives--
    this.livesText.setText(this.lives)
    apple.destroy()

    if (this.lives === 0) {
      this.gameOver()
    }
  }

  /**
   * Called when the snake eats the apple.
   *
   * @memberof SnakeScene
   */
  snakeAteApple () {
    this.audioBite.play()
    // Count apples and add to value.
    this.appleCounter++
    this.appleValue += 2

    this.growSnake()

    // The value of the snake. Two per tile.
    this.snakeValue = this.appleValue * this.snake.children.size
    this.snakeValueText.setText(this.snakeValue)

    // Can't grow more than six times.
    if (this.appleCounter === 7) { this.appleCounter-- }

    this.apple.destroy()
    this.collider.destroy()

    // Change color of snake to reflect its score value.
    this.snake.children.iterate(tile => {
      tile.setTexture(this.colors[this.appleCounter])
      tile.setData('value', this.appleValue)
    })

    this.appleExists = false
  }

  /**
   * Move the snake 20 pixels at a time.
   *
   * @memberof SnakeScene
   */
  snakeAutoMove () {
    switch (this.heading) {
      case this.right:
        let tileR = this.bgLayer.getTileAtWorldXY(this.snakeHead.x + 20, this.snakeHead.y, true)

        // If inside the tilemap.
        if (tileR !== null) {
          Phaser.Actions.ShiftPosition(this.snake.getChildren(), this.snakeHead.x + 20, this.snakeHead.y, 1)
          // If crashed into wall.
        } else if (tileR === null) {
          this.snake.clear(true, true)
          this.snakeExists = false
          this.heading = this.right

          this.gameOver()
        }
        break

      case this.left:
        let tileL = this.bgLayer.getTileAtWorldXY(this.snakeHead.x - 20, this.snakeHead.y, true)

        // If inside the tilemap.
        if (tileL !== null) {
          Phaser.Actions.ShiftPosition(this.snake.getChildren(), this.snakeHead.x - 20, this.snakeHead.y, 1)
          // If crashed into wall.
        } else if (tileL === null) {
          this.snake.clear(true, true)
          this.snakeExists = false
          this.heading = this.right

          this.gameOver()
        }
        break

      case this.down:
        let tileD = this.bgLayer.getTileAtWorldXY(this.snakeHead.x, this.snakeHead.y + 20, true)

        // If inside the tilemap.
        if (tileD !== null) {
          Phaser.Actions.ShiftPosition(this.snake.getChildren(), this.snakeHead.x, this.snakeHead.y + 20, 1)
          // If crashed into wall.
        } else if (tileD === null) {
          this.snake.clear(true, true)
          this.snakeExists = false
          this.heading = this.right

          this.gameOver()
        }
        break

      case this.up:
        let tileU = this.bgLayer.getTileAtWorldXY(this.snakeHead.x, this.snakeHead.y - 20, true)

        // If inside the tilemap.
        if (tileU !== null) {
          Phaser.Actions.ShiftPosition(this.snake.getChildren(), this.snakeHead.x, this.snakeHead.y - 20, 1)
          // If crashed into wall.
        } else if (tileU === null) {
          this.snake.clear(true, true)
          this.snakeExists = false
          this.heading = this.right

          this.gameOver()
        }
        break
    }

    this.direction = this.heading

    // Check if the snake hit its own body.
    let hitBody = Phaser.Actions.GetFirst(this.snake.getChildren(), { x: this.snakeHead.x, y: this.snakeHead.y }, 1)
    if (hitBody) {
      this.snake.clear(true, true)
      this.snakeExists = false
      this.heading = this.right

      this.gameOver()
    }
  }

  /**
   * Calls the game over scene.
   *
   * @memberof SnakeScene
   */
  gameOver () {
    this.scene.pause()
    this.audioGame.stop()
    this.scene.launch('GameOverScene', [this.username, this.score])
  }

  /**
   * Change the direction of the snake using keyboard arrows.
   *
   * @memberof SnakeScene
   */
  moveSnake () {
    this.input.keyboard.on('keydown_RIGHT', () => {
      if (this.direction === this.up || this.direction === this.down) {
        this.heading = this.right
      }
    })

    this.input.keyboard.on('keydown_LEFT', () => {
      if (this.direction === this.up || this.direction === this.down) {
        this.heading = this.left
      }
    })

    this.input.keyboard.on('keydown_DOWN', () => {
      if (this.direction === this.left || this.direction === this.right) {
        this.heading = this.down
      }
    })

    this.input.keyboard.on('keydown_UP', () => {
      if (this.direction === this.left || this.direction === this.right) {
        this.heading = this.up
      }
    })
  }

  /**
   * Called once per frame during the whole scene.
   *
   * @memberof SnakeScene
   */
  update () {
    if (this.snakeExists === false) {
      this.snakeExists = true
      this.spawnSnake()
    }

    if (this.poisonedApplesExists === false) {
      this.poisonedApplesExists = true
      this.spawnPoisonedApples()
    }

    if (this.appleExists === false) {
      this.appleExists = true
      this.spawnApple()
    }
  }
}
