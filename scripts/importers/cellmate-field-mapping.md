Cellmate -> DB Field Mapping

This document lists the external (Cellmate/Cafe24) product input fields found in the codebase and recommends how to map them into the new DB schema (`products`, `product_variants`, `suppliers`, `inventory_movements`). Use this as the canonical mapping when implementing import adapters.

Columns: Source Field | Example(s) | Source Location | Target Table.Column | DB Type | Notes

- `product_no` | `CM-1001` | `ExternalProduct.product_no`, `ExternalProductImportPage.tsx` | `products.product_code` | text | Primary external product code; use to dedupe imports
- `externalId` | `cafe24-12345` | API responses | `products.external_product_id` | text | Save original external ID for sync
- `name` / `productName` | `샘플 상품` | `ProductsEditPage`, `Product.ts` | `products.product_name` | text | Main product title
- `englishName` / `englishProductName` | `Sample Product` | `ProductsEditPage` | `products.english_product_name` | text | Optional
- `description` | long html/text | `Product.ts` | `products.description` | text | Can be long -> store as text
- `images` / `image` / `representativeImage` | URL list | UI props, ExternalProduct | `products.representative_image` (primary), `products.description_images` (json) | text / text[] | Keep JSON array in `description_images`
- `price` / `sellingPrice` / `representativeSellingPrice` | `10000` | `ExternalProduct.price`, UI | `products.representative_selling_price` (integer) | numeric | Store in KRW (integer or numeric)
- `originalCost` / `cost` / `representativeSupplyPrice` | `6000` | UI types, Product model | `products.original_cost` / `product_variants.cost_price` | numeric | Cost may exist on variant or product
- `consumerPrice` / `marketPrice` | `12000` | Product model | `products.consumer_price` / `products.market_price` | numeric
- `stock` / `inventory` | `50` | `ExternalProduct.inventory`, UI | `product_variants.stock` and/or `products.stock` | integer | Prefer variant-level stock; update product.stock as aggregate (or store legacy product-level stock)
- `safeStock` | `10` | Product model | `product_variants.safe_stock` / `products.safe_stock` | integer
- `isSelling` / `selling` / `sellStatus` | boolean/'Y'|'N' | ExternalProduct, UI | `product_variants.is_selling` / `products.is_selling` | boolean
- `isOutOfStock` / `isSoldout` | boolean | Product model | `product_variants.is_soldout` / `products.is_out_of_stock` | boolean
- `categoryId` / `productCategory` | `cat-1` | `ProductsEditPage` | `products.category_id` | text (FK) | Map to internal category IDs; support auto-create if `autoRegisterCategory` selected
- `brandId` / `brand` | `brand-1` | UI, External | `products.brand_id` | text (FK)
- `supplierId` | `supplier-1` | UI | `products.supplier_id` | uuid FK -> `suppliers.id` | If external supplier info exists, create supplier record
- `hsCode` | `123456` | `detailedLogistics` | `products.hs_code` | text
- `origin` / `countryOfOrigin` | `KR` | `detailedLogistics` | `products.origin` | text
- `width/height/depth/weight/volume` | `20, 15, 5, 300` | logistics fields | `products.width`/`height`/`depth`/`weight`/`volume` | numeric
- `packagingUnit` / `packagingQuantity` | `ea` / `1` | logistics | `products.packaging_unit`, `products.packaging_quantity` | text/integer
- `options` | `{ color: 'Black', size: 'M' }` | `ExternalProduct.options` | `product_variants.option_values` (jsonb) | jsonb | Each unique combination becomes a variant. SKU generation strategy below.
- `optionName` / `variantName` / `sku` | `Black / M`, `SKU-001` | UI/types | `product_variants.variant_name` / `product_variants.sku` | text
- `barcode`, `barcodeNumber`, `barcode1..3` | `8801234...` | UI/types | `product_variants.barcode` / `product_variants.barcode1..3` | text
- `linkCode` | external link code | types | `product_variants.link_code` | text
- `externalUrl` / `externalProductId` | url/id | Product model | `products.external_url`, `products.external_product_id` | text
- `createdAt`/`registDate` / `modifyDate` / `last_update` | timestamps | ExternalProduct UI | `products.created_at`, `products.updated_at` | timestamptz
- `inventory_movements` (import record) | generated | importer should create a row per import with: `product_id`, `variant_id`, `quantity`, `type='import'`, `note` | `inventory_movements` table | Use for audit and backfills

SKU generation heuristic (importer)
- Prefer explicit `sku` from external data.
- Otherwise: use `product_code` + hashed option key: `${product_code || product_id}-${hash(options)}` (ensures uniqueness across option combinations).

Variant creation logic
- If `options` is empty -> create a single default variant for the product (SKU = product_code or product.id).
- If `options` present -> create/update one variant per option combination using above SKU heuristic.

Deduplication strategy
- Primary: `products.external_product_id` (if present)
- Secondary: `products.product_code` (external `product_no`)
- Tertiary: if neither exists, create a new product and store `external_product_id` when possible.

Notes
- Keep product-level `stock` for backward compatibility; prefer authoritative stock on `product_variants`.
- Barcodes should be stored at variant-level when available.
- Price fields: prefer variant-level pricing when external data exposes it; otherwise apply to product-level representative price.
- Consider adding unique indexes on `external_product_id` and `product_code` in production to speed up imports and enforce uniqueness.

