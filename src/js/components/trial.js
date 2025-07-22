// This file creates and exports the trial component for the dot comparison task

import CONFIG from '../config.js';
import { generateDotCoordinates, drawDots, jitterTime, hexToRgba } from '../utils.js';
import { createConfidenceRating } from './confidence-rating.js'; // Import confidence rating
import { getCurrentDotDifference, updateStaircase, getTrialStaircaseData } from '../staircase.js'; // Import staircase utilities

/**
 * Helper function to draw a rounded rectangle with a border on canvas
 */
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

/**
 * Create a dot comparison trial
 * @param {Object} taskParams - Parameters for this trial
 * @returns {Object} JSPsych timeline object for this trial
 */
function createDotTrial(taskParams) {
    const {
        taskIndex,      // 0 or 1 for which task in the block
        taskColor,      // Color hex code for this task
        isEasy,         // Boolean: easy or difficult task
        hasFeedback,    // Boolean: whether to show feedback
        moreSide,       // 0 for left, 1 for right - which side has more dots
        isPractice,     // Boolean: is this a practice trial
        blockNum        // Current block number
    } = taskParams;
    
    // Determine number of dots based on difficulty using staircase
    const baseDotsPerBox = CONFIG.task.baseDotsPerBox;
    let dotDifference;
    
    // Get current dot difference from staircase (or use initial value for practice)
    if (isPractice) {
        // For practice trials, use the initial staircase value
        dotDifference = CONFIG.task.staircase.initialValue;
    } else {
        // For main trials, get current value from staircase
        dotDifference = getCurrentDotDifference(isEasy);
    }
    
    // Set stimulus duration based on whether this is practice
    const stimDuration = isPractice ? 
        CONFIG.timing.practiceStimulusDuration : 
        CONFIG.timing.stimulusDuration;
    
    // Common function to draw the boxes (used by both display and response trials)
    // Now accepts taskColor and alpha for the background
    const drawBoxesOnly = (ctx, canvasWidth, canvasHeight, taskColor, backgroundAlpha = 0.15) => {
        const gridSize = CONFIG.task.gridSize;
        const boxWidthPercent = CONFIG.task.boxWidthPercent;
        const gapPercent = CONFIG.task.boxGapPercent; // Use config value

        let boxWidth = Math.floor(canvasWidth * boxWidthPercent);
        boxWidth = Math.floor(boxWidth / gridSize) * gridSize;
        const boxHeight = boxWidth;

        const actualBoxWidthPercent = boxWidth / canvasWidth;
        const actualTotalWidthPercent = 2 * actualBoxWidthPercent + gapPercent;
        const gap = Math.floor(canvasWidth * gapPercent);

        const leftBoxX = Math.floor((canvasWidth * (1 - actualTotalWidthPercent)) / 2);
        const rightBoxX = leftBoxX + boxWidth + gap;
        const boxY = Math.floor((canvasHeight - boxHeight) / 2);

        // --- Draw faded background rectangle ---
        if (taskColor) {
            const fadedColor = hexToRgba(taskColor, backgroundAlpha);
            ctx.fillStyle = fadedColor;
            
            const padding = 10; // Pixels of padding around the boxes
            const backgroundX = leftBoxX - padding;
            const backgroundY = boxY - padding;
            const backgroundWidth = (boxWidth * 2) + gap + (padding * 2);
            const backgroundHeight = boxHeight + (padding * 2);
            
            // Draw the larger background rectangle
            ctx.fillRect(backgroundX, backgroundY, backgroundWidth, backgroundHeight); 
        }
        // --- End background drawing ---

        const boxRadius = 5;
        const boxBorderColor = '#374151'; // Dark gray border
        const boxFillColor = 'black';    // Black fill for the dot boxes
        const boxBorderWidth = 1;

        // Draw the two black boxes ON TOP of the background
        drawRoundedRect(ctx, leftBoxX, boxY, boxWidth, boxHeight, boxRadius, boxBorderColor, boxFillColor, boxBorderWidth);
        drawRoundedRect(ctx, rightBoxX, boxY, boxWidth, boxHeight, boxRadius, boxBorderColor, boxFillColor, boxBorderWidth);

        // Return dimensions needed for drawing dots later or positioning text
        return { leftBoxX, rightBoxX, boxY, boxWidth, boxHeight, gridSize, gap };
    };

    // Color cue display
    const colorCue = {
        type: jsPsychHtmlKeyboardResponse,
        stimulus: `<div class="w-16 h-16 rounded-full mx-auto" style="background-color:${taskColor};"></div>`,
        choices: "NO_KEYS",
        trial_duration: CONFIG.timing.colorCueDuration,
        data: {
            trial_type: 'color_cue',
            block_number: blockNum, // Added blockNum
            task_index: taskIndex,
            task_color: taskColor,
            is_easy: isEasy,
            has_feedback: hasFeedback
        }
    };
    
    // Dot stimulus display (dots visible, no response)
    const dotDisplay = {
        type: jsPsychCanvasKeyboardResponse,
        canvas_size: [600, 1000],
        stimulus: function(c) {
            const ctx = c.getContext('2d');
            const canvasWidth = c.width;
            const canvasHeight = c.height;
            
            ctx.clearRect(0, 0, canvasWidth, canvasHeight);

            // Draw boxes (passing taskColor) and get dimensions
            const { leftBoxX, rightBoxX, boxY, boxWidth, boxHeight, gridSize } = drawBoxesOnly(ctx, canvasWidth, canvasHeight, taskColor); // Pass taskColor

            // Generate dot coordinates
            const leftBoxDots = baseDotsPerBox + (moreSide === 0 ? dotDifference : 0);
            const rightBoxDots = baseDotsPerBox + (moreSide === 1 ? dotDifference : 0);

            const leftDotCoords = generateDotCoordinates(leftBoxDots, gridSize);
            const rightDotCoords = generateDotCoordinates(rightBoxDots, gridSize);

            // Draw dots
            const dotRadius = 3;
            drawDots(ctx, leftDotCoords, leftBoxX, boxY, boxWidth, boxHeight, gridSize, dotRadius);
            drawDots(ctx, rightDotCoords, rightBoxX, boxY, boxWidth, boxHeight, gridSize, dotRadius);
        },
        choices: "NO_KEYS", // No response during dot display
        prompt: '', // No prompt during dot display
        trial_duration: stimDuration, // Show dots for this duration
        response_ends_trial: false,
        data: {
            trial_type: 'dot_display', // Changed type
            block_number: blockNum, // Added blockNum
            task_index: taskIndex,
            task_color: taskColor,
            is_easy: isEasy,
            has_feedback: hasFeedback,
            more_side: moreSide,
            is_practice: isPractice,
            dot_difference: dotDifference, // Log the actual dot difference used
            // Add staircase data (will be null for practice trials)
            ...(isPractice ? {} : getTrialStaircaseData(isEasy))
            // Note: No response data here
        }
    };

    // Response screen (empty boxes, waits for response)
    const responseScreen = {
        type: jsPsychCanvasKeyboardResponse,
        canvas_size: [600, 1000],
        stimulus: function(c) {
            const ctx = c.getContext('2d');
            const canvasWidth = c.width;
            const canvasHeight = c.height;
            
            ctx.clearRect(0, 0, canvasWidth, canvasHeight);
            // Draw only the empty boxes (passing taskColor) and get dimensions
            const { boxY, boxHeight } = drawBoxesOnly(ctx, canvasWidth, canvasHeight, taskColor); // Pass taskColor

            // Draw prompt text below the boxes on the canvas
            ctx.fillStyle = '#374151'; // Dark gray text
            ctx.font = '24px sans-serif';
            ctx.textAlign = 'center';
            const promptText = `Which box had more dots? Press '${CONFIG.task.responseKeys.left}' for left, '${CONFIG.task.responseKeys.right}' for right.`;
            const textY = boxY + boxHeight + 50; // Position text 30px below the bottom of the boxes
            ctx.fillText(promptText, canvasWidth / 2, textY);
        },
        choices: [CONFIG.task.responseKeys.left, CONFIG.task.responseKeys.right], // Collect response here
        prompt: '', // Remove prompt parameter, text is drawn on canvas now
        trial_duration: null, // Wait indefinitely for response
        response_ends_trial: true, // End trial upon response
        data: {
            trial_type: 'dot_response', // New type for this part
            block_number: blockNum, // Added blockNum
            // Copy relevant info needed for analysis/feedback
            task_index: taskIndex,
            task_color: taskColor,
            is_easy: isEasy,
            has_feedback: hasFeedback,
            more_side: moreSide,
            is_practice: isPractice
        },
        on_finish: function(data) {
            // Determine if response was correct based on THIS trial's response
            if (data.response !== null) {
                const responseKey = data.response === CONFIG.task.responseKeys.left ? 0 : 1;
                data.response_side = responseKey;
                data.correct = responseKey === moreSide ? 1 : 0; // Compare response to the known 'moreSide'
                
                // Update staircase if this is not a practice trial
                if (!isPractice) {
                    const newDotDifference = updateStaircase(isEasy, data.correct === 1);
                    data.new_dot_difference = newDotDifference;
                    
                    // Log updated staircase data
                    const staircaseData = getTrialStaircaseData(isEasy);
                    Object.assign(data, staircaseData);
                }
            } else {
                // Should not happen with trial_duration: null and response_ends_trial: true, but good practice
                data.response_side = null;
                data.correct = null;
            }
        }
    };
    
    // Highlight the chosen box (using canvas)
    const highlightResponse = {
        type: jsPsychCanvasKeyboardResponse, // Change type to canvas
        canvas_size: [600, 1000],
        stimulus: function(c) {
            const ctx = c.getContext('2d');
            const canvasWidth = c.width;
            const canvasHeight = c.height;

            // Get data from the previous trial (responseScreen)
            const jsPsychInstance = window.jsPsychInstance; 
             if (!jsPsychInstance) {
                console.error("jsPsych instance not found on window object!");
                // Draw empty canvas if instance not found
                ctx.clearRect(0, 0, canvasWidth, canvasHeight);
                return;
            }
            const prevTrialData = jsPsychInstance.data.get().last(1).values()[0]; 
            const responseSide = prevTrialData.response_side; // 0 for left, 1 for right, null if no response

            ctx.clearRect(0, 0, canvasWidth, canvasHeight);

            // Draw the base boxes first (passing taskColor)
            const { leftBoxX, rightBoxX, boxY, boxWidth, boxHeight } = drawBoxesOnly(ctx, canvasWidth, canvasHeight, taskColor); // Pass taskColor

            // If a response was made, redraw the chosen box with highlight
            if (responseSide !== null) {
                const highlightColor = '#FBBF24'; // Tailwind yellow-400
                const highlightWidth = 4; // Border width for highlight
                const boxRadius = 5; // Keep radius consistent
                const boxFillColor = 'black'; // Keep fill consistent

                if (responseSide === 0) { // Highlight left box
                    drawRoundedRect(ctx, leftBoxX, boxY, boxWidth, boxHeight, boxRadius, highlightColor, boxFillColor, highlightWidth);
                } else { // Highlight right box
                    drawRoundedRect(ctx, rightBoxX, boxY, boxWidth, boxHeight, boxRadius, highlightColor, boxFillColor, highlightWidth);
                }
            } else {
                 // Optionally draw something if no response was detected, though responseScreen should prevent this
                 ctx.fillStyle = '#374151';
                 ctx.font = '16px sans-serif';
                 ctx.textAlign = 'center';
                 ctx.fillText("No response detected", canvasWidth / 2, canvasHeight / 2);
            }
        },
        choices: "NO_KEYS", // No response needed here
        prompt: '', // No prompt needed
        trial_duration: CONFIG.timing.highlightDuration, // Use config duration
        response_ends_trial: false,
        data: { // Keep data logging consistent
            trial_type: 'highlight',
            block_number: blockNum, // Added blockNum
            task_index: taskIndex,
            task_color: taskColor
        }
        // Remove on_load as it's no longer needed for HTML manipulation
    };
    
    // Confidence Rating
    const confidenceRating = createConfidenceRating(taskColor, blockNum); // Pass blockNum

    // Feedback display (or no feedback)
    const feedbackDisplay = {
        type: jsPsychHtmlKeyboardResponse,
        stimulus: '<div class="text-2xl" id="feedback-stimulus-container"></div>', // Placeholder container
        choices: "NO_KEYS",
        trial_duration: CONFIG.timing.feedbackDuration,
        data: {
            trial_type: 'feedback',
            block_number: blockNum, // Added blockNum
            task_index: taskIndex,
            task_color: taskColor,
            has_feedback: hasFeedback
        },
        on_load: function() {
            const jsPsychInstance = window.jsPsychInstance;
            if (!jsPsychInstance) {
                console.error("jsPsych instance not found on window object!");
                return;
            }
            
            // Get response screen trial data (now 3 trials ago: responseScreen -> highlight -> confidence)
            const responseTrialData = jsPsychInstance.data.get().last(3).values()[0];
            const correct = responseTrialData.correct;
            const responseSide = responseTrialData.response_side;

            let feedbackTextContent = "";
            let noResponseDetected = false;

            if (responseSide === null) {
                feedbackTextContent = "No response detected";
                noResponseDetected = true;
            } else if (!hasFeedback) {
                feedbackTextContent = "&nbsp;"; 
            } else {
                feedbackTextContent = correct ? "Correct" : "Incorrect";
            }

            const containerClasses = "p-6 rounded-lg text-3xl border-2 flex justify-center items-center min-w-[180px] mx-auto"; 
            
            const htmlContent = `
                <div class="${containerClasses}" style="background-color:${taskColor};">
                    <p class="text-white text-center text-3xl font-bold">${feedbackTextContent}</p>
                </div>`;

            const container = document.getElementById('feedback-stimulus-container');
             if (container) {
                container.innerHTML = htmlContent;
            } else {
                console.error("Could not find #feedback-stimulus-container");
                jsPsychInstance.getDisplayElement().innerHTML = htmlContent;
            }
        }
    };
    
    // Inter-trial interval
    const iti = {
        type: jsPsychHtmlKeyboardResponse,
        stimulus: '<div class="fixation">+</div>',
        choices: "NO_KEYS",
        trial_duration: function() {
            return jitterTime(CONFIG.timing.itiDuration, CONFIG.timing.itiJitter);
        },
        data: {
            trial_type: 'iti'
        }
    };
    
    // Return the updated trial sequence
    return {
        timeline: [
            colorCue, 
            dotDisplay, 
            responseScreen, 
            highlightResponse, 
            confidenceRating, // Confidence rating inserted here
            feedbackDisplay,  // Feedback now follows confidence
            iti
        ]
    };
}

export { createDotTrial };