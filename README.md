# freemint_monitor

### 脚本说明
在mempool中对跟踪的地址的freemint交易进行监听，对交易进行筛选后跟单；

筛选条件有：单笔交易数量，mint函数参数，gas fee，是否已经mint过

单笔交易数量<3可通过筛选

mint函数：无参数、参数为地址、参数为数量、参数为地址和数量可通过筛选

gas fee: gas limit < 15,000，priority fee < 88gwei可通过筛选

同一个项目仅可mint一次(防止监听地址重复mint一个项目烧太多gas)

### 配置.env
自行删掉.env的example后缀

```
MAINNET_PRIVATE_KEY     主网钱包私钥
MAINNET_PRIVATE_KEY_1   需要两个钱包跟单可配置，后续做多钱包
RINKEBY_PRIVATE_KEY     rinkeby测试网私钥，用来测试用，可不填
ALCHEMY_KEY             Alchemy api key
ETHERSCAN_KEY           Etherscan api key
EMAIL_ACCOUNT           qq账号  
EMAIL_PASSWARD          邮箱授权码
```
```
另外`utils/etherscan`下有代理配置，如果系统全局代理可忽略
```

### 脚本测试

```
test/test_email         测试邮件提醒（qq邮箱）
test/try_alarm          测试闹钟功能
test/try_ether`         测试etherscan能否返回数据
test/listen_rinkeby     在rinkeby运行脚本
test/try_wechat         测试公众号提醒功能(http://push.ijingniu.cn/)

测试网可以用这个合约测试：0xa4D8fc7b2Af49a06Ba8Ac047536B71E1c04C9b89
```

### 脚本运行

```
node listen 被监听地址 --alarm --payble --leverage

--alarm                 开启闹钟
--payable               付费模式
--leverage              杠杆模式（多钱包跟）   
```

### logs

会以监控地址为文件名生成json文件，记录跟单记录，方便复盘
