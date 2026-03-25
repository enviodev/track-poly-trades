# Track Polymarket Trades with HyperSync

[![Discord](https://img.shields.io/badge/Discord-Join%20Chat-7289da?logo=discord&logoColor=white)](https://discord.com/invite/envio)

A lightweight script that listens for real-time Polymarket trade activity using [Envio HyperSync](https://docs.envio.dev/docs/HyperSync/overview). Streams `OrderFilled` events from Polymarket's exchange contracts on Polygon and logs each BUY trade to the terminal.

## What This Does

- Connects to the Polygon HyperSync endpoint
- Listens for new blocks in real time
- Queries exchange contract logs for `OrderFilled` events
- Decodes events using [viem](https://viem.sh) and prints `[BUY]` trade lines

## What is HyperSync?

[HyperSync](https://docs.envio.dev/docs/HyperSync/overview) is Envio's high-performance blockchain data retrieval layer. It is a purpose-built alternative to JSON-RPC endpoints, providing up to 2000x faster access to on-chain data across 70+ EVM networks.

## Prerequisites

- [Bun](https://bun.sh)
- An Envio API token ([get one here](https://docs.envio.dev/docs/HyperSync/api-tokens))

## Setup

```bash
bun install
export ENVIO_API_TOKEN=your_token_here
```

## Run

```bash
bun run index.ts
```

## Related

- [Polymarket Whale Tracker](https://github.com/enviodev/poly-whale-tracker) - terminal UI for large Polymarket trades
- [Polymarket Indexer](https://github.com/enviodev/polymarket-indexer) - full HyperIndex indexer for Polymarket events

## Documentation

- [HyperSync Docs](https://docs.envio.dev/docs/HyperSync/overview)
- [HyperSync Node.js Client](https://github.com/enviodev/hypersync-client-node)
- [API Tokens](https://docs.envio.dev/docs/HyperSync/api-tokens)

## Support

- [Discord community](https://discord.com/invite/envio)
- [Envio Docs](https://docs.envio.dev)
