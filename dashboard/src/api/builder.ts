const BUILDER_API_BASE = '/api/v1/builders'

function builderPath(name: string) {
  return `${BUILDER_API_BASE}/${encodeURIComponent(name)}`
}

function filenameFromContentDisposition(header: string | null, fallback: string): string {
  if (!header) {
    return fallback
  }

  const utf8Match = header.match(/filename\*=UTF-8''([^;]+)/i)
  if (utf8Match?.[1]) {
    return decodeURIComponent(utf8Match[1])
  }

  const quotedMatch = header.match(/filename="([^"]+)"/i)
  if (quotedMatch?.[1]) {
    return quotedMatch[1]
  }

  const plainMatch = header.match(/filename=([^;]+)/i)
  if (plainMatch?.[1]) {
    return plainMatch[1].trim()
  }

  return fallback
}

function downloadBlob(filename: string, blob: Blob) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

export async function buildCrew(id: string): Promise<void> {
  const response = await fetch(builderPath(id), {
    method: 'POST',
  })

  if (!response.ok) {
    let message = `Request failed (${response.status})`

    try {
      const body = (await response.json()) as { detail?: string }
      if (body.detail) {
        message = body.detail
      }
    } catch {
      // ignore non-JSON error bodies
    }

    throw new Error(message)
  }

  const blob = await response.blob()
  const filename = filenameFromContentDisposition(
    response.headers.get('Content-Disposition'),
    `${id}.zip`,
  )
  downloadBlob(filename, blob)
}
