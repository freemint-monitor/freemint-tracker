import { sendWechat } from "../utils/send_wechat.js"

const main = async () => {
  await sendWechat("微信推送标题", "测试内容")
  console.log("微信 sent successfully")
}

main()
