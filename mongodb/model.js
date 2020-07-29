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
  ID: String,
  gasLimit: String,
  nonce: String,
  from: String,
  toAddr: String,
  amount: String,
  version: String,
  signature: String,
  receipt: TxnReceipt,
})

let TxBlockHeader = new Schema({
  BlockNum: String,
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
  id: {
    type: String,
    unique: true,
  },
  body: TxBlockBody,
  header: TxBlockHeader,
  txns: [Txn]
})

export const TxnModel = mongoose.model("TxnModel", Txn)
export const TxBlockModel = mongoose.model("TxBlockModel", TxBlock)