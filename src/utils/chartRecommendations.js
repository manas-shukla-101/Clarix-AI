/**
 * Generates intelligent chart recommendations from column types and data.
 * Employs heuristic scoring to ensure:
 * 1. True numeric metrics (Sales, Profit, Quantity, Revenue) are prioritized for Y-axis and KPIs.
 * 2. Identifiers, codes, postal codes, and phone numbers are excluded from metric calculations.
 * 3. Categorical dimensions with ideal cardinality (Ship Mode, Category, Segment, Region) are selected for Bar, Pie, and Funnel.
 * 4. Temporal columns (Date, Created At) are selected for Line and Area time series.
 * 5. Scatter plots compare two distinct, genuine metrics.
 */

function scoreMetricColumn(col, data = []) {
  let score = 0
  const lower = col.toLowerCase().trim()

  // 1. Strict disqualifiers
  if (
    /(\b|_)(id|key|code|zip|postal|phone|ssn|ein|row|index|lat|latitude|lon|longitude|lng|year|yr|month|day)(\b|_)/i.test(lower) ||
    /^.*(id|code|zip|postal|phone|ssn).*$/i.test(lower)
  ) {
    return -1000
  }

  // 2. High-value metric keywords
  if (
    /(\b|_)(sales|revenue|profit|income|cost|price|amount|total|spend|margin|budget|earnings|balance|fee|expense|gmv|arr|mrr|value)(\b|_)/i.test(lower)
  ) {
    score += 300
  } else if (
    /(\b|_)(quantity|qty|units|volume|count|inventory|stock|capacity)(\b|_)/i.test(lower)
  ) {
    score += 200
  } else if (
    /(\b|_)(score|rating|discount|rate|ratio|percent|pct|conversion|growth|roi|target)(\b|_)/i.test(lower)
  ) {
    score += 150
  } else {
    score += 50 // Generic numeric column
  }

  // 3. Inspect actual sample values if available
  if (data.length > 0) {
    let hasDecimals = false
    let isAll5DigitInts = true
    let isSequential = true
    let nonNullCount = 0

    const limit = Math.min(data.length, 50)
    for (let i = 0; i < limit; i++) {
      const val = data[i][col]
      if (val === null || val === undefined || val === '') continue
      nonNullCount++
      const n = Number(val)
      if (!isNaN(n)) {
        if (n % 1 !== 0) hasDecimals = true
        if (n < 10000 || n > 99999 || n % 1 !== 0) isAll5DigitInts = false
        if (i > 0 && n !== Number(data[i - 1][col]) + 1) isSequential = false
      }
    }

    if (hasDecimals) score += 60 // Continuous/monetary metrics frequently have decimals
    if (isAll5DigitInts && nonNullCount > 0) score -= 800 // Likely a postal code
    if (isSequential && nonNullCount > 3) score -= 800 // Likely an auto-increment row ID
  }

  return score
}

function scoreCategoryColumn(col, data = []) {
  let score = 0
  const lower = col.toLowerCase().trim()

  // 1. Disqualify IDs and unique codes
  if (
    /(\b|_)(id|uuid|guid|key|ssn|phone|code|hash|token)(\b|_)/i.test(lower) ||
    /^.*(id|uuid|code|key).*$/i.test(lower)
  ) {
    return -1000
  }

  // 2. High-value category keywords
  if (
    /(\b|_)(category|subcategory|sub_category|segment|region|department|status|type|genre|brand|group|channel|stage|tier|division|role|mode|ship_mode|country|state|city)(\b|_)/i.test(lower)
  ) {
    score += 250
  } else {
    score += 50
  }

  // 3. Inspect cardinality (unique count)
  if (data.length > 0) {
    const set = new Set()
    let total = 0
    const limit = Math.min(data.length, 100)
    for (let i = 0; i < limit; i++) {
      const val = data[i][col]
      if (val !== null && val !== undefined && val !== '') {
        set.add(String(val))
        total++
      }
    }
    const unique = set.size
    if (unique >= 2 && unique <= 12) {
      score += 150 // Perfect sweet spot for visualization
    } else if (unique > 12 && unique <= 30) {
      score += 60
    } else if (unique === 1) {
      score -= 500 // Zero variance
    } else if (total > 10 && unique / total > 0.8) {
      score -= 400 // Unique customer names or identifiers
    }
  }

  return score
}

export function getChartRecommendations(columnTypes, data = []) {
  const recommendations = []
  if (!columnTypes || Object.keys(columnTypes).length === 0) return recommendations

  const cols = Object.keys(columnTypes)

  // 1. Identify and rank valid numeric metrics
  const scoredMetrics = cols
    .filter(c => columnTypes[c] === 'number')
    .map(col => ({ col, score: scoreMetricColumn(col, data) }))
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)

  const rankedMetrics = scoredMetrics.map(m => m.col)

  // 2. Identify and rank valid categorical dimensions
  const scoredCategories = cols
    .filter(c => columnTypes[c] === 'string')
    .map(col => ({ col, score: scoreCategoryColumn(col, data) }))
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)

  const rankedCategories = scoredCategories.map(c => c.col)

  // 3. Identify temporal date columns
  const rankedDates = cols
    .filter(c => columnTypes[c] === 'date')
    .sort((a, b) => {
      const aLower = a.toLowerCase()
      const bLower = b.toLowerCase()
      const aPrimary = /order|create|start|date/i.test(aLower) ? 1 : 0
      const bPrimary = /order|create|start|date/i.test(bLower) ? 1 : 0
      return bPrimary - aPrimary
    })

  const primaryMetric = rankedMetrics[0] || null
  const secondaryMetric = rankedMetrics[1] || null
  const primaryCategory = rankedCategories[0] || null
  // Select an alternative category for Pie chart to provide visual diversity
  const pieCategory = rankedCategories.find((c, i) => i > 0) || primaryCategory
  const dateCol = rankedDates[0] || null

  // ── 1. Primary KPI Metric ────────────────────────────────────────────────
  if (primaryMetric) {
    recommendations.push({
      type: 'Metric',
      title: `Total ${primaryMetric}`,
      yAxis: primaryMetric,
      description: `High-level executive summary of ${primaryMetric}.`
    })
  }

  // ── 2. Bar Chart: Category Comparison ────────────────────────────────────
  if (primaryCategory && primaryMetric) {
    recommendations.push({
      type: 'Bar',
      title: `${primaryMetric} by ${primaryCategory}`,
      xAxis: primaryCategory,
      yAxis: primaryMetric,
      description: `Compare ${primaryMetric} across different ${primaryCategory} categories.`
    })
  }

  // ── 3. Line Chart: Trend over Time ──────────────────────────────────────
  if (dateCol && primaryMetric) {
    recommendations.push({
      type: 'Line',
      title: `${primaryMetric} Trend over Time`,
      xAxis: dateCol,
      yAxis: primaryMetric,
      description: `Track how ${primaryMetric} evolves across chronological dates.`
    })
  }

  // ── 4. Pie Chart: Proportional Distribution ──────────────────────────────
  if (pieCategory && primaryMetric) {
    recommendations.push({
      type: 'Pie',
      title: `${primaryMetric} Share by ${pieCategory}`,
      xAxis: pieCategory,
      yAxis: primaryMetric,
      description: `Analyze the percentage and distribution of ${primaryMetric} by ${pieCategory}.`
    })
  }

  // ── 5. Area Chart: Volume Progression ────────────────────────────────────
  if (dateCol && (secondaryMetric || primaryMetric)) {
    const areaMetric = secondaryMetric || primaryMetric
    recommendations.push({
      type: 'Area',
      title: `${areaMetric} Volume Progression`,
      xAxis: dateCol,
      yAxis: areaMetric,
      description: `Visualize the cumulative trend and volume of ${areaMetric} over time.`
    })
  }

  // ── 6. Scatter Plot: Correlation Analysis ────────────────────────────────
  if (primaryMetric && secondaryMetric && primaryMetric !== secondaryMetric) {
    recommendations.push({
      type: 'Scatter',
      title: `${primaryMetric} vs ${secondaryMetric} Correlation`,
      xAxis: primaryMetric,
      yAxis: secondaryMetric,
      description: `Identify relationships and variance between ${primaryMetric} and ${secondaryMetric}.`
    })
  }

  // ── 7. Secondary KPI Metric (e.g. Total Profit or Quantity) ──────────────
  if (secondaryMetric && secondaryMetric !== primaryMetric) {
    recommendations.push({
      type: 'Metric',
      title: `Total ${secondaryMetric}`,
      yAxis: secondaryMetric,
      description: `Key performance indicator for overall ${secondaryMetric}.`
    })
  }

  // ── 8. Funnel Chart: Stage/Segment Breakdown ─────────────────────────────
  const funnelCategory = rankedCategories.find(c => c !== primaryCategory && c !== pieCategory) || rankedCategories[1] || primaryCategory
  if (funnelCategory && primaryMetric) {
    recommendations.push({
      type: 'Funnel',
      title: `${primaryMetric} by ${funnelCategory}`,
      xAxis: funnelCategory,
      yAxis: primaryMetric,
      description: `Sequential conversion and volume breakdown across ${funnelCategory}.`
    })
  }

  return recommendations
}

export async function getChartRecommendationsAsync(columnTypes, data = []) {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY
  
  if (!apiKey) {
    console.log("No Groq API key found. Falling back to heuristic recommendations.")
    return getChartRecommendations(columnTypes, data)
  }

  const sample = data.length > 0 ? data[0] : {}
  const schemaStr = JSON.stringify(columnTypes)
  const sampleStr = JSON.stringify(sample)

  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "openai/gpt-oss-20b",
        messages: [
          {
            role: "system",
            content: "You are a data visualization expert. You will receive a JSON schema of column types (e.g. string, number, date) and a sample data row. Your job is to return a JSON array of up to 6 recommended charts that best represent this data. The allowed chart types are: 'Metric', 'Bar', 'Line', 'Pie', 'Area', 'Scatter', 'Funnel'. Each recommendation must be an object with: 'type', 'title', 'xAxis' (can be null or omitted for Metric), 'yAxis' (must be a numeric column name), and 'description' (a short string). Respond ONLY with the JSON array, no markdown wrappers, no conversational text. The JSON array must start with '[' and end with ']'."
          },
          {
            role: "user",
            content: `Schema: ${schemaStr}\nSample: ${sampleStr}`
          }
        ],
        temperature: 0.2
      })
    })

    if (!res.ok) {
      throw new Error(`Groq API error: ${res.status} ${res.statusText}`)
    }

    const json = await res.json()
    let content = json.choices[0].message.content.trim()
    
    // Remove markdown code blocks if the LLM ignored instructions
    if (content.startsWith("```json")) content = content.replace(/^```json/, '')
    if (content.startsWith("```")) content = content.replace(/^```/, '')
    if (content.endsWith("```")) content = content.replace(/```$/, '')
    
    const parsed = JSON.parse(content.trim())
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed
    }
    
    throw new Error("Invalid LLM response format")
  } catch (err) {
    console.error("LLM recommendation failed, falling back to heuristics:", err)
    return getChartRecommendations(columnTypes, data)
  }
}

