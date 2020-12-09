import apollo from "apollo-server-express";
import cors from "cors";
import express from "express";
import mongoose from "mongoose";

import GQLSchema from "./gql/schema2.js";
import Api from "./datasource/api.js";
import config from "./config/config.js";

import {
  txBlockReducer,
  txnReducer,
  transitionReducer,
} from "./mongodb/reducer.js";
import { TxBlockModel, TxnModel, TransitionModel } from "./mongodb/model.js";

const { ApolloServer } = apollo;

console.log("NODE_ENV: " + process.env.NODE_ENV);

// Set up apollo express server
const app = express();
app.use(cors());

const api = new Api();

const server = new ApolloServer({
  schema: GQLSchema,
  context: {
    models: {
      TxBlockModel,
      TxnModel,
    },
    api: api,
  },
});

server.applyMiddleware({ app, path: "/" });

mongoose.connect(config.dbUrl, { ...config.mongooseOpts });

let connection = mongoose.connection;

const loadData = async (start, end) => {
  for (
    let blockIndex = start;
    start > end ? blockIndex >= end : blockIndex <= end;
    start > end ? blockIndex-- : blockIndex++
  ) {
    try {
      //console.log(`Crawling ${blockIndex}`);
      const isCrawled = await TxBlockModel.exists({
        customId: blockIndex,
      });

      if (isCrawled) {
        //  console.log("is Crawled ", blockIndex);
        continue;
      }

      const txBlock = await api.getTxBlock(blockIndex);

      const reducedTxBlock = txBlockReducer(txBlock);

      const blockInsert = await TxBlockModel.create([reducedTxBlock]);

      console.log(`inserted block ${reducedTxBlock.header.BlockNum}`);

      if (reducedTxBlock.header.NumTxns === 0) {
        //  console.log("Block has no transactions.");
        continue;
      }

      const txns = await api.getTxnBodiesByTxBlock(
        reducedTxBlock.header.BlockNum
      );

      if (txns !== undefined) {
        const txnsoutput = await Promise.all(
          txns.map(async (x) => await txnReducer(x, reducedTxBlock))
        );

        await TxnModel.insertMany(txnsoutput, { ordered: false });

        if (txnsoutput.length) {
          const transitions = await Promise.all(
            txnsoutput.flatMap(async (tx) => await transitionReducer(tx))
          );

          const filteredTransitions = transitions.filter(
            (item) => item !== false
          );


          await TransitionModel.insertMany(filteredTransitions.flat(), {
            ordered: false,
          });

          // console.log(`Inserted ${filteredTransitions.length} transitions`);
        }
      }
      //console.log(`Inserted ${txnsoutput.length} transactions from block`);


    } catch (error) {
      throw error;
    }
  }
};

connection.once("open", function () {
  console.log("MongoDB database connection established successfully");
  api.getLatestTxBlock().then((latestBlock) => {
    try {

      loadData(latestBlock - 1, 0);
      loadData(1, latestBlock);

      setInterval(async () => {
        const latestB = await api.getLatestTxBlock();
        loadData(latestB - 1, latestB - 100);
      }, 60000);
      // loadData(1964715, 1964710);
    } catch (error) {
      console.error(error);
      return;
    }
  });
});

app.listen(5000, () => {
  console.log("🚀  Server ready at port 5000");
});