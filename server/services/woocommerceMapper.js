/**
 * WooCommerce Data Mapper
 * Transforms WooCommerce API responses to our database schema
 */

/**
 * Map WooCommerce product status to our status
 */
function mapProductStatus(wcStatus) {
  const statusMap = {
    'publish': 'active',
    'draft': 'draft',
    'pending': 'draft',
    'private': 'draft',
    'trash': 'draft',
  };
  return statusMap[wcStatus] || 'draft';
}

/**
 * Map WooCommerce order status to our status
 */
function mapOrderStatus(wcStatus) {
  const statusMap = {
    'pending': 'pending',
    'processing': 'processing',
    'on-hold': 'pending',
    'completed': 'completed',
    'cancelled': 'cancelled',
    'refunded': 'refunded',
    'failed': 'failed',
  };
  return statusMap[wcStatus] || 'pending';
}

/**
 * Generate a unique handle from WooCommerce slug or name
 */
function generateHandle(slug, name, tenantId) {
  if (slug) {
    return slug.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');
  }
  // Fallback to name-based slug
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 255);
}

/**
 * Map WooCommerce product to our product schema
 */
export function mapWooCommerceProduct(wcProduct, tenantId) {
  const product = {
    name: wcProduct.name || 'Unnamed Product',
    description: wcProduct.description || wcProduct.short_description || null,
    handle: generateHandle(wcProduct.slug, wcProduct.name, tenantId),
    status: mapProductStatus(wcProduct.status),
    featured_image: wcProduct.images && wcProduct.images.length > 0 
      ? wcProduct.images[0].src 
      : null,
    tenant_id: tenantId,
    external_id: String(wcProduct.id),
    external_source: 'woocommerce',
  };

  return product;
}

/**
 * Map WooCommerce product variations to our product_variants schema
 */
export function mapWooCommerceVariants(wcProduct, productId, tenantId) {
  const variants = [];

  // If product has variations
  if (wcProduct.type === 'variable' && wcProduct.variations && wcProduct.variations.length > 0) {
    // Note: WooCommerce variations are separate API calls
    // This function expects variations to be fetched separately
    // For now, we'll create a default variant from the main product
    console.warn('[testing] Variable products require separate variation API calls');
  }

  // Create default variant from main product
  // WooCommerce simple products become single variants
  const defaultVariant = {
    product_id: productId,
    sku: wcProduct.sku || null,
    title: 'Default',
    price: parseFloat(wcProduct.price || 0),
    compare_at_price: wcProduct.regular_price && wcProduct.regular_price !== wcProduct.price
      ? parseFloat(wcProduct.regular_price)
      : null,
    inventory_quantity: wcProduct.stock_quantity || 0,
    inventory_management: wcProduct.manage_stock !== false,
    tenant_id: tenantId,
  };

  variants.push(defaultVariant);

  return variants;
}

/**
 * Map WooCommerce categories to our product_categories schema
 */
export function mapWooCommerceCategories(wcCategories, tenantId) {
  if (!Array.isArray(wcCategories)) {
    return [];
  }

  return wcCategories.map(cat => ({
    name: cat.name || 'Unnamed Category',
    slug: cat.slug || generateHandle(null, cat.name, tenantId),
    description: cat.description || null,
    parent_id: null, // We'll handle parent relationships separately if needed
    tenant_id: tenantId,
    external_id: String(cat.id),
    external_source: 'woocommerce',
  }));
}

/**
 * Map WooCommerce order to our order schema
 */
export function mapWooCommerceOrder(wcOrder, tenantId) {
  const billing = wcOrder.billing || {};
  const shipping = wcOrder.shipping || {};

  const order = {
    order_number: wcOrder.number || `WC-${wcOrder.id}`,
    customer_email: billing.email || null,
    customer_first_name: billing.first_name || null,
    customer_last_name: billing.last_name || null,
    status: mapOrderStatus(wcOrder.status),
    subtotal: parseFloat(wcOrder.subtotal || 0),
    tax_amount: parseFloat(wcOrder.total_tax || 0),
    shipping_amount: parseFloat(wcOrder.shipping_total || 0),
    total_amount: parseFloat(wcOrder.total || 0),
    shipping_address: shipping.address_1 ? {
      first_name: shipping.first_name || null,
      last_name: shipping.last_name || null,
      company: shipping.company || null,
      address_1: shipping.address_1 || null,
      address_2: shipping.address_2 || null,
      city: shipping.city || null,
      state: shipping.state || null,
      postcode: shipping.postcode || null,
      country: shipping.country || null,
    } : null,
    billing_address: billing.address_1 ? {
      first_name: billing.first_name || null,
      last_name: billing.last_name || null,
      company: billing.company || null,
      address_1: billing.address_1 || null,
      address_2: billing.address_2 || null,
      city: billing.city || null,
      state: billing.state || null,
      postcode: billing.postcode || null,
      country: billing.country || null,
      email: billing.email || null,
      phone: billing.phone || null,
    } : null,
    tenant_id: tenantId,
    external_id: String(wcOrder.id),
    external_source: 'woocommerce',
  };

  return order;
}

/**
 * Map WooCommerce order line items to our order_items schema
 */
export function mapWooCommerceOrderItems(wcOrder, orderId, productMap = {}) {
  // productMap: { wc_product_id: our_product_id }
  const items = [];

  if (!Array.isArray(wcOrder.line_items)) {
    return items;
  }

  for (const lineItem of wcOrder.line_items) {
    // Try to find matching product by external_id
    // If not found, we'll need to create a placeholder or skip
    const productId = productMap[lineItem.product_id] || null;
    const variantId = lineItem.variation_id ? productMap[lineItem.variation_id] : null;

    const item = {
      order_id: orderId,
      product_id: productId,
      variant_id: variantId,
      quantity: parseInt(lineItem.quantity || 1),
      unit_price: parseFloat(lineItem.price || 0),
      total_price: parseFloat(lineItem.total || 0),
    };

    items.push(item);
  }

  return items;
}

/**
 * Helper to create product map from WooCommerce product IDs
 * Returns: { wc_product_id: our_product_id }
 */
export async function createProductMap(wcProductIds, tenantId, query) {
  if (!Array.isArray(wcProductIds) || wcProductIds.length === 0) {
    return {};
  }

  const productMap = {};
  const externalIds = wcProductIds.map(id => String(id));

  // Find existing products by external_id
  const result = await query(`
    SELECT id, external_id
    FROM products
    WHERE tenant_id = $1 
      AND external_source = 'woocommerce'
      AND external_id = ANY($2::text[])
  `, [tenantId, externalIds]);

  for (const row of result.rows) {
    productMap[row.external_id] = row.id;
  }

  return productMap;
}

/**
 * Calculate order totals from line items (fallback if WooCommerce doesn't provide)
 */
export function calculateOrderTotals(lineItems, shippingTotal = 0, taxTotal = 0) {
  const subtotal = lineItems.reduce((sum, item) => {
    return sum + parseFloat(item.total || 0);
  }, 0);

  return {
    subtotal,
    tax_amount: parseFloat(taxTotal || 0),
    shipping_amount: parseFloat(shippingTotal || 0),
    total_amount: subtotal + parseFloat(taxTotal || 0) + parseFloat(shippingTotal || 0),
  };
}
