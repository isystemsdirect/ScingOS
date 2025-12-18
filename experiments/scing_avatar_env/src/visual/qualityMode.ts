let qhd = true
let version = 0

export function setQualityMode(v: boolean) {
  qhd = v
  version++
}

export function toggleQualityMode() {
  setQualityMode(!qhd)
}

export function getQualityMode() {
  return qhd
}

export function getQualityVersion() {
  return version
}
