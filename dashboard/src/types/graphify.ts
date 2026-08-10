export const MIN_GRAPHIFY_DESCRIPTION_LENGTH = 100
export const MAX_GRAPHIFY_DESCRIPTION_LENGTH = 2048

export function formatCharacterCount(length: number, max: number) {
  return `${length}/${max}`
}

export function validateGraphifyUri(uri: string): string | null {
  const trimmed = uri.trim()

  if (!trimmed) {
    return 'URI is required'
  }

  try {
    new URL(trimmed)
  } catch {
    return 'URI must be a valid URL'
  }

  return null
}

export function validateGraphifyDescription(description: string): string | null {
  const trimmed = description.trim()

  if (!trimmed) {
    return 'Description is required'
  }

  if (trimmed.length < MIN_GRAPHIFY_DESCRIPTION_LENGTH) {
    return `Description must be at least ${MIN_GRAPHIFY_DESCRIPTION_LENGTH} characters`
  }

  if (trimmed.length > MAX_GRAPHIFY_DESCRIPTION_LENGTH) {
    return `Description must be at most ${MAX_GRAPHIFY_DESCRIPTION_LENGTH} characters`
  }

  return null
}

export type Graphify = {
  id: string
  type: string
  uri: string
  description: string
  updated_at: string
}

export const initialGraphifys: Graphify[] = [
  {
    id: 'gfy-001',
    type: 'line-chart',
    uri: 'https://api.example.com/graphs/revenue',
    description: 'Monthly revenue trends across all product lines.',
    updated_at: '2026-07-28T14:32:00Z',
  },
  {
    id: 'gfy-002',
    type: 'bar-chart',
    uri: 'https://api.example.com/graphs/user-growth',
    description: 'New user sign-ups grouped by region and acquisition channel.',
    updated_at: '2026-07-27T09:15:00Z',
  },
  {
    id: 'gfy-003',
    type: 'pie-chart',
    uri: 'https://api.example.com/graphs/traffic-sources',
    description: 'Breakdown of website traffic by referrer and campaign.',
    updated_at: '2026-07-25T18:45:00Z',
  },
  {
    id: 'gfy-004',
    type: 'funnel',
    uri: 'https://api.example.com/graphs/conversion',
    description: 'Conversion funnel from landing page visit to completed purchase.',
    updated_at: '2026-07-29T11:20:00Z',
  },
  {
    id: 'gfy-005',
    type: 'heatmap',
    uri: 'https://api.example.com/graphs/retention',
    description: 'User retention cohort analysis over a 12-month period.',
    updated_at: '2026-07-20T16:00:00Z',
  },
]

export type NewGraphifyInput = {
  uri: string
  description: string
}
