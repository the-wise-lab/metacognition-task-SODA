/**
 * Saves data to the server using the Fetch API.
 * @param {object} saveData - The data object to save.
 * Expected structure for saveData:
 * {
 *   taskName: string, (e.g., 'metacognition-task')
 *   subjectID: string | null,
 *   sessionID: string | null,
 *   data: array, (trial-by-trial data or block data)
 *   apiURL: string, (e.g., '127.0.0.1')
 *   apiPort: string, (e.g., '5000')
 *   apiEndpoint: string, (e.g., '/submit_data')
 *   writeMode: string (e.g., 'overwrite', 'append')
 * }
 */
export function saveDataToServer(saveData) {
    const { 
        taskName = 'default_task',
        subjectID = 'default_id',
        sessionID = 'none',
        data = [],
        apiURL = '127.0.0.1',
        apiPort = '5000',
        apiEndpoint = '/submit_data',
        writeMode = 'overwrite'
    } = saveData;

    // Format the data for the API request, similar to the provided example
    const requestData = {
        task: taskName,
        id: subjectID,
        session: sessionID,
        write_mode: writeMode,
        data: data // jsPsych data is already an array of objects, so direct assignment is fine
    };

    console.log('Data to be sent to server:', requestData);

    // Construct the complete URL
    const fullApiUrl = `http://${apiURL}${apiPort ? `:${apiPort}` : ''}${apiEndpoint}`;

    console.log(`Attempting to save data to: ${fullApiUrl}`);

    // Make the POST request to the API endpoint
    return fetch(fullApiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
    })
    .then(response => {
        if (!response.ok) {
            // Try to parse the error response body for more details
            return response.text().then(text => {
                throw new Error(`HTTP error! Status: ${response.status}, Body: ${text}`);
            });
        }
        return response.json();
    })
    .then(responseData => {
        console.log('Data successfully saved to API:', responseData);
        return responseData;
    })
    .catch(error => {
        console.error('Error saving data to API:', error);
        // Handle errors, perhaps by trying to save locally or alerting the user.
        // For now, just re-throw the error so the calling function can be aware.
        throw error;
    });
}
