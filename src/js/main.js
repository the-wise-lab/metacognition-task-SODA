// Main experiment controller for the metacognition task
import CONFIG from "./config.js";
import {
    createTaskSequence,
    balanceLocations,
    shuffleArray,
    seedPRNG, // Import seedPRNG
    seededRandom, // Import seededRandom
} from "./utils.js";
import { saveDataToServer } from "./server-utils.js"; // Import saveDataToServer
import { initializeStaircases, getStaircaseSummary } from "./staircase.js"; // Import staircase utilities
import { createDotTrial } from "./components/trial.js";
import { createConfidenceRating } from "./components/confidence-rating.js";
import { createTaskChoice } from "./components/task-choice.js";
import { createPerformanceRating } from "./components/performance-rating.js";
import {
    createInstructions,
    createTestBlockInstructions,
    createBreakScreen,
    createPracticeInstructions,
    createLearningBlockInstructions,
} from "./components/instructions.js";
import {
    createBlockFeedback,
    createExperimentFeedback,
} from "./components/feedback.js";

// Parse URL parameters to check for skip instructions flag
const urlParams = new URLSearchParams(window.location.search);
const skipInstructions = urlParams.has("skip_instructions");
const skipPractice = urlParams.has("skip_practice");
const testMode = urlParams.has("test_mode"); // Check for test_mode parameter

// Capture subjectID and sessionID from URL
const subjectID = urlParams.get("subjectID") || null;
const sessionID = urlParams.get("sessionID") || null;

// Capture data saving configuration from URL
const saveMethod = urlParams.get("saveMethod") || "http";
const apiURL = urlParams.get("apiURL") || "127.0.0.1";
const apiPort = urlParams.get("apiPort") || "5000";
const apiEndpoint = urlParams.get("apiEndpoint") || "/submit_data";
const firebaseCollection = urlParams.get("firebaseCollection") || "experiment-data";

// Log these
console.log(`Subject ID: ${subjectID}`);
console.log(`Session ID: ${sessionID}`);
console.log(`Save Method: ${saveMethod}`);
console.log(`Consolidate Data: ${CONFIG.data.consolidateData}`);
console.log(`Save Raw Data: ${CONFIG.data.saveRawData}`);

// --- Seed the PRNG ---
/**
 * Simple hash function to convert a string to an integer seed.
 * @param {string} str - The input string.
 * @returns {number} A 32-bit integer hash.
 */
function simpleHash(str) {
    let hash = 0;
    if (str.length === 0) return hash;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
}

let combinedSeedString;
if (subjectID !== null && sessionID !== null) {
    combinedSeedString = `${subjectID}_${sessionID}`;
} else if (subjectID !== null) {
    combinedSeedString = `${subjectID}_defaultSession`;
} else if (sessionID !== null) {
    combinedSeedString = `defaultSubject_${sessionID}`;
} else {
    // Fallback if both are null - using current time for some variability,
    // but this part won't be deterministic across different initial runs without IDs.
    // For true deterministic behavior when IDs are missing, a fixed default string is better.
    combinedSeedString = `defaultSubject_defaultSession_${Date.now()}`;
}
const numericSeed = simpleHash(combinedSeedString);
seedPRNG(numericSeed); // Seed the PRNG from utils.js

// Shuffle CONFIG.colors using the seeded shuffleArray
CONFIG.colors = shuffleArray(CONFIG.colors);
// --- End PRNG Seeding ---

// Initialize jsPsych
const jsPsych = initJsPsych({
    show_progress_bar: false,
    on_finish: function () {
        // Save data to server
        const allData = jsPsych.data.get().values(); // Get as array of objects
        saveDataToServer({
            taskName: "metacognition-task", // Or a more dynamic task name if needed
            subjectID: subjectID,
            sessionID: sessionID,
            data: allData,
            saveMethod: saveMethod,
            apiURL: apiURL,
            apiPort: apiPort,
            apiEndpoint: apiEndpoint,
            firebaseCollection: firebaseCollection,
            writeMode: "overwrite", // Or make this configurable
            consolidateData: CONFIG.data.consolidateData,
            saveRawData: CONFIG.data.saveRawData,
        });
        // jsPsych.data.displayData(); // Uncomment to display data for debugging
    },
});

// Add subjectID and sessionID as global data properties
jsPsych.data.addProperties({
    subject_id: subjectID,
    session_id: sessionID,
    save_method: saveMethod,
    api_url: apiURL,
    api_port: apiPort,
    api_endpoint: apiEndpoint,
    firebase_collection: firebaseCollection,
});

// Make the specific jsPsych instance globally available for access within trial components
// Note: This is a workaround for the v7 migration issue regarding global access.
window.jsPsychInstance = jsPsych;

// Preload task
const preload = {
    type: jsPsychPreload,
    auto_preload: true,
};

// Helper function to validate a trial or timeline object before pushing
function validateAndPush(
    timelineArray,
    trialObject,
    trialName = "Unnamed Trial"
) {
    if (
        !trialObject ||
        typeof trialObject !== "object" ||
        Object.keys(trialObject).length === 0
    ) {
        console.error(
            `Attempting to push an empty or invalid object for ${trialName}:`,
            trialObject
        );
        throw new Error(
            `Invalid trial object for ${trialName}: Empty or not an object.`
        );
    }
    if (
        typeof trialObject.type === "undefined" &&
        typeof trialObject.timeline === "undefined"
    ) {
        console.error(
            `Trial object for ${trialName} is missing 'type' or 'timeline' property:`,
            trialObject
        );
        throw new Error(
            `Invalid trial object for ${trialName}: Missing 'type' or 'timeline'.`
        );
    }
    timelineArray.push(trialObject);
}

// Main timeline
const timeline = [];

// Fullscreen mode at the start of the experiment
// timeline.push({
//   type: jsPsychFullscreen,
//   fullscreen_mode: true
// });

validateAndPush(timeline, preload, "Preload");

// Initialize staircases early so they're ready for practice trials
initializeStaircases(CONFIG.task);

// Add instructions (unless skip_instructions is present in URL)
if (!skipInstructions) {
    validateAndPush(timeline, createInstructions(), "Instructions");
}

// Add practice instructions and trials (skip if skip_instructions or skip_practice is present in URL)
if (!skipInstructions && !skipPractice) {
    console.log(timeline);
    validateAndPush(
        timeline,
        createPracticeInstructions(),
        "Practice Instructions"
    );

    // Practice trials - alternate between easy and difficult, use both for staircase initialization
    let practiceTrialCount = 0; // Counter for practice trial numbers
    console.log(practiceTrialCount);
    for (let i = 0; i < CONFIG.task.practiceTrialsPerTask; i++) {
        // Create practice trials for both easy and difficult conditions
        for (let difficulty = 0; difficulty < 2; difficulty++) {
            const isEasy = difficulty === 0;
            const taskIdx = difficulty; // Use difficulty as task index for practice
            const taskColor = CONFIG.practiceTaskColors[taskIdx];
            const moreSide = seededRandom() > 0.5 ? 0 : 1; // Use seededRandom

            const practiceTrial = createDotTrial({
                taskIndex: taskIdx,
                taskColor: taskColor,
                isEasy: isEasy,
                hasFeedback: taskIdx === 0, // First task has feedback, second doesn't
                moreSide: moreSide,
                isPractice: true,
                blockNum: 0, // Practice block number
                trialNumber: practiceTrialCount + 1, // Add logical trial number
            });
            practiceTrialCount++; // Increment trial counter
            validateAndPush(
                timeline,
                practiceTrial,
                `Practice Trial ${i * 2 + difficulty + 1}`
            );
        }
    }

    console.log(timeline);

    validateAndPush(
        timeline,
        createLearningBlockInstructions(),
        "Learning Block Instructions"
    );
    
} else if (!skipInstructions && skipPractice) {
    // If only practice is skipped, but not main instructions, still show learning block instructions
    validateAndPush(
        timeline,
        createLearningBlockInstructions(),
        "Learning Block Instructions"
    );
}

// Number of blocks is determined by the number of color pairs
let numBlocksToRun = CONFIG.colors.length;
let trialsPerLearningBlock = CONFIG.task.learningBlockTrials;

if (testMode) {
    numBlocksToRun = 2; // Override number of blocks for test mode
    trialsPerLearningBlock = 2; // Override trials per learning block for test mode
    // Ensure we don't try to run more blocks than available colors if CONFIG.colors has less than 2 pairs
    if (CONFIG.colors.length < numBlocksToRun) {
        numBlocksToRun = CONFIG.colors.length;
    }
}

// Global trial counter for logical trial numbering (continues across blocks)
let globalTrialCounter = 0; // Start after practice trials

// Learning and test blocks
for (let block = 0; block < numBlocksToRun; block++) {
    const blockNum = block + 1;

    // Assign colors for this block directly from the (already shuffled) CONFIG.colors
    const taskColors = CONFIG.colors[block];

    // Dynamically assign difficulty and feedback for the two tasks in this block
    let difficulty1, difficulty2;
    if (seededRandom() < 0.5) {
        // Use seededRandom
        difficulty1 = "easy";
        difficulty2 = "difficult";
    } else {
        difficulty1 = "difficult";
        difficulty2 = "easy";
    }

    const feedback1 = true; // Use seededRandom
    const feedback2 = true; // Use seededRandom

    const taskPairing = [
        { difficulty: difficulty1, feedback: feedback1 },
        { difficulty: difficulty2, feedback: feedback2 },
    ];

    // Create descriptions of the tasks
    const taskDescriptions = [
        `${taskPairing[0].difficulty} difficulty, ${
            taskPairing[0].feedback ? "with" : "without"
        } feedback`,
        `${taskPairing[1].difficulty} difficulty, ${
            taskPairing[1].feedback ? "with" : "without"
        } feedback`,
    ];

    // Create a pseudo-random sequence of tasks ensuring no more than maxConsecutive in a row
    const taskSequence = createTaskSequence(
        trialsPerLearningBlock, // Use potentially overridden trial count
        2,
        CONFIG.task.maxConsecutiveSameTask
    );

    // Create a balanced sequence of more-dots locations (left or right)
    const locationSequence = balanceLocations(trialsPerLearningBlock); // Use potentially overridden trial count

    // Create the learning block timeline
    const learningBlockTimeline = [];
    let blockAccuracy = 0;

    // Create each trial in the learning block
    for (let t = 0; t < trialsPerLearningBlock; t++) {
        // Use potentially overridden trial count
        const taskIdx = taskSequence[t]; // 0 or 1, which task in this block
        const task = taskPairing[taskIdx];
        const moreSide = locationSequence[t]; // 0 (left) or 1 (right)

        // Create the trial
        const trial = createDotTrial({
            taskIndex: taskIdx,
            taskColor: taskColors[taskIdx],
            isEasy: task.difficulty === "easy",
            hasFeedback: task.feedback,
            moreSide: moreSide,
            isPractice: false,
            blockNum: blockNum, // Pass blockNum
            trialNumber: globalTrialCounter + 1, // Add logical trial number
        });
        globalTrialCounter++; // Increment global trial counter

        validateAndPush(
            learningBlockTimeline,
            trial,
            `Learning Block ${blockNum}, Trial ${t}`
        );
    }

    // Add learning block to main timeline
    const learningBlockWrapper = {
        timeline: learningBlockTimeline,
        on_timeline_finish: function () {
            // Calculate accuracy for this learning block
            // Corrected filter to 'dot_response'
            const trials = jsPsych.data
                .get()
                .filter({ trial_type: "dot_response", is_practice: false })
                .last(trialsPerLearningBlock);
            const correctTrials = trials.filter({ correct: 1 }).count();
            // Ensure we don't divide by zero if trialsPerLearningBlock is 0 or no trials are found
            blockAccuracy =
                trialsPerLearningBlock > 0 && trials.count() > 0
                    ? correctTrials / trials.count()
                    : 0;
        },
    };
    validateAndPush(
        timeline,
        learningBlockWrapper,
        `Learning Block Wrapper ${blockNum}`
    );

    // Performance ratings (moved before block feedback)
    for (let t = 0; t < 2; t++) {
        // Create a simplified description for performance rating, showing only difficulty
        const performanceRatingTaskDescription = `${taskPairing[t].difficulty} difficulty task`;

        const performanceRating = createPerformanceRating({
            color: taskColors[t],
            type: performanceRatingTaskDescription, // Use the simplified description
            index: t,
            blockNum: blockNum, // Pass blockNum
            trialNumber: globalTrialCounter + 1, // Add logical trial number
        });
        globalTrialCounter++; // Increment global trial counter
        validateAndPush(
            timeline,
            performanceRating,
            `Performance Rating Block ${blockNum}, Task ${t}`
        );
    }

    // Block feedback - Using a simpler dynamic trial approach
    const blockFeedbackNode = {
        type: jsPsychHtmlButtonResponse, // Directly using the type we know blockFeedback will use
        stimulus: function () {
            return `
                <div class="max-w-4xl text-2xl mx-auto">
                    <h2 class="text-4xl font-bold mb-4">Block ${blockNum} Complete</h2>
                    
                    <p class="mb-3">You have completed ${blockNum} of ${numBlocksToRun} blocks.</p>
                </div>
            `;
        },
        choices: ["Continue"],
        data: {
            trial_type: "block_feedback",
            block_number: blockNum,
            total_blocks: numBlocksToRun,
        },
        on_finish: function (data) {
            // Save accuracy to data here to ensure it's captured
            data.accuracy = blockAccuracy;
            data.points_earned = Math.round(blockAccuracy * 100);
        },
    };
    validateAndPush(timeline, blockFeedbackNode, `Block Feedback ${blockNum}`);

    // Task choice - only if not skipping test blocks
    if (!CONFIG.task.skipTestBlock) {
        const taskChoiceTrial = createTaskChoice(
            taskColors,
            taskDescriptions,
            blockNum
        ); // Pass blockNum
        validateAndPush(
            timeline,
            taskChoiceTrial,
            `Task Choice Block ${blockNum}`
        );
    }

    // Test block (after the learning block) - only if not skipping test blocks
    if (!CONFIG.task.skipTestBlock) {
        const testBlock = {
            timeline: [],
            conditional_function: function () {
                // This ensures the test block runs only if task choice happened (i.e., not skipped)
                // and a choice was made.
                const taskChoiceData = jsPsych.data.get().last(1).values()[0];
                return (
                    taskChoiceData &&
                    typeof taskChoiceData.chosen_task !== "undefined"
                );
            },
            on_timeline_start: function () {
                const taskChoiceData = jsPsych.data.get().last(1).values()[0];
                const chosenTaskIdx = taskChoiceData.chosen_task; // 0 or 1
                const chosenTask = taskPairing[chosenTaskIdx];
                const chosenTaskColor = taskColors[chosenTaskIdx];
                const chosenTaskDesc = taskDescriptions[chosenTaskIdx];

                validateAndPush(
                    this.timeline,
                    createTestBlockInstructions(
                        chosenTaskColor,
                        chosenTaskDesc,
                        blockNum
                    ),
                    "Test Block Instructions"
                ); // Pass blockNum

                // Create balanced locations for test trials
                const testLocations = balanceLocations(
                    CONFIG.task.testBlockTrials
                );

                // Create test trials
                for (let t = 0; t < CONFIG.task.testBlockTrials; t++) {
                    const testTrial = createDotTrial({
                        taskIndex: chosenTaskIdx,
                        taskColor: chosenTaskColor,
                        isEasy: chosenTask.difficulty === "easy",
                        hasFeedback: false, // No feedback in test block
                        moreSide: testLocations[t],
                        isPractice: false,
                        blockNum: blockNum, // Pass blockNum
                        trialNumber: globalTrialCounter + 1, // Add logical trial number
                    });
                    globalTrialCounter++; // Increment global trial counter

                    validateAndPush(
                        this.timeline,
                        testTrial,
                        `Test Block, Trial ${t}`
                    );
                }
            },
        };
        validateAndPush(timeline, testBlock, `Test Block Wrapper ${blockNum}`);
    }

    // Trial to save/print data for the current block
    const saveBlockDataTrial = {
        type: jsPsychCallFunction,
        func: function () {
            const blockData = jsPsych.data
                .get()
                .filter({ block_number: blockNum })
                .values(); // Get as array of objects
            console.log(`Data for block ${blockNum} to be saved:`, blockData);
            // In a real experiment, you would send 'blockData' to a server here.
            saveDataToServer({
                taskName: "metacognition-task",
                subjectID: subjectID,
                sessionID: sessionID,
                data: blockData,
                saveMethod: saveMethod,
                apiURL: apiURL,
                apiPort: apiPort,
                apiEndpoint: apiEndpoint,
                firebaseCollection: firebaseCollection,
                writeMode: "append", // Or 'overwrite' depending on desired behavior for block data
                consolidateData: CONFIG.data.consolidateData,
                saveRawData: CONFIG.data.saveRawData,
            });
        },
        data: {
            trial_type: "save_block_data",
            block_number: blockNum,
        },
    };
    validateAndPush(
        timeline,
        saveBlockDataTrial,
        `Save Data for Block ${blockNum}`
    );

    // Add break screen if not the last block
    if (block < numBlocksToRun - 1) {
        validateAndPush(
            timeline,
            createBreakScreen(blockNum, numBlocksToRun),
            `Break Screen after Block ${blockNum}`
        );
    }
}

// Final feedback - Using the same approach
const finalFeedbackNode = {
    type: jsPsychHtmlButtonResponse, // Directly using the type
    stimulus: function () {
        const allTrials = jsPsych.data
            .get()
            .filter({ trial_type: "dot_response" });
        const learningTrials = allTrials.filter({ is_practice: false });
        const correctTrials = learningTrials.filter({ correct: 1 }).count();
        let totalAccuracy = 0;
        if (learningTrials.count() > 0) {
            totalAccuracy = correctTrials / learningTrials.count();
        }

        return `
            <div class="max-w-xl mx-auto">
            <h2 class="text-2xl font-bold mb-4">Experiment Complete</h2>
            <p class="mb-4">Thank you for participating in this study!</p>
            ${
                CONFIG.instructions.show_debrief
                ? `<p class="mb-4">The aim of this study is to understand how people form general feelings of self-confidence, and how this relates to self-confidence about individual decisions.</p>`
                : ""
            }
            </div>
        `;
    },
    choices: ["Finish"],
    data: {
        trial_type: "experiment_feedback",
    },
    on_finish: function (data) {
        // Calculate and store data in finish callback
        const allTrials = jsPsych.data
            .get()
            .filter({ trial_type: "dot_response" });
        const learningTrials = allTrials.filter({ is_practice: false });
        const correctTrials = learningTrials.filter({ correct: 1 }).count();
        let totalAccuracy = 0;
        if (learningTrials.count() > 0) {
            totalAccuracy = correctTrials / learningTrials.count();
        }
        data.total_accuracy = totalAccuracy;
        data.total_points = Math.round(totalAccuracy * 100);
        if (!CONFIG.task.skipTestBlock) {
            // Store bonus points only if test blocks were part of the experiment
            data.bonus_points = Math.round(totalAccuracy * 50); // Placeholder calculation
        } else {
            data.bonus_points = 0;
        }

        // Add staircase summary to final data
        data.staircase_summary = getStaircaseSummary();
    },
};
validateAndPush(timeline, finalFeedbackNode, "Final Feedback");

// Check for empty timeline nodes
timeline.forEach((trial, index) => {
    if (trial === undefined || trial === null) {
        console.error(
            `Timeline entry at index ${index} is empty or undefined.`
        );
    } else if (typeof trial !== "object") {
        console.error(
            `Timeline entry at index ${index} is not an object:`,
            trial
        );
    }
    // If it's a function, check that it returns a valid object
    if (typeof trial === "function") {
        const result = trial();
        if (
            result === undefined ||
            result === null ||
            typeof result !== "object"
        ) {
            console.error(
                `Function at index ${index} did not return a valid object:`,
                result
            );
        }
    }
});

console.log(timeline);

// Comment out timeline.splice(3) for complete testing
// timeline.splice(3);

// Run the experiment
jsPsych.run(timeline);
