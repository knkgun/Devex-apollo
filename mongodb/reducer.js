// Reduces api results into models recognised by mongodb,
// at the same time doing some primary formatting

import { pubKeyToHex } from '../util.js'

export const txBlockReducer = (txBlock) => {
  return {
    ...txBlock,
    customId: 'txbk_' + txBlock.header.BlockNum,
    txnHashes: txBlock.txnHashes
  }
}

export const txnReducer = (txn) => {
  return {
    ...txn,
    customId: 'txn_' + txn.ID,
    toAddr: txn.toAddr,
    from: pubKeyToHex(txn.senderPubKey),
  }
}