'use strict'

const ethers = require('ethers')
const gotql = require('gotql')

const LENS_HOST = 'https://api.lens.dev/'
const registryAbi = ['function owner(bytes32) external view returns (address)']
const RPC_API_KEY = 'alchemy_api_key'

const provider = new ethers.providers.AlchemyProvider('homestead', RPC_API_KEY)
const registryContract = new ethers.Contract('0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e', registryAbi, provider)

module.exports = resolve

async function resolve (fnInterface, ...args) {
  return resolvers[fnInterface](...args)
}

const resolvers = {
  'text(bytes32,string)': textResolver,
  'contenthash(bytes32)': node => textResolver(node, 'contenthash')
}

async function textResolver (node, key) {
  const ownerAddress = await registryContract.owner(node)

  const { attributes } = await getProfile(ownerAddress) || { attributes: [] }
  const { value } = attributes.find(a => a.key === key) || {}
  
  return value
}

async function getProfile (ownerAddress) {
  const query = {
    operation: {
      name: 'profiles',
      args: {
        request: {
          ownedBy: [ownerAddress]
        }
      },
      fields: [
        {
          items: {
            fields: [
              {
                attributes: {
                  fields: ['key', 'value']
                }
              }
            ]
          }
        }
      ]
    }
  }

  const { data } = await gotql.query(LENS_HOST, query)

  return data.profiles.items[0]
}

