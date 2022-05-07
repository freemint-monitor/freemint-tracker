const signer = Wallet.createRandom()
const provider = new providers.JsonRpcProvider("http://localhost:8545")
const flashbotsProvider = await FlashbotsBundleProvider.create(provider, signer)

const transaction = {
    from: signer.address,
    to: signer.address,
    value: "0x42",
    gasPrice: BigNumber.from(99).mul(1e9),
    gasLimit: BigNumber.from(21000),
}

const res = await flashbotsProvider.sendPrivateTransaction({
    transaction,
    signer,
}, {
    maxBlockNumber: (await provider.getBlockNumber()) + 5, // only allow tx to be mined for the next 5 blocks
});

const waitRes = await res.wait();
if (waitRes === FlashbotsTransactionResolution.TransactionIncluded) {
    console.log("Private transaction successfully mined.")
} else if (waitRes === FlashbotsTransactionResolution.TransactionDropped) {
    console.log("Private transaction was not mined and has been removed from the system.")
}