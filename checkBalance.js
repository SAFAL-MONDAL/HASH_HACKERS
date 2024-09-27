const hre = require("hardhat");

async function main() {
    // Get the accounts
    const [account] = await hre.ethers.getSigners();

    console.log("Checking balance for:", account.address);

    // Get the balance of the account
    const balance = await hre.ethers.provider.getBalance(account.address);
    
    console.log("Account balance:", hre.ethers.utils.formatEther(balance), "AVAX");
}

// Run the checkBalance function
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
