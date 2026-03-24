# track-trades

Script that listens for Polymarket activity with HyperSync by Envio.

## What this project uses

- [HyperSync](https://docs.envio.dev/docs/HyperSync/overview): high-performance blockchain data access.
- `@envio-dev/hypersync-client`: connects to the Polygon HyperSync endpoint.
- `viem`: decodes `OrderFilled` event logs from contract data.

## Prerequisite

You must install [Bun](https://bun.sh) before running this project.

## Setup

Install dependencies:

```bash
bun install
```

Set your Envio API token:

```bash
export ENVIO_API_TOKEN=your_token_here
```

You can get an API token from Envio and use it to authenticate requests to HyperSync.

## Run the script

```bash
bun run index.ts
```

The script will:

- Connect to `https://polygon.hypersync.xyz`
- Listen for new block heights
- Query exchange contract logs for `OrderFilled`
- Decode events and logs `[BUY]` trade lines
