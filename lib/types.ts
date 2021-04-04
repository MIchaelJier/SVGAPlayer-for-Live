/* eslint-disable no-undef */
import { VideoEntity } from 'svga.lite'

export const SVGAElementSign = Symbol('')
export type SVGAElementItem = {
  value: string | VideoEntity | ArrayBuffer
  id?: number
  [SVGAElementSign]?: symbol
  [propName: string]: any
}

export interface SVGAoptions {
  target: string | HTMLCanvasElement
  useDB?: boolean
  preDown?: number
}

export type SVGAElementArr = Array<SVGAElementItem>
