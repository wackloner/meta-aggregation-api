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
        const chainId = '137';
        // DAI
        const buyTokenAddress = '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063';
        // MATIC
        const sellTokenAddress = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';
        // 10 MATIC
        const sellAmount = '10_000_000_000_000_000_000';
        const takerAddress = wallet.address;
        const slippagePercent = '0.005';
        const feePercent = '0.01';
        const feeRecipient = wallet.address;

        console.log(`Buying ${buyTokenAddress} with ${sellAmount} ${sellTokenAddress} on ${chainId} chain`)

        const bestPriceResponse = await axios.get(
            `${apiUrl}/v1/market/${chainId}/price`,
            {
                params: {
                    'buyToken': buyTokenAddress,
                    'sellToken': sellTokenAddress,
                    'sellAmount': sellAmount,
                    'takerAddress': takerAddress,
                    'slippagePercentage': slippagePercent,
                    'buyTokenPercentageFee': feePercent,
                    'feeRecipient': feeRecipient
                }
            },
        );
        console.log(`DexGuru API Best Price: ${JSON.stringify(bestPriceResponse.data, null, 2)}`);

        const providerName = bestPriceResponse.data.provider;
        const quoteResponse = await axios.get(
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
                    'slippagePercentage': slippagePercent,
                    'buyTokenPercentageFee': feePercent,
                    'feeRecipient': feeRecipient
                }
            },
        );

        const txData = quoteResponse.data;
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
