// fetch-metadata.js
import { ApiPromise, WsProvider } from '@polkadot/api';
import fs from 'fs';

const wsEndpoint = 'ws://3.219.48.230:9944';

const main = async () => {
  const provider = new WsProvider(wsEndpoint);
  const api = await ApiPromise.create({ provider });

  // This is the raw metadata in hex
  const metadataHex = api.runtimeMetadata.toHex();

  console.log('✅ Raw Metadata Hex:\n');
  console.log(metadataHex);

  // Optional: Save to file
  fs.writeFileSync('metadata.hex', metadataHex);

  await api.disconnect();
};

main().catch(console.error);
