import chalk from "chalk"
import { ethers } from "ethers"

const provider = new ethers.providers.AlchemyWebSocketProvider(
  "mainnet",
  process.env.ALCHEMY_KEY
)
const main = async (address, start_block, end_block) => {
  console.log(`🕵️ 计算中...`)
  // opensea
  let os_logs = await provider.getLogs({
    fromBlock: start_block,
    toBlock: end_block,
    topics: [
      "0xc4109843e0b7d514e4c093114b863f8e7d8d9a458c372cd51bfe526b588006c9",
      "0x000000000000000000000000" + address.slice(2),
    ],
  })
  // x2y2
  let x2y2_logs = await provider.getLogs({
    fromBlock: start_block,
    toBlock: end_block,
    topics: [
      "0xe2c49856b032c255ae7e325d18109bc4e22a2804e2e49a017ec0f59f19cd447b",
    ],
  })
  let profit = 0
  for (let log of os_logs) {
    let decode_data = ethers.utils.defaultAbiCoder.decode(
      ["bytes32", "bytes32", "uint256"],
      log.data
    )
    profit += Number(ethers.utils.formatEther(decode_data[2]))
  }
  console.log(`total profit: ${chalk.green(profit)} Ξ`)
  process.exit(0)
}
const fragment = async (start_block, end_block) => {
  for (let bn = start_block; bn < end_block; bn += 2000) {
    
  }
}
// main("0x5181E7418b1BeDfc176703741E1b8A887E65a525", 14530706, 14945415)
fragment(1,5000)
