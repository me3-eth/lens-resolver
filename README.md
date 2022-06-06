# LENS Resolver

Map ENS PublicResolver functions to LENS profile attributes.

This is intended to be used as part of a solution in linking CCIP/Durian/OffchainLookups from ENS resolvers to LENS protocol.

![offchain-lookup-gateway](https://user-images.githubusercontent.com/87212793/172201119-18c6eb59-26e9-4564-85a9-be721ce942e7.png)

This project fits into the Green Rectangle in the diagram ("Resolve ENS functions against a datasource"), the data source being LENS protocol.

Note: does not follow [ENSIP-10](https://docs.ens.domains/ens-improvement-proposals/ensip-10-wildcard-resolution)

## Installation

```sh
npm i @me3/lens-resolver
```

This library only works in Node and has only been tested on v16.13.0. We suggest
you use [`nvm`](https://github.com/nvm-sh/nvm).

## Usage

The only mandatory configuration option is `rpcUrl`. Use your connection URL from
your preferred RPC provider (Alchemy, Infura, self-hosted, etc)

```js
const { utils } = require('ethers')
const resovle = require('@me3/lens-resolver)({
  network: 'mainnet', // DEFAULT
  lensUrl: 'https://api.lens.dev/', // DEFAULT
  rpcUrl: 'your.fav.rpc' // REQUIRED
})

const node = utils.namehash('charchar.eth')
const key = 'twitter'
const ensResolverFunction = 'text(bytes32,string)'

const value = await resolve(ensResolverFunction, node, key)

console.log({ value })
// returns 0xcharchar on mainnet
```

## Roadmap

* support address resolving
* provide pre- & post-loading hooks to support key/value manipulation
