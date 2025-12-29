class GameCanvasV2 {
  constructor(canvasElement, options = {}) {
    this.canvas = canvasElement;
    this.ctx = canvasElement.getContext('2d');
    this.eventEmitter = options.eventEmitter;
    this.currentLevel = options.currentLevel;
    
    // Game constants - double rows for 12 tone wall
    this.GRID_ROWS = this.currentLevel && this.currentLevel.type === "12 tone wall" ? 24 : 12;
    // Calculate initial grid columns based on level type
    this.GRID_COLS = this.currentLevel ? 
      (this.currentLevel.type === "12 tone wall" ? 13 : this.currentLevel.intervals.length + 1) : 4;
    
    // Game state
    this.grid = Array(this.GRID_ROWS).fill(null).map(() => Array(this.GRID_COLS).fill(0));
    this.showSquare = false;
    this.animationStartTime = null;
    this.fallColumn = 0;
    this.targetColumn = 0;
    this.horizontalAnimationStart = null;
    this.isAnimatingHorizontal = false;
    this.brickPlaced = false;
    this.correctlyIdentified = false;
    this.falseNotePlayed = false; // Track if a false note was played
    this.gravityStartTime = null;
    this.gravityStartY = 0;
    this.currentY = 0; // Store current Y position
    
    // Animation
    this.animationFrameId = null;
    
    this.init();
  }

  init() {
    this.setupCanvas();
    this.bindEvents();
    this.startGameLoop();
  }

  setupCanvas() {
    // For "12 tone wall" type, use half-sized cells and blocks
    const is12ToneWall = this.currentLevel && this.currentLevel.type === "12 tone wall";
    const baseWidth = is12ToneWall ? 25 : 50; // Half width for 12 tone wall
    const baseHeight = 600; // Base height for all levels
    
    // Apply vertical scale to match React Native aspect ratio (0.75)
    const scaleY = 0.75;
    
    // Scale canvas dimensions - width stays same, height scaled by 0.75
    this.canvas.width = this.GRID_COLS * baseWidth;
    this.canvas.height = baseHeight * scaleY; // Scale height to match brick aspect ratio
    
    // Grid helper calculations
    this.CELL_WIDTH = this.canvas.width / this.GRID_COLS;
    this.CELL_HEIGHT = this.canvas.height / this.GRID_ROWS;
    this.BLOCK_SIZE_X = is12ToneWall ? 23 : 46; // Half size for 12 tone wall
    this.BLOCK_SIZE_Y = (is12ToneWall ? 23 : 46) * scaleY; // Apply vertical scaling
    
    // Debug logging
    console.log('setupCanvas debug:', {
      levelType: this.currentLevel?.type,
      is12ToneWall,
      GRID_COLS: this.GRID_COLS,
      baseWidth,
      baseHeight,
      canvasWidth: this.canvas.width,
      canvasHeight: this.canvas.height,
      CELL_WIDTH: this.CELL_WIDTH,
      CELL_HEIGHT: this.CELL_HEIGHT,
      BLOCK_SIZE_X: this.BLOCK_SIZE_X,
      BLOCK_SIZE_Y: this.BLOCK_SIZE_Y,
      scaleY
    });
  }

  bindEvents() {
    this.handleSecondNote = this.handleSecondNote.bind(this);
    this.handleCorrectNote = this.handleCorrectNote.bind(this);
    this.handleFalseNote = this.handleFalseNote.bind(this);
    this.handleClearAllBricks = this.handleClearAllBricks.bind(this);
    this.handleStackWall = this.handleStackWall.bind(this);
    
    this.eventEmitter.on('secondNotePlay', this.handleSecondNote);
    this.eventEmitter.on('correctNote', this.handleCorrectNote);
    this.eventEmitter.on('falseNote', this.handleFalseNote);
    this.eventEmitter.on('clearAllBricks', this.handleClearAllBricks);
    
    // Listen for stackWall event
    this.eventEmitter.on('stackWall', this.handleStackWall);
  }

  // Convert pixel position to grid coordinates
  pixelToGrid(x, y) {
    const col = Math.floor(x / this.CELL_WIDTH);
    const row = Math.floor(y / this.CELL_HEIGHT);
    return { col, row };
  }

  // Convert grid coordinates to pixel position (center of cell)
  gridToPixel(col, row) {
    const x = col * this.CELL_WIDTH + (this.CELL_WIDTH - this.BLOCK_SIZE_X) / 2;
    const y = row * this.CELL_HEIGHT + (this.CELL_HEIGHT - this.BLOCK_SIZE_Y) / 2;
    return { x, y };
  }

  // Helper method to determine if current level is descending
  isDescendingLevel() {
    return this.currentLevel && 
           this.currentLevel.settings && 
           this.currentLevel.settings.descending && 
           !this.currentLevel.settings.ascending;
  }

  // Helper method to get the wrong/timeout column based on level type
  getWrongColumn() {
    return this.isDescendingLevel() ? this.GRID_COLS - 1 : 0;
  }

  // Check if a position would collide with grid boundaries or occupied cells
  checkCollision(x, y) {
    const { col, row } = this.pixelToGrid(x + this.BLOCK_SIZE_X/2, y + this.BLOCK_SIZE_Y);
    
    // Check if hitting bottom boundary
    if (row >= this.GRID_ROWS) {
      return true;
    }
    
    // Check if hitting occupied cell
    if (row >= 0 && col >= 0 && col < this.GRID_COLS && this.grid[row] && this.grid[row][col] >= 1) {
      return true;
    }
    
    return false;
  }

  // Function to check if a row can be cleared (all interval columns are filled)
  isRowClearable(rowIndex) {
    if (this.isDescendingLevel()) {
      // Descending: check if columns 0 to (GRID_COLS-2) are filled (last column is for wrong notes)
      for (let col = 0; col < this.GRID_COLS - 1; col++) {
        if (this.grid[rowIndex][col] < 1) {
          return false;
        }
      }
    } else {
      // Ascending: check if columns 1 onwards are filled (first column is for wrong notes)
      for (let col = 1; col < this.GRID_COLS; col++) {
        if (this.grid[rowIndex][col] < 1) {
          return false;
        }
      }
    }
    return true;
  }

  // Function to check if wrong column has a brick (mistake that prevents bonus)
  hasWrongColumnBrick(rowIndex) {
    const wrongColumn = this.getWrongColumn();
    return this.grid[rowIndex][wrongColumn] >= 1;
  }

  // Function to clear full bottom row and drop bricks above
  clearFullRowsAndDrop() {
    const bottomRowIndex = this.GRID_ROWS - 1;
    
    // Condition A: Check if all interval columns are filled (required to clear)
    if (!this.isRowClearable(bottomRowIndex)) {
      return { rowsCleared: 0, bonus: false };
    }
    
    // Condition B: Check if wrong column has a brick (mistake)
    const hasMistake = this.hasWrongColumnBrick(bottomRowIndex);
    
    // Clear the row regardless of condition B
    this.grid.splice(bottomRowIndex, 1); // Remove bottom row
    this.grid.unshift(Array(this.GRID_COLS).fill(0)); // Add empty row at top
    
    return { 
      rowsCleared: 1, 
      bonus: !hasMistake // Bonus only if NO mistake (no brick in wrong column)
    };
  }

  handleSecondNote(data) {
    this.showSquare = true;
    this.animationStartTime = Date.now();
    this.brickPlaced = false; // Reset for new brick
    this.correctlyIdentified = false;
    this.falseNotePlayed = false; // Reset false note state for new brick
    this.gravityStartTime = null;
    this.gravityStartY = 0;
    
    // Set the drop column based on level type
    // Ascending: drop on left (column 0), move right when correct
    // Descending: drop on right (last column), move left when correct
    this.fallColumn = this.getWrongColumn();
  }

  handleCorrectNote(data) {
    // Map the recognized interval to the correct column based on current level
    if (data && data.recognizedInterval !== undefined && this.currentLevel) {
      // Get the active intervals for this level (0-indexed half-tone steps)
      const activeIntervals = [];
      
      if (this.currentLevel.settings.ascending) {
        this.currentLevel.settings.ascendingVector.forEach((active, index) => {
          if (active === 1) activeIntervals.push(index);
        });
      }
      if (this.currentLevel.settings.descending) {
        this.currentLevel.settings.descendingVector.forEach((active, index) => {
          if (active === 1) activeIntervals.push(index);
        });
      }
      if (this.currentLevel.settings.harmonic) {
        this.currentLevel.settings.harmonicVector.forEach((active, index) => {
          if (active === 1) activeIntervals.push(index);
        });
      }
      
      // Remove duplicates and sort to get ordered list of intervals
      const sortedIntervals = [...new Set(activeIntervals)].sort((a, b) => a - b);
      
      // Find which column this interval maps to
      const columnIndex = sortedIntervals.indexOf(data.recognizedInterval);
      
      if (columnIndex >= 0) {
        // Found the interval, calculate target column based on level type
        let targetCol;
        
        if (this.currentLevel.type === "12 tone wall") {
          if (this.isDescendingLevel()) {
            // For descending 12 tone wall: reverse the column mapping
            // Column 0: P8, Column 1: M7, ..., Column 11: m2, Column 12: wrong
            targetCol = 11 - data.recognizedInterval; // Reverse the mapping
          } else {
            // For ascending 12 tone wall: use the interval value directly as column number
            // Column 0: wrong, Column 1: m2, Column 2: M2, etc.
            targetCol = data.recognizedInterval + 1; // +1 because column 0 is for wrong notes
          }
        } else if (this.isDescendingLevel()) {
          // Descending: reverse order so largest intervals are on left, smallest on right
          // E.g., for M2,P5: P5(larger) goes to column 0, M2(smaller) goes to column 1
          targetCol = (sortedIntervals.length - 1) - columnIndex;
        } else {
          // Ascending: column 0 is for wrong notes, so add 1 offset
          targetCol = columnIndex + 1;
        }
          

          
          this.targetColumn = targetCol;
          this.isAnimatingHorizontal = true;
          this.horizontalAnimationStart = Date.now();
          
          // Mark as correctly identified to trigger gravity acceleration
          this.correctlyIdentified = true;
      } else {
        // Interval not found in current level, move to wrong column
        this.targetColumn = this.getWrongColumn();
        this.isAnimatingHorizontal = true;
        this.horizontalAnimationStart = Date.now();
      }
    }
  }

  handleFalseNote(data) {
    // Mark that a false note was played - this will make the brick red
    this.falseNotePlayed = true;
  }

  handleClearAllBricks() {
    // Clear all bricks from the grid
    this.grid = Array(this.GRID_ROWS).fill(null).map(() => Array(this.GRID_COLS).fill(0));
    
    // Reset any falling brick state
    this.showSquare = false;
    this.animationStartTime = null;
    this.brickPlaced = false;
    this.correctlyIdentified = false;
    this.falseNotePlayed = false; // Reset false note state
    this.gravityStartTime = null;
    this.gravityStartY = 0;
    this.currentY = 0;
    this.isAnimatingHorizontal = false;
    this.horizontalAnimationStart = null;
    this.fallColumn = 0;
    this.targetColumn = 0;
  }

  handleStackWall() {
    // Only stack wall for "12 tone wall" levels
    if (this.currentLevel && this.currentLevel.type === "12 tone wall") {
      this.stackWall();
    }
  }

  update() {
    // Update wall stacking if active
    this.updateWallStacking();
    
    // Only update if there's a falling square
    if (!this.showSquare || !this.animationStartTime) return;

    // Calculate Y position - use gravity if started, otherwise normal fall
    let y;
    if (this.gravityStartTime) {
      // Apply gravity physics: y = y0 + v0*t + 0.5*g*t^2
      const gravityElapsed = (Date.now() - this.gravityStartTime) / 1000; // Convert to seconds
      const initialVelocity = 200; // pixels per second (very fast initial speed)
      const gravity = 3000; // pixels per second squared (extreme gravity for very obvious effect)
      y = this.gravityStartY + (initialVelocity * gravityElapsed) + (0.5 * gravity * gravityElapsed * gravityElapsed);
      
      // Clamp to canvas bounds
      y = Math.min(y, this.canvas.height - this.BLOCK_SIZE_Y);
      

    } else {
      // Normal fall speed (no gravity yet)
      const elapsed = Date.now() - this.animationStartTime;
      const fallDuration = 6000; // 6 seconds to fall from top to bottom
      const progress = Math.min(elapsed / fallDuration, 1);
      y = progress * (this.canvas.height - this.BLOCK_SIZE_Y);
    }
    
    // Store the current Y position for drawing
    this.currentY = y;
    
    // Calculate current column position (with horizontal animation)
    let currentColumn = this.fallColumn;
    
    // Handle horizontal animation if active
    if (this.isAnimatingHorizontal && this.horizontalAnimationStart) {
      const horizontalElapsed = Date.now() - this.horizontalAnimationStart;
      const horizontalDuration = 300; // 300ms for horizontal sweep
      const horizontalProgress = Math.min(horizontalElapsed / horizontalDuration, 1);
      
      // Easing function for smooth animation (ease-out)
      const easeOut = 1 - Math.pow(1 - horizontalProgress, 3);
      
      // Interpolate between current and target column
      currentColumn = this.fallColumn + (this.targetColumn - this.fallColumn) * easeOut;
      
      // Complete the animation when done
      if (horizontalProgress >= 1) {
        this.fallColumn = this.targetColumn;
        this.isAnimatingHorizontal = false;
        this.horizontalAnimationStart = null;
        currentColumn = this.targetColumn;
        
        // Start gravity immediately when horizontal animation completes (if correctly identified)
        if (this.correctlyIdentified && !this.gravityStartTime) {
          this.gravityStartTime = Date.now();
          this.gravityStartY = this.currentY; // Use current Y position when gravity starts
        }
      }
    }
    
    // Calculate x position based on current column
    const x = currentColumn * this.CELL_WIDTH + (this.CELL_WIDTH / 2) - (this.BLOCK_SIZE_X / 2);
    
    // Check for collision - only process once per brick
    if (this.checkCollision(x, y) && !this.brickPlaced) {
      this.placeBrick(x, y);
    }
  }

  placeBrick(x, y) {
    // Find the correct placement position
    const { col, row } = this.pixelToGrid(x + this.BLOCK_SIZE_X/2, y + this.BLOCK_SIZE_Y/2);
    let placementRow = row;
    
    // Find the topmost available position in this column
    for (let r = 0; r < this.GRID_ROWS; r++) {
      if (this.grid[r] && this.grid[r][col] >= 1) {
        placementRow = r - 1;
        break;
      }
    }
    
    // If no occupied cells found, place at bottom
    if (placementRow >= this.GRID_ROWS - 1) {
      placementRow = this.GRID_ROWS - 1;
    }
    
    // Place the block in the grid
    if (placementRow >= 0 && col >= 0 && col < this.GRID_COLS) {
      // Store brick state: 1 = correctly identified (green), 2 = unrecognized/timeout (grey), 3 = false note (red)
      let brickState;
      const wrongColumn = this.getWrongColumn();
      
      if (this.falseNotePlayed) {
        brickState = 3; // Red brick (false note)
      } else if (col === wrongColumn) {
        brickState = 2; // Grey brick (unrecognized/timeout)
      } else {
        brickState = 1; // Yellow/golden brick (correctly identified)
      }
      this.grid[placementRow][col] = brickState;
      
      // If brick lands in wrong column, it means interval timed out (user didn't identify it)
      if (col === wrongColumn) {
        this.eventEmitter.emit('intervalTimeout');
      }
    }
    
    // Check for and clear full rows
    const result = this.clearFullRowsAndDrop();
    
    // Emit rowsCleared event if rows were cleared
    if (result.rowsCleared > 0) {
      this.eventEmitter.emit('rowsCleared', {
        rowsCleared: result.rowsCleared,
        bonus: result.bonus
      });
    }
    
    // Reset animation state
    this.showSquare = false;
    this.animationStartTime = null;
    this.isAnimatingHorizontal = false;
    this.horizontalAnimationStart = null;
    this.brickPlaced = true; // Prevent duplicate placement
    this.correctlyIdentified = false;
    this.gravityStartTime = null;
    this.gravityStartY = 0;
    
    // Emit event that brick has landed - this will trigger next interval
    console.log('🎯 GAMECANVAS: Emitting brickLanded event:', {
      row: placementRow,
      col: col,
      isGameOver: placementRow === 0
    });
    this.eventEmitter.emit('brickLanded', {
      row: placementRow,
      col: col,
      isGameOver: placementRow === 0 // Game over if brick lands in top row
    });
  }

  draw() {
    // Clear the canvas each frame and set black background
    this.ctx.fillStyle = "black";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw grid lines for debugging (optional)
    this.ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
    this.ctx.lineWidth = 1;
    for (let i = 1; i < this.GRID_COLS; i++) {
      this.ctx.beginPath();
      this.ctx.moveTo(i * this.CELL_WIDTH, 0);
      this.ctx.lineTo(i * this.CELL_WIDTH, this.canvas.height);
      this.ctx.stroke();
    }
    for (let i = 1; i < this.GRID_ROWS; i++) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, i * this.CELL_HEIGHT);
      this.ctx.lineTo(this.canvas.width, i * this.CELL_HEIGHT);
      this.ctx.stroke();
    }

    // Draw placed blocks from grid
    for (let row = 0; row < this.GRID_ROWS; row++) {
      for (let col = 0; col < this.GRID_COLS; col++) {
        if (this.grid[row][col] >= 1) {
          const { x, y } = this.gridToPixel(col, row);
          // Color scheme: 1 = green (correctly identified), 2 = grey (unrecognized), 3 = red (false note)
          // 4-7 = light blue shades (white keys), 8-10 = dark blue shades (black keys)
          let color;
          switch (this.grid[row][col]) {
            case 1:
              color = "green"; // Green for correctly identified
              break;
            case 2:
              color = "grey"; // Grey for unrecognized/timeout
              break;
            case 3:
              color = "red"; // Red for false notes
              break;
            case 4:
              color = "#E0F2FE"; // Very light blue (white keys)
              break;
            case 5:
              color = "#BAE6FD"; // Light blue (white keys)
              break;
            case 6:
              color = "#7DD3FC"; // Medium light blue (white keys)
              break;
            case 7:
              color = "#38BDF8"; // Light blue (white keys)
              break;
            case 8:
              color = "#1E3A8A"; // Dark blue (black keys)
              break;
            case 9:
              color = "#1E40AF"; // Medium dark blue (black keys)
              break;
            case 10:
              color = "#1D4ED8"; // Dark blue (black keys)
              break;
            default:
              color = "blue"; // Fallback
          }
          this.ctx.fillStyle = color;
          this.ctx.fillRect(x, y, this.BLOCK_SIZE_X, this.BLOCK_SIZE_Y);
        }
      }
    }

    // Only draw the falling square when showSquare is true
    if (this.showSquare && this.animationStartTime) {
      // Use the Y position calculated in update()
      const y = this.currentY;
      
      // Calculate current column position (with horizontal animation)
      let currentColumn = this.fallColumn;
      
      // Handle horizontal animation if active
      if (this.isAnimatingHorizontal && this.horizontalAnimationStart) {
        const horizontalElapsed = Date.now() - this.horizontalAnimationStart;
        const horizontalDuration = 300; // 300ms for horizontal sweep
        const horizontalProgress = Math.min(horizontalElapsed / horizontalDuration, 1);
        
        // Easing function for smooth animation (ease-out)
        const easeOut = 1 - Math.pow(1 - horizontalProgress, 3);
        
        // Interpolate between current and target column
        currentColumn = this.fallColumn + (this.targetColumn - this.fallColumn) * easeOut;
        
        // Complete the animation when done
        if (horizontalProgress >= 1) {
          this.fallColumn = this.targetColumn;
          this.isAnimatingHorizontal = false;
          this.horizontalAnimationStart = null;
          currentColumn = this.targetColumn;
        }
      }
      
      // Calculate x position based on current column
      const x = currentColumn * this.CELL_WIDTH + (this.CELL_WIDTH / 2) - (this.BLOCK_SIZE_X / 2);
      
      // Draw the falling square (only if not placed yet)
      if (!this.brickPlaced) {
        // Color the falling brick based on state
        let fallingBrickColor;
        if (this.falseNotePlayed) {
          fallingBrickColor = "red"; // Red if false note was played
        } else if (this.correctlyIdentified) {
          fallingBrickColor = "green"; // Green when correctly identified
        } else {
          fallingBrickColor = "yellow"; // Yellow initially
        }
        this.ctx.fillStyle = fallingBrickColor;
        this.ctx.fillRect(x, y, this.BLOCK_SIZE_X, this.BLOCK_SIZE_Y);
      }
    }
  }

  startGameLoop() {
    const gameLoop = () => {
      this.update();
      this.draw();
      this.animationFrameId = requestAnimationFrame(gameLoop);
    };
    gameLoop();
  }

  stackWall() {
    // Get the number of rows to eliminate from the level
    const eliminatedRows = this.currentLevel.winCondition?.eliminatedRows || 10;
    
    // Get the appropriate vector based on level type
    const settings = this.currentLevel.settings || {};
    let activeVector;
    
    if (settings.descending && !settings.ascending) {
      // Descending level
      activeVector = settings.descendingVector || Array(12).fill(0);
    } else if (settings.ascending && !settings.descending) {
      // Ascending level
      activeVector = settings.ascendingVector || Array(12).fill(0);
    } else if (settings.harmonic) {
      // Harmonic level
      activeVector = settings.harmonicVector || Array(12).fill(0);
    } else {
      // Default to ascending if no clear direction
      activeVector = settings.ascendingVector || Array(12).fill(0);
    }
    
    // For 12 tone wall, column mapping depends on whether it's ascending or descending
    // Ascending: Column 0 = wrong, Column 1 = m2, Column 2 = M2, ..., Column 12 = P8
    // Descending: Column 0 = P8, Column 1 = M7, Column 2 = m7, ..., Column 11 = m2, Column 12 = wrong
    
    const wallColumns = [];
    
    if (this.isDescendingLevel()) {
      // Descending: check columns 0-11 (wrong note is column 12)
      // Column mapping for descending: 0=P8, 1=M7, 2=m7, 3=M6, 4=m6, 5=P5, 6=TT, 7=P4, 8=M3, 9=m3, 10=M2, 11=m2
      // Vector indices: 0=m2, 1=M2, 2=m3, 3=M3, 4=P4, 5=TT, 6=P5, 7=m6, 8=M6, 9=m7, 10=M7, 11=P8
      
      for (let col = 0; col <= 11; col++) {
        let vectorIndex;
        // Map column to vector index (reverse mapping for descending)
        switch(col) {
          case 0: vectorIndex = 11; break; // P8 -> index 11
          case 1: vectorIndex = 10; break; // M7 -> index 10
          case 2: vectorIndex = 9; break;  // m7 -> index 9
          case 3: vectorIndex = 8; break;  // M6 -> index 8
          case 4: vectorIndex = 7; break;  // m6 -> index 7
          case 5: vectorIndex = 6; break;  // P5 -> index 6
          case 6: vectorIndex = 5; break;  // TT -> index 5
          case 7: vectorIndex = 4; break;  // P4 -> index 4
          case 8: vectorIndex = 3; break;  // M3 -> index 3
          case 9: vectorIndex = 2; break;  // m3 -> index 2
          case 10: vectorIndex = 1; break; // M2 -> index 1
          case 11: vectorIndex = 0; break; // m2 -> index 0
          default: continue;
        }
        
        // If the interval is not active in the vector (0), add it to wall columns
        if (activeVector[vectorIndex] === 0) {
          wallColumns.push(col);
        }
      }
    } else {
      // Ascending: check columns 1-12 (wrong note is column 0)
      // Column mapping for ascending: 1=m2, 2=M2, 3=m3, 4=M3, 5=P4, 6=TT, 7=P5, 8=m6, 9=M6, 10=m7, 11=M7, 12=P8
      // Vector indices: 0=m2, 1=M2, 2=m3, 3=M3, 4=P4, 5=TT, 6=P5, 7=m6, 8=M6, 9=m7, 10=M7, 11=P8
      
      for (let col = 1; col <= 12; col++) {
        let vectorIndex;
        // Map column to vector index (direct mapping for ascending)
        switch(col) {
          case 1: vectorIndex = 0; break;  // m2 -> index 0
          case 2: vectorIndex = 1; break;  // M2 -> index 1
          case 3: vectorIndex = 2; break;  // m3 -> index 2
          case 4: vectorIndex = 3; break;  // M3 -> index 3
          case 5: vectorIndex = 4; break;  // P4 -> index 4
          case 6: vectorIndex = 5; break;  // TT -> index 5
          case 7: vectorIndex = 6; break;  // P5 -> index 6
          case 8: vectorIndex = 7; break;  // m6 -> index 7
          case 9: vectorIndex = 8; break;  // M6 -> index 8
          case 10: vectorIndex = 9; break; // m7 -> index 9
          case 11: vectorIndex = 10; break; // M7 -> index 10
          case 12: vectorIndex = 11; break; // P8 -> index 11
          default: continue;
        }
        
        // If the interval is not active in the vector (0), add it to wall columns
        if (activeVector[vectorIndex] === 0) {
          wallColumns.push(col);
        }
      }
    }
    
    // Debug logging
    console.log('🎯 StackWall: Level type:', this.isDescendingLevel() ? 'descending' : 'ascending');
    console.log('🎯 StackWall: Active vector:', activeVector);
    console.log('🎯 StackWall: Wall columns to prestack:', wallColumns);
    
    // Start the wall stacking animation
    this.startWallStacking(wallColumns, eliminatedRows);
  }

  startWallStacking(wallColumns, eliminatedRows) {
    this.isStackingWall = true;
    this.wallStackingData = {
      columns: wallColumns,
      totalRows: eliminatedRows,
      currentRow: 0,
      currentColumnIndex: 0,
      startTime: Date.now(),
      brickDelay: 100 // 100ms between each brick
    };
    
    console.log(`Starting wall stacking: ${eliminatedRows} rows in columns:`, wallColumns);
  }

  updateWallStacking() {
    if (!this.isStackingWall || !this.wallStackingData) return;
    
    const now = Date.now();
    const elapsed = now - this.wallStackingData.startTime;
    const brickIndex = Math.floor(elapsed / this.wallStackingData.brickDelay);
    
    const totalBricks = this.wallStackingData.totalRows * this.wallStackingData.columns.length;
    
    if (brickIndex >= totalBricks) {
      // Wall stacking complete
      this.isStackingWall = false;
      this.wallStackingData = null;
      console.log('Wall stacking complete');
      
      // Emit event to start the game
      this.eventEmitter.emit('wallStackingComplete');
      return;
    }
    
    // Calculate which brick to place
    const columnIndex = brickIndex % this.wallStackingData.columns.length;
    const rowIndex = Math.floor(brickIndex / this.wallStackingData.columns.length);
    
    const col = this.wallStackingData.columns[columnIndex];
    // Start from bottom row and work up (bottom to top stacking)
    const row = this.GRID_ROWS - 1 - rowIndex;
    
    // Place the brick with color based on key type (black vs white keys)
    // White keys: columns 0, 2, 4, 5, 7, 9, 11, 12 (light blue shades)
    // Black keys: columns 1, 3, 6, 8, 10 (dark blue shades)
    const whiteKeyColumns = [0, 2, 4, 5, 7, 9, 11, 12];
    const isWhiteKey = whiteKeyColumns.includes(col);
    
    let wallColor;
    if (isWhiteKey) {
      // Light blue shades for white keys (values 4-7)
      wallColor = Math.floor(Math.random() * 4) + 4; // Random value between 4-7
    } else {
      // Dark blue shades for black keys (values 8-10)
      wallColor = Math.floor(Math.random() * 3) + 8; // Random value between 8-10
    }
    this.grid[row][col] = wallColor;
  }

  updateLevel(newLevel) {
    this.currentLevel = newLevel;
    // For "12 tone wall" type, use 13 columns and 24 rows
    // For other types, use number of intervals + 1 and 12 rows
    this.GRID_COLS = newLevel ? 
      (newLevel.type === "12 tone wall" ? 13 : newLevel.intervals.length + 1) : 4;
    this.GRID_ROWS = newLevel && newLevel.type === "12 tone wall" ? 24 : 12;
    this.setupCanvas();
    // Reset grid for new level
    this.grid = Array(this.GRID_ROWS).fill(null).map(() => Array(this.GRID_COLS).fill(0));
  }

  destroy() {
    // Cancel animation loop
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    
    // Remove event listeners
    this.eventEmitter.off('secondNotePlay', this.handleSecondNote);
    this.eventEmitter.off('correctNote', this.handleCorrectNote);
    this.eventEmitter.off('falseNote', this.handleFalseNote);
    this.eventEmitter.off('clearAllBricks', this.handleClearAllBricks);
    
    // Remove eventEmitter listener
    this.eventEmitter.off('stackWall', this.handleStackWall);
  }
}

export default GameCanvasV2; 