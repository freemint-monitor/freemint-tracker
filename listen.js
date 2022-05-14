#!/usr/bin/env node
import { LoadingAnimation } from "./cli-style/Loading.js"
import { createAlchemyWeb3 } from "@alch/alchemy-web3"
import { printBanner } from "./cli-style/banner.js"
import { playSound } from "./utils/play_alarm.js"
import { sendEmail } from "./utils/send_mail.js"
import { etherscan } from "./utils/etherscan.js"
import { ethers } from "ethers"
import minimist from "minimist"
import dotenv from "dotenv"
import chalk from "chalk"
import {
  checkERC721,
  ERC721,
  writeLog,
  getMinted,
  writeMinted,
} from "./utils/utils.js"

dotenv.config("./.env")

// get console input
const address = process.argv.slice(2)[0]
const args = minimist(process.argv.slice(3))

let TARGET_ADDRESS = ""
let PAYABLE = false
let LEVERAGE = false
let ALARM = false

// config the monor address and mode
if (!address) {
  console.log(chalk.red("please input target address!"))
  process.exit(1)
} else {
  if (ethers.utils.isAddress(address)) TARGET_ADDRESS = address
  else {
    console.log(chalk.red("invalid address!"))
    process.exit(1)
  }
}

if (args.payable) PAYABLE = true

if (args.leverage) LEVERAGE = true

if (args.alarm) ALARM = true

// config the loading animation
// const loader = new LoadingAnimation(`🕵️‍♀️  monitoring...`)

const main = async () => {
  console.clear()
  alchemy_subscribe("mainnet", TARGET_ADDRESS)
}

/**
 *
 * @param {string} network chain network
 * @param {string} address the address you are gonna listen to
 */
const alchemy_subscribe = async (network, address) => {
  let alchemy_url = `wss://eth-${network}.alchemyapi.io/v2/${process.env.ALCHEMY_KEY}`
  let web3 = createAlchemyWeb3(alchemy_url)
  const provider = new ethers.providers.AlchemyProvider(
    network,
    process.ALCHEMY_KEY
  )

  let wallets
  if (network == "mainnet") {
    wallets = [new ethers.Wallet(process.env.MAINNET_PRIVATE_KEY, provider)]
    if (LEVERAGE)
      wallets.push(ethers.Wallet(process.env.MAINNET_PRIVATE_KEY_1, provider))
  }
  if (network == "rinkeby") {
    wallets = [new ethers.Wallet(process.env.RINKEBY_PRIVATE_KEY, provider)]
    if (LEVERAGE)
      wallets.push(
        new ethers.Wallet(process.env.RINKEBY_PRIVATE_KEY_1, provider)
      )
  }

  // config the banner
  let banner = [
    {
      label: "🌎 Current Network",
      content: network,
    },
    {
      label: "👻 Mode",
      content:
        (PAYABLE ? "payable" : "free") +
        (LEVERAGE ? " & leverage" : "") +
        (ALARM ? " & alarm" : ""),
    },
    {
      label: "👛 Current Main Wallet ",
      content: await wallets[0].getAddress(),
    },
    {
      label: "💰 Wallet Balance",
      content: `${ethers.utils.formatEther(await wallets[0].getBalance())}Ξ`,
    },
    {
      label: "💻 Monored Address",
      content: address,
    },
    {
      label: "📧 E-mail",
      content: `${process.env.EMAIL_ACCOUNT}@qq.com`,
    },
  ]
  if (LEVERAGE) {
    banner.splice(3, 0, {
      label: "👛 Current Main Wallet 2 ",
      content: await wallets[1].getAddress(),
    })
    banner.splice(5, 0, {
      label: "💰 Wallet 2 Balance",
      content: `${ethers.utils.formatEther(await wallets[1].getBalance())}Ξ`,
    })
  }
  printBanner(`Monitoring Info`, banner, 100)
  // loader.start()
  let minted = []
  web3.eth.subscribe(
    "alchemy_filteredFullPendingTransactions",
    {
      address: address,
    },
    async (err, txInfo) => {
      const time = new Date()
      const mint_amount = PAYABLE ? 3 : 3

      /**
       * @description line 135 - 153
       *  print in console when finding a transaction
       *  transactions are filtered based on user paraments
       */

      if (err) return
      // loader.stop()
      if (txInfo == null) return
      if (txInfo.from.toLowerCase() !== address.toLowerCase()) return
      console.log(
        `${"-".repeat(40)} ${time.toLocaleString()} ${"-".repeat(40)}`
      )
      console.log(`🔍 Found a transaction: ${txInfo.hash}`)
      if (!(Number(txInfo.value) == "0" || PAYABLE)) {
        console.log(chalk.red(`❌ it's not a free tx`))
        // loader.start()
        return
      }
      if (ethers.utils.formatEther(txInfo.value) > 0.1) {
        console.log(chalk.red("❌ tx value is more than 0.1E"))
        // loader.start()
      }

      try {
        console.log("🤖 getting abi...")
        let abi = await etherscan.getABIbyContractAddress(txInfo.to)
        const contract = new ethers.Contract(txInfo.to, abi, provider)
        const method = contract.interface.getFunction(txInfo.input.slice(0, 10))
        const functionData = contract.interface.decodeFunctionData(
          method,
          txInfo.input
        )
        let mintedAddress = await getMinted()

        if (!checkERC721(abi)) {
          console.log(chalk.red(`❌ it's not an ERC721 tx`))
          return
          // loader.start()
        }
        console.log(
          `🤑 it's an ERC721 tx, contract address: ${chalk.green(txInfo.to)}`
        )

        if (ERC721.includes(method.name)) {
          console.log(chalk.red(`❌ it's not a minting method`))
          // loader.start()
          return
        }
        if (mintedAddress.includes(txInfo.to)) {
          console.log(chalk.red("❌ this nft has been minted"))
          // loader.start()
          return
        }
        if (!method.inputs.length) {
          console.log("❌ can't resolve paramters!")
          await sendEmail(
            "前端MINT事件😊",
            `<b>该交易可能需要前端mint,请自行检查!下方链接跳转etherscan</b><p>https://${
              network == "mainnet" ? "" : network + "."
            }etherscan.io/tx/${txInfo.hash}</p>`
          )
          console.log("📧 Mail sending successed!")
          return
        }
        for (let i = 0; i < wallets.length; i++) {
          let wallet = wallets[i]
          let params = []
          // analyze paramters
          for (let j = 0; j < method.inputs.length; j++) {
            let param = method.inputs[j]
            if (param.type == "address") params.push(await wallet.getAddress())
            else if (param.type == "uint256" || param.type == "uint8") {
              if (functionData[j] > 3) {
                console.log("❌ minting amount is more than 3")
                return
              }
              params.push(functionData[j])
            } else {
              console.log("❌ can't resolve paramters!")
              await sendEmail(
                "前端MINT事件😊",
                `<b>该交易可能需要前端mint,请自行检查!下方链接跳转etherscan</b><p>https://${
                  network == "mainnet" ? "" : network + "."
                }etherscan.io/tx/${txInfo.hash}</p>`
              )
              console.log("📧 Mail sending successed!")
              return
            }
          }
          const input_data = contract.interface.encodeFunctionData(
            method,
            params
          )
          const tx = await wallet.sendTransaction({
            to: txInfo.to,
            gasLimit: txInfo.gas,
            data: input_data,
            maxPriorityFeePerGas: txInfo.maxPriorityFeePerGas,
            maxFeePerGas: txInfo.maxFeePerGas,
            value: txInfo.value,
          })
          writeMinted(txInfo.to)
          console.log(
            chalk.green(
              `✅ success! check the transaction info: https://etherscan.io/tx/${tx.hash}`
            )
          )
        }
        minted.push(txInfo.to)
        if (ALARM) playSound()
        // write the logs
        writeLog(TARGET_ADDRESS, {
          contractAddress: txInfo.to,
          txHash: txInfo.hash,
          time: time.toLocaleString(),
        })
        // send email
        if (process.env.EMAIL_ACCOUNT && process.env.EMAIL_PASSWARD) {
          try {
            await sendEmail(
              "发送mint交易😊",
              `<b>MINT 成功, 下方链接跳转etherscan</b><p>https://etherscan.io/tx/${follow_tx[0].hash}</p>`
            )
            console.log("📧 Mail sending successed!")
          } catch (error) {
            console.log("❌ Mail sending failed!")
          }
        }
      } catch (error) {
        console.error(error)
      }
    }
  )
}

main().catch((err) => console.log(err))
