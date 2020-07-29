// Reduces api results into models recognised by mongodb,
// at the same time doing some primary formatting

import crypto from '@zilliqa-js/crypto'

const { getAddressFromPublicKey, toBech32Address } = crypto

export const txBlockReducer = (txBlock) => {
  return {
    ...txBlock,
    id: 'txbk_' + txBlock.header.BlockNum,
    txns: txBlock.txns.map(x => txnReducer(x))
  }
}

export const txnReducer = (txn) => {
  return {
    ...txn,
    id: 'txn_' + txn.ID,
    toAddr: toBech32Address(txn.toAddr),
    from: toBech32Address(getAddressFromPublicKey(txn.senderPubKey)),
  }
}