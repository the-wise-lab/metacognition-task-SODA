// Simple test to verify staircase functionality
import { initializeStaircases, getCurrentDotDifference, updateStaircase, getStaircaseSummary } from './src/js/staircase.js';

// Mock config for testing
const mockConfig = {
    staircase: {
        initialValue: 100,
        stepSize: 10,
        minValue: 20,
        maxValue: 200,
        easy: {
            targetCorrectRate: 0.85,
            nUp: 1,
            nDown: 4
        },
        difficult: {
            targetCorrectRate: 0.71,
            nUp: 1,
            nDown: 2
        }
    }
};

// Test the staircase
console.log("Testing Staircase Implementation...");

initializeStaircases(mockConfig);

console.log("Initial values:");
console.log("Easy:", getCurrentDotDifference(true));
console.log("Difficult:", getCurrentDotDifference(false));

// Simulate some responses for easy condition
console.log("\nSimulating easy condition responses (1 up, 4 down for 85% target):");
for (let i = 0; i < 10; i++) {
    const isCorrect = Math.random() < 0.85; // Simulate 85% accuracy
    const newValue = updateStaircase(true, isCorrect);
    console.log(`Trial ${i + 1}: ${isCorrect ? 'Correct' : 'Incorrect'} -> Dot difference: ${newValue}`);
}

// Simulate some responses for difficult condition
console.log("\nSimulating difficult condition responses (1 up, 2 down for 71% target):");
for (let i = 0; i < 10; i++) {
    const isCorrect = Math.random() < 0.71; // Simulate 71% accuracy
    const newValue = updateStaircase(false, isCorrect);
    console.log(`Trial ${i + 1}: ${isCorrect ? 'Correct' : 'Incorrect'} -> Dot difference: ${newValue}`);
}

// Get summary
console.log("\nFinal Summary:");
const summary = getStaircaseSummary();
console.log("Easy condition summary:", summary.easy);
console.log("Difficult condition summary:", summary.difficult);

console.log("\nTest completed successfully!");
