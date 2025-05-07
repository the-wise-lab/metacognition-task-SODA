// This file contains utility functions for the metacognition task

// Seeded Pseudo-Random Number Generator (Mulberry32)
let _seed = Date.now(); // Default seed

/**
 * Seeds the pseudo-random number generator.
 * @param {number} s - The seed value.
 */
function seedPRNG(s) {
    _seed = s;
}

/**
 * Generates a pseudo-random number between 0 (inclusive) and 1 (exclusive).
 * @returns {number} A pseudo-random number.
 */
function seededRandom() {
    let t = _seed += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
}

// Generate a random integer between min and max (inclusive)
function getRandomInt(min, max) {
    return Math.floor(seededRandom() * (max - min + 1)) + min;
}

// Jitter a time value by +/- jitterAmount
function jitterTime(baseTime, jitterAmount) {
    return baseTime + getRandomInt(-jitterAmount, jitterAmount);
}

// Generate dot coordinates for a box with specified number of dots
function generateDotCoordinates(numDots, gridSize) {
    const positions = [];
    const dotPositions = new Set();
    const totalPositions = gridSize * gridSize;

    if (numDots > totalPositions) {
        numDots = totalPositions;
    }

    // Randomly select positions without replacement
    while (dotPositions.size < numDots) {
        const pos = getRandomInt(0, totalPositions - 1);
        dotPositions.add(pos);
    }

    // Convert to x,y coordinates
    for (const pos of dotPositions) {
        const x = pos % gridSize;
        const y = Math.floor(pos / gridSize);
        positions.push([x, y]);
    }

    return positions;
}

// Draw dots on canvas
function drawDots(ctx, coordinates, boxX, boxY, boxWidth, boxHeight, gridSize, dotRadius) {
    // Ensure cell dimensions are integers for pixel precision
    const cellWidth = Math.floor(boxWidth / gridSize);
    const cellHeight = Math.floor(boxHeight / gridSize);

    // Adjust dot radius to prevent overlap, ensure it's at least 1px if possible
    // Ensure cellWidth and cellHeight are positive before calculating maxRadius
    const safeCellWidth = Math.max(1, cellWidth);
    const safeCellHeight = Math.max(1, cellHeight);
    const maxRadius = Math.max(1, Math.floor(Math.min(safeCellWidth, safeCellHeight) / 2.5)); 
    const adjustedRadius = Math.min(dotRadius, maxRadius);

    ctx.fillStyle = 'white'; // Ensure dots are white

    coordinates.forEach(([x, y], index) => {
        // Calculate center of the cell, ensure integer coordinates
        const pixelX = Math.floor(boxX + (x + 0.5) * cellWidth);
        const pixelY = Math.floor(boxY + (y + 0.5) * cellHeight);

        ctx.beginPath();
        ctx.arc(pixelX, pixelY, adjustedRadius, 0, 2 * Math.PI);
        ctx.fill();
    });
}

// Convert hex color string to RGBA string with specified alpha
function hexToRgba(hex, alpha = 1) {
    // Remove hash if present
    hex = hex.replace('#', '');

    // Handle short hex codes (e.g., #FFF)
    if (hex.length === 3) {
        hex = hex.split('').map(char => char + char).join('');
    }

    const bigint = parseInt(hex, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;

    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// Create a pseudo-random sequence of tasks ensuring no more than maxConsecutive in a row
function createTaskSequence(numTrials, numTasks, maxConsecutive) {
    // Initialize with balanced counts for each task
    const taskCounts = Array(numTasks).fill(Math.floor(numTrials / numTasks));
    
    // Distribute any remaining trials
    for (let i = 0; i < numTrials % numTasks; i++) {
        taskCounts[i]++;
    }
    
    // Create a pool of tasks based on counts
    let taskPool = [];
    for (let task = 0; task < numTasks; task++) {
        taskPool = taskPool.concat(Array(taskCounts[task]).fill(task));
    }
    
    // Shuffle until constraints are met
    let validSequence = false;
    let sequence;
    
    while (!validSequence) {
        // Shuffle the pool
        sequence = [...taskPool];
        for (let i = sequence.length - 1; i > 0; i--) {
            const j = Math.floor(seededRandom() * (i + 1));
            [sequence[i], sequence[j]] = [sequence[j], sequence[i]];
        }
        
        // Check if sequence meets constraints
        validSequence = true;
        for (let i = 0; i <= sequence.length - maxConsecutive - 1; i++) {
            const segment = sequence.slice(i, i + maxConsecutive + 1);
            if (new Set(segment).size === 1) {
                validSequence = false;
                break;
            }
        }
    }
    
    return sequence;
}

// Balance the more-dots location (left/right) within a block
function balanceLocations(numTrials) {
    const locations = Array(numTrials).fill(0);
    const halfTrials = Math.floor(numTrials / 2);
    
    // Set half to be right (1)
    for (let i = 0; i < halfTrials; i++) {
        locations[i] = 1;
    }
    
    // Shuffle the locations
    for (let i = locations.length - 1; i > 0; i--) {
        const j = Math.floor(seededRandom() * (i + 1));
        [locations[i], locations[j]] = [locations[j], locations[i]];
    }
    
    return locations;
}

// Create all possible task pairings (6 pairings from 4 task types)
function createTaskPairings(taskTypes) {
    const pairings = [];
    
    for (let i = 0; i < taskTypes.length; i++) {
        for (let j = i + 1; j < taskTypes.length; j++) {
            pairings.push([taskTypes[i], taskTypes[j]]);
        }
    }
    
    return pairings;
}

// Fisher-Yates shuffle algorithm
function shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(seededRandom() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

// Helper function to draw a rounded rectangle (moved from trial.js)
function drawRoundedRect(ctx, x, y, width, height, radius, strokeColor, fillColor, lineWidth = 1) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();

    if (fillColor) {
        ctx.fillStyle = fillColor;
        ctx.fill();
    }
    if (strokeColor) {
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = lineWidth;
        ctx.stroke();
    }
}

// Function to draw the main stimulus display elements (boxes, optional background)
function drawStimulusDisplayElements(ctx, canvasWidth, canvasHeight, config, options = {}) {
    const { 
        taskColor, 
        backgroundAlpha = 0.15, 
        boxBorderColor = '#374151', // Dark gray border
        boxFillColor = 'black',     // Black fill for the dot boxes
        boxRadius = 5, 
        boxBorderWidth = 1 
    } = options;

    const { gridSize, boxWidthPercent, boxHeightPercent: configBoxHeightPercent, boxGapPercent } = config.task;

    // Calculate effective box width, ensuring it's a multiple of gridSize
    let effectiveBoxWidth = Math.floor(canvasWidth * boxWidthPercent);
    effectiveBoxWidth = Math.max(gridSize, Math.floor(effectiveBoxWidth / gridSize) * gridSize); // Ensure at least 1 grid cell wide

    // Calculate effective box height
    let effectiveBoxHeight;
    if (configBoxHeightPercent !== undefined) {
        let tempBoxHeight = Math.floor(canvasWidth * configBoxHeightPercent); // Base height on canvasWidth for consistency
        effectiveBoxHeight = Math.max(gridSize, Math.floor(tempBoxHeight / gridSize) * gridSize); // Ensure at least 1 grid cell high
    } else {
        effectiveBoxHeight = effectiveBoxWidth; // Default to square based on adjusted width
    }
    
    const gap = Math.floor(canvasWidth * boxGapPercent);

    // Horizontal positioning based on effectiveBoxWidth
    const leftBoxX = Math.floor((canvasWidth - (effectiveBoxWidth * 2 + gap)) / 2);
    const rightBoxX = leftBoxX + effectiveBoxWidth + gap;
    // Vertical positioning based on effectiveBoxHeight
    const boxY = Math.floor((canvasHeight - effectiveBoxHeight) / 2);

    // Draw faded background rectangle if taskColor is provided and alpha > 0
    if (taskColor && backgroundAlpha > 0) {
        const fadedColor = hexToRgba(taskColor, backgroundAlpha); // hexToRgba is already in utils.js
        ctx.fillStyle = fadedColor;
        const padding = 10; // Pixels of padding around the boxes
        const backgroundX = leftBoxX - padding;
        const backgroundY = boxY - padding;
        const backgroundWidth = (effectiveBoxWidth * 2) + gap + (padding * 2);
        const backgroundHeight = effectiveBoxHeight + (padding * 2);
        ctx.fillRect(backgroundX, backgroundY, backgroundWidth, backgroundHeight);
    }

    // Draw the two main boxes
    drawRoundedRect(ctx, leftBoxX, boxY, effectiveBoxWidth, effectiveBoxHeight, boxRadius, boxBorderColor, boxFillColor, boxBorderWidth);
    drawRoundedRect(ctx, rightBoxX, boxY, effectiveBoxWidth, effectiveBoxHeight, boxRadius, boxBorderColor, boxFillColor, boxBorderWidth);

    return { leftBoxX, rightBoxX, boxY, boxWidth: effectiveBoxWidth, boxHeight: effectiveBoxHeight, gridSize: config.task.gridSize, gap };
}

export { 
    seedPRNG, // Export the seeder function
    seededRandom, // Export the PRNG function
    getRandomInt, 
    jitterTime, 
    generateDotCoordinates, 
    drawDots, 
    hexToRgba,
    createTaskSequence, 
    balanceLocations,
    createTaskPairings,
    shuffleArray,
    drawRoundedRect, // Export new function
    drawStimulusDisplayElements // Export new function
};