import {
  HypersyncClient,
  type Query,
  type QueryResponseData,
} from "@envio-dev/hypersync-client";
import { decodeEventLog } from "viem";

export const EXCHANGE_ADDRESSES = [
  "0x4bfb41d5b3570defd03c39a9a4d8de6bd8b8982e",
  "0xc5d563a36ae78145c45a50134d48a1215220f80a",
].map((a) => a.toLowerCase());

const ORDER_FILLED_TOPIC =
  "0xd0a08e8c493f9c94f29311604c9de1b4e8c8d4c06bd0c789af57f2d65bfec0f6".toLowerCase();

const ORDER_FILLED_ABI = {
  anonymous: false,
  inputs: [
    {
      indexed: true,
      internalType: "bytes32",
      name: "orderHash",
      type: "bytes32",
    },
    {
      indexed: true,
      internalType: "address",
      name: "maker",
      type: "address",
    },
    {
      indexed: true,
      internalType: "address",
      name: "taker",
      type: "address",
    },
    {
      indexed: false,
      internalType: "uint256",
      name: "makerAssetId",
      type: "uint256",
    },
    {
      indexed: false,
      internalType: "uint256",
      name: "takerAssetId",
      type: "uint256",
    },
    {
      indexed: false,
      internalType: "uint256",
      name: "makerAmountFilled",
      type: "uint256",
    },
    {
      indexed: false,
      internalType: "uint256",
      name: "takerAmountFilled",
      type: "uint256",
    },
    {
      indexed: false,
      internalType: "uint256",
      name: "fee",
      type: "uint256",
    },
  ],
  name: "OrderFilled",
  type: "event",
} as const;

const ORDER_FILLED_ABI_ITEMS = [ORDER_FILLED_ABI] as const; // we can push it to query directly as an array

function formatRatio(numerator: bigint, denominator: bigint, precision = 6): string {
  if (denominator === 0n) {
    return "0";
  }

  const scale = 10n ** BigInt(precision);
  const scaled = (numerator * scale) / denominator;
  const whole = scaled / scale;
  const fraction = (scaled % scale).toString().padStart(precision, "0");
  return `${whole}.${fraction}`;
}

async function fetchOrderFilledEvents(client: HypersyncClient, height: number) {
  // Topic0: 0xd0a08e8c493f9c94f29311604c9de1b4e8c8d4c06bd0c789af57f2d65bfec0f6

  const query: Query = {
    fromBlock: height,
    logs: [
      {
        address: EXCHANGE_ADDRESSES,
        topics: [[ORDER_FILLED_TOPIC], [], [], []],
      },
    ],
    fieldSelection: {
      log: [
        "Data",
        "Address",
        "Topic0",
        "Topic1",
        "Topic2",
        "Topic3",
        "TransactionHash",
        "BlockNumber",
      ],
    },
  };

  const res = await client.get(query);
  const logs = (res.data as QueryResponseData).logs ?? [];

  for (const log of logs) {
    const decoded = decodeEventLog({
      abi: ORDER_FILLED_ABI_ITEMS,
      data: log.data as `0x${string}`,
      topics: log.topics as [`0x${string}`, ...`0x${string}`[]],
    });

    if (decoded.eventName !== "OrderFilled") {
      continue;
    }

    const { makerAssetId, makerAmountFilled, takerAmountFilled, maker, taker } =
      decoded.args as {
        makerAssetId: bigint;
        makerAmountFilled: bigint;
        takerAmountFilled: bigint;
        maker: string;
        taker: string;
      };

    if (makerAssetId === 0n) {
      const pricePerShare = formatRatio(makerAmountFilled, takerAmountFilled);
      console.log(
        `[BUY] block=${log.blockNumber} tx=${log.transactionHash} maker=${maker} taker=${taker} pricePerShare=${pricePerShare}`,
      );
    }
  }
}

/**
 * type of log
 * export interface Log {
  removed?: boolean
  logIndex?: number
  transactionIndex?: number
  transactionHash?: string
  blockHash?: string
  blockNumber?: number
  address?: string
  data?: string
  topics: Array<string | undefined | null>
}
 */

async function main() {
  // Create hypersync client using the mainnet hypersync endpoint
  const client = new HypersyncClient({
    url: "https://polygon.hypersync.xyz",
    apiToken: process.env.ENVIO_API_TOKEN!,
  });

  // Create a height stream to monitor blockchain height changes
  const heightStream = await client.streamHeight();

  console.log("Height stream created. Listening for height updates...");

  // Track the last known height to detect changes

  try {
    while (true) {
      // Receive the next event from the height stream
      const event = await heightStream.recv();

      if (event === null) {
        console.log("Height stream ended by server");
        break;
      }

      // Handle different types of events
      switch (event.type) {
        case "Height":
          await fetchOrderFilledEvents(client, event.height);
          break;

        case "Connected":
          console.log(`Connected to height stream`);
          break;

        case "Reconnecting":
          console.log(
            `Reconnecting to height stream in ${event.delayMillis}ms due to error: ${event.errorMsg}`,
          );
          break;

        default:
          // Tells the typescript compiler that we have covered all possible event types
          const _exhaustiveCheck: never = event;
          throw new Error("Unhandled event type");
      }
    }
  } catch (error) {
    console.error("Error in height stream:", error);
  } finally {
    // Always close the stream to clean up resources
    await heightStream.close();
    console.log("Height stream closed");
  }
}

main().catch(console.error);
