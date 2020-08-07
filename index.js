import apollo from 'apollo-server-express'
import cors from 'cors'
import express from 'express'
import mongoose from 'mongoose'

import GQLSchema from './gql/schema.js'
import Api from './datasource/api.js'
import config from './config/config.js'

import { txBlockReducer, txnReducer } from './mongodb/reducer.js'
import { TxBlockModel, TxnModel } from './mongodb/model.js'
import { range } from './util.js'

const { ApolloServer } = apollo

console.log('NODE_ENV: ' + process.env.NODE_ENV)

// Set up apollo express server 
const app = express()
app.use(cors())

const api = new Api()

const server = new ApolloServer({
  schema: GQLSchema,
  context: {
    models: {
      TxBlockModel,
      TxnModel,
    },
    api: api
  }
})

server.applyMiddleware({ app, path: '/' })

mongoose.connect(config.dbUrl, { ...config.mongooseOpts })

let connection = mongoose.connection

const loadData = async () => {

  const latestTxBlock = await api.getLatestTxBlock()

  // Load in batches of 5 TxBlocks
  // Proceeds as long as 1 of the TxBlock in the window has not been stored
  for (let i = latestTxBlock; i >= 0; i -= 5) {
    const currRange = [...range(i - 5, i)]

    const isCrawled = await currRange.map(x => TxBlockModel.exists({ customId: 'txbk_' + x }))
      .reduce((acc, x) => acc && x, true)
    if (isCrawled) continue

    const txBlocks = await Promise.all(currRange.map(x => api.getTxBlock(x)))
    const reducedTxBlocks = txBlocks.map(x => txBlockReducer(x))

    reducedTxBlocks.forEach(async x => {
      if (x.header.NumTxns === 0) return
      const txns = await api.getTxnBodiesByTxBlock(x.header.BlockNum)
      const output = txns.map(x => txnReducer(x))

      TxnModel.insertMany(output, { ordered: false }, function (err, result) {
        if (err && err.code === 11000) // 11000 is duplicate insert code which we can ignore
          return
        if (err) // 11000 is duplicate insert code which we can ignore
          console.log(err)
      })
    })

    TxBlockModel.insertMany(reducedTxBlocks, { ordered: false }, function (err, result) {
      if (err && err.code === 11000) // 11000 is duplicate insert code which we can ignore
        return
      if (err)
        console.log(err)
      else {
        const percentage = (latestTxBlock - result[0].customId.split('_')[1]) / latestTxBlock 
        console.log(`(${(percentage * 100).toFixed(2)}%)`+ ' LOAD ' + result.map(x => x.customId).join(', '))
      }
    })
    await new Promise(resolve => setTimeout(resolve, 2000))
  }
}

connection.once("open", function () {
  console.log("MongoDB database connection established successfully")
  loadData()
})

app.listen(5000, () => {
  console.log('🚀  Server ready at port 5000')
})