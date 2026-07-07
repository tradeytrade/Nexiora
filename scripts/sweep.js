// Sends the deployer wallet's remaining ETH back to a destination address,
// leaving the throwaway wallet empty after deployment.
// Usage: node scripts/sweep.js <network> <destinationAddress>
const fs = require("fs");
const path = require("path");
const { ethers } = require("ethers");

const NETWORKS = {
  base: { chainId: 8453, rpcs: ["https://mainnet.base.org", "https://base-rpc.publicnode.com", "https://base.drpc.org"] },
  sepolia: { chainId: 11155111, rpcs: ["https://ethereum-sepolia-rpc.publicnode.com", "https://sepolia.drpc.org"] },
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
  const [networkName, destination] = process.argv.slice(2);
  const net = NETWORKS[networkName];
  if (!net) throw new Error("Unknown network: " + networkName);
  if (!ethers.isAddress(destination)) throw new Error("Invalid destination address: " + destination);

  const root = path.join(__dirname, "..");
  const { privateKey } = JSON.parse(fs.readFileSync(path.join(root, ".deployer.json"), "utf8"));
  const provider = await getProvider(net);
  const wallet = new ethers.Wallet(privateKey, provider);
  const balance = await provider.getBalance(wallet.address);
  console.log("Deployer:", wallet.address, "| balance:", ethers.formatEther(balance), "ETH");

  const block = await provider.getBlock("latest");
  const tip = ethers.parseUnits("0.001", "gwei");
  const maxFeePerGas = (block.baseFeePerGas * 125n) / 100n + tip;
  // On OP-stack chains (Base) the L1 data fee is charged on top of the L2 fee,
  // so leave a small buffer instead of sweeping to exactly zero.
  const gasCost = 21000n * maxFeePerGas;
  const l1Buffer = networkName === "base" ? ethers.parseUnits("0.000002", "ether") : 0n;
  const value = balance - gasCost - l1Buffer;
  if (value <= 0n) throw new Error("Balance too small to sweep");

  console.log(`Sweeping ${ethers.formatEther(value)} ETH -> ${destination}`);
  const tx = await wallet.sendTransaction({ to: destination, value, gasLimit: 21000, maxFeePerGas, maxPriorityFeePerGas: tip });
  console.log("Sweep tx:", tx.hash);
  await tx.wait();
  const after = await provider.getBalance(wallet.address);
  console.log("Done. Deployer balance now:", ethers.formatEther(after), "ETH");
}

main().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});
