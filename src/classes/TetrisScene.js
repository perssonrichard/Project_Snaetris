/**
 * Tetris scene
 *
 * @author Richard Persson
 * @version 1.0.0
 */

import Phaser from 'phaser'
import { config } from '../app'

/**
 * Represents the Tetris part of the game.
 *
 * @export
 * @class TetrisScene
 * @extends {Phaser.Scene}
 */
export default class TetrisScene extends Phaser.Scene {
  constructor () {
    super('TetrisScene')
  }

  /**
   * Intantly called when the scene starts.
   *
   * @memberof TetrisScene
   */
  create () {
    this.createVariables()
    this.createContent()
    this.onResume()
  }

  /**
   * Called when this scene is resumed.
   *
   * @memberof TetrisScene
   */
  onResume () {
    this.events.on('resume', (sys, data) => {
      this.scene.pause('SnakeScene')

      // Data passed from snake scene.
      this.snakeLayer = data[0]
      let block = data[1]
      this.speed = data[2]
      this.username = data[3]

      // Reset keys in case they were hold down before pause
      this.input.keyboard.resetKeys()

      // Pass the snake block to this scene by creating a new block.
      this.block = this.add.group()

      block.getChildren().forEach(tile => {
        // The score value of the tile
        let value = tile.getData('value')
        if (value === undefined) { value = 0 }

        let newTile = this.physics.add.image(tile.x, tile.y, tile.texture.key).setOrigin(0, 0).setData('value', value)
        this.block.add(newTile)
      })
      // Detroy block from SnakeScene
      block.destroy(true)

      // Create a time for auto moving block
      this.blockTimer = this.time.addEvent({
        delay: this.speed,
        callback: this.blockAutoMove,
        callbackScope: this,
        loop: true
      })
    })
  }

  /**
   * Create local variables.
   *
   * @memberof TetrisScene
   */
  createVariables () {
    // Middle of game area.
    this.middleWidth = config.width / 2
    this.middleHeight = config.height / 2

    this.right = 'RIGHT'
    this.left = 'LEFT'
    this.up = 'UP'
    this.down = 'DOWN'

    // Game state
    this.stateStopBlock = 1
    this.stateCheckMatch = 2
    this.stateGameOver = 3
    this.stateResumeSnake = 4
    this.statePaused = 'PAUSED'

    this.score = 0

    // Save tiles to array.
    this.tiles = []
  }

  /**
  * Create content used inside the scene.
  *
  * @memberof TetrisScene
  */
  createContent () {
    // Create layers
    this.tetrisMap = this.make.tilemap({ key: 'tetrisMap' })
    this.tetrisMap.addTilesetImage('snakeTetrisTiles')
    this.bgLayer = this.tetrisMap.createStaticLayer('tetrisBackground', 'snakeTetrisTiles')
    let bgOverlay = this.tetrisMap.createStaticLayer('tetrisBackground1', 'snakeTetrisTiles')
    this.tetrisLayer = this.tetrisMap.createDynamicLayer('tetrisPlay', null)

    // Config layers
    this.bgLayer.x = this.middleWidth - (this.bgLayer.width / 2)
    this.bgLayer.y = 250
    bgOverlay.x = this.bgLayer.x
    bgOverlay.y = this.bgLayer.y
    this.tetrisLayer.x = this.middleWidth - (this.tetrisLayer.width / 2)
    this.tetrisLayer.y = 250

    // Create text
    let leftPosX = 124.5
    let posY = 69

    this.scoreHeader = this.add.bitmapText(leftPosX, posY, 'arcade', 'Score', 24).setOrigin(0.5).setTint(0xfffa65)
    this.scoreText = this.add.bitmapText(this.scoreHeader.x, this.scoreHeader.y + 35, 'arcade', this.score, 24).setOrigin(0.5)

    // Create a cursor key object to prevent default dom actions
    this.input.keyboard.createCursorKeys()

    // Create audio
    this.audioMatch = this.sound.add('audioMatch')
  }

  /**
   * Handles the game flow depending on state.
   *
   * @memberof TetrisScene
   */
  handleGameFlow () {
    if (this.state === this.stateStopBlock) {
      this.stateStopBlockF()
    }

    if (this.state === this.stateCheckMatch) {
      this.stateCheckMatchF()
    }

    if (this.state === this.stateResumeSnake) {
      this.state = this.statePaused
      this.scene.resume('SnakeScene', [this.score])
    }

    if (this.state === this.stateGameOver) {
      this.state = this.statePaused
      this.scene.pause()
      let snake = this.scene.get('SnakeScene')
      snake.audioGame.stop()
      this.scene.launch('GameOverScene', [this.username, this.score])
    }
  }

  /**
   * Handles check match state
   *
   * @memberof TetrisScene
   */
  stateCheckMatchF () {
    this.state = this.statePaused

    // Check for matches
    let matchingRows = this.checkMatch()

    // If match
    if (matchingRows.length !== 0) {
      this.audioMatch.play()
      this.removeMatchingRows(matchingRows)

      matchingRows.sort((a, b) => a - b)

      matchingRows.forEach(row => { this.updateAfterMatch(row) })
    }
    // If no matches
    this.state = this.stateResumeSnake
  }

  /**
   * Move tiles downwards after a match.
   *
   * @param {number} row The y position of the row
   * @memberof TetrisScene
   */
  updateAfterMatch (row) {
    // Get all non empty tiles above matching row.
    let tilesAboveRow = this.tetrisLayer.getTilesWithin(0, 0, 20, row, { isNotEmpty: true })

    let tilesToMove = []

    // Iterate the tiles array to check which tiles to move.
    for (let i = 0; i < this.tiles.length; i++) {
      for (let j = 0; j < tilesAboveRow.length; j++) {
        let tilePos = this.tetrisLayer.getTileAtWorldXY(this.tiles[i].x, this.tiles[i].y, true)
        let rowTileX = tilesAboveRow[j].x
        let rowTileY = tilesAboveRow[j].y

        if (tilePos.x === rowTileX && tilePos.y === rowTileY) {
          tilesToMove.push(this.tiles[i])
        }
      }
    }
    // Set layer index to minus 1 before moving tiles down, and plus 1 after moving them.
    this.updateLayer(tilesToMove, -1)
    tilesToMove.forEach(tile => { tile.y += 20 })
    this.updateLayer(tilesToMove, 1)
  }

  /**
   * Handles stop block state.
   *
   * @memberof TetrisScene
   */
  stateStopBlockF () {
    this.blockTimer.paused = true

    // Save block tiles to tiles array.
    this.block.children.iterate(tile => { this.tiles.push(tile) })

    // Update layer index to 1.
    this.updateLayer(this.block.getChildren(), 1)

    // Check for game over
    if (this.checkGameOver()) {
      this.state = this.stateGameOver
    } else {
      this.state = this.stateCheckMatch
    }
  }

  /**
   * Moves a block of tiles downwards.
   *
   * @returns
   * @memberof TetrisScene
   */
  blockAutoMove () {
    // Check if moving down is possible
    if (this.checkMove(this.down)) {
      return this.block.children.iterate(tile => { tile.y += 20 })
    } else {
      this.blockTimer.paused = true
      this.state = this.stateStopBlock
    }
  }

  /**
   * Update layer index depending on value.
   *
   * @param {array} block The blocks used to update layer with
   * @param {number} value The index to update layer with
   * @memberof TetrisScene
   */
  updateLayer (tiles, value) {
    tiles.forEach(tile => {
      let tilePos = this.tetrisLayer.getTileAtWorldXY(tile.x, tile.y, true)

      if (tilePos !== null) {
        if (value === 1) {
          this.tetrisLayer.fill(1, tilePos.x, tilePos.y, 1, 1, true)
        }

        if (value === -1) {
          this.tetrisLayer.fill(-1, tilePos.x, tilePos.y, 1, 1, true)
        }
      }
    })
  }

  /**
   * Check if block has reached the top of the layer area
   *
   * @memberof TetrisScene
   * @returns {boolean}
   */
  checkGameOver () {
    let gameOver = false
    this.block.children.iterate(tile => {
      let tilePos = this.tetrisLayer.getTileAtWorldXY(tile.x, tile.y - 20, true)

      if (tilePos === null) {
        gameOver = true
      }
    })

    return gameOver
  }

  /**
   * Check if a move is possible depending on direction
   *
   * @param {string} direction
   * @returns
   * @memberof TetrisScene
   */
  checkMove (direction) {
    let block = this.block.getChildren()
    let move = false

    for (let i = 0; i < block.length; i++) {
      let snakeTile
      let tetrisTile

      switch (direction) {
        case this.down:
          snakeTile = this.snakeLayer.getTileAtWorldXY(block[i].x, block[i].y + 20, true)
          tetrisTile = this.tetrisLayer.getTileAtWorldXY(block[i].x, block[i].y + 20, true)
          break
        case this.left:
          snakeTile = this.snakeLayer.getTileAtWorldXY(block[i].x - 20, block[i].y, true)
          tetrisTile = this.tetrisLayer.getTileAtWorldXY(block[i].x - 20, block[i].y, true)
          break
        case this.right:
          snakeTile = this.snakeLayer.getTileAtWorldXY(block[i].x + 20, block[i].y, true)
          tetrisTile = this.tetrisLayer.getTileAtWorldXY(block[i].x + 20, block[i].y, true)
          break
      }

      if (snakeTile !== null) {
        move = true
      }

      if (tetrisTile !== null) {
        if (tetrisTile.index === -1) {
          move = true
        } else {
          move = false
          break
        }
      }

      if (snakeTile === null && tetrisTile === null) {
        move = false
        break
      }
    }

    return move
  }

  /**
   * Move block with keyboard arrow keys.
   *
   * @memberof TetrisScene
   */
  moveBlock () {
    let right = this.input.keyboard.addKey('RIGHT')
    let left = this.input.keyboard.addKey('LEFT')
    let down = this.input.keyboard.addKey('DOWN')

    // Right key
    if (this.input.keyboard.checkDown(right, 100)) {
      if (this.checkMove(this.right)) {
        this.block.children.iterate(tile => { tile.x += 20 })
      }
    }

    // Left key
    if (this.input.keyboard.checkDown(left, 100)) {
      if (this.checkMove(this.left)) {
        this.block.children.iterate(tile => { tile.x -= 20 })
      }
    }

    // Down key
    if (this.input.keyboard.checkDown(down, 70)) {
      if (this.checkMove(this.down)) {
        this.block.children.iterate(tile => { tile.y += 20 })
      }
    }
  }

  /**
   * Check for matches.
   *
   * @returns {array} Returns an array with matching rows
   * @memberof TetrisScene
   */
  checkMatch () {
    let rows = new Set()

    this.tiles.forEach(tile => {
      let tilePos = this.tetrisLayer.getTileAtWorldXY(tile.x, tile.y, true)

      // Get all tiles with index 1 within a row.
      let row = this.tetrisLayer.getTilesWithin(0, tilePos.y, 20, 1, { isNotEmpty: true })

      // If 20 in a row
      if (row.length === 20) {
        rows.add(tilePos.y)
      }
    })
    rows = Array.from(rows)
    return rows
  }

  /**
   * Remove matching rows.
   *
   * @param {array} matchingRows
   * @memberof TetrisScene
   */
  removeMatchingRows (matchingRows) {
    // Fill each row with index -1
    matchingRows.forEach(row => { this.tetrisLayer.fill(-1, 0, row, 20, 1, true) })

    // Calculate score and destroy game objects
    this.tiles.forEach(tile => {
      let tilePos = this.tetrisLayer.getTileAtWorldXY(tile.x, tile.y, true)

      matchingRows.forEach(row => {
        if (tilePos.y === row) {
          let value = tile.getData('value')
          this.score += (value * matchingRows.length)
          this.scoreText.setText(this.score)
          tile.destroy()
        }
      })
    })
    // Delete tiles from tiles array
    for (let i = 0; i < this.tiles.length; i++) {
      if (this.tiles[i].active === false) {
        this.tiles.splice(i, 1)
        i--
      }
    }
  }

  /**
   * Called once per frame during the whole scene.
   *
   * @memberof TetrisScene
   */
  update () {
    if (this.blockTimer.paused === false) {
      this.moveBlock()
    }
    this.handleGameFlow()
  }
}
