import client from './client';

function normalizeProduct(p) {
  return {
    ...p,
    category: p.category?.toLowerCase(),
  };
}

function toProductPayload(payload) {
  const normalizedCategory = payload.category?.toUpperCase();
  if (payload.imageFile) {
    const formData = new FormData();
    formData.append('name', payload.name);
    if (payload.description) formData.append('description', payload.description);
    formData.append('price', String(payload.price));
    formData.append('stock', String(payload.stock));
    formData.append('category', normalizedCategory);
    formData.append('image', payload.imageFile);
    return formData;
  }

  return {
    ...payload,
    category: normalizedCategory,
    imageFile: undefined,
  };
}

function normalizeOrder(o) {
  return {
    ...o,
    status: o.status?.toLowerCase(),
    items: (o.items || []).map((item) => ({
      ...item,
      product: item.product
        ? { ...item.product, category: item.product.category?.toLowerCase() }
        : null,
    })),
  };
}

export const shopApi = {
  // Products
  getProducts: async (params = {}) => {
    const res = await client.get('/products', { params });
    return {
      data: res.data.data.map(normalizeProduct),
      meta: res.data.meta,
    };
  },

  createProduct: async (payload) => {
    const res = await client.post('/products', toProductPayload(payload));
    return normalizeProduct(res.data.data);
  },

  updateProduct: async (id, payload) => {
    const res = await client.put(`/products/${id}`, toProductPayload(payload));
    return normalizeProduct(res.data.data);
  },

  removeProduct: async (id) => {
    await client.delete(`/products/${id}`);
  },

  // Orders
  getOrders: async (params = {}) => {
    const res = await client.get('/orders', { params });
    return {
      data: res.data.data.map(normalizeOrder),
      meta: res.data.meta,
    };
  },

  placeOrder: async ({ items, address, note }) => {
    const res = await client.post('/orders', { items, address, note });
    return normalizeOrder(res.data.data);
  },

  updateOrderStatus: async (id, status) => {
    const res = await client.patch(`/orders/${id}/status`, { status: status.toUpperCase() });
    return normalizeOrder(res.data.data);
  },
};
