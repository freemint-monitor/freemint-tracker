import fs from "fs"
import path from "path"

export const ERC721 = [
  "balanceOf",
  "ownerOf",
  "safeTransferFrom",
  "safeTransferFrom",
  "transferFrom",
  "approve",
  "setApprovalForAll",
  "getApproved",
  "isApprovedForAll",
]
export const checkERC721 = (resString) => {
  try {
    const abi = JSON.parse(resString)
    let funcNames = []
    for (let func of abi) funcNames.push(func.name)
    for (let inter of ERC721) {
      if (!funcNames.includes(inter)) return false
    }
    return true
  } catch (error) {
    return false
  }
}

export const sleep = (ms) => {
  return new Promise((r) => setTimeout(r, ms))
}

export const writeLog = (address, tx) => {
  let path = `./logs/logs_${address}.json`
  if (!fs.existsSync(path)) {
    let log = {
      monoredAddress: address,
      txLogs: [tx],
    }
    fs.writeFile(path, JSON.stringify(log, null, 4), () => {
      console.log(`successful writting the log in ${path}`)
    })
  } else {
    fs.readFile(path, (err, data) => {
      if (err) console.error(err)
      let log = JSON.parse(data)
      log.txLogs.push(tx)
      fs.writeFile(path, JSON.stringify(log, null, 4), () => {
        console.log(`successful editting the log in ${path}`)
      })
    })
  }
}

export const getMinted = () => {
  return new Promise((resolve) => {
    if (!fs.existsSync("./mintedAddress.json")) {
      path.join("./", "mintedAddress.json")
      fs.writeFile("./mintedAddress.json", JSON.stringify([], null, 4), () => {
        console.log("successfully created mintedAddress.json")
        resolve([])
      })
    } else
      fs.readFile("./mintedAddress.json", (err, data) => {
        if (err) console.error(err)
        let mintedAddress = JSON.parse(data)
        resolve(mintedAddress)
      })
  })
}

export const writeMinted = async (address) => {
  let mintedAddress = await getMinted()
  mintedAddress.push(address)
  fs.writeFile(
    "./mintedAddress.json",
    JSON.stringify(mintedAddress, null, 4),
    () => {
      console.log(`successfully written minted address`)
    }
  )
}

export const readJson = (path) => {
  return new Promise((resolve) => {
    fs.readFile(path, (err, data) => {
      if (err) console.error(err)
      let res = JSON.parse(data)
      resolve(res)
    })
  })
}

export const formatTxt = (path, output) => {
  let res = fs.readFileSync(path, "utf8")
  let my_address = []
  res.split(/\r?\n/).forEach((add) => {
    my_address.push(add.trim())
  })
  fs.writeFile(output, JSON.stringify(my_address, null, 4), () => {
    console.log("done")
  })
}
