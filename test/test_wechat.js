import { sendWechat } from "../utils/send_wechat.js"

const main = async () => {
  await sendWechat(
    "公众号提醒测试💻",
    `<b>测试公众号提醒能否正常使用</b>
    `
  )
  console.log("微信 sent successfully")
}

main()
