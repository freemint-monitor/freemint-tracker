import axios from "axios"
import dotenv from "dotenv"
import { sleep } from "../utils/utils.js"
dotenv.config(".env")

const LOCAL_PROXY = { protocol: "http", host: "127.0.0.1", port: "56554" }

const getSlugName = async (address) => {
  try {
    let res = await axios(
      `https://api.opensea.io/api/v1/asset_contract/${address}`,
      {
        headers: {
          "X-API-KEY": process.env.OPENSEA_KEY,
        },
        proxy: LOCAL_PROXY,
      }
    )
    return res.data.collection.slug
  } catch (error) {
    console.error(error)
  }
}

const getStats = async (slug) => {
  try {
    let res = await axios(`https://api.opensea.io/api/v1/collection/${slug}`, {
      headers: {
        "X-API-KEY": process.env.OPENSEA_KEY,
      },
      proxy: LOCAL_PROXY,
    })
    return res.data.collection.stats
  } catch (error) {
    console.error(error)
  }
}

export default async (address) => {
  let slug = await getSlugName(address)
  console.log(`🤖️ start listening to ${slug}'s floor_price`)
  let stats = await getStats(slug)
  let { floor_price, total_volume } = stats
  while (1) {
    let stats = await getStats(slug)
    let current_floor_price = stats.floor_price
    let current_total_volume = stats.total_volume
    console.log(`start stats: floor_price: ${floor_price}\n total_volume: ${total_volume}`)
    console.log(`current stats: floor_price: ${current_floor_price}\n total_volume: ${current_total_volume}`)
    await sleep(2000)
  }
}
