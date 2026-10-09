// Column type detection utility
// Detects column data types: 'date', 'number', 'string'

// Regex for headers that represent codes, postal codes, zips, phones, or identifiers
const IDENTIFIER_OR_CODE_HEADER_REGEX =
  /^(postal[\s_-]?code|zip|zip[\s_-]?code|zipcode|phone|phone[\s_-]?number|telephone|mobile|fax|ssn|ein|tax[\s_-]?id|routing[\s_-]?num|iban|swift|id|row[\s_-]?id)$|^.*([\s_-]id|postal[\s_-]?code|zip[\s_-]?code|phone[\s_-]?number).*$/i


// Regex for headers that suggest temporal / date data
const DATE_HEADER_REGEX =
  /(^|[_\s])(date|datetime|timestamp|time|dob|day|month|year)($|[_\s])/i

/**
 * Checks if a value is a valid date (and not a random code, zip, or number)
 */
function isDateValue(val, isDateNamedHeader = false) {
  if (val === null || val === undefined || val === '') return false
  if (val instanceof Date) return !isNaN(val.getTime())
  
  if (typeof val === 'number') {
    // 4-digit years like 2024 if header suggests date/year
    if (isDateNamedHeader && val >= 1900 && val <= 2100 && Number.isInteger(val)) {
      return true
    }
    return false
  }

  if (typeof val !== 'string') return false
  const s = val.trim()
  if (!s || s.length < 4 || s.length > 35) return false

  // Pure digits: only allow 4-digit years if header suggests date/year
  if (/^\d+$/.test(s)) {
    if (isDateNamedHeader && s.length === 4) {
      const yr = parseInt(s, 10)
      return yr >= 1900 && yr <= 2100
    }
    return false
  }

  // Common date formats:
  // ISO: 2024-01-15, 2024/01/15, 2024-01-15T12:00:00
  // Slash/Dash: 01/15/2024, 15-01-2024, 1/5/24
  // Month names: 15-Jan-2024, Jan 15 2024
  const isoPattern = /^\d{4}[-/.]\d{1,2}[-/.]\d{1,2}/
  const dmyPattern = /^\d{1,2}[-/.]\d{1,2}[-/.]\d{2,4}/
  const monthNamePattern = /(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/i

  if (!isoPattern.test(s) && !dmyPattern.test(s) && !monthNamePattern.test(s)) {
    return false
  }

  const parsed = Date.parse(s)
  if (isNaN(parsed)) return false

  const d = new Date(parsed)
  const yr = d.getFullYear()
  return !isNaN(yr) && yr >= 1900 && yr <= 2100
}

/**
 * Checks if a value is a valid numeric quantity or currency amount
 */
function isNumberValue(val) {
  if (val === null || val === undefined || val === '') return false
  if (typeof val === 'number') return !isNaN(val) && isFinite(val)
  if (typeof val !== 'string') return false

  const s = val.trim()
  if (!s) return false

  // Strip currency symbols, commas, percent
  const cleaned = s.replace(/^[$€£¥₹]/, '').replace(/%$/, '').replace(/,/g, '').trim()
  if (!cleaned) return false

  const num = Number(cleaned)
  return !isNaN(num) && isFinite(num)
}

export function detectColumnTypes(data) {
  if (!data || data.length === 0) return {}

  const headers = Object.keys(data[0])
  const sampleSize = Math.min(data.length, 100)
  const sampleData = data.slice(0, sampleSize)
  const types = {}

  for (const header of headers) {
    // 1. Check for identifier / postal code / zip / phone patterns
    if (IDENTIFIER_OR_CODE_HEADER_REGEX.test(header.trim())) {
      types[header] = 'string'
      continue
    }

    const isDateHeader = DATE_HEADER_REGEX.test(header.trim())
    let numCount = 0
    let dateCount = 0
    let strCount = 0
    let nonNullCount = 0

    for (const row of sampleData) {
      const val = row[header]
      if (val === null || val === undefined || val === '') continue
      nonNullCount++

      if (isDateValue(val, isDateHeader)) {
        dateCount++
      } else if (isNumberValue(val)) {
        numCount++
      } else {
        strCount++
      }
    }

    if (nonNullCount === 0) {
      types[header] = 'string'
    } else if (dateCount / nonNullCount >= 0.7 || (isDateHeader && dateCount / nonNullCount >= 0.4)) {
      types[header] = 'date'
    } else if (numCount / nonNullCount >= 0.8) {
      types[header] = 'number'
    } else {
      types[header] = 'string'
    }
  }

  return types
}

