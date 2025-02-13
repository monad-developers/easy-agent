import { ids } from "./ids"
import { action, BaseAgent } from "@easyagent/lib"
import { GetPricesParameters, GetPricesResult, GetPricesParametersSchema } from "./types"

/**
 * Agent to fetch price data from Pyth
 */
export class PythFetcherAgent extends BaseAgent {
  public name = "pyth-fetcher"

}