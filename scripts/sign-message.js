// Signs a message with the deployer wallet (EIP-191 personal_sign), for explorer
// address-ownership proofs (Basescan "Verify Address Ownership", Blockscout, etc.).
// Usage: node scripts/sign-message.js "<exact message from the explorer>"
const path = require("path");
const { Wallet } = require("ethers");

const message = process.argv[2];
if (!message) {
  console.error('Usage: node scripts/sign-message.js "<message to sign>"');
  process.exit(1);
}

const deployer = require(path.join(__dirname, "..", ".deployer.json"));
const wallet = new Wallet(deployer.privateKey || deployer.key || deployer.pk);

wallet.signMessage(message).then((sig) => {
  console.log("Address:  ", wallet.address);
  console.log("Message:  ", JSON.stringify(message));
  console.log("Signature:", sig);
});
