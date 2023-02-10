中文 / [English](https://github.com/freemint-monitor/freemint-tracker/blob/main/README.md)

<div align="center">
    <!-- <img style="border-radius: 0.3125em;
    box-shadow: 0 2px 4px 0 rgba(34,36,38,.12),0 2px 10px 0 rgba(34,36,38,.08);" 
    src="https://github.com/TimGrey998/img/blob/main/priview.png">
    <br> -->
    <p style="opacity: 0.8"><b>Track the high win rate wallets of mint trasactions</b></p>
    <p style="opacity: 0.8">跟踪高胜率地址的nft图狗交易</p>
</div>
# freemint_monitor

### 脚本说明

在 mempool 中对跟踪的地址的 freemint 交易进行监听，对交易进行筛选后跟单；

筛选条件有：

- 单笔交易数量，mint 函数参数，gas fee，是否已经 mint 过单笔交易数量 小于 3 可通过筛选

- mint 函数：无参数、参数为地址、参数为数量、参数为地址和数量可通过筛选

- gas fee: gas limit 小于 15,000，priority fee 小于 88gwei 可通过筛选

- 同一个项目仅可 mint 一次(防止监听地址重复 mint 一个项目烧太多 gas)

### 配置.env

自行删掉.env 的 example 后缀

```
MAINNET_PRIVATE_KEY     主网钱包私钥
MAINNET_PRIVATE_KEY_1   需要两个钱包跟单可配置，后续做多钱包
RINKEBY_PRIVATE_KEY     rinkeby测试网私钥，用来测试用，可不填
ALCHEMY_KEY             Alchemy api key
ETHERSCAN_KEY           Etherscan api key
EMAIL_ACCOUNT           qq账号
EMAIL_PASSWARD          邮箱授权码
```

### 配置 config.js

```
export const config = {
  free: {
    max_gas_limit: 最大gas limit,
    max_gas_price: 最大gas price,
    max_priority_fee: 最大矿工费,
    max_mint_amount: 最大单笔交易token数量,
  },
  payable: {
    tracker_wallets: [指定哪些钱包跟单，不需要就置为空数组],
    max_gas_limit: 最大gas limit,
    max_gas_price: 最大gas price,
    max_priority_fee: 最大矿工费,
    max_mint_amount: 最大单笔交易token数量,
    max_payable_amount: 最大可支付eth数量,
  },
  extra_priority_fee: 额外矿工费（你想做卷王么？🤪）,
  local_proxy_port: 本地代理端口（不需要就填0）,
  alarm_mp3_name: '指定闹钟名称，闹钟在alarm目录下存放',
  keywords_filter: ["azuki", "zuki", "doodles", "888", "666"] (token关键词过滤),
  notification_type: ["wechat", "email"], 通知类型：微信公众号和邮箱, 不需要的删除即可
}
```

### 脚本测试

```
test/test_email           测试邮件提醒（qq邮箱）
test/test_alarm           测试闹钟功能
test/test_etherscan       测试etherscan能否返回数据
test/test_wechat          测试公众号提醒功能(https://wxpusher.zjiecode.com/docs/#/)
test/listen_rinkeby       在rinkeby运行脚本

测试网可以用这个合约测试：0xa4D8fc7b2Af49a06Ba8Ac047536B71E1c04C9b89
```

### 脚本运行

```
node listen 被监听地址 --alarm --payble --leverage

--alarm                 开启闹钟
--payable               付费模式
--leverage              杠杆模式（多钱包跟）
--king                  狗王模式（取消关键词过滤功能）
```

### logs

会以监控地址为文件名生成 json 文件，记录跟单记录，方便复盘
