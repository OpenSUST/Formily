export const compareTitle = (a: string, b: string) => {
  const arr = a.split('.')
  const brr = b.split('.')
  let i = 0
  for (const it of arr) {
    // @ts-ignore
    const val = it - brr[i++]
    if (val) return val
    else if (isNaN(+it)) return -1
  }
  return arr.length - brr.length
}
