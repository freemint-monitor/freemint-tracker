import { sendEmail } from "../utils/send_mail.js"

const main = async () => {
  await sendEmail("<h1>测试邮箱能否正常使用</h1>")
  console.log("📧 sent successfully")
}

main()
