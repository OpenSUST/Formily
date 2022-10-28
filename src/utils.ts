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

export const normalizeTitle = (title: string) => (title || '').replace(/_/g, '.')
