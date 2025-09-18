// Firebase imports (using v9 modular SDK)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
    getFirestore,
    collection,
    addDoc,
    setDoc,
    doc,
    updateDoc,
    arrayUnion,
    serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Import data consolidation utilities
import { consolidateTrialData } from './data-consolidation.js';
import CONFIG from './config.js';

// Firebase configuration (replace with your actual config)
const firebaseConfig = {
    apiKey: "AIzaSyDf9ZvBdhn7vEV2ZVkUe5aFrCvJy1EvSac",

    authDomain: "onlinetesting-96dd3.firebaseapp.com",

    databaseURL: "https://onlinetesting-96dd3.firebaseio.com",

    projectId: "onlinetesting-96dd3",

    storageBucket: "onlinetesting-96dd3.appspot.com",

    messagingSenderId: "855612276612",

    appId: "1:855612276612:web:ea6f80c5e0c8e3251627d1",
};

// Initialize Firebase
let firebaseApp = null;
let firestore = null;

try {
    firebaseApp = initializeApp(firebaseConfig);
    firestore = getFirestore(firebaseApp);
    // console.log("Firebase initialized successfully");
} catch (error) {
    console.warn("Firebase initialization failed:", error);
    console.warn("Firebase features will be disabled");
}

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
 *   saveMethod: string (e.g., 'http', 'firebase') - defaults to 'http'
 *   firebaseCollection: string - DEPRECATED: Firebase now uses fixed path structure
 * }
 *
 * Firebase data is stored at: metacognition/metacognition_pilot/subjects/{subjectID}_{sessionID}
 */
/**
 * Saves data to Firebase Firestore database.
 * Data is stored in the path: metacognition/metacognition_pilot/subjects/{subjectID}_{sessionID}
 * @param {object} saveData - The data object to save.
 * @returns {Promise} - Promise that resolves when data is saved
 */
export function saveDataToFirebase(saveData) {
    const {
        taskName = "default_task",
        subjectID = "default_id",
        sessionID = "none",
        data = [],
        writeMode = "append",
        // Note: firebaseCollection parameter removed - using fixed path structure
    } = saveData;

    const verbose = !!(CONFIG?.data?.verboseSave);
    if (!firestore) {
        throw new Error("Firebase not initialized. Check your configuration.");
    }

    // Always use a consistent document ID based on subjectID and sessionID
    const docId = `${subjectID}_${sessionID}`;
    const docRef = doc(
        firestore,
        "metacognition",
        "metacognition_pilot",
        "subjects",
        docId
    );


    if (verbose) {
        console.log(`[save/firebase] Preparing ${writeMode} to ${subjectID}_${sessionID}`);
        const preview = Array.isArray(data) ? data : (typeof data === 'object' ? { ...data, data: undefined } : data);
        console.log(`[save/firebase] Payload preview:`, preview);
    }

    if (writeMode === "overwrite") {
        // Overwrite mode: Replace entire document
        const documentData = {
            task: taskName,
            subjectID: subjectID,
            sessionID: sessionID,
            writeMode: writeMode,
            data: data,
            timestamp: serverTimestamp(),
            userAgent: navigator.userAgent,
            url: window.location.href,
        };

        // console.log("Data to be sent to Firebase (overwrite):", documentData);

        if (verbose) console.log(`[save/firebase] setDoc…`);
        return setDoc(docRef, documentData)
            .then(() => {
                if (verbose) console.log(`[save/firebase] setDoc OK: ${docId}`);
                return {
                    success: true,
                    documentId: docId,
                    method: "overwrite",
                    path: `metacognition/metacognition_pilot/subjects/${docId}`,
                };
            })
            .catch((error) => {
                console.error("Error overwriting data in Firebase:", error);
                throw error;
            });
    } else {
        // Append mode: Add new data to existing data array using arrayUnion
        // console.log("Data to be appended to Firebase:", data);

        // First, try to update the existing document by appending to the data array
        if (verbose) console.log(`[save/firebase] updateDoc (arrayUnion)…`);
        return updateDoc(docRef, {
            data: arrayUnion(...data),
            timestamp: serverTimestamp(),
            userAgent: navigator.userAgent,
            url: window.location.href,
        })
        .catch((error) => {
            // If document doesn't exist, create it with initial data
            if (error.code === 'not-found') {
                if (verbose) console.log(`[save/firebase] doc missing → setDoc (create)`);
                const documentData = {
                    task: taskName,
                    subjectID: subjectID,
                    sessionID: sessionID,
                    writeMode: writeMode,
                    data: data,
                    timestamp: serverTimestamp(),
                    userAgent: navigator.userAgent,
                    url: window.location.href,
                };
                return setDoc(docRef, documentData);
            } else {
                throw error;
            }
        })
        .then(() => {
            if (verbose) console.log(`[save/firebase] append OK: ${docId}`);
            return {
                success: true,
                documentId: docId,
                method: "append",
                path: `metacognition/metacognition_pilot/subjects/${docId}`,
            };
        })
        .catch((error) => {
            console.error("Error appending data to Firebase:", error);
            throw error;
        });
    }
}

export function saveDataToServer(saveData) {
    const {
        taskName = "default_task",
        subjectID = "default_id",
        sessionID = "none",
        data = [],
        apiURL = "127.0.0.1",
        apiPort = "5000",
        apiEndpoint = "/submit_data",
        writeMode = "overwrite",
        saveMethod = "http", // 'http' or 'firebase'
        firebaseCollection = "experiment-data",
        consolidateData = true, // Option to enable/disable data consolidation
        saveRawData = false, // Option to also save raw data alongside consolidated
    } = saveData;

    const verbose = !!(CONFIG?.data?.verboseSave);
    let processedData = data;
    
    // Consolidate trial data if requested
    if (consolidateData && Array.isArray(data) && data.length > 0) {
    if (verbose) console.log("[save] Consolidating trial data...");
        processedData = consolidateTrialData(data);
        
        // Optionally include raw data as well
        if (saveRawData) {
            processedData = {
                consolidated_data: processedData,
                raw_data: data
            };
        }
        
        if (verbose) console.log(`[save] Consolidation complete: ${data.length} → ${processedData.length || processedData.consolidated_data?.length}`);
    }

    // Route to appropriate save method
    if (saveMethod === "firebase") {
        if (verbose) console.log(`[save] Routing to Firebase…`);
        return saveDataToFirebase({
            taskName,
            subjectID,
            sessionID,
            data: processedData,
            writeMode,
            // Note: firebaseCollection parameter removed - using fixed path structure
        });
    } else if (saveMethod === "http") {
        if (verbose) console.log(`[save] Routing to HTTP…`);
        return saveDataToHTTP({
            taskName,
            subjectID,
            sessionID,
            data: processedData,
            apiURL,
            apiPort,
            apiEndpoint,
            writeMode,
        });
    } else {
        throw new Error(
            `Unsupported save method: ${saveMethod}. Use 'http' or 'firebase'.`
        );
    }
}

/**
 * Saves data to HTTP server (original functionality).
 * @param {object} saveData - The data object to save.
 * @returns {Promise} - Promise that resolves when data is saved
 */
export function saveDataToHTTP(saveData) {
    const {
        taskName = "default_task",
        subjectID = "default_id",
        sessionID = "none",
        data = [],
        apiURL = "127.0.0.1",
        apiPort = "5000",
        apiEndpoint = "/submit_data",
        writeMode = "overwrite",
    } = saveData;

    // Format the data for the API request, similar to the provided example
    const requestData = {
        task: taskName,
        id: subjectID,
        session: sessionID,
        write_mode: writeMode,
        data: data, // jsPsych data is already an array of objects, so direct assignment is fine
    };

    const verbose = !!(CONFIG?.data?.verboseSave);
    if (verbose) {
        console.log(`[save/http] POST ${apiURL}:${apiPort}${apiEndpoint}`);
        const preview = Array.isArray(data) ? data.slice(0, 2) : (typeof data === 'object' ? { ...data, data: undefined } : data);
        console.log(`[save/http] Payload preview:`, preview);
    }

    // Construct the complete URL
    const fullApiUrl = `http://${apiURL}${
        apiPort ? `:${apiPort}` : ""
    }${apiEndpoint}`;

    if (verbose) console.log(`Attempting to save data to: ${fullApiUrl}`);

    // Make the POST request to the API endpoint
    return fetch(fullApiUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
    })
        .then((response) => {
            if (!response.ok) {
                // Try to parse the error response body for more details
                return response.text().then((text) => {
                    throw new Error(
                        `HTTP error! Status: ${response.status}, Body: ${text}`
                    );
                });
            }
            return response.json();
        })
        .then((responseData) => {
            if (verbose) console.log("[save/http] OK:", responseData);
            return responseData;
        })
        .catch((error) => {
            console.error("Error saving data to API:", error);
            // Handle errors, perhaps by trying to save locally or alerting the user.
            // For now, just re-throw the error so the calling function can be aware.
            throw error;
        });
}
