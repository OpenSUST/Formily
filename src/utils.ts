export const compareTitle = (a: string, b: string) => {
  const arr = a.replace(/_/g, '.').split('.')
  const brr = b.replace(/_/g, '.').split('.')
  let i = 0
  for (const it of arr) {
    const cur = parseInt(it)
    const val = cur - parseInt(brr[i++])
    if (val) return val
    else if (isNaN(cur)) return 1
  }
  return arr.length - brr.length
}

export const dataURItoBlob = (dataURI: string) => {
  const byteString = atob(dataURI.split(',')[1])
  const ab = new ArrayBuffer(byteString.length)
  const ia = new Uint8Array(ab)
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i)
  }
  return new Blob([ab], { type: dataURI.split(',')[0].split(':')[1].split(';')[0] })
}

export const normalizeTitle = (title: string) => (title || '').replace(/_/g, '.')
