import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import {
  fetchAdminStats,
  fetchAdminProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  fetchAdminOrders,
  updateOrderStatus,
  fetchAdminUsers,
  updateUserRole,
} from '../services/adminService';
import type { Product, AdminStats, AdminOrder, AdminUser } from '../types';
import { OrderStatusTracker } from '../components/orders/OrderStatusTracker';
import { uploadToCloudinary } from '../lib/cloudinary';

type Tab = 'overview' | 'products' | 'orders' | 'users';

const CATEGORIES = ['candles', 'soaps', 'oils', 'crafts', 'bamboo', 'gift-sets'];
const ORDER_STATUSES = ['processing', 'shipped', 'delivered', 'cancelled'];

export function AdminPage() {
  const { user, isAuthenticated, isInitialized } = useAuthStore();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Overview stats
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);

  // Products state
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const [productCategory, setProductCategory] = useState('all');
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadProgressMsg, setUploadProgressMsg] = useState<string | null>(null);

  // Orders state
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [orderFilterStatus, setOrderFilterStatus] = useState('all');
  const [orderSearch, setOrderSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  // Users state
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Load Overview Data
  const loadStats = useCallback(async () => {
    setLoadingStats(true);
    try {
      const data = await fetchAdminStats();
      setStats(data);
    } catch (err: any) {
      showToast(err.message || 'Failed to load stats', 'error');
    } finally {
      setLoadingStats(false);
    }
  }, []);

  // Load Products Data
  const loadProducts = useCallback(async () => {
    setLoadingProducts(true);
    try {
      const res = await fetchAdminProducts({
        search: productSearch,
        category: productCategory !== 'all' ? productCategory : undefined,
        limit: 50,
      });
      setProducts(res.products || []);
    } catch (err: any) {
      showToast(err.message || 'Failed to load products', 'error');
    } finally {
      setLoadingProducts(false);
    }
  }, [productSearch, productCategory]);

  // Load Orders Data
  const loadOrders = useCallback(async () => {
    setLoadingOrders(true);
    try {
      const res = await fetchAdminOrders({ limit: 50 });
      setOrders(res.orders || []);
    } catch (err: any) {
      showToast(err.message || 'Failed to load orders', 'error');
    } finally {
      setLoadingOrders(false);
    }
  }, []);

  // Load Users Data
  const loadUsers = useCallback(async () => {
    setLoadingUsers(true);
    try {
      const res = await fetchAdminUsers({ search: userSearch, limit: 50 });
      setUsers(res.users || []);
    } catch (err: any) {
      showToast(err.message || 'Failed to load users', 'error');
    } finally {
      setLoadingUsers(false);
    }
  }, [userSearch]);

  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      if (activeTab === 'overview') loadStats();
      if (activeTab === 'products') loadProducts();
      if (activeTab === 'orders') loadOrders();
      if (activeTab === 'users') loadUsers();
    }
  }, [activeTab, isAuthenticated, user, loadStats, loadProducts, loadOrders, loadUsers]);

  // Handle Order Status Change
  const handleOrderStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingOrderId(orderId);
    try {
      await updateOrderStatus(orderId, newStatus);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, orderStatus: newStatus } : o))
      );
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder((prev) => prev ? { ...prev, orderStatus: newStatus } : null);
      }
      showToast(`Order status updated to "${newStatus}"`);
    } catch (err: any) {
      showToast(err.message || 'Failed to update order status', 'error');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  // Handle Cloudinary Image File Upload
  const handleImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingProduct) return;

    setIsUploadingImage(true);
    setUploadProgressMsg('Uploading picture to Cloudinary...');
    try {
      const result = await uploadToCloudinary(file);
      if (result.url) {
        const currentImages = editingProduct.images || [];
        setEditingProduct({
          ...editingProduct,
          images: [result.url, ...currentImages.filter((img) => img !== result.url)],
        });
        showToast('Image uploaded to Cloudinary successfully!');
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to upload image', 'error');
    } finally {
      setIsUploadingImage(false);
      setUploadProgressMsg(null);
      e.target.value = '';
    }
  };

  const handleRemoveImage = (imgUrl: string) => {
    if (!editingProduct) return;
    setEditingProduct({
      ...editingProduct,
      images: (editingProduct.images || []).filter((img) => img !== imgUrl),
    });
  };

  // Handle Save Product (Create or Update)
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    try {
      if (editingProduct.id) {
        const res = await updateProduct(editingProduct.id, editingProduct);
        setProducts((prev) =>
          prev.map((p) => (p.id === editingProduct.id ? res.product : p))
        );
        showToast('Product updated successfully');
      } else {
        const res = await createProduct(editingProduct);
        setProducts((prev) => [res.product, ...prev]);
        showToast('Product created successfully');
      }
      setIsProductModalOpen(false);
      setEditingProduct(null);
    } catch (err: any) {
      showToast(err.message || 'Failed to save product', 'error');
    }
  };

  // Handle Delete Product
  const handleDeleteProduct = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;
    try {
      await deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      showToast(`Product "${name}" deleted`);
    } catch (err: any) {
      showToast(err.message || 'Failed to delete product', 'error');
    }
  };

  // Handle Demoting unintended admin users to customer (Single Master Admin Policy)
  const handleDemoteUser = async (targetUser: AdminUser) => {
    if (targetUser.email === 'admin@naturemades.com') {
      showToast('Cannot modify primary master administrator account', 'error');
      return;
    }
    if (!window.confirm(`Demote ${targetUser.name} to standard customer patron?`)) return;

    setUpdatingUserId(targetUser.id);
    try {
      await updateUserRole(targetUser.id, 'customer');
      setUsers((prev) =>
        prev.map((u) => (u.id === targetUser.id ? { ...u, role: 'customer' } : u))
      );
      showToast(`${targetUser.name} is now set as customer patron`);
    } catch (err: any) {
      showToast(err.message || 'Failed to update role', 'error');
    } finally {
      setUpdatingUserId(null);
    }
  };

  // Access Denied Guard
  if (!isInitialized) {
    return (
      <div className="min-h-screen pt-32 pb-24 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-8 h-8 rounded-full border-2 border-[#486838] border-t-transparent animate-spin mx-auto mb-3" />
          <p className="text-xs text-[#786848]">Verifying administrator credentials...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'admin') {
    return (
      <div className="min-h-screen pt-32 pb-24 flex items-center justify-center px-4">
        <div
          className="max-w-md w-full p-8 rounded-3xl text-center"
          style={{
            background: 'rgba(255, 255, 255, 0.04)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4 text-2xl">
            🔒
          </div>
          <h1
            className="text-2xl font-bold text-[#F8F8E8] mb-2"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Admin Access Restricted
          </h1>
          <p className="text-sm text-[#786848] mb-4">
            You must be signed in as the master administrator (<strong className="text-[#F8F8E8]">admin@naturemades.com</strong>) using email and password credentials.
          </p>
          <div className="mb-6 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300">
            ⚠️ <strong>Security Notice:</strong> Google OAuth is disabled for administrative privileges. Administrators must authenticate with email &amp; password.
          </div>
          <Link
            to="/account"
            className="inline-flex items-center px-6 py-3 rounded-xl text-sm font-semibold text-[#0A0A0A] bg-[#F8F8E8] hover:bg-white transition-all shadow-md"
          >
            Go to Account / Sign In with Password
          </Link>
        </div>
      </div>
    );
  }

  // Filtered orders for view
  const filteredOrders = orders.filter((o) => {
    const matchesStatus =
      orderFilterStatus === 'all' || o.orderStatus.toLowerCase() === orderFilterStatus.toLowerCase();
    const q = orderSearch.toLowerCase().trim();
    const matchesSearch =
      !q ||
      o.orderNumber.toLowerCase().includes(q) ||
      o.customer.firstName.toLowerCase().includes(q) ||
      o.customer.lastName.toLowerCase().includes(q) ||
      o.customer.email.toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="min-h-screen pt-28 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl text-sm font-medium shadow-2xl flex items-center gap-3 transition-all ${
            toast.type === 'error'
              ? 'bg-red-900/90 text-red-100 border border-red-700'
              : 'bg-[#486838] text-[#F8F8E8] border border-[#F8F8E8]/20'
          }`}
        >
          <span>{toast.type === 'error' ? '⚠️' : '✓'}</span>
          <span>{toast.message}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-widest text-[#486838]">
              NatureMades Portal
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#486838]/20 text-[#F8F8E8] border border-[#486838]/40">
              Admin Mode
            </span>
          </div>
          <h1
            className="text-3xl sm:text-4xl font-bold text-[#F8F8E8]"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Management Dashboard
          </h1>
          <p className="text-sm text-[#786848] mt-1">
            Manage products, supervise orders & shipment status, and manage registered patrons.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-white/[0.03] border border-white/[0.08] overflow-x-auto">
          {(
            [
              { id: 'overview', label: 'Overview', icon: '📊' },
              { id: 'products', label: 'Products', icon: '🌿' },
              { id: 'orders', label: 'Orders', icon: '📦' },
              { id: 'users', label: 'Users', icon: '👥' },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                activeTab === t.id
                  ? 'bg-[#486838] text-[#F8F8E8] shadow-md shadow-[#486838]/30'
                  : 'text-[#786848] hover:text-[#F8F8E8] hover:bg-white/[0.04]'
              }`}
            >
              <span>{t.icon}</span>
              <span>{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {loadingStats ? (
            <div className="py-20 text-center text-[#786848]">Loading store overview...</div>
          ) : stats ? (
            <>
              {/* 4 Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {[
                  { label: 'Total Revenue', value: `₹${(stats.totalRevenue || 0).toFixed(2)}`, icon: '💰', highlight: true },
                  { label: 'Total Orders', value: stats.orderCount || 0, icon: '📦' },
                  { label: 'Products in Catalog', value: stats.productCount || 0, icon: '🌿' },
                  { label: 'Registered Patrons', value: stats.userCount || 0, icon: '👥' },
                ].map((card, i) => (
                  <div
                    key={i}
                    className="rounded-2xl p-6 relative overflow-hidden"
                    style={{
                      background: 'rgba(255, 255, 255, 0.04)',
                      backdropFilter: 'blur(16px)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                    }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs uppercase tracking-wider text-[#786848] font-medium">
                        {card.label}
                      </span>
                      <span className="text-2xl">{card.icon}</span>
                    </div>
                    <div
                      className={`text-2xl sm:text-3xl font-bold font-mono ${
                        card.highlight ? 'text-[#486838]' : 'text-[#F8F8E8]'
                      }`}
                    >
                      {card.value}
                    </div>
                  </div>
                ))}
              </div>

              {/* Recent Orders Preview */}
              <div
                className="rounded-2xl p-6"
                style={{
                  background: 'rgba(255, 255, 255, 0.04)',
                  backdropFilter: 'blur(16px)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                }}
              >
                <div className="flex items-center justify-between mb-5">
                  <h2
                    className="text-lg font-bold text-[#F8F8E8]"
                    style={{ fontFamily: 'var(--font-heading)' }}
                  >
                    Recent Orders
                  </h2>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="text-xs text-[#486838] hover:underline"
                  >
                    View all orders →
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-white/[0.08] text-[#786848]">
                        <th className="pb-3 font-semibold">Order Number</th>
                        <th className="pb-3 font-semibold">Customer</th>
                        <th className="pb-3 font-semibold">Date</th>
                        <th className="pb-3 font-semibold">Total</th>
                        <th className="pb-3 font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.04]">
                      {stats.recentOrders.map((ro) => (
                        <tr key={ro.id} className="hover:bg-white/[0.02]">
                          <td className="py-3 font-mono text-[#F8F8E8]">{ro.orderNumber}</td>
                          <td className="py-3 text-[#F8F8E8]">{ro.customer}</td>
                          <td className="py-3 text-[#786848]">
                            {new Date(ro.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-3 font-mono text-[#F8F8E8]">₹{ro.total.toFixed(2)}</td>
                          <td className="py-3">
                            <span
                              className={`px-2.5 py-0.5 rounded-full capitalize text-[11px] font-medium border ${
                                ro.orderStatus === 'delivered'
                                  ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                                  : ro.orderStatus === 'shipped'
                                  ? 'bg-blue-500/10 text-blue-300 border-blue-500/20'
                                  : ro.orderStatus === 'cancelled'
                                  ? 'bg-red-500/10 text-red-300 border-red-500/20'
                                  : 'bg-[#486838]/20 text-[#F8F8E8] border-[#486838]/40'
                              }`}
                            >
                              {ro.orderStatus}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : null}
        </div>
      )}

      {/* TAB 2: PRODUCTS CRUD */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          {/* Action & Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <input
                type="text"
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                placeholder="Search products..."
                className="px-4 py-2 rounded-xl text-xs bg-white/[0.04] border border-white/[0.08] text-[#F8F8E8] placeholder-[#786848] focus:outline-none focus:border-[#486838] w-full sm:w-64"
              />
              <select
                value={productCategory}
                onChange={(e) => setProductCategory(e.target.value)}
                aria-label="Filter products by category"
                className="px-3 py-2 rounded-xl text-xs bg-white/[0.04] border border-white/[0.08] text-[#F8F8E8] focus:outline-none focus:border-[#486838]"
              >
                <option value="all" className="bg-[#0A0A0A]">All Categories</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c} className="bg-[#0A0A0A] capitalize">
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => {
                setEditingProduct({
                  name: '',
                  category: 'candles',
                  price: 24,
                  stock: 20,
                  shortDescription: '',
                  description: '',
                  images: ['/images/products/forest-mist-candle.jpg'],
                  featured: false,
                  bestSeller: false,
                  tags: [],
                });
                setIsProductModalOpen(true);
              }}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold text-[#0A0A0A] bg-[#F8F8E8] hover:bg-white transition-all duration-200 flex items-center gap-2 whitespace-nowrap"
            >
              <span>+</span>
              <span>Add New Product</span>
            </button>
          </div>

          {/* Products Table */}
          <div
            className="rounded-2xl p-6 overflow-hidden"
            style={{
              background: 'rgba(255, 255, 255, 0.04)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            {loadingProducts ? (
              <div className="py-16 text-center text-[#786848]">Loading products catalog...</div>
            ) : products.length === 0 ? (
              <div className="py-16 text-center text-[#786848]">No products found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-white/[0.08] text-[#786848]">
                      <th className="pb-3 font-semibold">Product</th>
                      <th className="pb-3 font-semibold">Category</th>
                      <th className="pb-3 font-semibold">Price</th>
                      <th className="pb-3 font-semibold">Stock</th>
                      <th className="pb-3 font-semibold">Badges</th>
                      <th className="pb-3 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {products.map((p) => (
                      <tr key={p.id} className="hover:bg-white/[0.02]">
                        <td className="py-3 flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg overflow-hidden bg-white/[0.04] border border-white/[0.08] shrink-0 flex items-center justify-center relative">
                            {p.images?.[0] ? (
                              <img
                                src={p.images[0]}
                                alt={p.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLElement).style.display = 'none';
                                }}
                              />
                            ) : null}
                            <span className="text-xs font-bold text-[#786848] uppercase">
                              {p.name?.charAt(0) || '•'}
                            </span>
                          </div>
                          <div>
                            <span className="font-medium text-[#F8F8E8] block">{p.name}</span>
                            <span className="text-[10px] text-[#786848] font-mono">{p.slug}</span>
                          </div>
                        </td>
                        <td className="py-3 capitalize text-[#786848]">{p.category}</td>
                        <td className="py-3 font-mono text-[#F8F8E8]">
                          ₹{p.price.toFixed(2)}
                          {p.compareAtPrice ? (
                            <span className="line-through text-[#786848] text-[10px] ml-1.5">
                              ₹{p.compareAtPrice.toFixed(2)}
                            </span>
                          ) : null}
                        </td>
                        <td className="py-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                              p.stock > 10
                                ? 'bg-emerald-500/15 text-emerald-300'
                                : p.stock > 0
                                ? 'bg-amber-500/15 text-amber-300'
                                : 'bg-red-500/15 text-red-400'
                            }`}
                          >
                            {p.stock} units
                          </span>
                        </td>
                        <td className="py-3">
                          <div className="flex gap-1">
                            {p.featured && (
                              <span className="px-2 py-0.5 rounded text-[10px] bg-[#486838]/30 text-[#F8F8E8]">
                                Featured
                              </span>
                            )}
                            {p.bestSeller && (
                              <span className="px-2 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-300">
                                Best Seller
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => {
                                setEditingProduct(p);
                                setIsProductModalOpen(true);
                              }}
                              className="px-3 py-1 rounded-lg text-xs bg-white/[0.05] hover:bg-white/[0.1] text-[#F8F8E8] transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(p.id, p.name)}
                              className="px-3 py-1 rounded-lg text-xs bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: ORDERS MANAGEMENT */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <input
                type="text"
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                placeholder="Search by order #, patron name or email..."
                className="px-4 py-2 rounded-xl text-xs bg-white/[0.04] border border-white/[0.08] text-[#F8F8E8] placeholder-[#786848] focus:outline-none focus:border-[#486838] w-full sm:w-80"
              />
              <select
                value={orderFilterStatus}
                onChange={(e) => setOrderFilterStatus(e.target.value)}
                aria-label="Filter orders by status"
                className="px-3 py-2 rounded-xl text-xs bg-white/[0.04] border border-white/[0.08] text-[#F8F8E8] focus:outline-none focus:border-[#486838] capitalize"
              >
                <option value="all" className="bg-[#0A0A0A]">All Statuses</option>
                {ORDER_STATUSES.map((s) => (
                  <option key={s} value={s} className="bg-[#0A0A0A] capitalize">
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div className="text-xs text-[#786848]">
              Total Orders: <strong className="text-[#F8F8E8]">{filteredOrders.length}</strong>
            </div>
          </div>

          {/* Orders Table */}
          <div
            className="rounded-2xl p-6"
            style={{
              background: 'rgba(255, 255, 255, 0.04)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            {loadingOrders ? (
              <div className="py-16 text-center text-[#786848]">Retrieving customer orders...</div>
            ) : filteredOrders.length === 0 ? (
              <div className="py-16 text-center text-[#786848]">No orders found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-white/[0.08] text-[#786848]">
                      <th className="pb-3 font-semibold">Order Number</th>
                      <th className="pb-3 font-semibold">Customer</th>
                      <th className="pb-3 font-semibold">Items</th>
                      <th className="pb-3 font-semibold">Total</th>
                      <th className="pb-3 font-semibold">Order Status (Live Sync)</th>
                      <th className="pb-3 font-semibold text-right">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {filteredOrders.map((o) => (
                      <tr key={o.id} className="hover:bg-white/[0.02]">
                        <td className="py-3">
                          <span className="font-mono text-[#F8F8E8] font-bold block">
                            {o.orderNumber}
                          </span>
                          <span className="text-[10px] text-[#786848]">
                            {new Date(o.createdAt).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="py-3">
                          <span className="text-[#F8F8E8] block font-medium">
                            {o.customer.firstName} {o.customer.lastName}
                          </span>
                          <span className="text-[10px] text-[#786848]">{o.customer.email}</span>
                        </td>
                        <td className="py-3 text-[#786848]">
                          {o.items?.length || 0} {o.items?.length === 1 ? 'item' : 'items'}
                        </td>
                        <td className="py-3">
                          <span className="font-mono text-[#F8F8E8] block">₹{o.total.toFixed(2)}</span>
                          <span
                            className={`text-[9px] font-medium uppercase tracking-wider ${
                              o.paymentStatus === 'paid' ? 'text-emerald-400' : 'text-amber-400'
                            }`}
                          >
                            {o.paymentStatus}
                          </span>
                        </td>
                        <td className="py-3">
                          {/* Interactive Status Selector */}
                          <div className="flex items-center gap-2">
                            <select
                              value={o.orderStatus}
                              disabled={updatingOrderId === o.id}
                              onChange={(e) => handleOrderStatusChange(o.id, e.target.value)}
                              aria-label={`Change status for order ${o.orderNumber}`}
                              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize border focus:outline-none transition-all cursor-pointer ${
                                o.orderStatus === 'delivered'
                                  ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                                  : o.orderStatus === 'shipped'
                                  ? 'bg-blue-500/15 text-blue-300 border-blue-500/30'
                                  : o.orderStatus === 'cancelled'
                                  ? 'bg-red-500/15 text-red-300 border-red-500/30'
                                  : 'bg-[#486838]/20 text-[#F8F8E8] border-[#486838]/50'
                              }`}
                            >
                              {ORDER_STATUSES.map((status) => (
                                <option
                                  key={status}
                                  value={status}
                                  className="bg-[#0A0A0A] text-[#F8F8E8] capitalize"
                                >
                                  {status}
                                </option>
                              ))}
                            </select>
                            {updatingOrderId === o.id && (
                              <div className="w-3.5 h-3.5 border-2 border-[#486838] border-t-transparent rounded-full animate-spin" />
                            )}
                          </div>
                        </td>
                        <td className="py-3 text-right">
                          <button
                            onClick={() => setSelectedOrder(o)}
                            className="px-3 py-1.5 rounded-lg text-xs bg-white/[0.05] hover:bg-white/[0.1] text-[#F8F8E8] transition-colors"
                          >
                            View Order
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: USERS MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          {/* Search Bar */}
          <div className="flex items-center justify-between">
            <input
              type="text"
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              placeholder="Search patrons by name or email..."
              className="px-4 py-2 rounded-xl text-xs bg-white/[0.04] border border-white/[0.08] text-[#F8F8E8] placeholder-[#786848] focus:outline-none focus:border-[#486838] w-full sm:w-80"
            />
            <span className="text-xs text-[#786848]">
              Total Users: <strong className="text-[#F8F8E8]">{users.length}</strong>
            </span>
          </div>

          {/* Single Admin Policy Banner */}
          <div className="p-4 rounded-2xl bg-[#486838]/10 border border-[#486838]/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5 text-[#F8F8E8]">
              <span className="text-base">🛡️</span>
              <span>
                <strong>Single Administrator Policy:</strong> Master admin authority is exclusively reserved for{' '}
                <strong className="text-[#486838] underline">admin@naturemades.com</strong>. All other registered users are assigned patron customer privileges.
              </span>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-[#486838]/20 text-[#F8F8E8] text-[10px] font-mono whitespace-nowrap border border-[#486838]/40">
              Role Protection Active
            </span>
          </div>

          {/* Users Table */}
          <div
            className="rounded-2xl p-6"
            style={{
              background: 'rgba(255, 255, 255, 0.04)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            {loadingUsers ? (
              <div className="py-16 text-center text-[#786848]">Retrieving registered patrons...</div>
            ) : users.length === 0 ? (
              <div className="py-16 text-center text-[#786848]">No users found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-white/[0.08] text-[#786848]">
                      <th className="pb-3 font-semibold">Patron</th>
                      <th className="pb-3 font-semibold">Email</th>
                      <th className="pb-3 font-semibold">Role</th>
                      <th className="pb-3 font-semibold">Joined Date</th>
                      <th className="pb-3 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {users.map((u) => {
                      const isMasterAdmin = u.email.toLowerCase() === 'admin@naturemades.com';
                      const isCurrentUser = user?.id === u.id;
                      return (
                        <tr key={u.id} className="hover:bg-white/[0.02]">
                          <td className="py-3 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#486838]/30 border border-[#486838]/50 flex items-center justify-center font-bold text-[#F8F8E8]">
                              {u.name ? u.name[0].toUpperCase() : 'U'}
                            </div>
                            <span className="font-medium text-[#F8F8E8]">{u.name}</span>
                          </td>
                          <td className="py-3 text-[#786848] font-mono">{u.email}</td>
                          <td className="py-3">
                            <span
                              className={`px-2.5 py-0.5 rounded-full capitalize text-[10px] font-semibold border ${
                                isMasterAdmin
                                  ? 'bg-[#486838]/30 text-[#F8F8E8] border-[#486838]'
                                  : u.role === 'admin'
                                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                                  : 'bg-white/[0.04] text-[#786848] border-white/[0.08]'
                              }`}
                            >
                              {isMasterAdmin ? 'Master Admin' : u.role}
                            </span>
                          </td>
                          <td className="py-3 text-[#786848]">
                            {new Date(u.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-3 text-right">
                            {isMasterAdmin ? (
                              <span className="px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-[#486838]/20 text-[#F8F8E8] border border-[#486838]/40">
                                Primary Admin (Protected)
                              </span>
                            ) : u.role === 'admin' ? (
                              <button
                                onClick={() => handleDemoteUser(u)}
                                disabled={updatingUserId === u.id}
                                className="px-3 py-1 rounded-lg text-xs font-medium bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                              >
                                {updatingUserId === u.id ? 'Updating...' : 'Demote to Customer'}
                              </button>
                            ) : isCurrentUser ? (
                              <span className="text-[11px] text-[#786848] italic">
                                Current Account
                              </span>
                            ) : (
                              <span className="text-[11px] text-[#786848]">
                                Patron Customer
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL 1: ADD/EDIT PRODUCT */}
      {isProductModalOpen && editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div
            className="w-full max-w-2xl rounded-3xl p-6 sm:p-8 my-8 relative"
            style={{
              background: '#0D0D0D',
              border: '1px solid rgba(255, 255, 255, 0.12)',
            }}
          >
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/[0.08]">
              <h2
                className="text-xl font-bold text-[#F8F8E8]"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                {editingProduct.id ? 'Edit Product' : 'Add New Product'}
              </h2>
              <button
                onClick={() => {
                  setIsProductModalOpen(false);
                  setEditingProduct(null);
                }}
                className="text-lg text-[#786848] hover:text-[#F8F8E8]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#786848] font-medium mb-1">Product Name *</label>
                  <input
                    type="text"
                    required
                    value={editingProduct.name || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.1] text-[#F8F8E8] focus:border-[#486838] focus:outline-none"
                    placeholder="e.g. Forest Mist Candle"
                  />
                </div>

                <div>
                  <label className="block text-[#786848] font-medium mb-1">Category *</label>
                  <select
                    value={editingProduct.category || 'candles'}
                    onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.1] text-[#F8F8E8] focus:border-[#486838] focus:outline-none capitalize"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat} className="bg-[#0A0A0A] capitalize">
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[#786848] font-medium mb-1">Price (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={editingProduct.price !== undefined ? editingProduct.price : ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.1] text-[#F8F8E8] focus:border-[#486838] focus:outline-none font-mono"
                    placeholder="24.00"
                  />
                </div>

                <div>
                  <label className="block text-[#786848] font-medium mb-1">Compare At Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingProduct.compareAtPrice || ''}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        compareAtPrice: e.target.value ? parseFloat(e.target.value) : undefined,
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.1] text-[#F8F8E8] focus:border-[#486838] focus:outline-none font-mono"
                    placeholder="30.00"
                  />
                </div>

                <div>
                  <label className="block text-[#786848] font-medium mb-1">Stock Quantity *</label>
                  <input
                    type="number"
                    required
                    value={editingProduct.stock !== undefined ? editingProduct.stock : 10}
                    onChange={(e) => setEditingProduct({ ...editingProduct, stock: parseInt(e.target.value, 10) })}
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.1] text-[#F8F8E8] focus:border-[#486838] focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#786848] font-medium mb-1">Short Description *</label>
                <input
                  type="text"
                  required
                  value={editingProduct.shortDescription || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, shortDescription: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.1] text-[#F8F8E8] focus:border-[#486838] focus:outline-none"
                  placeholder="One sentence summary for product cards..."
                />
              </div>

              <div>
                <label className="block text-[#786848] font-medium mb-1">Full Description *</label>
                <textarea
                  rows={3}
                  required
                  value={editingProduct.description || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.1] text-[#F8F8E8] focus:border-[#486838] focus:outline-none"
                  placeholder="Artisan details, scent profiles, botanical heritage..."
                />
              </div>

              {/* Cloudinary Picture Upload Section */}
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.08] space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-[#F8F8E8] font-semibold">
                      Product Pictures (Cloudinary Storage)
                    </label>
                    <span className="text-[10px] text-[#786848]">
                      Upload pictures directly to Cloudinary (cloud: <strong>ww2lka18</strong>)
                    </span>
                  </div>
                  <label className="cursor-pointer px-4 py-2 rounded-xl text-xs font-semibold bg-[#486838] text-white hover:bg-[#5a8247] transition-all flex items-center gap-1.5 shadow-sm">
                    <span>📷</span>
                    <span>{isUploadingImage ? 'Uploading...' : 'Upload Picture'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      disabled={isUploadingImage}
                      onChange={handleImageFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {uploadProgressMsg && (
                  <div className="flex items-center gap-2 text-xs text-[#486838] bg-[#486838]/10 px-3 py-2 rounded-xl border border-[#486838]/30">
                    <div className="w-3.5 h-3.5 border-2 border-[#486838] border-t-transparent rounded-full animate-spin" />
                    <span>{uploadProgressMsg}</span>
                  </div>
                )}

                {/* Uploaded Thumbnails Preview */}
                {editingProduct.images && editingProduct.images.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                    {editingProduct.images.map((imgUrl, idx) => (
                      <div
                        key={idx}
                        className="relative group aspect-square rounded-xl overflow-hidden bg-black/50 border border-white/10"
                      >
                        <img
                          src={imgUrl}
                          alt={`Uploaded ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(imgUrl)}
                          className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-red-500/80 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Remove picture"
                        >
                          ✕
                        </button>
                        {idx === 0 && (
                          <span className="absolute bottom-1.5 left-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded bg-black/70 text-[#486838] backdrop-blur-sm">
                            Main Image
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <div>
                  <label className="block text-[11px] text-[#786848] mb-1">
                    Or direct image URLs (comma separated):
                  </label>
                  <input
                    type="text"
                    value={editingProduct.images?.join(', ') || ''}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        images: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.1] text-[#F8F8E8] focus:border-[#486838] focus:outline-none text-[11px]"
                    placeholder="https://res.cloudinary.com/ww2lka18/image/upload/..., /images/products/..."
                  />
                </div>
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-[#F8F8E8]">
                  <input
                    type="checkbox"
                    checked={editingProduct.featured || false}
                    onChange={(e) => setEditingProduct({ ...editingProduct, featured: e.target.checked })}
                    className="rounded accent-[#486838]"
                  />
                  <span>Featured on Homepage</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-[#F8F8E8]">
                  <input
                    type="checkbox"
                    checked={editingProduct.bestSeller || false}
                    onChange={(e) => setEditingProduct({ ...editingProduct, bestSeller: e.target.checked })}
                    className="rounded accent-[#486838]"
                  />
                  <span>Best Seller</span>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => {
                    setIsProductModalOpen(false);
                    setEditingProduct(null);
                  }}
                  className="px-5 py-2.5 rounded-xl text-xs font-medium text-[#786848] hover:text-[#F8F8E8] bg-white/[0.04] hover:bg-white/[0.08] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl text-xs font-semibold text-[#0A0A0A] bg-[#F8F8E8] hover:bg-white transition-all shadow-md"
                >
                  {editingProduct.id ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: VIEW ORDER DETAILS */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div
            className="w-full max-w-2xl rounded-3xl p-6 sm:p-8 my-8 relative"
            style={{
              background: '#0D0D0D',
              border: '1px solid rgba(255, 255, 255, 0.12)',
            }}
          >
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] mb-6">
              <div>
                <span className="text-xs text-[#786848]">Order Inspection</span>
                <h2
                  className="text-xl font-bold text-[#F8F8E8] font-mono"
                  style={{ fontFamily: 'var(--font-heading)' }}
                >
                  {selectedOrder.orderNumber}
                </h2>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-lg text-[#786848] hover:text-[#F8F8E8]"
              >
                ✕
              </button>
            </div>

            {/* Live Progress Bar in Admin View */}
            <div className="mb-6 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
              <span className="text-xs text-[#786848] font-medium block mb-1">
                Patron-Facing Status Progress:
              </span>
              <OrderStatusTracker status={selectedOrder.orderStatus} />
            </div>

            {/* Quick Status Control */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-[#486838]/10 border border-[#486838]/30 mb-6">
              <div>
                <span className="text-xs text-[#786848] block">Current Order Status</span>
                <span className="text-sm font-bold text-[#F8F8E8] capitalize">
                  {selectedOrder.orderStatus}
                </span>
              </div>
              <select
                value={selectedOrder.orderStatus}
                onChange={(e) => handleOrderStatusChange(selectedOrder.id, e.target.value)}
                aria-label={`Update status for ${selectedOrder.orderNumber}`}
                className="px-4 py-2 rounded-xl text-xs font-semibold capitalize bg-[#0A0A0A] border border-[#486838] text-[#F8F8E8] focus:outline-none cursor-pointer"
              >
                {ORDER_STATUSES.map((status) => (
                  <option key={status} value={status} className="capitalize">
                    Mark as {status}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs mb-6">
              {/* Customer Info */}
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                <h3 className="font-bold text-[#F8F8E8] mb-2">Customer Information</h3>
                <p className="text-[#F8F8E8]">
                  {selectedOrder.customer.firstName} {selectedOrder.customer.lastName}
                </p>
                <p className="text-[#786848]">{selectedOrder.customer.email}</p>
                {selectedOrder.customer.phone && (
                  <p className="text-[#786848]">{selectedOrder.customer.phone}</p>
                )}
              </div>

              {/* Shipping Address */}
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                <h3 className="font-bold text-[#F8F8E8] mb-2">Shipping Destination</h3>
                <p className="text-[#F8F8E8]">{selectedOrder.shippingAddress.address}</p>
                <p className="text-[#786848]">
                  {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state}{' '}
                  {selectedOrder.shippingAddress.zip}
                </p>
                <p className="text-[11px] text-[#486838] mt-1">
                  Method: {selectedOrder.deliveryMethod}
                </p>
              </div>
            </div>

            {/* Items Breakdown */}
            <div className="mb-6">
              <h3 className="text-xs font-bold text-[#786848] uppercase tracking-wider mb-3">
                Order Items ({selectedOrder.items?.length || 0})
              </h3>
              <div className="divide-y divide-white/[0.04] text-xs">
                {selectedOrder.items?.map((item, idx) => {
                  const initial = item.name ? item.name.charAt(0).toUpperCase() : '🌿';

                  return (
                    <div key={idx} className="py-2.5 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-lg overflow-hidden bg-white/[0.04] border border-white/[0.08] shrink-0 flex items-center justify-center relative">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              loading="lazy"
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const img = e.currentTarget;
                                img.style.display = 'none';
                                if (img.parentElement) {
                                  const fb = img.parentElement.querySelector('.admin-order-img-fallback');
                                  if (fb) (fb as HTMLElement).style.display = 'flex';
                                }
                              }}
                            />
                          ) : null}
                          <div
                            className={`admin-order-img-fallback ${item.image ? 'hidden' : 'flex'} w-full h-full items-center justify-center bg-[#486838]/20 text-[#F8F8E8] font-bold text-xs`}
                          >
                            {initial}
                          </div>
                        </div>
                        <div>
                          <span className="text-[#F8F8E8] font-medium block">{item.name}</span>
                          <span className="text-[11px] text-[#786848]">
                            Qty: {item.quantity} × ₹{item.price.toFixed(2)}
                          </span>
                        </div>
                      </div>
                      <span className="font-mono text-[#F8F8E8] shrink-0">
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Total Cost */}
            <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between text-xs">
              <div className="text-[#786848]">
                <span>Subtotal: ₹{selectedOrder.subtotal.toFixed(2)}</span>
                <span className="mx-2">•</span>
                <span>Shipping: ₹{selectedOrder.shippingFee.toFixed(2)}</span>
              </div>
              <div className="text-right">
                <span className="text-xs text-[#786848] block">Grand Total</span>
                <span className="text-lg font-bold font-mono text-[#486838]">
                  ₹{selectedOrder.total.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
