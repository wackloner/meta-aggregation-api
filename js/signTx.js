const axios = require('axios');
const { ethers } = require('ethers');

async function signTransactionWithMnemonic() {
    const INFURA_ENDPOINT = 'https://polygon-mainnet.infura.io/v3/ff604fdc9fa942fb81c6e23b4f6b73fe';
    const provider = new ethers.getDefaultProvider(INFURA_ENDPOINT);

    // YOUR PRIVATE KEY
    const privateKey = '';
    const wallet = new ethers.Wallet(privateKey, provider);
    console.log(`Wallet Address: ${wallet.address}`);

    try {
        const apiUrl = 'http://localhost:8888';

        // Get Auth token
        const authResponse = await axios.post(`${apiUrl}/v1/auth/token`, {
            'wallet': wallet.address
        });
        const authToken = authResponse.data.access_token;
        console.log(`DexGuru API Auth Token: ${authToken}`);

        // Polygon Mainnet
        let chainId = '137';
        // USDC
        let buyTokenAddress = '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063';
        // MATIC
        let sellTokenAddress = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';
        // 10 MATIC
        let sellAmount = '10000000000000000000';
        let providerName = 'one_inch';
        let takerAddress = wallet.address;
        let slippagePercent = '0.005';

        const response = await axios.get(
            `${apiUrl}/v1/market/${chainId}/quote`,
            {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                },
                params: {
                    'buyToken': buyTokenAddress,
                    'sellToken': sellTokenAddress,
                    'sellAmount': sellAmount,
                    'provider': providerName,
                    'takerAddress': takerAddress,
                    'slippagePercentage': slippagePercent
                }
            },
        );

        const txData = response.data;
        console.log(`DexGuru API Unsigned Transaction: ${JSON.stringify(txData, null, 2)}`);

        const tx = {
            nonce: await wallet.getNonce(),
            gasLimit: txData.gas,
            gasPrice: txData.gas_price,
            to: txData.to,
            value: txData.value,
            data: txData.data,
            chainId: chainId // Polygon Mainnet
        };

        console.log(`Constructed Transaction: ${JSON.stringify(tx, null, 2)}`);

        const signedTx = await wallet.signTransaction(tx);
        console.log(`Signed Transaction: ${signedTx}`);

        const txResponse = await provider.broadcastTransaction(signedTx);
        console.log('Transaction hash:', txResponse.hash);

        await txResponse.wait();
        console.log("Transaction has been confirmed");
    } catch (error) {
        console.error('Error:', error);
    }
}

signTransactionWithMnemonic();
