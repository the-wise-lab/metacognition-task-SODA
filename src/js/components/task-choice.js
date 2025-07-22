// This file exports the task choice component after learning blocks
import CONFIG from '../config.js';

/**
 * Create a task choice trial where participants select which task they think they performed better on
 * @param {Array} taskColors - Array of two colors representing the tasks
 * @param {Array} taskTypes - Array of two task types (descriptions)
 * @param {number} blockNum - The current block number
 * @returns {Object} JSPsych timeline object for task choice
 */
function createTaskChoice(taskColors, taskTypes, blockNum) {
    return {
        type: jsPsychHtmlKeyboardResponse,
        stimulus: function() {
            return `
                <div class="max-w-4xl text-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
                    <h2 class="text-4xl text-center mb-6">Which task would you like to perform in the test block?</h2>
                    
                    <p class="mb-4 text-center">Choose the task you think you performed better at to maximize your bonus points.</p>
                    
                    <div class="flex justify-center items-center my-12">
                        <div class="text-center mx-8">
                            <div class="w-24 h-24 rounded-full mx-auto mb-4" style="background-color:${taskColors[0]};"></div>
                            <p class="text-lg">Task 1</p>
                            <p class="text-sm mb-4">${taskTypes[0]}</p>
                            <p class="border border-gray-400 px-3 py-1 rounded">Press '${CONFIG.task.taskChoiceKeys.left}' to choose</p>
                        </div>
                        <div class="text-center mx-8">
                            <div class="w-24 h-24 rounded-full mx-auto mb-4" style="background-color:${taskColors[1]};"></div>
                            <p class="text-lg">Task 2</p>
                            <p class="text-sm mb-4">${taskTypes[1]}</p>
                            <p class="border border-gray-400 px-3 py-1 rounded">Press '${CONFIG.task.taskChoiceKeys.right}' to choose</p>
                        </div>
                    </div>
                    
                    <p class="text-center text-sm italic mt-4">
                        Note: You will perform 6 trials of your chosen task in the test block.
                        <br>No feedback will be provided during the test block.
                    </p>
                </div>
            `;
        },
        choices: [CONFIG.task.taskChoiceKeys.left, CONFIG.task.taskChoiceKeys.right],
        data: {
            trial_type: 'task_choice',
            block_number: blockNum, // Added blockNum
            task_colors: taskColors,
            task_types: taskTypes
        },
        on_finish: function(data) {
            // Store which task was chosen (0 = left/first task, 1 = right/second task)
            data.chosen_task = data.response === CONFIG.task.taskChoiceKeys.left ? 0 : 1;
        }
    };
}

export { createTaskChoice };