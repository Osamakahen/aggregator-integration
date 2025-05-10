const { ethers } = require('ethers');

async function checkTransaction() {
    try {
        // Using Infura's public RPC endpoint
        const provider = new ethers.providers.JsonRpcProvider('https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161');
        
        const txHash = '0x8adf7f273812c62188afc55876b65d352c6e1ef038ff2563e3f1bdbcf8e7dfbf';
        
        // Get transaction details
        const tx = await provider.getTransaction(txHash);
        console.log('\nTransaction Details:');
        console.log('From:', tx.from);
        console.log('To:', tx.to);
        console.log('Value:', ethers.utils.formatEther(tx.value), 'ETH');
        console.log('Block Number:', tx.blockNumber);
        
        // Get transaction receipt
        const receipt = await provider.getTransactionReceipt(txHash);
        console.log('\nTransaction Receipt:');
        console.log('Status:', receipt.status ? 'Success' : 'Failed');
        console.log('Block Number:', receipt.blockNumber);
        console.log('Gas Used:', receipt.gasUsed.toString());
        
    } catch (error) {
        console.error('Error:', error.message);
    }
}

checkTransaction(); 