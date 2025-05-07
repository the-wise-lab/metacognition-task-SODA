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
        learningBlockTrials: 20, // 12 per task
        testBlockTrials: 6,
        practiceTrialsPerTask: 2,
        maxConsecutiveSameTask: 3,
        skipTestBlock: true, // Set to true to skip test blocks and task choice
        
        // Dot parameters
        baseDotsPerBox: 313, // half-filled box (out of 625 positions)
        difficultDotDifference: 24, // +24 dots (target ~70% accuracy)
        easyDotDifference: 58,    // +58 dots (target ~85% accuracy)
        gridSize: 25, // 25x25 grid = 625 positions
        boxWidthPercent: 0.2, // Percentage of canvas width for each box (adjust for size)
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
        ['#b42afe', '#1affd9'], 
        ['#432afe', '#ffd91a'], 
        ['#fe2a90', '#4bff1a'],
        ['#2afe9b', '#ff881a'], 
        ['#f0ff1a', '#fe2aa6'],
        ['#00ad1d', '#9800a3']
    ], // Shuffling removed, will be done in main.js
    
    // Define specific colors for practice trials (used in main.js and instructions.js)
    practiceTaskColors: ['#FF69B4', '#1E90FF'], // Pink and Blue for practice

    // Confidence and performance rating scales
    ratingScale: {
        min: 50,
        max: 100,
        step: 1,
        tickMarks: [50, 60, 70, 80, 90, 100],
        tickLabels: ['50% (chance)', '', '', '', '', '100% (perfect)']
    }
};

export default CONFIG;