declare module 'openrgb-sdk' {
  export class OpenRGBClient {
    constructor(params: { address?: string; port?: number; name?: string })
    connect(): Promise<void>
    getAllControllerData(): Promise<unknown>
    updateLeds(device: unknown, colors: utils.OpenRGBColor[]): Promise<void>
  }

  export namespace utils {
    export type OpenRGBColor = { red: number; green: number; blue: number }
    export function color(r: number, g: number, b: number): OpenRGBColor
  }
}
