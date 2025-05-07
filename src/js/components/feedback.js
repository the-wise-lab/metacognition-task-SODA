// src/js/components/feedback.js
import CONFIG from '../config.js';

/**
 * Create the end of block feedback component
 * @param {Object} blockData - Data from the completed block
 * @returns {Object} JSPsych trial object for block feedback
 */
function createBlockFeedback(blockData) {
    const { blockNumber, totalBlocks, accuracy, pointsEarned } = blockData;
    
    return {
        type: jsPsychHtmlButtonResponse,
        stimulus: `
            <div class="max-w-xl mx-auto">
                <h2 class="text-2xl font-bold mb-4">Block ${blockNumber} Complete</h2>
                
                <p class="mb-3">You have completed ${blockNumber} of ${totalBlocks} blocks.</p>
                
                <p class="mb-3">In the next screen, you'll choose which task you want to continue with in the test block.</p>
                <p class="mb-3">Remember to choose the task you think you performed BETTER at to maximize your bonus points.</p>
            </div>
        `,
        choices: ['Continue'],
        data: {
            trial_type: 'block_feedback',
            block_number: blockNumber,
            total_blocks: totalBlocks,
            accuracy: accuracy,
            points_earned: pointsEarned
        }
    };
}

/**
 * Create the end of experiment feedback component
 * @param {Object} expData - Data from the completed experiment
 * @returns {Object} JSPsych trial object for experiment feedback
 */
function createExperimentFeedback(expData) {
    const { totalAccuracy, totalPoints, bonusPoints } = expData;
    
    return {
        type: jsPsychHtmlButtonResponse,
        stimulus: `
            <div class="max-w-xl mx-auto">
                <h2 class="text-2xl font-bold mb-4">Experiment Complete</h2>
                
                <p class="mb-4">Thank you for participating in this experiment!</p>
                
                <div class="p-4 bg-gray-100 rounded-lg mb-6">
                    <p class="text-lg mb-2">Your overall performance:</p>
                    <p class="text-xl font-semibold">Overall accuracy: ${Math.round(totalAccuracy * 100)}%</p>
                    <p class="text-xl font-semibold">Total points: ${totalPoints}</p>
                    <p class="text-xl font-semibold text-green-600">Bonus points: ${bonusPoints}</p>
                </div>
                
                <p class="mb-3">The bonus points reflect how well you were able to identify which tasks you performed better at.</p>
                
                <p class="mb-3">Your data has been saved. You may now close this browser window.</p>
                
                <p class="text-sm mt-6 text-gray-500">If you have any questions about this experiment, please contact the experimenter.</p>
            </div>
        `,
        choices: ['Finish'],
        data: {
            trial_type: 'experiment_feedback',
            total_accuracy: totalAccuracy,
            total_points: totalPoints,
            bonus_points: bonusPoints
        }
    };
}

export { createBlockFeedback, createExperimentFeedback };