import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  Box,
  CheckCircle,
  Edit2,
  Minus,
  Package,
  Plus,
  ShoppingBag,
  ShoppingCart,
  Trash2,
  X,
  Zap,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { shopApi } from '../../api/shop.api';
import { getErrorMessage } from '../../utils/formatters';
import ConfirmDialog from '../shared/ConfirmDialog';
import ErrorState from '../shared/ErrorState';
import Modal from '../shared/Modal';
import Spinner from '../shared/Spinner';

const CATEGORY_META = {
  protein:   { label: 'Gym Proteins',   color: '#e11d48', bg: 'rgba(225,29,72,0.1)',   icon: Zap },
  equipment: { label: 'Gym Equipment',  color: '#3b82f6', bg: 'rgba(59,130,246,0.1)',  icon: Box },
};

const STATUS_COLOR = {
  pending:   { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  confirmed: { color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
  shipped:   { color: '#a855f7', bg: 'rgba(168,85,247,0.1)' },
  delivered: { color: '#22c55e', bg: 'rgba(34,197,94,0.1)' },
  cancelled: { color: '#6b7280', bg: 'rgba(107,114,128,0.1)' },
};

const ALL_STATUSES = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

export default function Shop() {
  const { state } = useApp();
  const role = state.currentUser?.role;
  const isSuperAdmin = role === 'SUPER_ADMIN';

  // ── Products ─────────────────────────────────────────────────────────────────
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [categoryTab, setCategoryTab] = useState('all');

  // ── Cart ─────────────────────────────────────────────────────────────────────
  const [cart, setCart] = useState({}); // { productId: qty }
  const [showCart, setShowCart] = useState(false);
  const [orderAddress, setOrderAddress] = useState('');
  const [orderNote, setOrderNote] = useState('');
  const [placing, setPlacing] = useState(false);
  const [placeError, setPlaceError] = useState('');
  const [orderSuccess, setOrderSuccess] = useState(null);

  // ── Orders tab ───────────────────────────────────────────────────────────────
  const [tab, setTab] = useState('shop'); // 'shop' | 'orders'
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState('');

  // ── Product management (super admin) ─────────────────────────────────────────
  const [showProductModal, setShowProductModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [productForm, setProductForm] = useState({ name: '', description: '', price: '', stock: '', category: 'protein' });
  const [productSaving, setProductSaving] = useState(false);
  const [productSaveError, setProductSaveError] = useState('');
  const [deleteProductId, setDeleteProductId] = useState(null);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await shopApi.getProducts({ limit: 100 });
      setProducts(res.data);
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, []);

  const loadOrders = useCallback(async () => {
    setOrdersLoading(true);
    setOrdersError('');
    try {
      const res = await shopApi.getOrders({ limit: 50 });
      setOrders(res.data);
    } catch (e) {
      setOrdersError(getErrorMessage(e));
    } finally {
      setOrdersLoading(false);
    }
  }, []);

  useEffect(() => { loadProducts(); }, [loadProducts]);

  useEffect(() => {
    if (tab === 'orders') loadOrders();
  }, [tab, loadOrders]);

  // ── Cart helpers ─────────────────────────────────────────────────────────────
  const cartItems = useMemo(() => {
    return Object.entries(cart)
      .map(([productId, qty]) => {
        const product = products.find((p) => p.id === Number(productId));
        return product ? { product, qty } : null;
      })
      .filter(Boolean);
  }, [cart, products]);

  const cartTotal = cartItems.reduce((sum, { product, qty }) => sum + product.price * qty, 0);
  const cartCount = Object.values(cart).reduce((s, q) => s + q, 0);

  const addToCart = (product) => {
    setCart((prev) => {
      const current = prev[product.id] || 0;
      if (current >= product.stock) return prev;
      return { ...prev, [product.id]: current + 1 };
    });
  };

  const removeFromCart = (productId) => {
    setCart((prev) => {
      const next = { ...prev };
      if (next[productId] > 1) {
        next[productId] -= 1;
      } else {
        delete next[productId];
      }
      return next;
    });
  };

  const clearCart = () => setCart({});

  // ── Place order ───────────────────────────────────────────────────────────────
  const handlePlaceOrder = async () => {
    if (!cartItems.length) return;
    setPlacing(true);
    setPlaceError('');
    try {
      const items = cartItems.map(({ product, qty }) => ({ productId: product.id, quantity: qty }));
      const order = await shopApi.placeOrder({ items, address: orderAddress, note: orderNote });
      setOrderSuccess(order);
      clearCart();
      setShowCart(false);
      setOrderAddress('');
      setOrderNote('');
      loadProducts(); // refresh stock
    } catch (e) {
      setPlaceError(getErrorMessage(e));
    } finally {
      setPlacing(false);
    }
  };

  // ── Filtered products ────────────────────────────────────────────────────────
  const displayed = useMemo(() => {
    if (categoryTab === 'all') return products;
    return products.filter((p) => p.category === categoryTab);
  }, [products, categoryTab]);

  // ── Product form ─────────────────────────────────────────────────────────────
  const openAddProduct = () => {
    setProductForm({ name: '', description: '', price: '', stock: '', category: 'protein' });
    setEditProduct(null);
    setProductSaveError('');
    setShowProductModal(true);
  };

  const openEditProduct = (product) => {
    setProductForm({
      name: product.name,
      description: product.description || '',
      price: String(product.price),
      stock: String(product.stock),
      category: product.category,
    });
    setEditProduct(product);
    setProductSaveError('');
    setShowProductModal(true);
  };

  const handleProductSave = async (e) => {
    e.preventDefault();
    setProductSaving(true);
    setProductSaveError('');
    try {
      const payload = {
        name: productForm.name.trim(),
        description: productForm.description.trim() || undefined,
        price: parseFloat(productForm.price),
        stock: parseInt(productForm.stock, 10),
        category: productForm.category,
      };
      if (editProduct) {
        await shopApi.updateProduct(editProduct.id, payload);
      } else {
        await shopApi.createProduct(payload);
      }
      setShowProductModal(false);
      await loadProducts();
    } catch (e) {
      setProductSaveError(getErrorMessage(e));
    } finally {
      setProductSaving(false);
    }
  };

  const handleDeleteProduct = async () => {
    try {
      await shopApi.removeProduct(deleteProductId);
      setDeleteProductId(null);
      await loadProducts();
    } catch (e) {
      setError(getErrorMessage(e));
    }
  };

  const handleCancelOrder = async (orderId) => {
    try {
      const updated = await shopApi.updateOrderStatus(orderId, 'CANCELLED');
      setOrders((prev) => prev.map((o) => o.id === updated.id ? updated : o));
    } catch (e) {
      setOrdersError(getErrorMessage(e));
    }
  };

  const handleOrderStatus = async (orderId, status) => {
    try {
      const updated = await shopApi.updateOrderStatus(orderId, status);
      setOrders((prev) => prev.map((o) => o.id === updated.id ? updated : o));
    } catch (e) {
      setOrdersError(getErrorMessage(e));
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h2 className="page-title">Shop</h2>
          <p className="page-subtitle">{products.length} products · Proteins &amp; Equipment</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {isSuperAdmin && (
            <button className="btn btn-secondary" onClick={openAddProduct}>
              <Plus size={14} /> Add Product
            </button>
          )}
          {tab === 'shop' && (
            <button className="btn btn-primary" style={{ position: 'relative' }} onClick={() => setShowCart(true)}>
              <ShoppingCart size={14} /> Cart
              {cartCount > 0 && (
                <span style={{ position: 'absolute', top: -6, right: -6, background: '#f59e0b', color: '#000', fontSize: 10, fontWeight: 900, width: 18, height: 18, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {cartCount}
                </span>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Order success banner */}
      {orderSuccess && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: 'var(--radius)', marginBottom: 20, color: '#22c55e', fontWeight: 600, fontSize: 13 }}>
          <CheckCircle size={16} />
          Order #{orderSuccess.id} placed! Total: ${orderSuccess.total.toFixed(2)}
          <button onClick={() => setOrderSuccess(null)} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: '#22c55e' }}><X size={14} /></button>
        </div>
      )}

      {/* Tabs */}
      <div className="tabs">
        <button className={`tab-btn ${tab === 'shop' ? 'active' : ''}`} onClick={() => setTab('shop')}>
          <ShoppingBag size={13} /> Browse
        </button>
        <button className={`tab-btn ${tab === 'orders' ? 'active' : ''}`} onClick={() => setTab('orders')}>
          <Package size={13} /> {isSuperAdmin ? 'All Orders' : 'My Orders'}
        </button>
      </div>

      {/* ── SHOP TAB ─────────────────────────────────────────────────────────── */}
      {tab === 'shop' && (
        <>
          {/* Category filters */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 22, flexWrap: 'wrap' }}>
            {[{ key: 'all', label: 'All Products', color: 'var(--red)' }, ...Object.entries(CATEGORY_META).map(([key, m]) => ({ key, label: m.label, color: m.color }))].map(({ key, label, color }) => (
              <button
                key={key}
                onClick={() => setCategoryTab(key)}
                style={{
                  padding: '8px 16px', borderRadius: 'var(--radius-sm)', border: '1px solid', fontSize: 12, fontWeight: 700, cursor: 'pointer',
                  borderColor: categoryTab === key ? color : 'var(--border-soft)',
                  background: categoryTab === key ? `${color}18` : 'var(--bg-elevated)',
                  color: categoryTab === key ? color : 'var(--text-muted)',
                  transition: 'all 0.18s',
                }}
              >
                {label}
              </button>
            ))}
          </div>

          {loading ? <Spinner /> : error ? <ErrorState message={error} onRetry={loadProducts} /> : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
              {displayed.map((product) => {
                const meta = CATEGORY_META[product.category] || CATEGORY_META.equipment;
                const Icon = meta.icon;
                const inCart = cart[product.id] || 0;
                const outOfStock = product.stock === 0;

                return (
                  <div key={product.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                    {/* Product image / icon placeholder */}
                    <div style={{ height: 110, background: meta.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                      <Icon size={40} color={meta.color} opacity={0.6} />
                      <span style={{ position: 'absolute', top: 10, right: 10, fontSize: 9, fontWeight: 800, padding: '3px 8px', borderRadius: 4, background: meta.bg, color: meta.color, border: `1px solid ${meta.color}40`, letterSpacing: '0.08em' }}>
                        {meta.label}
                      </span>
                      {isSuperAdmin && (
                        <div style={{ position: 'absolute', top: 8, left: 8, display: 'flex', gap: 4 }}>
                          <button className="btn btn-icon btn-secondary btn-sm" onClick={() => openEditProduct(product)} style={{ width: 26, height: 26 }}><Edit2 size={11} /></button>
                          <button className="btn btn-icon btn-danger btn-sm" onClick={() => setDeleteProductId(product.id)} style={{ width: 26, height: 26 }}><Trash2 size={11} /></button>
                        </div>
                      )}
                    </div>

                    <div style={{ padding: 14, flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <h4 style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.3 }}>{product.name}</h4>
                      {product.description && (
                        <p style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.5, flex: 1 }}>{product.description}</p>
                      )}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                        <span style={{ fontSize: 18, fontWeight: 900, color: 'var(--red)', letterSpacing: '-0.5px' }}>${product.price.toFixed(2)}</span>
                        <span style={{ fontSize: 10, color: outOfStock ? 'var(--danger)' : 'var(--text-muted)', fontWeight: 600 }}>
                          {outOfStock ? 'Out of stock' : `${product.stock} left`}
                        </span>
                      </div>

                      {inCart > 0 ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                          <button onClick={() => removeFromCart(product.id)} style={{ width: 30, height: 30, borderRadius: 6, border: '1px solid var(--border-soft)', background: 'var(--bg-elevated)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}><Minus size={13} /></button>
                          <span style={{ flex: 1, textAlign: 'center', fontWeight: 800, fontSize: 14, color: 'var(--text-primary)' }}>{inCart}</span>
                          <button onClick={() => addToCart(product)} disabled={inCart >= product.stock} style={{ width: 30, height: 30, borderRadius: 6, border: '1px solid var(--red)', background: 'var(--red-faint)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--red)' }}><Plus size={13} /></button>
                        </div>
                      ) : (
                        <button
                          className="btn btn-primary"
                          style={{ width: '100%', padding: '9px', fontSize: 12, marginTop: 4 }}
                          disabled={outOfStock}
                          onClick={() => addToCart(product)}
                        >
                          {outOfStock ? 'Out of Stock' : <><ShoppingCart size={12} /> Add to Cart</>}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}

              {displayed.length === 0 && (
                <div style={{ gridColumn: '1/-1' }}>
                  <div className="empty-state card"><ShoppingBag size={30} /><h3>No products found</h3></div>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* ── ORDERS TAB ──────────────────────────────────────────────────────── */}
      {tab === 'orders' && (
        ordersLoading ? <Spinner /> : ordersError ? <ErrorState message={ordersError} onRetry={loadOrders} /> : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {orders.length === 0 ? (
              <div className="empty-state card"><Package size={30} /><h3>No orders yet</h3></div>
            ) : orders.map((order) => {
              const sColor = STATUS_COLOR[order.status] || STATUS_COLOR.pending;
              return (
                <div key={order.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '16px 20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
                    <div>
                      <span style={{ fontWeight: 800, fontSize: 14, color: 'var(--text-primary)' }}>Order #{order.id}</span>
                      {isSuperAdmin && order.user && (
                        <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 10 }}>{order.user.name}</span>
                      )}
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{new Date(order.createdAt).toLocaleDateString()}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 11, fontWeight: 800, padding: '4px 10px', borderRadius: 4, background: sColor.bg, color: sColor.color, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        {order.status}
                      </span>
                      <span style={{ fontWeight: 900, fontSize: 16, color: 'var(--red)' }}>${order.total.toFixed(2)}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
                    {order.items.map((item) => (
                      <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 10px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', fontSize: 12 }}>
                        <span style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>{item.product?.name}</span>
                        <span style={{ color: 'var(--text-muted)' }}>×{item.quantity}</span>
                        <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  {order.address && (
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>📍 {order.address}</div>
                  )}

                  <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                    {isSuperAdmin && order.status !== 'cancelled' && order.status !== 'delivered' && (
                      <>
                        {ALL_STATUSES.filter((s) => s !== order.status.toUpperCase() && s !== 'CANCELLED').map((s) => (
                          <button key={s} className="btn btn-secondary btn-sm" style={{ fontSize: 11 }} onClick={() => handleOrderStatus(order.id, s)}>
                            → {s}
                          </button>
                        ))}
                        <button className="btn btn-danger btn-sm" style={{ fontSize: 11 }} onClick={() => handleOrderStatus(order.id, 'CANCELLED')}>Cancel</button>
                      </>
                    )}
                    {!isSuperAdmin && order.status === 'pending' && (
                      <button className="btn btn-danger btn-sm" style={{ fontSize: 11 }} onClick={() => handleCancelOrder(order.id)}>Cancel Order</button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}

      {/* ── Cart Modal ───────────────────────────────────────────────────────── */}
      <Modal isOpen={showCart} onClose={() => { setShowCart(false); setPlaceError(''); }} title="Your Cart">
        {cartItems.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-muted)' }}>
            <ShoppingCart size={36} style={{ marginBottom: 12, opacity: 0.4 }} />
            <p>Your cart is empty</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {cartItems.map(({ product, qty }) => (
              <div key={product.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-primary)' }}>{product.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>${product.price.toFixed(2)} each</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <button onClick={() => removeFromCart(product.id)} style={{ width: 26, height: 26, borderRadius: 5, border: '1px solid var(--border)', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}><Minus size={11} /></button>
                  <span style={{ minWidth: 20, textAlign: 'center', fontWeight: 800, fontSize: 13 }}>{qty}</span>
                  <button onClick={() => addToCart(product)} disabled={qty >= product.stock} style={{ width: 26, height: 26, borderRadius: 5, border: '1px solid var(--red)', background: 'var(--red-faint)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--red)' }}><Plus size={11} /></button>
                </div>
                <span style={{ fontWeight: 800, fontSize: 13, color: 'var(--red)', minWidth: 54, textAlign: 'right' }}>${(product.price * qty).toFixed(2)}</span>
              </div>
            ))}

            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12 }}>
              <div className="form-group">
                <label className="form-label">Delivery Address</label>
                <input className="form-input" placeholder="Your delivery address..." value={orderAddress} onChange={(e) => setOrderAddress(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Note</label>
                <input className="form-input" placeholder="Optional note..." value={orderNote} onChange={(e) => setOrderNote(e.target.value)} />
              </div>
            </div>

            {placeError && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', background: 'var(--danger-faint)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 'var(--radius-sm)', color: 'var(--danger)', fontSize: 13 }}>
                <AlertCircle size={14} /> {placeError}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 6 }}>
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>Total</div>
                <div style={{ fontSize: 22, fontWeight: 900, color: 'var(--red)', letterSpacing: '-0.5px' }}>${cartTotal.toFixed(2)}</div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-secondary" onClick={clearCart} disabled={placing}><Trash2 size={13} /> Clear</button>
                <button className="btn btn-primary" onClick={handlePlaceOrder} disabled={placing}>
                  {placing ? 'Placing...' : <><CheckCircle size={13} /> Place Order</>}
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* ── Product Form Modal ───────────────────────────────────────────────── */}
      <Modal isOpen={showProductModal} onClose={() => setShowProductModal(false)} title={editProduct ? 'Edit Product' : 'Add Product'}>
        <form onSubmit={handleProductSave} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {productSaveError && (
            <div style={{ padding: '10px 12px', background: 'var(--danger-faint)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 'var(--radius-sm)', color: 'var(--danger)', fontSize: 13 }}>
              {productSaveError}
            </div>
          )}
          <div className="form-group">
            <label className="form-label">Name *</label>
            <input className="form-input" value={productForm.name} onChange={(e) => setProductForm((p) => ({ ...p, name: e.target.value }))} required />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-input" rows={2} value={productForm.description} onChange={(e) => setProductForm((p) => ({ ...p, description: e.target.value }))} />
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Price ($) *</label>
              <input className="form-input" type="number" min="0" step="0.01" value={productForm.price} onChange={(e) => setProductForm((p) => ({ ...p, price: e.target.value }))} required />
            </div>
            <div className="form-group">
              <label className="form-label">Stock *</label>
              <input className="form-input" type="number" min="0" value={productForm.stock} onChange={(e) => setProductForm((p) => ({ ...p, stock: e.target.value }))} required />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Category *</label>
            <select className="form-input" value={productForm.category} onChange={(e) => setProductForm((p) => ({ ...p, category: e.target.value }))}>
              <option value="protein">Gym Proteins</option>
              <option value="equipment">Gym Equipment</option>
            </select>
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', paddingTop: 6, borderTop: '1px solid var(--border)' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setShowProductModal(false)} disabled={productSaving}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={productSaving}>
              {productSaving ? 'Saving...' : editProduct ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ── Delete confirm ───────────────────────────────────────────────────── */}
      <ConfirmDialog
        isOpen={!!deleteProductId}
        onClose={() => setDeleteProductId(null)}
        onConfirm={handleDeleteProduct}
        title="Remove Product?"
        message="This product will be hidden from the shop."
        confirmLabel="Remove"
      />
    </div>
  );
}
