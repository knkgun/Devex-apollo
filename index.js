import apollo from 'apollo-server-express'
import cors from 'cors'
import express from 'express'
import mongoose from 'mongoose'

import GQLSchema from './gql/schema.js'
import Api from './datasource/api.js'
import { txBlockReducer } from './mongodb/reducer.js'
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
    const TxBlock = await Promise.all(currRange.map(x => api.getTxBlockWithTxns(x)))
    const output = TxBlock.map(x => txBlockReducer(x))
    TxBlockModel.insertMany(output, function (err, result) {
      if (err) {
        if(err.code !== 11000) {
          console.log(err)
        }
      } else {
        console.log(result.map(x=>x.id))
      }
    })
    await new Promise(resolve => setTimeout(resolve, 5000));
  }
}

connection.once("open", function () {
  console.log("MongoDB database connection established successfully")
  loadData()
})

app.listen(5000, () => {
  console.log('🚀  Server ready at port 5000')
})