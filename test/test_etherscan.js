import {etherscan } from '../utils/etherscan.js'
const main = async () => {
    let res = await etherscan.getABIbyContractAddress('0x147fF909EE900ab430eD8aA977E39450Cf554f10')
    console.log(res)
}
main()