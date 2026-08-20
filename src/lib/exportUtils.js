/**
 * Export data array to a downloadable CSV file.
 * @param {string} filename - Name of the exported CSV file
 * @param {Array<{key: string, label: string}>} headers - Column mappings
 * @param {Array<Object>} data - Array of row objects
 */
export function exportToCSV(filename, headers, data) {
  if (!data || !data.length) return

  const csvRows = []
  
  // Header row
  csvRows.push(headers.map((h) => `"${h.label.replace(/"/g, '""')}"`).join(','))

  // Data rows
  data.forEach((row) => {
    const values = headers.map((h) => {
      const val = row[h.key] ?? ''
      return `"${String(val).replace(/"/g, '""')}"`
    })
    csvRows.push(values.join(','))
  })

  const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + encodeURIComponent(csvRows.join('\n'))
  const link = document.createElement('a')
  link.setAttribute('href', csvContent)
  link.setAttribute('download', `${filename}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
