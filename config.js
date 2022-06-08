export const config = {
  free: {
    max_gas_limit: 150000,
    max_gas_price: 300,
    max_priority_fee: 88,
    max_mint_amount: 5,
  },
  payable: {
    tracker_wallets: [2],
    max_gas_limit: 150000,
    max_gas_price: 300,
    max_priority_fee: 88,
    max_mint_amount: 10,
    max_payable_amount: 0.2,
  },
  extra_priority_fee: 1.8,
  local_proxy_port: 7890,
  keywords_filter: [
    "not",
    "okay",
    "goblin",
    "punk",
    "bear",
    "doodle",
    "azuki",
    "zuki",
    "doodles",
    "888",
    "666",
    "999"
  ],
  notification_type: ['wechat', 'email']
}
