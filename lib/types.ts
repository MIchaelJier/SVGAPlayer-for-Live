/* eslint-disable no-undef */
import { VideoEntity, EVENT_TYPES } from 'svga.lite'

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

export type Events = {
  // eslint-disable-next-line no-unused-vars
  [propNames in EVENT_TYPES]?: (element: SVGAElementItem | undefined) => void
}
