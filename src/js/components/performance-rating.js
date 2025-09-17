// This file creates and exports the performance rating component
import CONFIG from '../config.js';

/**
 * Create a performance rating trial for explicit performance estimates
 * @param {Object} taskInfo - Object containing task information
 * @returns {Object} JSPsych timeline object for performance rating
 */
function createPerformanceRating(taskInfo) {
    const { color, type, index, blockNum, trialNumber } = taskInfo; // Added trialNumber
    
    return {
        type: jsPsychHtmlSliderResponse,
        stimulus: `
            <div class="max-w-4xl text-2xl mx-auto">
                <h3 class="text-4xl mb-4 text-center">Please rate your overall performance for this colour:</h3>
                <div class="w-16 h-16 rounded-full mx-auto mb-4" style="background-color:${color};"></div>
                <p class="text-2xl text-center text-gray-600 mb-6">
                    How well do you think you performed on this colour, from 50% (chance level) to 100% (perfect)?
                </p>
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
            trial_component: 'performance_rating',
            trial_number: trialNumber, // Added trial number
            block_number: blockNum, // Added blockNum
            task_color: color,
            task_type: type,
            task_index: index
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
            const sliderWidth = sliderElement.offsetWidth || CONFIG.ratingScale.slider_width || 500; // Use actual or configured width
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

export { createPerformanceRating };