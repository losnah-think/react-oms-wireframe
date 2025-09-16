import supabaseAdmin from './supabaseClient'

// runtime-safe require for mock fallback (avoid build-time resolution failures)
function tryRequireMock() {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const path = require('path')
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const root = process.cwd()
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mod = require(path.join(root, 'src', 'data', 'mockClassifications'))
    return mod?.mockClassifications || mod?.default || []
  } catch (e) {
    return []
  }
}

export type ClassificationNode = {
  id: string
  name: string
  slug?: string
  children?: ClassificationNode[]
}

export async function listClassifications(): Promise<ClassificationNode[]> {
  try {
    const { data, error } = await supabaseAdmin.from('product_classifications').select('*')
    if (error) throw error
    if (data && data.length > 0) return data as ClassificationNode[]
  } catch (e) {
    // swallow and fallback to mock
  }
  return tryRequireMock() as ClassificationNode[]
}
