// This file creates and exports the confidence rating component

import CONFIG from '../config.js';

/**
 * Create a confidence rating trial
 * @param {string} taskColor - The color associated with the task
 * @param {number} blockNum - The current block number
 * @returns {Object} JSPsych trial object for confidence rating
 */
function createConfidenceRating(taskColor, blockNum) {
    return {
        type: jsPsychHtmlSliderResponse,
        stimulus: `
            <div class="max-w-4xl text-2xl mx-auto mb-6">
                <p class="text-4xl mb-6">How confident are you that your response was correct?</p>
                <p class="text-2xl text-gray-600">Drag the slider to indicate your confidence</p>
                <div class="w-8 h-8 rounded-full mx-auto mt-4 mb-2" style="background-color:${taskColor};"></div>
            </div>
        `,
        labels: ['50% correct<br>(chance level)', '60%', '70%', '80%', '90%', '100% correct<br>(perfect)'],
        slider_width: 800,
        min: CONFIG.ratingScale.min,
        max: CONFIG.ratingScale.max,
        step: CONFIG.ratingScale.step,
        slider_start: CONFIG.ratingScale.min,
        require_movement: true,
        button_label: '<span class="text-2xl font-bold">Submit</span>',
        data: {
            trial_type: 'confidence_rating',
            block_number: blockNum, // Added blockNum
            task_color: taskColor
        },
        on_load: function() {
            const sliderElement = document.querySelector('#jspsych-html-slider-response-response'); // Get the slider input
            const sliderWrapper = document.querySelector('#jspsych-html-slider-response-wrapper'); // Wrapper div created by plugin

            // Set text size for labels
            sliderWrapper.style.fontSize = '1.5rem'; // Set font size for labels

            if (!sliderElement || !sliderWrapper) {
                console.error("Slider elements not found for tick mark positioning.");
                return;
            }

            // --- Create container for visual tick marks ---
            const visualTicksContainer = document.createElement('div');
            const sliderWidth = sliderElement.offsetWidth || CONFIG.ratingScale.slider_width || 800; // Use actual or configured width
            visualTicksContainer.style.position = 'relative'; // Relative positioning for children
            visualTicksContainer.style.width = `${sliderWidth}px`;
            visualTicksContainer.style.height = '10px'; // Height for tick lines
            visualTicksContainer.style.margin = '0 auto'; // Center the container
            // Position it slightly above the slider track, adjust as needed
            visualTicksContainer.style.marginTop = '-15px'; 
            visualTicksContainer.style.marginBottom = '5px'; // Space between ticks and slider

            const numberOfLabels = CONFIG.ratingScale.tickMarks.length; // Use tickMarks from config for consistency
            const numberOfGaps = numberOfLabels - 1;

            // Add visual tick lines corresponding to each label position
            for (let i = 0; i < numberOfLabels; i++) {
                const tickMarkLine = document.createElement('div');
                tickMarkLine.style.position = 'absolute';
                tickMarkLine.style.width = '1px'; // Width of the tick line
                tickMarkLine.style.height = '8px'; // Height of the tick line
                tickMarkLine.style.backgroundColor = '#9ca3af'; // gray-400
                
                // Calculate horizontal position - labels are evenly spaced
                const percentPosition = i / numberOfGaps;
                let leftPosition = percentPosition * sliderWidth;

                // Adjust endpoints slightly inward to align better with track ends
                if (i === 0) {
                    leftPosition += 1; // Small adjustment inward
                } else if (i === numberOfGaps) {
                    leftPosition -= 1; // Small adjustment inward
                }
                
                tickMarkLine.style.left = `${leftPosition}px`;
                // Center the line itself horizontally over the calculated position
                tickMarkLine.style.transform = 'translateX(-50%)'; 
                tickMarkLine.style.top = '0';

                visualTicksContainer.appendChild(tickMarkLine);
            }
            
            // Insert the visual ticks container before the slider input element
            sliderElement.parentNode.insertBefore(visualTicksContainer, sliderElement.nextSibling);

            // --- Handle thumb visibility (existing code) ---
            if (sliderElement) {
                 const showThumb = () => {
                    sliderElement.classList.add('thumb-visible');
                };
                sliderElement.addEventListener('mousedown', showThumb, { once: true }); 
                sliderElement.addEventListener('touchstart', showThumb, { once: true }); 
            } else {
                console.error("Could not find slider element to attach thumb visibility listener.");
            }
        }
    };
}

export { createConfidenceRating };