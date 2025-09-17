// This file contains configuration settings for the metacognition task experiment

const CONFIG = {
    // Timing parameters (in milliseconds)
    timing: {
        colorCueDuration: 1200,
        stimulusDuration: 300,
        highlightDuration: 300,
        feedbackDuration: 1500,
        itiDuration: 600,
        itiJitter: 200, // +/- jitter for ITI
        practiceStimulusDuration: 1000 // longer duration for practice trials
    },
    
    // Task parameters
    task: {
        // Trial counts
        learningBlockTrials: 24, // 12 per task
        testBlockTrials: 1,  
        practiceTrialsPerTask: 5, // This is doubled - this is the number of "pairs", i.e., the two difficulty levels
        maxConsecutiveSameTask: 3,
        skipTestBlock: true, // Set to true to skip test blocks and task choice
        
        // Dot parameters
        baseDotsPerBox: 313, // half-filled box (out of 625 positions)
        
        // Staircase parameters
        staircase: {
            initialValue: 40,    // Starting dot difference
            stepSize: 2,         // Amount to change on each adjustment
            minValue: 2,         // Minimum dot difference
            maxValue: 100,        // Maximum dot difference
            logging: false,        // Enable/disable console logging of staircase updates
            easy: {
                targetCorrectRate: 0.85,  // Target 85% accuracy
                nUp: 1,                   // 1 correct to decrease difficulty
                nDown: 4                  // 4 incorrect to increase difficulty (1 up 4 down)
            },
            difficult: {
                targetCorrectRate: 0.71,  // Target 71% accuracy
                nUp: 1,                   // 1 correct to decrease difficulty
                nDown: 2                  // 2 incorrect to increase difficulty (1 up 2 down)
            }
        },
        gridSize: 25, // 25x25 grid = 625 positions
        boxWidthPercent: 0.3, // Percentage of canvas width for each box (adjust for size)
        boxGapPercent: 0.2, // Percentage of canvas width for the gap between boxes
        
        // Response keys
        responseKeys: {
            left: 'z',
            right: 'm'
        },
        
        // Task choice keys (different from perceptual decision keys)
        taskChoiceKeys: {
            left: 'c',
            right: 'n'
        }
    },
    
    // Color cues for tasks - pairs for each block
    // Each block uses a pair of colors from this list
    colors: [
        ['#7AC600', '#0E55A8'],
        ['#c4c700', '#780eaa'], 
        ['#0021c7', '#6baa0e'],
        ['#0085c7', '#aa0e0e'],
        ['#00c7b0', '#aa0e88'],
        ['#1a9cff', '#fea62a'],
        // ['#b42afe', '#1affd9'], 
        // ['#432afe', '#ffd91a'], 
        // ['#fe2a90', '#4bff1a'],
        // ['#2afe9b', '#ff881a'], 
        // ['#f0ff1a', '#fe2aa6'],
        // ['#00ad1d', '#9800a3']
    ], 
    
    // Define specific colors for practice trials (used in main.js and instructions.js)
    practiceTaskColors: ['#FF69B4', '#1E90FF'], // Pink and Blue for practice

    // Confidence and performance rating scales
    ratingScale: {
        min: 50,
        max: 100,
        step: 1,
        tickMarks: [50, 60, 70, 80, 90, 100],
        tickLabels: ['50% (chance)', '', '', '', '', '100% (perfect)']
    },

    instructions: {
        show_debrief: true,
        redirect_url: 'https://app.prolific.com/submissions/complete?cc=CBST3BVG'
    },

    // Data saving and consolidation settings
    data: {
        consolidateData: true,  // Consolidate trial components into single entries
        saveRawData: false      // Also save raw jsPsych data alongside consolidated data
    }
};

export default CONFIG;