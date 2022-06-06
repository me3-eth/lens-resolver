'use strict'

const { test } = require('tap')
const nock = require('nock')
const { utils } = require('ethers')

const createLensResolver = require('.')

// Ethers has an incrementing ID to track request/response so the simplest solution is to
// reflect that request ID back in the response
function wrapJsonRpc (responseBody) {
  return function (uri, requestBody) {
    const { id, jsonrpc } = requestBody
    return { ...responseBody, id, jsonrpc }
  }
}

function isChainIdReq (requestBody) {
  return requestBody && requestBody.method === 'eth_chainId'
}

test('should return twitter value from lens', async (t) => {
  const resolve = createLensResolver({ rpcUrl: 'https://eth-mainnet.alchemyapi.io/v2/alchemy_api_key' })

  const node = utils.namehash('charchar.eth')
  const key = 'twitter'

  // An incrementing ID is used to track request/response
  const blockchain = nock('https://eth-mainnet.alchemyapi.io')
    .post('/v2/alchemy_api_key', isChainIdReq)
    .reply(200, wrapJsonRpc({ result: '0x1' }))
    .post('/v2/alchemy_api_key')
    .reply(200, wrapJsonRpc({ result: '0x000000000000000000000000f638bf55b9b7b30a7f3286245e13f6198fcc9879' }))

  const lens = nock('https://api.lens.dev:443')
    .post('/', {
      query: 'query { profiles(request: { ownedBy: ["0xF638Bf55B9B7B30A7f3286245E13f6198FCc9879"] }) { items { attributes { key value } } } }',
      operationName: null,
      variables: null
    })
    .reply(200, {
      data: {
        profiles: {
          items: [
            {
              attributes: [
                { key: 'website', value: 'https://me3.eth.limo/#/charchar.eth' },
                { key: 'twitter', value: '0xcharchar' },
                { key: 'hasPrideLogo', value: 'true' },
                { key: 'app', value: 'Lenster' }
              ]
            }
          ]
        }
      }
    })

  const result = await resolve('text(bytes32,string)', node, key)

  t.equal(result, '0xcharchar')
  t.ok(blockchain.isDone())
  t.ok(lens.isDone())
})

test('should return nothing for non-existant key', async (t) => {
  const resolve = createLensResolver({ rpcUrl: 'https://eth-mainnet.alchemyapi.io/v2/alchemy_api_key' })
  const node = utils.namehash('charchar.eth')
  const key = 'github'

  const blockchain = nock('https://eth-mainnet.alchemyapi.io')
    .post('/v2/alchemy_api_key', isChainIdReq)
    .reply(200, wrapJsonRpc({ result: '0x1' }))
    .post('/v2/alchemy_api_key')
    .reply(200, wrapJsonRpc({ result: '0x000000000000000000000000f638bf55b9b7b30a7f3286245e13f6198fcc9879' }))

  const lens = nock('https://api.lens.dev:443')
    .post('/', {
      query: 'query { profiles(request: { ownedBy: ["0xF638Bf55B9B7B30A7f3286245E13f6198FCc9879"] }) { items { attributes { key value } } } }',
      operationName: null,
      variables: null
    })
    .reply(200, {
      data: {
        profiles: {
          items: [
            {
              attributes: [
                { key: 'twitter', value: '0xcharchar' }
              ]
            }
          ]
        }
      }
    })

  const result = await resolve('text(bytes32,string)', node, key)

  t.notOk(result)
  t.ok(blockchain.isDone())
  t.ok(lens.isDone())
})

test('should get contenthash from attributes', async (t) => {
  const resolve = createLensResolver({ rpcUrl: 'https://eth-mainnet.alchemyapi.io/v2/alchemy_api_key' })
  const node = utils.namehash('charchar.eth')

  const blockchain = nock('https://eth-mainnet.alchemyapi.io')
    .post('/v2/alchemy_api_key', isChainIdReq)
    .reply(200, wrapJsonRpc({ result: '0x1' }))
    .post('/v2/alchemy_api_key')
    .reply(200, wrapJsonRpc({ result: '0x000000000000000000000000f638bf55b9b7b30a7f3286245e13f6198fcc9879' }))

  const lens = nock('https://api.lens.dev:443')
    .post('/', {
      query: 'query { profiles(request: { ownedBy: ["0xF638Bf55B9B7B30A7f3286245E13f6198FCc9879"] }) { items { attributes { key value } } } }',
      operationName: null,
      variables: null
    })
    .reply(200, {
      data: {
        profiles: {
          items: [
            {
              attributes: [
                { key: 'twitter', value: '0xcharchar' },
                { key: 'contenthash', value: 'ipns://k2k4r8jxjubxv5pvzyf63gdakm902g0yiu0zk7bn0ny145cn0qeu46oa' }
              ]
            }
          ]
        }
      }
    })

  const result = await resolve('contenthash(bytes32)', node)

  t.equal(result, 'ipns://k2k4r8jxjubxv5pvzyf63gdakm902g0yiu0zk7bn0ny145cn0qeu46oa')
  t.ok(blockchain.isDone())
  t.ok(lens.isDone())
})

test('should throw error when missing RPC URL', async (t) => {
  return t.throws(() => createLensResolver())
})

test('should return nothing when there are no attributes', async (t) => {
  const resolve = createLensResolver({ rpcUrl: 'https://eth-mainnet.alchemyapi.io/v2/alchemy_api_key' })
  const node = utils.namehash('charchar.eth')

  const blockchain = nock('https://eth-mainnet.alchemyapi.io')
    .post('/v2/alchemy_api_key', isChainIdReq)
    .reply(200, wrapJsonRpc({ result: '0x1' }))
    .post('/v2/alchemy_api_key')
    .reply(200, wrapJsonRpc({ result: '0x000000000000000000000000f638bf55b9b7b30a7f3286245e13f6198fcc9879' }))

  const lens = nock('https://api.lens.dev:443')
    .post('/', {
      query: 'query { profiles(request: { ownedBy: ["0xF638Bf55B9B7B30A7f3286245E13f6198FCc9879"] }) { items { attributes { key value } } } }',
      operationName: null,
      variables: null
    })
    .reply(200, {
      data: {
        profiles: {
          items: []
        }
      }
    })

  const result = await resolve('contenthash(bytes32)', node)

  t.notOk(result)
  t.ok(blockchain.isDone())
  t.ok(lens.isDone())
})
