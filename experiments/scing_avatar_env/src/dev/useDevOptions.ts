import { useEffect, useState } from 'react'
import { getDevOptions, subscribeDevOptions, type DevOptions } from './devOptionsStore'

export function useDevOptions(): DevOptions {
  const [opt, setOpt] = useState<DevOptions>(() => getDevOptions())

  useEffect(() => {
    return subscribeDevOptions(() => setOpt(getDevOptions()))
  }, [])

  return opt
}
