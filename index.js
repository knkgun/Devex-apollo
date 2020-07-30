import apollo from 'apollo-server-express'
import cors from 'cors'
import express from 'express'
import mongoose from 'mongoose'

import GQLSchema from './gql/schema.js'
import Api from './datasource/api.js'
import { txBlockReducer, txnReducer } from './mongodb/reducer.js'
import { TxBlockModel, TxnModel } from './mongodb/model.js'
import { range } from './util.js'

const { ApolloServer } = apollo

// Set up apollo express server 
const app = express()
app.use(cors())

const server = new ApolloServer({
  schema: GQLSchema,
  context: {
    models: {
      TxBlockModel,
      TxnModel,
    },
  }
})

server.applyMiddleware({ app, path: '/graphql' })

// Start crawling TxBlocks and storing into db
const api = new Api()

mongoose.connect('mongodb://localhost:27017/graphql', { useUnifiedTopology: true, useNewUrlParser: true, useCreateIndex: true })

let connection = mongoose.connection

const loadData = async () => {

  const latestTxBlock = await api.getLatestTxBlock()

  for (let i = latestTxBlock; i >= 0; i -= 5) {
    const currRange = [...range(i - 5, i)]
    const txBlocks = await Promise.all(currRange.map(x => api.getTxBlock(x)))
    const reducedTxBlocks = txBlocks.map(x => txBlockReducer(x))

    reducedTxBlocks.forEach(async x => {
      if (x.header.NumTxns === 0) return
      const txns = await api.getTxnBodiesByTxBlock(x.header.BlockNum)
      const output = txns.map(x => txnReducer(x))
      TxnModel.insertMany(output, { ordered: false }, function (err, result) {
        if (err) {
          if (err.code === 11000) {
            console.log('skipping txn')
          }
        } else {
          console.log(result.map(x => x.customId))
        }
      })
    })

    TxBlockModel.insertMany(reducedTxBlocks, { ordered: false }, function (err, result) {
      if (err) {
        if (err.code === 11000) {
          console.log('skipping txblock')
        }
      } else {
        console.log(result.map(x => x.customId))
      }
    })
    await new Promise(resolve => setTimeout(resolve, 3000));
  }
}

connection.once("open", function () {
  console.log("MongoDB database connection established successfully")
  loadData()
})

app.listen(5000, () => {
  console.log('🚀  Server ready at port 5000')
})