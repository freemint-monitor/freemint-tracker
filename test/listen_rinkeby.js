import { createAlchemyWeb3 } from "@alch/alchemy-web3"
import { printBanner } from "../cli-style/banner.js"
import { sendWechat } from "../utils/send_wechat.js"
import { etherscan } from "./etherscan_rinkeby.js"
import { playSound } from "../utils/play_alarm.js"
import { sendEmail } from "../utils/send_mail.js"
import { config } from "../config.js"
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
} from "../utils/utils.js"

dotenv.config("./.env")

// get console input
const address = process.argv.slice(2)[0]
const args = minimist(process.argv.slice(3))

let TARGET_ADDRESS = ""
let PAYABLE = false
let LEVERAGE = false
let ALARM = false
let KING = false

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

if (args.king) KING = true

const main = async () => {
  console.clear()
  alchemy_subscribe("rinkeby", TARGET_ADDRESS)
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
  let payable_wallets
  if (network == "mainnet") {
    wallets = [new ethers.Wallet(process.env.MAINNET_PRIVATE_KEY, provider)]
    payable_wallets = [
      new ethers.Wallet(process.env.MAINNET_PRIVATE_KEY, provider),
    ]
    if (LEVERAGE) {
      let i = 1
      while (i) {
        if (process.env[`MAINNET_PRIVATE_KEY_${i}`]) {
          wallets.push(
            new ethers.Wallet(process.env[`MAINNET_PRIVATE_KEY_${i}`], provider)
          )
          i++
        } else break
      }
    }
    if (LEVERAGE && PAYABLE) {
      for (let index of config.payable.tracker_wallets) {
        if (process.env[`MAINNET_PRIVATE_KEY_${index}`])
          payable_wallets.push(
            new ethers.Wallet(
              process.env[`MAINNET_PRIVATE_KEY_${index}`],
              provider
            )
          )
      }
    }
    console.log(payable_wallets)
  }
  if (network == "rinkeby") {
    wallets = [new ethers.Wallet(process.env.RINKEBY_PRIVATE_KEY, provider)]
    payable_wallets = [
      new ethers.Wallet(process.env.RINKEBY_PRIVATE_KEY, provider),
    ]
    if (LEVERAGE) {
      let i = 1
      while (i) {
        if (process.env[`RINKEBY_PRIVATE_KEY_${i}`]) {
          wallets.push(
            new ethers.Wallet(process.env[`RINKEBY_PRIVATE_KEY_${i}`], provider)
          )
          i++
        } else break
      }
    }
    if (LEVERAGE && PAYABLE) {
      for (let index of config.payable.tracker_wallets) {
        if (process.env[`RINKEBY_PRIVATE_KEY_${index}`])
          payable_wallets.push(
            new ethers.Wallet(
              process.env[`RINKEBY_PRIVATE_KEY_${index}`],
              provider
            )
          )
      }
    }
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
        (ALARM ? " & alarm" : "") +
        (KING ? " & king" : ""),
    },
    {
      label: "👛 Current Main Wallet ",
      content: (await wallets[0].getAddress()) + (PAYABLE ? " 🌟" : ""),
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
    for (let i = 1; i < wallets.length; i++) {
      let payable = false
      payable_wallets.forEach(async (pay) => {
        pay.address == wallets[i].address ? (payable = true) : (payable = false)
      })
      banner.splice(2 + i, 0, {
        label: `👛 Current Main Wallet ${i} `,
        content: (await wallets[i].getAddress()) + (payable ? " 🌟" : ""),
      })
      banner.splice(3 + 2 * i, 0, {
        label: `💰 Wallet ${i} Balance`,
        content: `${ethers.utils.formatEther(await wallets[i].getBalance())}Ξ`,
      })
    }
  }
  printBanner(`Monitoring Info`, banner, 100)
  let minted = []
  web3.eth.subscribe(
    "alchemy_filteredFullPendingTransactions",
    {
      address: address,
    },
    async (err, txInfo) => {
      const time = new Date()
      const max_mint_amount = PAYABLE
        ? config.payable.max_mint_amount
        : config.free.max_mint_amount
      const max_gas_limit = PAYABLE
        ? config.payable.max_gas_limit
        : config.free.max_gas_limit
      const max_gas_price = PAYABLE
        ? config.payable.max_gas_price
        : config.free.max_gas_price
      const max_priority_fee = PAYABLE
        ? config.payable.max_priority_fee
        : config.free.max_priority_fee
      const gas_limit = parseInt(txInfo.gas)
      if (!txInfo.maxPriorityFeePerGas) {
        console.log("❌ this is not EIP-1559 tx")
        return
      }

      /**
       * @description
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
      if (
        ethers.utils.formatEther(txInfo.value) >
        config.payable.max_payable_amount
      ) {
        console.log(
          chalk.red(
            `❌ tx value is more than ${config.payable.max_payable_amount}`
          )
        )
        // loader.start()
        return
      }
      if (gas_limit > max_gas_limit) {
        console.log(chalk.red("❌ gas is too high!"))
        return
      }
      try {
        console.log("🤖 getting abi...")
        let abi = await etherscan.getABIbyContractAddress(txInfo.to)
        if (abi == "Contract source code not verified") {
          console.log(chalk.red("❌ contract source code is not open source"))
          return
        }
        const contract = new ethers.Contract(txInfo.to, abi, provider)
        if (!checkERC721(abi)) {
          try {
            const imple_address = await contract.implementation()
            abi = await etherscan.getABIbyContractAddress(imple_address)
            contract = new ethers.Contract(address, abi, provider)
          } catch (error) {
            console.error(error)
            console.log(`❌ it's not a ERC721 contract`)
            return
          }
        }
        const token_name = await contract.name()
        const method = contract.interface.getFunction(txInfo.input.slice(0, 10))
        const functionData = contract.interface.decodeFunctionData(
          method,
          txInfo.input
        )
        let mintedAddress = await getMinted()

        /**
         * @dev store the promise of sending transaction, send them with promise.all
         */
        let txWaitToBeSent = []

        console.log(
          `🤑 it's an ERC721 tx, contract address: ${chalk.green(
            txInfo.to
          )}, token name: ${chalk.green(token_name)}`
        )
        if (ERC721.includes(method.name)) {
          console.log(chalk.red(`❌ it's not a minting method`))
          return
        }
        if (mintedAddress.includes(txInfo.to)) {
          console.log(chalk.red("❌ this nft has been minted"))
          return
        }
        if (!KING)
          for (let keyword of config.keywords_filter) {
            if (token_name.toLowerCase().indexOf(keyword) >= 0) {
              console.log(chalk.red(`❌ contains banned keyword`))
              return
            }
          }
        for (
          let i = 0;
          i <
          (Number(txInfo.value) == 0 ? wallets.length : payable_wallets.length);
          i++
        ) {
          let wallet =
            Number(txInfo.value) == 0 ? wallets[i] : payable_wallets[i]
          let params = []
          // the condition of non-param
          if (!method.inputs.length) {
            txWaitToBeSent.push(
              wallet.sendTransaction({
                to: txInfo.to,
                gasLimit: txInfo.gas,
                data: txInfo.input,
                maxPriorityFeePerGas:
                  ethers.utils.formatUnits(
                    parseInt(txInfo.maxPriorityFeePerGas),
                    "gwei"
                  ) > max_priority_fee
                    ? (max_priority_fee + config.extra_priority_fee) *
                      1000000000
                    : Number(txInfo.maxPriorityFeePerGas) +
                      config.extra_priority_fee * 1000000000,
                maxFeePerGas:
                  ethers.utils.formatUnits(
                    parseInt(txInfo.maxFeePerGas),
                    "gwei"
                  ) > max_gas_price
                    ? max_gas_price * 1000000000
                    : txInfo.maxFeePerGas,
                value: txInfo.value,
              })
            )
            continue
          }
          // analyze paramters
          for (let j = 0; j < method.inputs.length; j++) {
            let param = method.inputs[j]
            if (param.type == "address") params.push(await wallet.getAddress())
            else if (
              param.type == "uint256" ||
              param.type == "uint128" ||
              param.type == "uint64" ||
              param.type == "uint32" ||
              param.type == "uint16" ||
              param.type == "uint8"
            ) {
              if (functionData[j] > max_mint_amount) {
                console.log(`❌ minting amount is more than ${max_mint_amount}`)
                return
              }
              params.push(functionData[j])
            } else {
              console.log("❌ can't resolve paramters!")
              if (config.notification_type.includes("email")) {
                await sendEmail(
                  "前端MINT事件😊",
                  `<b>该交易可能需要前端mint,请自行检查!下方链接跳转etherscan</b><p>https://${
                    network == "mainnet" ? "" : network + "."
                  }etherscan.io/tx/${txInfo.hash}</p>`
                )
                console.log("📧 Mail sending successed!")
              }
              if (config.notification_type.includes("wechat")) {
                await sendWechat(
                  "前端MINT事件😊",
                  `<b>该交易可能需要前端mint,请自行检查!下方链接跳转etherscan</b>
                [etherscan链接](https://${
                  network == "mainnet" ? "" : network + "."
                }etherscan.io/tx/${txInfo.hash})
                `
                )
                console.log("💻 Wechat sending successed!")
              }
              return
            }
          }
          const input_data = contract.interface.encodeFunctionData(
            method,
            params
          )

          txWaitToBeSent.push(
            wallet.sendTransaction({
              to: txInfo.to,
              gasLimit: txInfo.gas,
              data: input_data,
              maxPriorityFeePerGas:
                ethers.utils.formatUnits(
                  parseInt(txInfo.maxPriorityFeePerGas),
                  "gwei"
                ) > max_priority_fee
                  ? (max_priority_fee + config.extra_priority_fee) * 1000000000
                  : Number(txInfo.maxPriorityFeePerGas) +
                    config.extra_priority_fee * 1000000000,
              maxFeePerGas:
                ethers.utils.formatUnits(
                  parseInt(txInfo.maxFeePerGas),
                  "gwei"
                ) > max_gas_price
                  ? max_gas_price * 1000000000
                  : txInfo.maxFeePerGas,
              value: txInfo.value,
            })
          )
        }
        /**
         * @dev send transaction!
         */
        writeMinted(txInfo.to)
        const res = await Promise.all(txWaitToBeSent)
        console.log(
          chalk.green(
            `✅ success! check the transaction info: https://etherscan.io/tx/${res[0].hash}`
          )
        )
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
            if (config.notification_type.includes("email")) {
              await sendEmail(
                "发送mint交易😊",
                `<b>MINT 成功, 下方链接跳转etherscan</b><p>https://etherscan.io/tx/${res[0].hash}</p>`
              )
              console.log("📧 Mail sending successed!")
            }
            if (config.notification_type.includes("wechat")) {
              await sendWechat(
                "发送mint交易😊",
                `<b>MINT 成功, 下方链接跳转etherscan<</b>
              [etherscan链接](https://etherscan.io/tx/${res[0].hash})
              `
              )
              console.log("💻 Wechat sending successed!")
            }
          } catch (error) {
            console.log(error)
            console.log("❌ Mail sending failed!")
          }
        }
      } catch (error) {
        console.error(error.message)
      }
    }
  )
}

main().catch((err) => console.log(err.message))
