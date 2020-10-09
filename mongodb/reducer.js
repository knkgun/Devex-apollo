// Reduces api results into models recognised by mongodb,
// at the same time doing some primary formatting

import { pubKeyToHex } from "../util.js";
import Api from "../datasource/api.js";
const api = new Api();
export const txBlockReducer = (txBlock) => {
  return {
    ...txBlock,
    customId: "txbk_" + txBlock.header.BlockNum,
    txnHashes: txBlock.txnHashes,
  };
};

export const txnReducer = async (txn) => {
  let type = "payment";

  if (txn.toAddr === "0000000000000000000000000000000000000000") {
    type = "contract-creation";
  } else {
    const isContract = await api.isContractAddr(txn.toAddr);

    if (isContract) {
      type = "contract-call";
    }
  }

  return {
    ...txn,
    customId: "txn_" + txn.ID,
    toAddr: txn.toAddr,
    fromAddr: pubKeyToHex(txn.senderPubKey),
    type,
  };
};
