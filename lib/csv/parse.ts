export function parseCsvRecords(csvText: string): string[][] {
  const text = csvText.replace(/^\uFEFF/, '')

  if (text.trim().length === 0) {
    return []
  }

  const rows: string[][] = []
  let row: string[] = []
  let cell = ''
  let inQuotes = false
  let justClosedQuote = false

  const pushCell = () => {
    row.push(cell)
    cell = ''
    justClosedQuote = false
  }

  const pushRow = () => {
    rows.push(row)
    row = []
  }

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index]

    if (inQuotes) {
      if (character === '"') {
        if (text[index + 1] === '"') {
          cell += '"'
          index += 1
        } else {
          inQuotes = false
          justClosedQuote = true
        }
      } else {
        cell += character
      }

      continue
    }

    if (justClosedQuote && character !== ',' && character !== '\n' && character !== '\r') {
      if (character === ' ' || character === '\t') {
        continue
      }

      throw new Error('Malformed CSV: unexpected character after closing quote.')
    }

    if (character === '"') {
      if (cell.length > 0) {
        throw new Error('Malformed CSV: unexpected quote character.')
      }

      inQuotes = true
      continue
    }

    if (character === ',') {
      pushCell()
      continue
    }

    if (character === '\n' || character === '\r') {
      pushCell()
      pushRow()

      if (character === '\r' && text[index + 1] === '\n') {
        index += 1
      }

      continue
    }

    cell += character
  }

  if (inQuotes) {
    throw new Error('Malformed CSV: unterminated quoted value.')
  }

  pushCell()
  pushRow()

  return rows
}
