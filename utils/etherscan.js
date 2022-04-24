import axios from "axios"
import dotenv from 'dotenv'
dotenv.config('.env')

const ETHERSCAN_URL = "https://api.etherscan.io/api"
// const LOCAL_PROXY = { protocol: "http", host: "127.0.0.1", port: "56554" }
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
    console.error(error.message)
  }f
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
    if (res.stauts == "200") return res.data.result
  } catch (error) {
    console.error(error.message)
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
    console.error(error.message)
  }
}

// 发送axios请求
const sendAxiosRequest = async (params) => {
  params.apikey = ETHERSCAN_API
  return await axios({
    url: ETHERSCAN_URL,
    params,
    // proxy: LOCAL_PROXY,
  })
}

export const etherscan = {
  getTxInfoByUserAddress,
  getTokenInfoByConractAddress,
  getABIbyContractAddress,
}
