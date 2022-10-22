import axios from "axios"
import dotenv from "dotenv"
import {config} from "../config.js"
dotenv.config(".env")

const ETHERSCAN_URL = "https://api-goerli.etherscan.io/api"
const PORT = config.local_proxy_port
const LOCAL_PROXY = PORT
  ? { protocol: "http", host: "127.0.0.1", port: PORT }
  : null
const ETHERSCAN_API = process.env.ETHERSCAN_KEY

// 根据钱包地址获取交易信息
const getTxInfoByUserAddress = async (address, startblock, endblock) => {
  const params = {
    module: "account",
    action: "txlist",
    address,
    startblock,
    endblock,
    sort: "desc",
  }
  try {
    let res = await sendAxiosRequest(params)
    if (res.status == "200") return res.data.result
  } catch (error) {
    console.error(error)
  }
}

// 根据合约地址获取token信息(需要升级pro版)
const getTokenInfoByConractAddress = async (contractaddress) => {
  const params = {
    module: "token",
    action: "tokeninfo",
    contractaddress,
  }
  try {
    let res = await sendAxiosRequest(params)
    if (res.status == "200") return res.data.result
  } catch (error) {
    console.error(error)
  }
}

// 根据合约地址获取ABI
const getABIbyContractAddress = async (address) => {
  const params = {
    module: "contract",
    action: "getabi",
    address,
  }
  try {
    let res = await sendAxiosRequest(params)
    if (res.status == "200") return res.data.result
  } catch (error) {
    console.error(error)
  }
}

// 发送axios请求
const sendAxiosRequest = async (params) => {
  params.apikey = ETHERSCAN_API
  const config = {
    url: ETHERSCAN_URL,
    params,
  }
  if (LOCAL_PROXY) config.proxy = LOCAL_PROXY
  return await axios(config)
}

export const etherscan = {
  getTxInfoByUserAddress,
  getTokenInfoByConractAddress,
  getABIbyContractAddress,
}
