import chalk from "chalk"
import dotenv from "dotenv"
import { ethers } from "ethers"
import cliProgress from "cli-progress"
import { checkERC721 } from "./utils.js"
import { etherscan } from "./etherscan.js"
dotenv.config()

const args = process.argv.slice(2)

let address = args[0]
let start_block = args[1]
let end_block = args[2]

if (!address || !start_block || !end_block) {
  console.log(chalk.red("缺少参数! 请依次输入地址、起始区块、结束区块！"))
  console.log(
    chalk.red(
      "Missing params! Please input address, start block, end block, respectively!"
    )
  )
  process.exit(0)
}

const main = async (address, start_block, end_block) => {
  const bar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic)
  let his_list = await etherscan.getHistory(address, start_block, end_block)
  let total_gas_fee_used = 0
  let index = 0

  console.log(
    `Scanning the transactions 🔍... start block: ${chalk.green(
      start_block
    )}, end block: ${chalk.green(end_block)}`
  )
  console.log(
    `交易扫描中 🔍... 起始区块: ${chalk.green(
      start_block
    )}, 结束区块: ${chalk.green(end_block)}`
  )
  bar.start(his_list.length)
  for (let tx of his_list) {
    bar.update(++index)
    let abi = await etherscan.getABIbyContractAddress(tx.to)
    if (checkERC721(abi)) {
      total_gas_fee_used += ethers.utils.formatEther(tx.gasPrice) * tx.gas
    }
  }
  bar.stop()
  console.log(`💰共花费: ${chalk.green(total_gas_fee_used)} Ξ`)
  console.log(`💰total consumption: ${chalk.green(total_gas_fee_used)} Ξ`)
}

main(address, start_block, end_block)
