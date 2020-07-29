/* 
  API for Zilliqa network
  
  Available async functions:
  1) getLatestTxBlock(): Number
  2) getTxBlockWithTxns(blockNum: Number): TxBlockObj with Txns
  3) getTxnHashesByTxBlock(blockNum: Number): Array<TxnHashes>
  4) getTxnBodyByTxnHash(txnHash: String): TransactionObj
  5) getTxnBodiesByTxBlock(blockNum: Number): Array<TransactionObj>
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
  async getTxBlockWithTxns(blockNum) {
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
    return parsedRes.result.header.NumTxns > 0
      ? { ...parsedRes.result, txns: await this.getTxnBodiesByTxBlock(blockNum) }
      : { ...parsedRes.result, txns: [] }
  }

  // Get transaction hashes by tx block
  async getTxnHashesByTxBlock(blockNum) {
    const response = await fetch(this.networkUrl,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          "id": "1",
          "jsonrpc": "2.0",
          "method": "GetTransactionsForTxBlock",
          "params": [`${blockNum}`]
        }),
      })
    const parsedRes = await response.json()
    return parsedRes.error
      ? []
      : parsedRes.result.flat().filter(x => x !== null)
  }

  // Get transaction body by hash
  async getTxnBodyByTxnHash(txnHash) {
    const response = await fetch(this.networkUrl,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          "id": "1",
          "jsonrpc": "2.0",
          "method": "GetTransaction",
          "params": [`${txnHash}`]
        }),
      }
    )
    const parsedRes = await response.json()
    return parsedRes.result
  }

  // Get transaction bodies by tx block
  async getTxnBodiesByTxBlock(blockNum) {
    const txnHashes = await this.getTxnHashesByTxBlock(blockNum)
    const txnBodies = txnHashes.map(x => this.getTxnBodyByTxnHash(x))
    const res = await Promise.all(txnBodies)
    return res
  }
}

export default Api