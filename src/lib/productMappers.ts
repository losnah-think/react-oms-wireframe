import type { ProductFormData } from 'src/types/multitenant'

function f(p: any, camel: string, snake?: string) {
  return p?.[camel] ?? (snake ? p?.[snake] : undefined) ?? undefined
}

export function mapDbProductToForm(p: any): ProductFormData {
  const sellingPrice = Number(f(p, 'sellingPrice', 'selling_price') ?? 0)
  const consumerPrice = Number(f(p, 'consumerPrice', 'consumer_price') ?? 0)
  const supplyPrice = Number(f(p, 'supplyPrice', 'supply_price') ?? 0)

  const images = (f(p, 'images') ?? f(p, 'image_urls') ?? f(p, 'images_json') ?? [])
  const descriptionImages = (f(p, 'descriptionImages') ?? f(p, 'description_images') ?? [])
  const tags = (f(p, 'tags') ?? f(p, 'tag_list') ?? [])

  const mapped: ProductFormData = {
    basicInfo: {
      productName: String(f(p, 'name', 'product_name') ?? ''),
      englishProductName: String(f(p, 'englishName', 'english_name') ?? ''),
      productCode: String(f(p, 'code') ?? f(p, 'sku') ?? String(f(p, 'id') ?? '')),
      productCategory: String(f(p, 'categoryName', 'category_name') ?? ''),
      brandId: f(p, 'brand_id') ?? f(p, 'brandId') ?? '',
      supplierId: f(p, 'supplier_id') ?? f(p, 'supplierId') ?? '',
      codes: {
        internal: String(f(p, 'code') ?? f(p, 'sku') ?? String(f(p, 'id') ?? '')),
        cafe24: String(f(p, 'external_id') ?? f(p, 'externalId') ?? ''),
        channels: f(p, 'channels') ?? [],
      },
      categoryId: f(p, 'category_id') ?? f(p, 'categoryId') ?? '',
      pricing: {
        sellingPrice,
        consumerPrice,
        supplyPrice,
        commissionRate: Number(f(p, 'commission_rate', 'commissionRate') ?? 0),
        isSupplyPriceCalculated: true,
        calculationMethod: 'commission',
      },
      originalCost: Number(f(p, 'cost_price', 'costPrice') ?? 0),
      representativeSellingPrice: sellingPrice,
      representativeSupplyPrice: supplyPrice,
      marketPrice: Number(f(p, 'market_price', 'marketPrice') ?? 0),
      consumerPrice: consumerPrice,
      foreignCurrencyPrice: Number(f(p, 'foreign_currency_price', 'foreignCurrencyPrice') ?? 0),
      stock: Number(f(p, 'stock') ?? 0),
      safeStock: Number(f(p, 'safe_stock', 'safeStock') ?? 0),
      isOutOfStock: !!(f(p, 'is_soldout') ?? f(p, 'isSoldout') ?? false),
      isSelling: !!(f(p, 'is_selling') ?? f(p, 'isSelling') ?? false),
      isSoldout: !!(f(p, 'is_soldout') ?? f(p, 'isSoldout') ?? false),
      description: String(f(p, 'description') ?? ''),
      representativeImage: String(f(p, 'representative_image') ?? f(p, 'thumbnail_url') ?? ''),
      descriptionImages: Array.isArray(descriptionImages) ? descriptionImages : String(descriptionImages).split(',').filter(Boolean),
      thumbnailUrl: String(f(p, 'thumbnail_url') ?? ''),
      images: Array.isArray(images) ? images : String(images).split(',').filter(Boolean),
      width: Number(f(p, 'width') ?? 0),
      height: Number(f(p, 'height') ?? 0),
      depth: Number(f(p, 'depth') ?? 0),
      weight: Number(f(p, 'weight') ?? 0),
      volume: Number(f(p, 'volume') ?? 0),
      hsCode: String(f(p, 'hs_code', 'hsCode') ?? ''),
      origin: String(f(p, 'origin_country', 'origin') ?? ''),
      isTaxExempt: !!(f(p, 'is_dutyfree') ?? f(p, 'isTaxExempt') ?? false),
      showProductNameOnInvoice: true,
      productDesigner: String(f(p, 'designer') ?? ''),
      productRegistrant: String(f(p, 'registrant') ?? ''),
      productYear: String(f(p, 'product_year') ?? ''),
      productSeason: String(f(p, 'product_season') ?? ''),
      externalProductId: String(f(p, 'external_sku') ?? f(p, 'external_sku') ?? f(p, 'externalId') ?? ''),
      externalUrl: String(f(p, 'external_url', 'externalUrl') ?? ''),
      active: (f(p, 'active') === undefined) ? true : !!f(p, 'active'),
      tags: Array.isArray(tags) ? tags : String(tags).split(',').filter(Boolean),
      logistics: {
        width: Number(f(p, 'width') ?? 0),
        height: Number(f(p, 'height') ?? 0),
        depth: Number(f(p, 'depth') ?? 0),
        weight: Number(f(p, 'weight') ?? 0),
        packagingUnit: f(p, 'packaging_unit') ?? 'ea',
        packagingQuantity: Number(f(p, 'packaging_quantity') ?? 1),
        isFragile: !!(f(p, 'is_fragile') ?? false),
        isLiquid: !!(f(p, 'is_liquid') ?? false),
      },
      policies: {
        showProductNameOnInvoice: true,
        preventConsolidation: false,
        shippingPolicyId: undefined,
        giftPolicyId: undefined,
        isSampleIncluded: false,
        isReturnable: true,
        isExchangeable: true,
        returnPeriodDays: 14,
      },
    },
    additionalInfo: {
      productDesigner: String(f(p, 'designer') ?? ''),
      publishDate: f(p, 'published_at') ? new Date(f(p, 'published_at')) : undefined,
      detailedLogistics: {
        width: f(p, 'width') ?? undefined,
        height: f(p, 'height') ?? undefined,
        depth: f(p, 'depth') ?? undefined,
        weight: f(p, 'weight') ?? undefined,
        packagingUnit: f(p, 'packaging_unit') ?? 'ea',
        packagingQuantity: Number(f(p, 'packaging_quantity') ?? 1),
        isFragile: !!(f(p, 'is_fragile') ?? false),
        isLiquid: !!(f(p, 'is_liquid') ?? false),
        packageWidth: f(p, 'package_width') ?? undefined,
        packageHeight: f(p, 'package_height') ?? undefined,
        packageDepth: f(p, 'package_depth') ?? undefined,
        packageWeight: f(p, 'package_weight') ?? undefined,
        countryOfOrigin: f(p, 'origin_country') ?? 'KR',
        hsCode: f(p, 'hs_code') ?? '',
        storageConditions: f(p, 'storage_conditions') ?? '',
        shelfLife: f(p, 'shelf_life') ?? undefined,
      },
      // map variants/options if present
      options: (function () {
        const opts = f(p, 'options') ?? f(p, 'product_options') ?? f(p, 'variants') ?? []
        if (!Array.isArray(opts)) return undefined
        return opts.map((o: any) => ({
          id: o.id ?? String(o.option_id ?? ''),
          name: o.name ?? o.option_name ?? '옵션',
          type: o.type ?? (o.name && /color/i.test(o.name) ? 'color' : 'other'),
          values: (o.values ?? o.option_values ?? o.variants ?? []).map((v: any) => ({
            id: v.id ?? String(v.variant_id ?? ''),
            value: v.value ?? v.name ?? String(v.sku ?? ''),
            additionalPrice: Number(v.price_delta ?? v.additional_price ?? 0),
            stock: Number(v.stock ?? v.inventory ?? 0),
            isActive: !(v.disabled || v.inactive),
          })),
          isRequired: !!o.required,
        }))
      })(),
    },
    validation: {
      errors: {},
      warnings: {},
      isValid: true,
      touchedFields: new Set(),
    },
  }
  return mapped
}

export default mapDbProductToForm
