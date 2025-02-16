import { z } from "zod"
import { names } from "./ids"

export type PythPricesResult = {
  binary: {
    encoding: string
    data: Array<string>
  }
  parsed: Array<{
    id: string
    price: {
      price: string
      conf: string
      expo: number
      publish_time: number
    }
    ema_price: {
      price: string
      conf: string
      expo: number
      publish_time: number
    }
    metadata: {
      slot: number
      proof_available_time: number
      prev_publish_time: number
    }
  }>
}

export type GetPricesResult= {
  name: string
  price: string
}[]

export const GetPricesParametersSchema = z.object({
  symbols: z.array(z.enum(names)),
})

export type GetPricesParameters = z.infer<typeof GetPricesParametersSchema>
