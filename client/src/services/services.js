import api from './api';

export const productService = {
  getProducts: (params = {}) => api.get('/products', { params }),
  getProductById: (id) => api.get(`/products/${id}`),
  createProduct: (productData) => api.post('/products', productData),
  updateProduct: (id, productData) => api.put(`/products/${id}`, productData),
  deleteProduct: (id) => api.delete(`/products/${id}`),
  suggestFromImage: (formData) => api.post('/products/suggest-from-image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  repeatListing: (id) => api.post(`/products/${id}/repeat`),
  translateDescription: (id, targetLanguage) => api.post(`/products/${id}/translate`, { targetLanguage })
};

export const cartService = {
  getCart: () => api.get('/cart'),
  addToCart: (productId, quantity = 1) => api.post('/cart/items', { productId, quantity }),
  updateQuantity: (productId, quantity) => api.put(`/cart/items/${productId}`, { quantity }),
  removeItem: (productId) => api.delete(`/cart/items/${productId}`)
};

export const checkoutService = {
  estimateDelivery: (customerAddress) => api.post('/checkout/estimate-delivery', { customerAddress }),
  createOrder: (data) => api.post('/checkout/create-order', data),
  verifyPayment: (data) => api.post('/checkout/verify-payment', data),
  refundPayment: (paymentId) => api.post(`/payments/${paymentId}/refund`)
};

export const orderService = {
  getOrders: (params = {}) => api.get('/orders', { params }),
  getOrderById: (id) => api.get(`/orders/${id}`),
  acceptOrder: (id) => api.put(`/orders/${id}/accept`),
  rejectOrder: (id, rejectionReason) => api.put(`/orders/${id}/reject`, { rejectionReason }),
  markReadyForPickup: (id) => api.put(`/orders/${id}/ready-for-pickup`),
  assignDelivery: (id, deliveryPartnerId) => api.put(`/orders/${id}/assign-delivery`, { deliveryPartnerId }),
  updateCheckpoint: (id, location, status) => api.put(`/orders/${id}/checkpoint`, { location, status }),
  confirmCodPayment: (id) => api.put(`/orders/${id}/confirm-cod`),
  markDelivered: (id) => api.put(`/orders/${id}/mark-delivered`),
  cancelOrder: (id, reason) => api.post(`/orders/${id}/cancel`, { reason })
};

export const disputeService = {
  getDisputes: (params = {}) => api.get('/disputes', { params }),
  createDispute: (data) => api.post('/disputes', data),
  uploadVoiceNote: (formData) => api.post('/disputes/voice-note', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  updateTrustCircleReview: (id, data) => api.put(`/disputes/${id}/trust-circle-review`, data),
  resolveDispute: (id, data) => api.put(`/disputes/${id}/resolve`, data)
};

export const sellerService = {
  getPublicProfile: (id) => api.get(`/sellers/${id}`),
  getAnalytics: () => api.get('/sellers/me/analytics'),
  getVault: () => api.get('/sellers/me/vault'),
  updateVaultSettings: (balancePercentSetting) => api.put('/sellers/me/vault/settings', { balancePercentSetting }),
  unlockVaultFunds: (amount, reason) => api.post('/sellers/me/vault/unlock', { amount, reason }),
  getCatalogShare: () => api.get('/sellers/me/catalog-share'),
  updateProfile: (data) => api.put('/sellers/me/profile', data)
};

export const deliveryService = {
  getAssignments: () => api.get('/delivery/assignments'),
  getNearbyPickups: () => api.get('/delivery/nearby-pickups'),
  updateProfile: (data) => api.put('/delivery/profile', data)
};

export const adminService = {
  getPendingSellers: () => api.get('/admin/sellers/pending'),
  approveSeller: (id) => api.put(`/admin/sellers/${id}/approve`),
  suspendSeller: (id, reason) => api.put(`/admin/sellers/${id}/suspend`, { reason }),
  getAnalytics: () => api.get('/admin/analytics'),
  getAllOrders: (params = {}) => api.get('/admin/orders', { params }),
  getAllPayments: (params = {}) => api.get('/admin/payments', { params }),
  adjustCodFloat: (data) => api.put('/admin/cod-float', data)
};

export const reviewService = {
  createReview: (reviewData) => api.post('/reviews', reviewData),
  getReviews: (params = {}) => api.get('/reviews', { params })
};

export const notificationService = {
  getNotifications: () => api.get('/notifications'),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all')
};

export const wishlistService = {
  getWishlist: () => api.get('/wishlist'),
  toggleWishlist: (productId) => api.post('/wishlist/toggle', { productId })
};
