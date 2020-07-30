/* 
  API for Zilliqa network
  
  Available async functions:
  1) getLatestTxBlock(): Number
  2) getTxBlock(blockNum: Number): TxBlockObj
  3) getTxnBodiesByTxBlock(blockNum: Number): Array<TransactionObj>
*/
import fetch from 'node-fetch'

class Api {

  constructor() {
    this.networkUrl = 'https://dev-api.zilliqa.com/'
  }

  // Get latest tx block number
  async getLatestTxBlock() {
    const response = await fetch(this.networkUrl,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          "id": "1",
          "jsonrpc": "2.0",
          "method": "GetNumTxBlocks",
          "params": [""]
        }),
      })
    const parsedRes = await response.json()
    return parsedRes.result
  }

  // Get tx block with transactions
  async getTxBlock(blockNum) {
    const response = await fetch(this.networkUrl,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          "id": "1",
          "jsonrpc": "2.0",
          "method": "GetTxBlock",
          "params": [`${blockNum}`]
        }),
      })
    const parsedRes = await response.json()
    return parsedRes.result
  }

  // Get transaction bodies by tx block
  async getTxnBodiesByTxBlock(blockNum) {
    const response = await fetch(this.networkUrl,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          "id": "1",
          "jsonrpc": "2.0",
          "method": "GetTxnBodiesForTxBlock",
          "params": [`${blockNum}`]
        }),
      })
    const parsedRes = await response.json()
    return parsedRes.result
  }
}

export default Api