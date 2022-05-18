#!/usr/bin/env node
import chalk from 'chalk'
import listenToFloorPrice from './src/floor_price.js'
import minimist from 'minimist'

const address = process.argv.slice(2)[0]
const args = minimist(process.argv.slice(3))
let volume = 0
let floor_price = 0
if(!address) {
    console.log(chalk.red('please input contract address!'))
    process.exit(1)
}
if(args.floor_price) floor_price = args.floor_price
if(args.volume) volume = args.volume

console.clear()
listenToFloorPrice(address, floor_price, volume).catch(err => {
    console.log(err.message)
})  