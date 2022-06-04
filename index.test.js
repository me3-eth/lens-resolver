'use strict'

const { test } = require('tap')
const nock = require('nock')
const { utils } = require('ethers')

const resolve = require('.')

test('should return twitter value from lens', async (t) => {
  const node = utils.namehash('charchar.eth')
  const key = 'twitter'

  const blockchain = nock('https://eth-mainnet.alchemyapi.io:443', { encodedQueryParams: true })
    .post('/v2/alchemy_api_key')
    .reply(200, {
      jsonrpc: '2.0',
      id: 42,
      result: "0x000000000000000000000000f638bf55b9b7b30a7f3286245e13f6198fcc9879"
    })

  const lens = nock('https://api.lens.dev:443')
    .post('/', {
      query: 'query { profiles(request: { ownedBy: [\"0xF638Bf55B9B7B30A7f3286245E13f6198FCc9879\"] }) { items { attributes { key value } } } }',
      'operationName': null,
      'variables': null
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
  const node = utils.namehash('charchar.eth')
  const key = 'github'

  const blockchain = nock('https://eth-mainnet.alchemyapi.io:443', { encodedQueryParams: true })
    .post('/v2/alchemy_api_key')
    .reply(200, {
      jsonrpc: '2.0',
      id: 42,
      result: "0x000000000000000000000000f638bf55b9b7b30a7f3286245e13f6198fcc9879"
    })

  const lens = nock('https://api.lens.dev:443')
    .post('/', {
      query: 'query { profiles(request: { ownedBy: [\"0xF638Bf55B9B7B30A7f3286245E13f6198FCc9879\"] }) { items { attributes { key value } } } }',
      'operationName': null,
      'variables': null
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