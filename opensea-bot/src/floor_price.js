import axios from "axios"
import dotenv from "dotenv"
import { sleep } from "../../utils/utils.js"
import { LoadingAnimation } from "../../cli-style/Loading.js"
import { playSound } from "../../utils/play_alarm.js"
dotenv.config(".env")

const LOCAL_PROXY = { protocol: "http", host: "127.0.0.1", port: "56554" }

const loader = new LoadingAnimation("🔍 monitoring floor price...")

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
    console.error(error.code)
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
    console.error(error.code)
  }
}

export default async (address, mini_floor_price, mini_volume) => {
  let slug = await getSlugName(address)
  console.log(`🤖️ start listening to ${slug}'s floor_price`)
  let stats = await getStats(slug)
  let { floor_price, total_volume } = stats
  console.log(
    `${"-".repeat(50)}\nstart stats: floor_price: ${floor_price}\n total_volume: ${total_volume}\n${"-".repeat(50)}`
  )
  loader.start()
  while (1) {
    try {
      let stats = await getStats(slug)
      let current_floor_price = stats.floor_price
      let current_total_volume = stats.total_volume
      if (
        current_floor_price !== floor_price ||
        current_total_volume !== total_volume
      ) {
        loader.stop()
        floor_price = current_floor_price
        total_volume = current_total_volume
        console.log(
          `${"-".repeat(50)}\ncurrent stats: floor_price: ${current_floor_price}\ntotal_volume: ${current_total_volume}\n${"-".repeat(50)}`
        )
        loader.start()
      }
      if (mini_floor_price && current_floor_price >= mini_floor_price) {
        console.log("the floor price exceeds the preset value!")
        playSound()
      }
      if (mini_volume && current_total_volume >= mini_volume) {
        console.log("the total volume exceeds the preset value!")
        playSound()
      }
      await sleep(2000)
    } catch (error) {
      if (error.code == 502) {
        console.log("error code: 502")
        continue
      }
    }
  }
}
