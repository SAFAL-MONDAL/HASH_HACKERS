// Get DOM elements
const fileInput = document.getElementById('fileInput');
const uploadButton = document.getElementById('uploadButton');
const resultContainer = document.getElementById('result');
const fileHashDisplay = document.getElementById('fileHash');

// Function to calculate SHA-256 hash
async function calculateSHA256(file) {
    const arrayBuffer = await file.arrayBuffer(); // Convert file to ArrayBuffer
    const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer); // Calculate hash
    const hashArray = Array.from(new Uint8Array(hashBuffer)); // Convert buffer to byte array
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join(''); // Convert bytes to hex
}

// Handle file upload
uploadButton.addEventListener('click', async () => {
    const file = fileInput.files[0]; // Get the selected file
    if (!file) {
        alert('Please select a file to upload.');
        return;
    }

    // Calculate SHA-256 hash
    const hash = await calculateSHA256(file);

    // Display the hash
    fileHashDisplay.textContent = hash;
    resultContainer.classList.remove('hidden'); // Show the result
});
