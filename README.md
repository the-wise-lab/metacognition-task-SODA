# Metacognition task

This repository implements a variant of the local/global confidence task reported in [Rouault et al. (2019)](https://www.nature.com/articles/s41467-019-09075-3), shown to be associated with anxiety and depression in [Katyal et al. (2025)](https://www.nature.com/articles/s41467-025-57040-0).

This is a simplified variant of the task, which follows this structure:

1. **Instructions**: Participants are presented with instructions on how to perform the task.
2. **Practice**: Participants complete a practice block of 10 trials to familiarize themselves with the task.
3. **Task**: This contains two phases, with 12 blocks:
   - **Learning**: Participants are presented with a series of trials where they indicate which of two boxes contains more dots. These are drawn from two sets (indicated by a colour probe), one of which is harder and one of which is easier to discriminate.
   - **Global confidence ratings**: At the end of each block participants are asked to rate their confidence in their performance on each of the two sets.

The task differs from the original in that we ask only for global confidence ratings, rather than bonus task preference. We also intermix feedback/no feedback trials and the two stimulus sets, rather than manipulating these factorially.

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
