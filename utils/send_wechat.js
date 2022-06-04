"use strict"
import axios from "axios"
import dotenv from "dotenv"
dotenv.config("./.env")

export async function sendWechat(summary, content) {
  let config = {
    method: "post",
    appToken: process.env.WECHAT_KEY,
    content,
    summary, // 消息摘要
    contentType: 3, // 内容类型 1表示文字  2表示html(只发送body标签内部的数据即可，不包括body标签) 3表示markdown
    uids: [
      process.env.WECHAT_UID,
    ],
  }

  const url = `http://wxpusher.zjiecode.com/api/send/message/`
  axios
    .post(url, config)
    .catch((error) => {
      console.log(error)
    })
}
