import { LoadingAnimation } from "../cli-style/Loading.js"
import { createAlchemyWeb3 } from "@alch/alchemy-web3"
import { printBanner } from "../cli-style/banner.js"
import { etherscan } from "./etherscan_rinkeby.js"
import { playSound } from "../utils/play_alarm.js"
import { sendEmail } from "../utils/send_mail.js"
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
  const provider = new ethers.providers.AlchemyProvider(network, process.ALCHEMY_KEY)

  let wallet
  let wallet1
  if (network == "mainnet") {
    wallet = new ethers.Wallet(process.env.MAINNET_PRIVATE_KEY, provider)
    if(LEVERAGE) wallet1 = new ethers.Wallet(process.env.MAINNET_PRIVATE_KEY_1, provider)
  }
  if (network == "rinkeby") {
    wallet = new ethers.Wallet(process.env.RINKEBY_PRIVATE_KEY, provider)
    if(LEVERAGE) wallet1 = new ethers.Wallet(process.env.RINKEBY_PRIVATE_KEY_1, provider)
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
      content: await wallet.getAddress(),
    },
    {
      label: "💰 Wallet Balance",
      content: `${ethers.utils.formatEther(await wallet.getBalance())}Ξ`,
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
      content: await wallet1.getAddress(),
    })
    banner.splice(5, 0, {
      label: "💰 Wallet 2 Balance",
      content: `${ethers.utils.formatEther(await wallet1.getBalance())}Ξ`,
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
      if (!err) {
        // loader.stop()
        if (txInfo !== null) {
          if (txInfo.from.toLowerCase() === address.toLowerCase()) {
            console.log(
              `${"-".repeat(40)} ${time.toLocaleString()} ${"-".repeat(40)}`
            )
            console.log(`🔍 Found a transaction: ${txInfo.hash}`)
            if (Number(txInfo.value) == "0" || PAYABLE) {
              if (ethers.utils.formatEther(txInfo.value) <= 0.1) {
                try {
                  console.log("🤖 getting abi...")
                  let abi = await etherscan.getABIbyContractAddress(txInfo.to)
                  if (checkERC721(abi)) {
                    console.log(
                      `🤑 it's an ERC721 tx, contract address: ${chalk.green(
                        txInfo.to
                      )}`
                    )
                    const contract = new ethers.Contract(txInfo.to, abi, wallet)
                    let method = contract.interface.getFunction(
                      txInfo.input.slice(0, 10)
                    )
                    if (!ERC721.includes(method.name)) {
                      let paramIncludesAddress = false
                      method.inputs.forEach((param) => {
                        if (param.type == "address") paramIncludesAddress = true
                      })
                      if (!paramIncludesAddress && method.inputs.length == 1) {
                        if (
                          method.inputs[0].type == "uint8" ||
                          method.inputs[0].type == "uint256"
                        ) {
                          if (
                            txInfo.input.slice(txInfo.input.length - 2) <=
                            mint_amount
                          ) {
                            let mintedAddress = await getMinted()
                            if (!mintedAddress.includes(txInfo.to)) {
                              try {
                                console.log("🚚 sending transaction...")
                                writeMinted(txInfo.to)
                                let sendPromise = [
                                  wallet.sendTransaction({
                                    to: txInfo.to,
                                    gasLimit: txInfo.gas,
                                    data: txInfo.input,
                                    maxPriorityFeePerGas:
                                      txInfo.maxPriorityFeePerGas,
                                    maxFeePerGas: txInfo.maxFeePerGas,
                                    value: txInfo.value,
                                  }),
                                ]
                                if (LEVERAGE)
                                  sendPromise.push(
                                    wallet1.sendTransaction({
                                      to: txInfo.to,
                                      gasLimit: txInfo.gas,
                                      data: txInfo.input,
                                      maxPriorityFeePerGas:
                                        txInfo.maxPriorityFeePerGas,
                                      maxFeePerGas: txInfo.maxFeePerGas,
                                      value: txInfo.value,
                                    })
                                  )
                                let follow_tx = await Promise.all(sendPromise)
                                // await follow_tx.wait()
                                if (ALARM) playSound()
                                for (let tx of follow_tx) {
                                  console.log(
                                    chalk.green(
                                      `✅ success! check the transaction info: https://etherscan.io/tx/${tx.hash}`
                                    )
                                  )
                                }
                                minted.push(txInfo.to)
                                // write the logs
                                writeLog(TARGET_ADDRESS, {
                                  contractAddress: txInfo.to,
                                  txHash: txInfo.hash,
                                  time: time.toLocaleString(),
                                })
                                // send email
                                if (
                                  process.env.EMAIL_ACCOUNT &&
                                  process.env.EMAIL_PASSWARD
                                ) {
                                  try {
                                    await sendEmail(
                                      "发送mint交易😊",
                                      `<b>MINT 成功, 下方链接跳转etherscan</b><p>https://${
                                        network == "mainnet"
                                          ? ""
                                          : network + "."
                                      }etherscan.io/tx/${txInfo.hash}</p>`
                                    )
                                    console.log("📧 Mail sending successed!")
                                  } catch (error) {
                                    console.log("❌ Mail sending failed!")
                                  }
                                }
                                // loader.start()
                              } catch (error) {
                                console.error(error.message)
                              }
                            } else {
                              console.log(
                                chalk.red("❌ this nft has been minted")
                              )
                              // loader.start()
                            }
                          } else {
                            console.log(
                              chalk.red("❌ minting amount is more than 3")
                            )
                            // loader.start()
                          }
                        } else {
                          console.log(chalk.red("❌ paramter type error"))
                          // loader.start()
                        }
                      } else {
                        console.log(
                          chalk.red(
                            "❌ param includes address, we can't resolve it yet / function has more than 1 params, we can't resolve it too"
                          )
                        )
                        await sendEmail(
                          "前端MINT事件😊",
                          `<b>该交易可能需要前端mint,请自行检查!下方链接跳转etherscan</b><p>https://${
                            network == "mainnet" ? "" : network + "."
                          }etherscan.io/tx/${txInfo.hash}</p>`
                        )
                        console.log("📧 Mail sending successed!")
                        // loader.start()
                      }
                    } else {
                      console.log(chalk.red(`❌ it's not a minting method`))
                      // loader.start()
                    }
                  } else {
                    console.log(chalk.red(`❌ it's not an ERC721 tx`))
                    // loader.start()
                  }
                } catch (error) {
                  console.error(error)
                }
              } else {
                console.log(chalk.red("❌ tx value is more than 0.1E"))
                // loader.start()
              }
            } else {
              console.log(chalk.red(`❌ it's not a free tx`))
              // loader.start()
            }
          }
        }
      }
    }
  )
}

main().catch((err) => console.log(err))
