/* Schema references types in Zilliqa-js-sdk */
import mongoose from 'mongoose'

const Schema = mongoose.Schema

// Receipt Schema
let ExceptionEntry = new Schema({
  line: Number,
  message: String,
})

let EventParam = new Schema({
  vname: String,
  type: String,
  value: Schema.Types.Mixed,
})

let EventLogEntry = new Schema({
  address: String,
  _eventname: String,
  params: [EventParam],
})

let TransitionMsg = new Schema({
  _amount: String,
  _recipient: String,
  _tag: String,
  params: [EventParam],
})

let TransitionEntry = new Schema({
  accepted: Boolean,
  addr: String,
  depth: Number,
  msg: TransitionMsg,
})

let TxnReceipt = new Schema({
  accepted: Boolean,
  cumulative_gas: String,
  epoch_num: String,
  event_logs: [EventLogEntry],
  exceptions: [ExceptionEntry],
  success: Boolean,
  transitions: [TransitionEntry],
  error: Schema.Types.Mixed,
})

let Txn = new Schema({
  customId: {
    type: String,
    unique: true,
  },
  ID: {
    type: String,
    unique: true,
  },
  amount: String,
  gasLimit: String,
  gasPrice: String,
  nonce: String,
  receipt: TxnReceipt,
  senderPubKey: String,
  signature: String,
  fromAddr: String,
  toAddr: String,
  type: String,
  version: String,
});

let TxBlockHeader = new Schema({
  BlockNum: {
    type: String,
    unique: true,
  },
  DSBlockNum: String,
  GasLimit: String,
  GasUsed: String,
  MbInfoHash: String,
  MinerPubKey: String,
  NumMicroBlocks: Number,
  NumTxns: Number,
  PrevBlockHash: String,
  Rewards: String,
  StateDeltaHash: String,
  StateRootHash: String,
  Timestamp: String,
  Version: Number,
})

let MicroBlockInfo = new Schema({
  MicroBlockHash: String,
  MicroBlockShardId: Number,
  MicroBlockTxnRootHash: String,
})

let TxBlockBody = new Schema({
  BlockHash: String,
  HeaderSign: String,
  MicroBlockInfos: [MicroBlockInfo],
})

let TxBlock = new Schema({
  customId: {
    type: String,
    unique: true,
  },
  body: TxBlockBody,
  header: TxBlockHeader,
  txnHashes: [String]
})

export const TxnModel = mongoose.model("txn", Txn)
export const TxBlockModel = mongoose.model("block", TxBlock)