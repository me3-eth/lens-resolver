# LENS Resolver

Map ENS PublicResolver functions to LENS profile attributes.

Note: does not follow [ENSIP-10](https://docs.ens.domains/ens-improvement-proposals/ensip-10-wildcard-resolution)

## Installation

```sh
npm i @me3/lens-resolver
```

## Usage

```js
const { utils } = require('ethers')
const resovle = require('@me3/lens-resolver)({
  network: 'mainnet',
  lensUrl: 'https://api.lens.dev/',
  rpcUrl: 'your.fav.rpc'
})

const node = utils.namehash('charchar.eth')
const key = 'twitter'

const value = await resolve('text(bytes32,string)', node, key)

console.log({ value })
// returns 0xcharchar on mainnet
```
