// Import necessary packages
const Moralis = require('moralis').default;
const fs = require('fs');
const inquirer = require('inquirer');
require('dotenv').config();

// Moralis API initialization
const moralisApiKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6IjYwNGIzNDQyLTcxZTYtNDIyYi05NzllLTFmYmYwMDA4YmZkMCIsIm9yZ0lkIjoiNDA5NTg5IiwidXNlcklkIjoiNDIwOTAxIiwidHlwZUlkIjoiMjc1YzY5YmYtMWVhYy00ZWNiLThhMGYtMWQ1Mjk0MDY5OTk2IiwidHlwZSI6IlBST0pFQ1QiLCJpYXQiOjE3MjczOTI1MjUsImV4cCI6NDg4MzE1MjUyNX0.WSmR7ZUn1E-i6Ev9VxPF-hRrfzdHz3u4nsucoCz5-00';

// Initialize Moralis
Moralis.start({
    apiKey: moralisApiKey,
});

// Function for user authentication
const authenticateUser = async () => {
    try {
        const user = await Moralis.authenticate();
        console.log('User authenticated successfully:', user);
        return user;
    } catch (error) {
        console.error('User authentication failed:', error);
        throw new Error('Authentication error');
    }
};

// Function to get file from user input
const getFileFromUser = async () => {
    const { filePath } = await inquirer.prompt([
        {
            type: 'input',
            name: 'filePath',
            message: 'Enter the path to the NFT image you want to upload:',
            validate: (input) => (fs.existsSync(input) ? true : 'File not found. Please provide a valid file path.'),
        },
    ]);
    return filePath;
};

// Function to upload file to IPFS
const uploadFileToIPFS = async (filePath) => {
    try {
        const fileContent = fs.readFileSync(filePath);
        const fileName = filePath.split('/').pop();

        const file = new Moralis.File(fileName, { base64: fileContent.toString('base64') });
        await file.saveIPFS();
        console.log('File uploaded to IPFS:', file.ipfs());
        return file.ipfs();
    } catch (error) {
        console.error('Failed to upload file to IPFS:', error);
        throw new Error('IPFS upload error');
    }
};

// Function to upload metadata to IPFS
const uploadMetadataToIPFS = async (ipfsFileUrl, nftName, nftDescription) => {
    try {
        const metadata = {
            name: nftName,
            description: nftDescription,
            image: ipfsFileUrl,
        };

        const metadataFile = new Moralis.File('metadata.json', {
            base64: Buffer.from(JSON.stringify(metadata)).toString('base64'),
        });
        await metadataFile.saveIPFS();
        console.log('Metadata uploaded to IPFS:', metadataFile.ipfs());
        return metadataFile.ipfs();
    } catch (error) {
        console.error('Failed to upload metadata to IPFS:', error);
        throw new Error('Metadata IPFS upload error');
    }
};

// Function to mint NFT
const mintNFT = async (userAddress, metadataUrl) => {
    try {
        const transaction = await Moralis.Web3API.token.mint({
            chain: 'eth',
            contract_address: '0xYourContractAddressHere', // Replace with your NFT contract address
            metadata_url: metadataUrl,
            user_address: userAddress,
        });
        console.log('NFT minted successfully:', transaction);
        return transaction;
    } catch (error) {
        console.error('Failed to mint NFT:', error);
        throw new Error('NFT minting error');
    }
};

// Main function to orchestrate the NFT minting process
const main = async () => {
    try {
        // Step 1: Authenticate user
        const user = await authenticateUser();

        // Step 2: Get file from user
        const filePath = await getFileFromUser();

        // Step 3: Upload file to IPFS
        const ipfsFileUrl = await uploadFileToIPFS(filePath);

        // Step 4: Get NFT name and description from user
        const { nftName, nftDescription } = await inquirer.prompt([
            {
                type: 'input',
                name: 'nftName',
                message: 'Enter the name of the NFT:',
            },
            {
                type: 'input',
                name: 'nftDescription',
                message: 'Enter the description of the NFT:',
            },
        ]);

        // Step 5: Upload metadata to IPFS
        const ipfsMetadataUrl = await uploadMetadataToIPFS(ipfsFileUrl, nftName, nftDescription);

        // Step 6: Mint NFT
        const userAddress = user.get('ethAddress');
        const transaction = await mintNFT(userAddress, ipfsMetadataUrl);

        // Step 7: Output transaction details
        console.log('NFT minted successfully!');
        console.log('Transaction details:', transaction);
    } catch (error) {
        console.error('Error during NFT minting process:', error);
    }
};

// Start the main function
main();

