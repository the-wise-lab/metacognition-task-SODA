// This file creates and exports the instructions component for the metacognition task
import CONFIG from "../config.js";
import {
    generateDotCoordinates,
    drawDots,
    drawStimulusDisplayElements,
} from "../utils.js";

/**
 * Create instruction trials for the metacognition task
 * @returns {Object} JSPsych timeline object with instructions
 */
function createInstructions() {
    // Page 1: Welcome
    const page1_html = `
        <div class="max-w-2xl mx-auto">
            <h1 class="text-2xl font-bold mb-4">Welcome</h1>
            <p class="mb-3">In this experiment, you will perform a series of trials where you'll judge which of two boxes contains more dots.</p>
            <p class="mb-3">The boxes can be from either the <span style="color:${
                CONFIG.practiceTaskColors[1] // Use second practice color
            };"><b>first</b></span> set or <span style="color:${
        CONFIG.practiceTaskColors[0] // Use first practice color
    };"><b>second</b></span> set. The <span style="color:${
        CONFIG.practiceTaskColors[1]
    };"><b>first</b></span> and <span style="color:${
        CONFIG.practiceTaskColors[0]
    };"><b>second</b></span> sets differ in their difficulty.</p>
    <p class="mb-3">Each set is identified by a different colour, and each trial will begin with a coloured circle telling you which set the boxes come from on that trial.</p>
    <p class="mb-3">You will perform multiple blocks, each with different colours.</p>
        </div>
    `;

    // Page 2: Task Instructions with Canvas (HTML only, script moved to on_load)
    const canvasInstructionPageHTML = `
        <div class="max-w-2xl mx-auto">
            <h1 class="text-2xl font-bold mb-4">Task Instructions</h1>
            <p class="mb-3">You'll see two black boxes filled with white dots. Your job is to decide which box has <b>MORE</b> dots.</p>
            <p class="mb-3">The boxes will appear briefly, so you'll need to pay close attention.</p>
            <p class="mb-3">If you think the <b>LEFT</b> box has more dots, press the <b>'${CONFIG.task.responseKeys.left}'</b> key.</p>
            <p class="mb-3">If you think the <b>RIGHT</b> box has more dots, press the <b>'${CONFIG.task.responseKeys.right}'</b> key.</p>
            <p class="mb-3">The task is designed to be challening, so the correct answer may not always be obvious.</p>
            <div class="flex justify-center my-4">
                <canvas id="dotBoxExample" width="600" height="300" class="border"></canvas>
            </div>
            <p class="text-sm text-center text-gray-600">Example of dot boxes (left box has more dots in this example)</p>
        </div>
    `;

    // Define individual HTML for intermediate instruction pages
    const feedbackPageHTML = `
        <div class="max-w-2xl mx-auto">
            <h1 class="text-2xl font-bold mb-4">Feedback</h1>
            <p class="mb-3">After each response, you may receive feedback about whether your answer was correct or not.</p>
            <p class="mb-3">Some trials will provide feedback, showing "Correct" or "Incorrect" after the trial.</p>
            <p class="mb-3">Other trials will not provide any feedback, showing only a coloured rectangle with no text.</p>
            <p class="mb-3">Pay attention to how well you think you're performing in each task, even when you don't get feedback.</p>
        </div>
        `;

    const confidenceRatingsPageHTML = `
        <div class="max-w-2xl mx-auto">
            <h1 class="text-2xl font-bold mb-4">Confidence Ratings</h1>
            <p class="mb-3">After each trial, you'll be asked to rate how confident you are that your response was correct.</p>
            <p class="mb-3">Use the slider to indicate your confidence level, from 50% (chance level) to 100% (completely certain).</p>
            <p class="mb-3">Try to be as accurate as possible when rating your confidence.</p>
            <div class="my-4 p-4 border rounded bg-gray-50 flex justify-center">
                <img src="assets/rating_scale_example.png" alt="Example of the rating scale" style="max-width: 500px; width: 100%; border: 1px solid #ccc;">
            </div>
        </div>
        `;

    const learningAndTestBlocksPageHTML = `
        <div class="max-w-2xl mx-auto">
            <h1 class="text-2xl font-bold mb-4">Learning and Test Blocks</h1>
            <p class="mb-3">The experiment is organized into "learning blocks" and "test blocks".</p>
            <p class="mb-3">Each learning block contains 24 trials (12 from each of two tasks). The tasks are mixed together in random order.</p>
            <p class="mb-3">After each learning block, you'll choose which task you want to perform in a short test block.</p>
            <p class="mb-3">You should choose the task you think you performed BETTER at, to maximize your bonus points.</p>
            <p class="mb-3">The test block will contain 6 trials of your chosen task, without feedback.</p>
        </div>
        `;

    const taskChoiceAndPerformanceRatingsPageHTML = `
        <div class="max-w-2xl mx-auto">
            <h1 class="text-2xl font-bold mb-4">Task Choice and Performance Ratings</h1>
            <p class="mb-3">After a learning block, you'll choose which task to continue with by pressing either:</p>
            <p class="mb-3 font-bold">The '${CONFIG.task.taskChoiceKeys.left}' key for the first task, or the '${CONFIG.task.taskChoiceKeys.right}' key for the second task.</p>
            <p class="mb-3">After the test block, you'll rate your overall performance on both tasks using a rating scale.</p>
            <p class="mb-3">These ratings help us understand how well you think you performed on each task.</p>
        </div>
        `;

    const learningBlocksAndPerformanceRatingsPageHTML_SkipTest = `
        <div class="max-w-2xl mx-auto">
            <h1 class="text-2xl font-bold mb-4">Learning Blocks and Performance Ratings</h1>
            <p class="mb-3">After 24 trials, you'll rate your overall performance on both tasks using a rating scale.</p>
            <p class="mb-3">These ratings help us understand how well you think you performed on each task.</p>
        </div>
        `;

    let intermediateInstructionPages = [
        feedbackPageHTML,
        confidenceRatingsPageHTML,
    ];

    if (CONFIG.task.skipTestBlock) {
        intermediateInstructionPages.push(
            learningBlocksAndPerformanceRatingsPageHTML_SkipTest
        );
    } else {
        intermediateInstructionPages.push(learningAndTestBlocksPageHTML);
        intermediateInstructionPages.push(
            taskChoiceAndPerformanceRatingsPageHTML
        );
    }

    // Page 7: Practice Trials intro
    const lastPageHTML = `
        <div class="max-w-2xl mx-auto">
            <h1 class="text-2xl font-bold mb-4">Practice Trials</h1>
            <p class="mb-3">Before we begin, you'll complete 10 practice trials to get familiar with the task.</p>
            <p class="mb-3">The practice will show you both types of tasks - with and without feedback.</p>
            <p class="mb-3">During practice, the dots will be shown for a little longer than in the real task.</p>
            <p class="mb-3">After the practice, we'll begin the actual experiment with the first learning block.</p>
            <p class="mb-3 mt-6 text-center font-bold">Press the button below when you're ready to begin the practice trials.</p>
        </div>
    `;

    const instructions_part1 = {
        type: jsPsychInstructions,
        pages: [page1_html],
        show_clickable_nav: true,
        allow_backward: false,
        button_label_next: "Next",
        data: { trial_type: "instructions_part1" },
    };

    const canvas_instruction_trial = {
        type: jsPsychHtmlButtonResponse,
        stimulus: canvasInstructionPageHTML,
        choices: ["Next"],
        button_html: '<button class="jspsych-btn">%choice%</button>',
        on_load: function () {
            const canvas = document.getElementById("dotBoxExample");
            if (canvas) {
                const ctx = canvas.getContext("2d");
                const canvasWidth = canvas.width;
                const canvasHeight = canvas.height;

                // Clear canvas with gray background (as per original example style)
                ctx.fillStyle = "gray";
                ctx.fillRect(0, 0, canvasWidth, canvasHeight);

                // Draw stimulus boxes using the utility function
                // Pass CONFIG. For the example, we don't want a task-specific faded background,
                // so we omit taskColor or pass backgroundAlpha = 0 in options.
                // The default options for drawStimulusDisplayElements will handle box colors.
                const stimulusElements = drawStimulusDisplayElements(
                    ctx,
                    canvasWidth,
                    canvasHeight,
                    CONFIG,
                    { backgroundAlpha: 0 }
                ); // No taskColor, so no faded bg
                const {
                    leftBoxX,
                    rightBoxX,
                    boxY,
                    boxWidth,
                    boxHeight,
                    gridSize,
                } = stimulusElements;

                // Generate dot coordinates for the example
                // Using CONFIG values for consistency, e.g., easy difference for a clear example
                const baseDots = CONFIG.task.baseDotsPerBox;
                const leftBoxDots = baseDots + CONFIG.task.easyDotDifference;
                const rightBoxDots = baseDots;

                const leftDotCoords = generateDotCoordinates(
                    leftBoxDots,
                    gridSize
                );
                const rightDotCoords = generateDotCoordinates(
                    rightBoxDots,
                    gridSize
                );

                // Draw dots
                const dotRadius = 2; // Example dot radius
                drawDots(
                    ctx,
                    leftDotCoords,
                    leftBoxX,
                    boxY,
                    boxWidth,
                    boxHeight,
                    gridSize,
                    dotRadius
                );
                drawDots(
                    ctx,
                    rightDotCoords,
                    rightBoxX,
                    boxY,
                    boxWidth,
                    boxHeight,
                    gridSize,
                    dotRadius
                );
            } else {
                console.error(
                    "on_load (instructions): Canvas element #dotBoxExample not found."
                );
            }
        },
        data: { trial_type: "instructions_canvas_example" },
    };

    const instructions_part2 = {
        type: jsPsychInstructions,
        pages: intermediateInstructionPages,
        show_clickable_nav: true,
        button_label_next: "Next",
        button_label_previous: "Previous",
        data: { trial_type: "instructions_part2" },
    };

    const final_instruction_page_trial = {
        type: jsPsychHtmlButtonResponse,
        stimulus: lastPageHTML,
        choices: ["Begin Practice Trials"],
        button_html: '<button class="jspsych-btn">%choice%</button>',
        data: { trial_type: "instructions_final_page" },
    };

    let timeline = [instructions_part1, canvas_instruction_trial];

    if (intermediateInstructionPages.length > 0) {
        timeline.push(instructions_part2);
    }
    timeline.push(final_instruction_page_trial);

    return {
        timeline: timeline,
    };
}

/**
 * Create a trial explaining the transition to a test block
 * @param {string} taskColor - The color of the chosen task
 * @param {string} taskType - The type of the chosen task
 * @param {number} blockNum - The current block number
 * @returns {Object} JSPsych trial object
 */
function createTestBlockInstructions(taskColor, taskType, blockNum) {
    return {
        type: jsPsychHtmlButtonResponse,
        stimulus: `
            <div class="max-w-xl mx-auto">
                <h2 class="text-2xl font-bold mb-4">Test Block</h2>
                <p class="mb-3">You have chosen to perform the following task in the test block:</p>
                <div class="flex items-center justify-center my-6">
                    <div class="w-16 h-16 rounded-full mr-4" style="background-color:${taskColor};"></div>
                    <p class="text-lg">${taskType}</p>
                </div>
                <p class="mb-3">You will now perform 6 trials of this task.</p>
                <p class="mb-3">Remember that NO FEEDBACK will be provided during the test block.</p>
                <p class="mb-3">Try to perform as accurately as possible to maximize your bonus.</p>
            </div>
        `,
        choices: ["Begin Test Block"],
        data: {
            trial_type: "test_block_instructions",
            block_number: blockNum, // Added blockNum
            task_color: taskColor,
            task_type: taskType,
        },
    };
}

/**
 * Create a break screen to display between blocks
 * @param {number} blockNumber - Current block number
 * @param {number} totalBlocks - Total number of blocks
 * @returns {Object} JSPsych trial object for the break screen
 */
function createBreakScreen(blockNumber, totalBlocks) {
    return {
        type: jsPsychHtmlButtonResponse,
        stimulus: `
            <div class="max-w-xl mx-auto">
                <h2 class="text-2xl font-bold mb-4">Take a Break</h2>
                <p class="mb-3">You have completed block ${blockNumber} of ${totalBlocks}.</p>
                <p class="mb-3">Feel free to take a short break before continuing.</p>
                <p class="mb-3">The next block will feature two new tasks with different colors.</p>
                <p class="mb-3">Remember to pay attention to how well you perform on each task.</p>
            </div>
        `,
        choices: ["Continue to Next Block"],
        data: {
            trial_type: "break_screen",
            block_number: blockNumber,
            total_blocks: totalBlocks,
        },
    };
}

/**
 * Create a trial explaining practice block is about to begin
 * @returns {Object} JSPsych trial object
 */
function createPracticeInstructions() {
    return {
        type: jsPsychHtmlButtonResponse,
        stimulus: `
            <div class="max-w-xl mx-auto">
                <h2 class="text-2xl font-bold mb-4">Practice Trials</h2>
                <p class="mb-3">You will now complete 10 practice trials to familiarize yourself with the task.</p>
                <p class="mb-3">Press the <b>'${CONFIG.task.responseKeys.left}'</b> key if the <b>LEFT</b> box has more dots.</p>
                <p class="mb-3">Press the <b>'${CONFIG.task.responseKeys.right}'</b> key if the <b>RIGHT</b> box has more dots.</p>
            </div>
        `,
        choices: ["Begin Practice"],
        data: {
            trial_type: "practice_instructions",
        },
    };
}

/**
 * Create a trial explaining the transition to learning blocks
 * @returns {Object} JSPsych trial object
 */
function createLearningBlockInstructions() {
    let listItemsHTML = `
        <li class="mb-1">Each block has two tasks, indicated by different colors.</li>
        <li class="mb-1">Pay attention to how well you're performing on each task.</li>
    `;

    if (CONFIG.task.skipTestBlock) {
        listItemsHTML += `
        <li class="mb-1">After each learning block, you will rate your overall performance on both tasks.</li>
        `;
    } else {
        listItemsHTML += `
        <li class="mb-1">After each learning block, you'll choose which task to continue with.</li>
        <li class="mb-1">Choose the task you think you're better at to maximize your bonus.</li>
        `;
    }

    return {
        type: jsPsychHtmlButtonResponse,
        stimulus: `
            <div class="max-w-xl mx-auto">
                <h2 class="text-2xl font-bold mb-4">End of practice</h2>
                <p class="mb-3">You will now begin the actual experiment with the first learning block.</p>
                <p class="mb-3">Remember:</p>
                <ul class="list-disc list-inside mb-3">
                    ${listItemsHTML}
                </ul>
                <p class="mb-3">The dots will now be shown for a shorter time.</p>
            </div>
        `,
        choices: ["Begin Experiment"],
        data: {
            trial_type: "learning_block_instructions",
        },
    };
}

export {
    createInstructions,
    createTestBlockInstructions,
    createBreakScreen,
    createPracticeInstructions,
    createLearningBlockInstructions,
};
