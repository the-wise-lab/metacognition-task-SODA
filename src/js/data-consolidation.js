// Data consolidation utilities for the metacognition task

/**
 * Consolidates trial data by grouping components that share the same trial_number
 * @param {Array} rawData - Array of all jsPsych data entries
 * @returns {Array} - Single array containing consolidated trials and performance ratings
 */
export function consolidateTrialData(rawData) {
    const consolidatedTrials = [];
    const performanceRatings = [];
    
    // Group data by trial_number for consolidation
    const trialGroups = {};
    
    // Separate different types of data
    rawData.forEach(entry => {
        if (entry.trial_component === 'performance_rating') {
            performanceRatings.push(entry);
        } else if (entry.trial_number !== undefined && entry.trial_number !== null) {
            // This is a trial component with a trial number
            if (!trialGroups[entry.trial_number]) {
                trialGroups[entry.trial_number] = [];
            }
            trialGroups[entry.trial_number].push(entry);
        }
        // Skip other data (instructions, feedback, etc.)
    });
    
    // Consolidate each trial group
    Object.keys(trialGroups).forEach(trialNumber => {
        const trialComponents = trialGroups[trialNumber];
        const consolidatedTrial = consolidateTrialComponents(trialComponents, parseInt(trialNumber));
        if (consolidatedTrial) {
            consolidatedTrials.push(consolidatedTrial);
        }
    });
    
    // Sort consolidated trials by trial number
    consolidatedTrials.sort((a, b) => a.trial_number - b.trial_number);
    
    // Process performance ratings
    const processedRatings = processPerformanceRatings(performanceRatings);
    
    // Combine consolidated trials and performance ratings into single array
    return [...consolidatedTrials, ...processedRatings];
}

/**
 * Consolidates components of a single trial into one unified trial object
 * @param {Array} components - Array of trial components with same trial_number
 * @param {number} trialNumber - The trial number
 * @returns {Object|null} - Consolidated trial object or null if invalid
 */
function consolidateTrialComponents(components, trialNumber) {
    if (!components || components.length === 0) {
        return null;
    }

    // Find key components
    const dotDisplay = components.find(c => c.trial_component === 'dot_display');
    const dotResponse = components.find(c => c.trial_component === 'dot_response');
    const confidenceRating = components.find(c => c.trial_component === 'confidence_rating');

    // Must have at least dot_display and dot_response
    if (!dotDisplay || !dotResponse) {
        console.warn(`Trial ${trialNumber} missing required components`);
        return null;
    }
    
    // Build consolidated trial object
    const consolidatedTrial = {
        // Basic trial information
        trial_number: trialNumber,
        trial_type: 'dot_task',
        trial_index: dotResponse.trial_index, // Use response trial_index as main reference
        time_elapsed: dotResponse.time_elapsed,
        
        // Task settings (from dot_display)
        task_index: dotDisplay.task_index,
        task_color: dotDisplay.task_color,
        block_number: dotDisplay.block_number,
        is_easy: dotDisplay.is_easy,
        has_feedback: dotDisplay.has_feedback,
        is_practice: dotDisplay.is_practice,
        
        // Trial-specific information
        more_side: dotDisplay.more_side, // 0 = left, 1 = right (which side had more dots)
    dot_difference: dotDisplay.dot_difference,
    staircase_method: dotDisplay.staircase_method || null,
    staircase_target_rate: dotDisplay.target_rate ?? null,
    quest_alpha_map: dotDisplay.alpha_map ?? null,
    quest_entropy: dotDisplay.entropy ?? null,
    quest_beta: dotDisplay.beta ?? null,
    quest_lapse: dotDisplay.lapse ?? null,
    quest_guess: dotDisplay.guess ?? null,
        
        // Response data (from dot_response)
        response_key: dotResponse.response,
        response_side: dotResponse.response_side, // 0 = left, 1 = right (which side user chose)
        response_rt: dotResponse.rt,
        correct: dotResponse.correct, // 1 if correct, 0 if incorrect
        response_matches_more_side: dotResponse.correct === 1, // Boolean for clarity
        
        // Confidence data (from confidence_rating, if present)
        confidence_rating: confidenceRating ? confidenceRating.response : null,
        confidence_rt: confidenceRating ? confidenceRating.rt : null,
        
        // Updated staircase values (from dot_response)
    new_dot_difference: dotResponse.new_dot_difference,
        
        // Timing information for the whole trial
        trial_start_time: Math.min(...components.map(c => c.time_elapsed - (c.rt || 0))),
        trial_end_time: Math.max(...components.map(c => c.time_elapsed))
    };
    
    // Add trial duration
    consolidatedTrial.trial_duration = consolidatedTrial.trial_end_time - consolidatedTrial.trial_start_time;
    
    return consolidatedTrial;
}

/**
 * Processes performance rating data to make it more readable
 * @param {Array} performanceRatings - Array of performance rating entries
 * @returns {Array} - Processed performance ratings
 */
function processPerformanceRatings(performanceRatings) {
    return performanceRatings.map(rating => ({
        trial_type: 'performance_rating',
        trial_index: rating.trial_index,
        time_elapsed: rating.time_elapsed,
        block_number: rating.block_number,
        task_color: rating.task_color,
        task_type: rating.task_type,
        task_index: rating.task_index,
        performance_estimate: rating.response,
        performance_rt: rating.rt,
        trial_number: rating.trial_number || null
    }));
}