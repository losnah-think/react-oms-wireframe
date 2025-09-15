declare module 'bwip-js' {
  interface ToCanvasOptions {
    bcid?: string
    text?: string
    scale?: number
    height?: number
    includetext?: boolean
    textxalign?: string
  }
  export function toCanvas(canvas: HTMLCanvasElement, opts: ToCanvasOptions): void
  export default { toCanvas }
}
