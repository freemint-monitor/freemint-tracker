"use strict"
import axios from "axios"
import dotenv from "dotenv"
dotenv.config("./.env")

export async function sendWechat(head, body) {

let channel = process.env.WECHAT_CHANNEL
head = encodeURI(head)
body = encodeURI(body)
const url = `http://push.ijingniu.cn/send?key=${channel}&head=${head}&body=${body}`
console.log(url)
axios.get(url)
  .then(response => {
    console.log(response.data.url);
    console.log(response.data.explanation);
  })
  .catch(error => {
    console.log(error);
  });
  }