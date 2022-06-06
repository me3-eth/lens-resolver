'use strict'

const ethers = require('ethers')
const gotql = require('gotql')

module.exports = create

const registryAbi = ['function owner(bytes32) external view returns (address)']

const defaults = {
  network: 'mainnet',
  lensUrl: 'https://api.lens.dev/',
  registryAddr: '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e'
}

function create (options = {}) {
  const opts = { ...defaults, ...options }
  if(!opts.rpcUrl) throw new Error('Missing JSON RPC URL: options.rpcUrl')

  const network = ethers.providers.getNetwork(opts.network)
  const provider = new ethers.providers.JsonRpcProvider(opts.rpcUrl, network)
  const registryContract = new ethers.Contract(opts.registryAddr, registryAbi, provider)

  async function textResolver (node, key) {
    const ownerAddress = await registryContract.owner(node)

    const attributes = await getAttributes(ownerAddress)
    const { value } = attributes.find(a => a.key === key) || {}

    return value
  }

  async function getAttributes (ownerAddress) {
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

    const { data } = await gotql.query(opts.lensUrl, query)
    const { items } = data.profiles

    return items[0] && items[0].attributes || []
  }

  const resolvers = {
    'text(bytes32,string)': textResolver,
    'contenthash(bytes32)': node => textResolver(node, 'contenthash')
  }

  async function resolve (fnInterface, ...args) {
    return resolvers[fnInterface](...args)
  }

  return resolve
}
