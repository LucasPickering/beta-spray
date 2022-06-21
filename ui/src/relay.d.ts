import { QueryResponseCache } from "relay-runtime";

declare module "relay-runtime/lib/network/RelayNetworkTypes" {
  export interface Network {
    responseCache: QueryResponseCache;
  }
}
