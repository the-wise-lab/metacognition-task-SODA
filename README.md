# Metacognition task

This repository implements a variant of the local/global confidence task reported in [Rouault et al. (2019)](https://www.nature.com/articles/s41467-019-09075-3), shown to be associated with anxiety and depression in [Katyal et al. (2025)](https://www.nature.com/articles/s41467-025-57040-0).

This is a simplified variant of the task, which follows this structure:

1. **Instructions**: Participants are presented with instructions on how to perform the task.
2. **Practice**: Participants complete a practice block of 10 trials to familiarize themselves with the task.
3. **Task**: This contains two phases, with 12 blocks:
   - **Learning**: Participants are presented with a series of trials where they indicate which of two boxes contains more dots. These are drawn from two sets (indicated by a colour probe), one of which is harder and one of which is easier to discriminate.
   - **Global confidence ratings**: At the end of each block participants are asked to rate their confidence in their performance on each of the two sets.

The task differs from the original in that we ask only for global confidence ratings, rather than bonus task preference. 

## Adaptive Staircase Procedure

This implementation uses an adaptive staircase procedure to dynamically adjust task difficulty and maintain target accuracy levels for each participant. This ensures consistent performance levels across participants while providing personalized difficulty.

### Staircase Configuration

The task maintains **two separate staircases**:

- **Easy condition**: Targets 85% accuracy using a 1-up-4-down procedure
- **Difficult condition**: Targets 71% accuracy using a 1-up-2-down procedure

### Parameters

- **Initial dot difference**: 100 dots
- **Step size**: 10 dots per adjustment
- **Bounds**: 20-200 dots (minimum-maximum)
- **Adjustment rules**:
  - After 1 correct response → decrease difficulty (reduce dot difference)
  - After N incorrect responses → increase difficulty (increase dot difference)
    - N = 4 for easy condition
    - N = 2 for difficult condition

### How it Works

1. **Initialization**: Both staircases start at 100 dots difference
2. **Practice trials**: Include both easy and difficult trials that actively update and initialize the staircases
3. **Continuous adaptation**: Throughout the experiment, each trial (including practice) updates the appropriate staircase based on the participant's response
4. **State maintenance**: Staircase state is preserved across all blocks (no reset between blocks)
5. **Data logging**: Comprehensive tracking of staircase progression, including:
   - Current dot difference for each trial
   - Running accuracy for each condition
   - Number of reversals
   - Complete value history
6. **Console logging**: Optional real-time logging to browser console showing staircase updates (can be enabled/disabled in config)

### Theoretical Background

The staircase procedure implements a **weighted up/down method** (Kaernbach, 1991) where the ratio of up/down steps determines the target accuracy:

- **1-up-4-down** converges to ~79.4% 
- **1-up-2-down** converges to ~70.7% 

This approach ensures that participants perform at consistent difficulty levels while accommodating individual differences in perceptual sensitivity.

### Implementation Details

The staircase implementation is contained in `src/js/staircase.js` and includes:

- **`Staircase` class**: Core implementation with response tracking and difficulty adjustment
- **Global state management**: Maintains separate easy/difficult condition staircases
- **Integration with trials**: Automatic updating based on participant responses
- **Comprehensive logging**: Trial-by-trial staircase state and summary statistics

Configuration is handled in `src/js/config.js` under the `task.staircase` section, allowing easy adjustment of parameters for different experimental requirements.

## Running the task

You can access the landing page [here](https://the-wise-lab.github.io/metacognition-task-SODA/landing.html).

This landing page allows you to set the following URL parameters before starting the experiment:

- `subjectID`: A unique identifier for the participant.
- `sessionID`: An identifier for the session (e.g., 1, 2, 3).
- `test_mode`: If set to `true`, the experiment runs in a shortened test mode (e.g., fewer blocks and trials).
- `skip_instructions`: If set to `true`, the initial instruction screens are skipped.
- `skip_practice`: If set to `true`, the practice trials are skipped.
- `apiURL`: The base URL of the data-saving server (default: `127.0.0.1`).
- `apiPort`: The port number for the data-saving server (default: `5000`).
- `apiEndpoint`: The specific endpoint on the server for submitting data (default: `/submit_data`).

These parameters will be appended to the URL when redirecting to `index.html`, allowing the experiment script to configure itself accordingly.
