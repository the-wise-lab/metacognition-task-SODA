# Metacognition Task Experiment

This project implements a metacognition task using JSPsych and Tailwind CSS for styling. The task is designed to investigate participants' self-performance estimates (SPEs) through a series of perceptual judgment trials.

## Project Structure

- **index.html**: Main HTML entry point for the application.
- **src/js/**: Contains JavaScript files for the experiment logic.
  - **main.js**: Initializes the experiment and manages the JSPsych timeline.
  - **config.js**: Configuration settings for trial parameters and feedback messages.
  - **utils.js**: Utility functions for randomization and data management.
  - **components/**: Modular components for different parts of the experiment.
    - **instructions.js**: Displays instructions for participants.
    - **trial.js**: Defines the trial structure and response collection.
    - **feedback.js**: Displays feedback after each trial.
    - **confidence-rating.js**: Presents a confidence rating scale.
    - **task-choice.js**: Allows participants to choose their preferred task.
    - **performance-rating.js**: Collects overall performance ratings.
- **src/css/**: Contains custom styles for the application.
  - **custom.css**: Tailwind CSS styles for responsive design.
- **src/assets/stimuli/**: Contains definitions of stimuli used in the trials.
  - **dot-patterns.js**: Configurations for dot patterns in easy and difficult conditions.
- **data/**: Directory for storing data files.
- **lib/**: Directory for external libraries (currently empty).
- **.gitignore**: Specifies files and directories to ignore in version control.

## Setup Instructions

1. Clone the repository to your local machine.
2. Open `index.html` in a web browser to run the experiment.
3. Ensure you have an internet connection to load JSPsych and Tailwind CSS from the CDN.

## Usage

Participants will engage in a series of trials where they will make perceptual judgments about dot patterns. After each trial, they will receive feedback and be asked to rate their confidence in their responses. At the end of each learning block, participants will choose which task they believe they performed better on and provide overall performance ratings.

## Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue for any suggestions or improvements.

## License

This project is licensed under the MIT License. See the LICENSE file for more details.