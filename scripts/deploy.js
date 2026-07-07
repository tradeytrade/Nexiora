// Deploys Nexiora from the throwaway deployer wallet.
// Usage: node scripts/deploy.js <network> <recipientAddress> <supplyInWholeTokens>
// Networks: base (mainnet), sepolia (testnet)
const fs = require("fs");
const path = require("path");
const { ethers } = require("ethers");

const NETWORKS = {
  base: {
    chainId: 8453,
    rpcs: [
      "https://mainnet.base.org",
      "https://base-rpc.publicnode.com",
      "https://base.drpc.org",
      "https://1rpc.io/base",
    ],
    explorer: "https://basescan.org",
  },
  sepolia: {
    chainId: 11155111,
    rpcs: [
      "https://ethereum-sepolia-rpc.publicnode.com",
      "https://sepolia.drpc.org",
      "https://1rpc.io/sepolia",
    ],
    explorer: "https://sepolia.etherscan.io",
  },
};

async function getProvider(net) {
  for (const url of net.rpcs) {
    try {
      const p = new ethers.JsonRpcProvider(url, net.chainId, { staticNetwork: true });
      await p.getBlockNumber();
      console.log("Using RPC:", url);
      return p;
    } catch (e) {
      console.warn("RPC failed, trying next:", url);
    }
  }
  throw new Error("No RPC reachable for chainId " + net.chainId);
}

async function main() {
  const [networkName, recipient, supplyTokens] = process.argv.slice(2);
  const net = NETWORKS[networkName];
  if (!net) throw new Error("Unknown network: " + networkName + " (use: " + Object.keys(NETWORKS).join(", ") + ")");
  if (!ethers.isAddress(recipient)) throw new Error("Invalid recipient address: " + recipient);
  if (!/^\d+$/.test(supplyTokens || "")) throw new Error("Supply must be a whole number of tokens");
  const supply = ethers.parseUnits(supplyTokens, 18);

  const root = path.join(__dirname, "..");
  const abi = JSON.parse(fs.readFileSync(path.join(root, "artifacts", "Nexiora.abi.json"), "utf8"));
  const bytecode = "0x" + fs.readFileSync(path.join(root, "artifacts", "Nexiora.bin"), "utf8").trim();
  const { privateKey } = JSON.parse(fs.readFileSync(path.join(root, ".deployer.json"), "utf8"));

  const provider = await getProvider(net);
  const wallet = new ethers.Wallet(privateKey, provider);
  const balance = await provider.getBalance(wallet.address);
  console.log("Deployer:", wallet.address, "| balance:", ethers.formatEther(balance), "ETH");
  if (balance === 0n) throw new Error("Deployer wallet has no ETH for gas on " + networkName);

  const factory = new ethers.ContractFactory(abi, bytecode, wallet);
  console.log(`Deploying Nexiora on ${networkName}: ${supplyTokens} NXIO -> ${recipient}`);
  // Tighter fee than ethers' default 2x-baseFee buffer, so the tx fits the
  // deployer's small gas balance: baseFee +25% headroom plus a small tip.
  const block = await provider.getBlock("latest");
  const tip = ethers.parseUnits("0.01", "gwei");
  const maxFeePerGas = (block.baseFeePerGas * 125n) / 100n + tip;
  console.log("maxFeePerGas:", ethers.formatUnits(maxFeePerGas, "gwei"), "gwei");
  const contract = await factory.deploy(recipient, supply, {
    maxFeePerGas,
    maxPriorityFeePerGas: tip,
  });
  console.log("Deploy tx:", contract.deploymentTransaction().hash);
  await contract.waitForDeployment();
  const address = await contract.getAddress();

  const name = await contract.name();
  const symbol = await contract.symbol();
  const total = await contract.totalSupply();
  const bal = await contract.balanceOf(recipient);
  console.log("---");
  console.log("Contract deployed at:", address);
  console.log(`Token: ${name} (${symbol}) | totalSupply: ${ethers.formatUnits(total, 18)}`);
  console.log(`Recipient balance: ${ethers.formatUnits(bal, 18)} ${symbol}`);
  console.log("Explorer: " + net.explorer + "/token/" + address);

  fs.writeFileSync(
    path.join(root, `deployment.${networkName}.json`),
    JSON.stringify(
      {
        network: networkName,
        chainId: net.chainId,
        contract: address,
        deployTx: contract.deploymentTransaction().hash,
        deployer: wallet.address,
        recipient,
        supply: supplyTokens,
        constructorArgs: [recipient, supply.toString()],
        date: new Date().toISOString(),
      },
      null,
      2
    )
  );
}

main().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});
