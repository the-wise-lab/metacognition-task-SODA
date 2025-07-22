// This file implements the staircase procedure for the metacognition task

/**
 * Staircase class for adaptive difficulty adjustment
 */
class Staircase {
    constructor(targetCorrectRate, nUp, nDown, stepSize, initialValue, minValue, maxValue, enableLogging = false) {
        this.targetCorrectRate = targetCorrectRate;
        this.nUp = nUp;           // Number of correct responses needed to decrease difficulty (increase dots)
        this.nDown = nDown;       // Number of incorrect responses needed to increase difficulty (decrease dots)
        this.stepSize = stepSize;
        this.currentValue = initialValue;
        this.minValue = minValue;
        this.maxValue = maxValue;
        this.enableLogging = enableLogging;
        
        // Response tracking
        this.responses = [];      // Array of boolean values (true = correct, false = incorrect)
        this.consecutiveCorrect = 0;
        this.consecutiveIncorrect = 0;
        
        // History tracking
        this.valueHistory = [initialValue];
        this.reversalPoints = [];
        this.totalTrials = 0;
        this.correctTrials = 0;
        
        if (this.enableLogging) {
            console.log(`🎯 Staircase initialized: Target ${Math.round(targetCorrectRate * 100)}% accuracy, ${nUp}-up-${nDown}-down, Initial value: ${initialValue}`);
        }
    }

    /**
     * Add a response and update the staircase
     * @param {boolean} correct - Whether the response was correct
     * @returns {number} - The new staircase value
     */
    addResponse(correct) {
        this.responses.push(correct);
        this.totalTrials++;
        const previousValue = this.currentValue;
        
        if (correct) {
            this.correctTrials++;
            this.consecutiveCorrect++;
            this.consecutiveIncorrect = 0;
            
            if (this.enableLogging) {
                console.log(`✅ Trial ${this.totalTrials}: CORRECT | Consecutive correct: ${this.consecutiveCorrect}/${this.nUp} | Current accuracy: ${Math.round(this.getCurrentAccuracy() * 100)}%`);
            }
            
            // Check if we should make task harder (decrease dot difference)
            if (this.consecutiveCorrect >= this.nUp) {
                this.adjustDifficulty(false); // Make harder (decrease dots)
                this.consecutiveCorrect = 0;
                
                if (this.enableLogging) {
                    console.log(`🔽 Making task HARDER: ${previousValue} → ${this.currentValue} dots (${this.nUp} correct responses reached)`);
                }
            }
        } else {
            this.consecutiveIncorrect++;
            this.consecutiveCorrect = 0;
            
            if (this.enableLogging) {
                console.log(`❌ Trial ${this.totalTrials}: INCORRECT | Consecutive incorrect: ${this.consecutiveIncorrect}/${this.nDown} | Current accuracy: ${Math.round(this.getCurrentAccuracy() * 100)}%`);
            }
            
            // Check if we should make task easier (increase dot difference)
            if (this.consecutiveIncorrect >= this.nDown) {
                this.adjustDifficulty(true); // Make easier (increase dots)
                this.consecutiveIncorrect = 0;
                
                if (this.enableLogging) {
                    console.log(`🔼 Making task EASIER: ${previousValue} → ${this.currentValue} dots (${this.nDown} incorrect responses reached)`);
                }
            }
        }
        
        if (this.enableLogging && this.currentValue === previousValue) {
            console.log(`➡️  No difficulty change: staying at ${this.currentValue} dots`);
        }
        
        return this.currentValue;
    }

    /**
     * Adjust the difficulty level
     * @param {boolean} makeEasier - Whether to make the task easier (true) or harder (false)
     */
    adjustDifficulty(makeEasier) {
        const previousValue = this.currentValue;
        const requestedValue = makeEasier ? 
            this.currentValue + this.stepSize : 
            this.currentValue - this.stepSize;
        
        if (makeEasier) {
            // Make task easier by increasing dot difference
            this.currentValue = Math.min(this.currentValue + this.stepSize, this.maxValue);
        } else {
            // Make task harder by decreasing dot difference
            this.currentValue = Math.max(this.currentValue - this.stepSize, this.minValue);
        }
        
        // Log if we hit a bound
        if (this.enableLogging) {
            if (requestedValue !== this.currentValue) {
                const boundType = this.currentValue === this.maxValue ? 'maximum' : 'minimum';
                console.log(`⚠️  Hit ${boundType} bound: requested ${requestedValue}, clamped to ${this.currentValue}`);
            }
        }
        
        // Record reversal point if direction changed
        const directionChanged = (makeEasier && this.valueHistory.length > 1 && 
                                this.valueHistory[this.valueHistory.length - 1] < previousValue) ||
                               (!makeEasier && this.valueHistory.length > 1 && 
                                this.valueHistory[this.valueHistory.length - 1] > previousValue);
        
        if (directionChanged) {
            this.reversalPoints.push({
                trial: this.totalTrials,
                value: previousValue
            });
            
            if (this.enableLogging) {
                console.log(`🔄 REVERSAL detected at trial ${this.totalTrials} (reversal #${this.reversalPoints.length})`);
            }
        }
        
        this.valueHistory.push(this.currentValue);
    }

    /**
     * Get current difficulty value
     * @returns {number} - Current dot difference
     */
    getCurrentValue() {
        return this.currentValue;
    }

    /**
     * Get current accuracy rate
     * @returns {number} - Proportion correct (0-1)
     */
    getCurrentAccuracy() {
        if (this.totalTrials === 0) return 0;
        return this.correctTrials / this.totalTrials;
    }

    /**
     * Get staircase summary data
     * @returns {Object} - Summary statistics
     */
    getSummary() {
        return {
            targetCorrectRate: this.targetCorrectRate,
            nUp: this.nUp,
            nDown: this.nDown,
            stepSize: this.stepSize,
            initialValue: this.valueHistory[0],
            finalValue: this.currentValue,
            totalTrials: this.totalTrials,
            correctTrials: this.correctTrials,
            currentAccuracy: this.getCurrentAccuracy(),
            reversalCount: this.reversalPoints.length,
            valueHistory: [...this.valueHistory],
            reversalPoints: [...this.reversalPoints]
        };
    }

    /**
     * Reset consecutive counters (useful when switching between conditions)
     */
    resetCounters() {
        this.consecutiveCorrect = 0;
        this.consecutiveIncorrect = 0;
    }
}

/**
 * Global staircase instances
 */
let staircases = {
    easy: null,
    difficult: null
};

/**
 * Initialize staircases based on config
 * @param {Object} config - Staircase configuration
 */
function initializeStaircases(config) {
    const enableLogging = config.staircase.logging || false;
    
    if (enableLogging) {
        console.log('🔧 Initializing adaptive staircases...');
    }
    
    staircases.easy = new Staircase(
        config.staircase.easy.targetCorrectRate,
        config.staircase.easy.nUp,
        config.staircase.easy.nDown,
        config.staircase.stepSize,
        config.staircase.initialValue,
        config.staircase.minValue,
        config.staircase.maxValue,
        enableLogging
    );
    
    staircases.difficult = new Staircase(
        config.staircase.difficult.targetCorrectRate,
        config.staircase.difficult.nUp,
        config.staircase.difficult.nDown,
        config.staircase.stepSize,
        config.staircase.initialValue,
        config.staircase.minValue,
        config.staircase.maxValue,
        enableLogging
    );
    
    if (enableLogging) {
        console.log('✅ Staircases initialized successfully');
    }
}

/**
 * Get current dot difference for a given difficulty
 * @param {boolean} isEasy - Whether this is an easy or difficult trial
 * @returns {number} - Current dot difference
 */
function getCurrentDotDifference(isEasy) {
    const staircase = isEasy ? staircases.easy : staircases.difficult;
    if (!staircase) {
        throw new Error("Staircases not initialized. Call initializeStaircases() first.");
    }
    return staircase.getCurrentValue();
}

/**
 * Update staircase based on trial response
 * @param {boolean} isEasy - Whether this was an easy or difficult trial
 * @param {boolean} correct - Whether the response was correct
 * @returns {number} - New dot difference value
 */
function updateStaircase(isEasy, correct) {
    const staircase = isEasy ? staircases.easy : staircases.difficult;
    if (!staircase) {
        throw new Error("Staircases not initialized. Call initializeStaircases() first.");
    }
    
    if (staircase.enableLogging) {
        const conditionName = isEasy ? 'EASY' : 'DIFFICULT';
        console.log(`\n📊 Updating ${conditionName} staircase:`);
    }
    
    const newValue = staircase.addResponse(correct);
    
    if (staircase.enableLogging) {
        console.log(`📈 Current state: ${staircase.totalTrials} trials, ${staircase.reversalPoints.length} reversals\n`);
    }
    
    return newValue;
}

/**
 * Get staircase summary for data logging
 * @returns {Object} - Summary of both staircases
 */
function getStaircaseSummary() {
    return {
        easy: staircases.easy ? staircases.easy.getSummary() : null,
        difficult: staircases.difficult ? staircases.difficult.getSummary() : null
    };
}

/**
 * Get current state for data logging on each trial
 * @param {boolean} isEasy - Whether this is an easy or difficult trial
 * @returns {Object} - Current staircase state
 */
function getTrialStaircaseData(isEasy) {
    const staircase = isEasy ? staircases.easy : staircases.difficult;
    if (!staircase) {
        return {
            staircase_difficulty: isEasy ? 'easy' : 'difficult',
            dot_difference: null,
            staircase_trials: 0,
            staircase_accuracy: 0,
            staircase_reversals: 0
        };
    }
    
    return {
        staircase_difficulty: isEasy ? 'easy' : 'difficult',
        dot_difference: staircase.getCurrentValue(),
        staircase_trials: staircase.totalTrials,
        staircase_accuracy: staircase.getCurrentAccuracy(),
        staircase_reversals: staircase.reversalPoints.length,
        consecutive_correct: staircase.consecutiveCorrect,
        consecutive_incorrect: staircase.consecutiveIncorrect
    };
}

export { 
    Staircase,
    initializeStaircases, 
    getCurrentDotDifference, 
    updateStaircase, 
    getStaircaseSummary,
    getTrialStaircaseData
};
