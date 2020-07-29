import graphqlCompose from 'graphql-compose'
import graphqlComposeMongoose from 'graphql-compose-mongoose'
import { TxnModel, TxBlockModel } from '../mongodb/model.js'

const { schemaComposer } = graphqlCompose
const { composeWithMongoose } = graphqlComposeMongoose

const customizationOptions = {}
const TxnTC = composeWithMongoose(TxnModel, customizationOptions)
const TxBlockTC = composeWithMongoose(TxBlockModel, customizationOptions)

TxBlockTC.addResolver({
  name: 'txnsByAddr',
  type: [TxBlockTC],
  args: { addr: 'String!' },
  resolve: async ({ args, context }) => {
    const { addr } = args
    const { models: { TxBlockModel } } = context
    return TxBlockModel.find().elemMatch('txns', { from: addr })
  }
})

TxnTC.addRelation(
  'belongsTo',
  {
    resolver: () => TxBlockTC.get('$findMany'),
    prepareArgs: {
      filter: (source) => ({
        _operators : {
          ID : { 'in[]': source.txns.map(x=>x.ID) },
        },
    }),
    }
  }
)

schemaComposer.Query.addFields({
  txnsByAddr: TxBlockTC.getResolver('txnsByAddr'),
  txBlocks: TxBlockTC.getResolver('findMany'),
  txns: TxnTC.getResolver('findMany'),
})

const GQLSchema = schemaComposer.buildSchema()

export default GQLSchema