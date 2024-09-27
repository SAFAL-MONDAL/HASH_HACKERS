require('dotenv').config();
const { create } = require('ipfs-http-client');
const { ethers } = require('ethers');
const fs = require('fs');
const inquirer = require('inquirer');
const path = require('path');

// Constants
const VALID_FILE_TYPES = ['.jpg', '.jpeg', '.png', '.gif', '.pdf', '.txt', '.doc', '.docx'];
const TRANSACTION_LOG_FILE = 'transaction_log.json';

// IPFS Setup
const ipfs = create({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' });

// Ethereum Setup
const provider = new ethers.providers.InfuraProvider('goerli', {
    projectId: process.env,374a7e9e0b9a40e6b91a7d26ab9e33f3,
    projectSecret: process.env.rRiaEhYXpYo+S2VOWrnASjiymzFHrdRJeBLKOzVZiFcw3W09gc/7Sg
});

// Your Ethereum wallet (ensure it's unlocked)
const wallet = new ethers.Wallet('your_private_key_here', provider); // Replace with your private key
const contractAddress = '0x20a2df929a75810ba920fde3702cf1f8bfe9d946';
const contractABI = [
    // Add your contract's ABI here
];

// Create a contract instance
const contract = new ethers.Contract(contractAddress, contractABI, wallet);

// Get File Path from User
const getFilePathFromUser = async () => {
    const answers = await inquirer.prompt([{
        type: 'input',
        name: 'filePath',
        message: 'Enter the path to the file you want to upload:',
        validate: (input) => {
            if (fs.existsSync(input)) {
                const ext = path.extname(input).toLowerCase();
                return VALID_FILE_TYPES.includes(ext) || 'Invalid file type. Please upload a valid file.';
            }
            return 'File not found, please enter a valid file path.';
        }
    }]);
    return answers.filePath;
};

// Log Transaction
const logTransaction = (cid, filePath) => {
    const logEntry = {
        cid,
        filePath,
        timestamp: new Date().toISOString()
    };
    let logData = [];

    // Load existing log data if file exists
    if (fs.existsSync(TRANSACTION_LOG_FILE)) {
        const data = fs.readFileSync(TRANSACTION_LOG_FILE);
        logData = JSON.parse(data);
    }

    logData.push(logEntry);

    fs.writeFileSync(TRANSACTION_LOG_FILE, JSON.stringify(logData, null, 2));
};

// Upload File Function
const uploadFile = async (filePath) => {
    try {
        const fileBuffer = fs.readFileSync(filePath);
        const { path: cid } = await ipfs.add(fileBuffer);
        console.log(`File uploaded to IPFS with CID: ${cid}`);
        logTransaction(cid, filePath); // Log the transaction
        return cid;
    } catch (error) {
        throw new Error(`IPFS upload error: ${error.message}`);
    }
};

// Send CID to Smart Contract
const sendCidToContract = async (cid) => {
    try {
        const transaction = await contract.yourMethodToStoreCID(cid);
        await transaction.wait();
        console.log(`Transaction successful: ${transaction.hash}`);
    } catch (error) {
        throw new Error(`Transaction error: ${error.message}`);
    }
};

// View Previous Transactions
const viewPreviousTransactions = () => {
    if (fs.existsSync(TRANSACTION_LOG_FILE)) {
        const logData = fs.readFileSync(TRANSACTION_LOG_FILE);
        const transactions = JSON.parse(logData);
        console.log("Previous Transactions:");
        transactions.forEach((entry, index) => {
            console.log(`${index + 1}: CID: ${entry.cid}, File: ${entry.filePath}, Date: ${entry.timestamp}`);
        });
    } else {
        console.log('No previous transactions found.');
    }
};

// Enhanced Error Logging
const logError = (error) => {
    const errorLog = {
        error: error.message,
        timestamp: new Date().toISOString()
    };
    fs.appendFileSync('error_log.txt', JSON.stringify(errorLog, null, 2) + '\n');
};

// Main Execution
(async () => {
    try {
        console.log("1. Upload a file\n2. View previous transactions");
        const { action } = await inquirer.prompt([{
            type: 'list',
            name: 'action',
            message: 'Choose an action:',
            choices: ['Upload a file', 'View previous transactions']
        }]);

        if (action === 'Upload a file') {
            const filePath = await getFilePathFromUser();
            const cid = await uploadFile(filePath);
            await sendCidToContract(cid);
        } else {
            viewPreviousTransactions();
        }
    } catch (error) {
        console.error(`Error: ${error.message}`);
        logError(error); // Log error to a file
    }
})();
