export function normalizeProductGroup(product: any) {
  if (!product || typeof product !== 'object') return product
  const p = { ...product }
  // prefer explicit group fields, fall back to legacy classification/category fields
  p.group_id = p.group_id ?? p.groupId ?? p.classification_id ?? p.classificationId ?? p.category_id ?? p.categoryId ?? null
  p.group = p.group ?? p.group_name ?? p.groupName ?? p.classification ?? p.classification_name ?? p.classificationName ?? p.category_name ?? p.categoryName ?? null
  return p
}
