export const compareTitle = (a: string, b: string) => {
  const arr = a.split('_')
  const brr = b.split('_')
  let i = 0
  for (const it of arr) {
    // @ts-ignore
    const val = it - brr[i++]
    if (val) return val
    else if (isNaN(+it)) return 1
  }
  return arr.length - brr.length
}

export const normalizeTitle = (title: string) => (title || '').replace(/_/g, '.')
