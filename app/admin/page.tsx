"use client";

import { Home, LogOut, PackagePlus, ReceiptText, Settings, Shield, UsersRound, Wrench, Plus, Edit2, Trash2, ArrowRight, DollarSign, CheckCircle, Clock } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { collection, doc, getDoc, getDocs, setDoc, deleteDoc, updateDoc, query, onSnapshot, addDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "@/components/AuthProvider";
import { db } from "@/lib/firebase";

type Product = {
  id: string;
  name: string;
  tag: string;
  price: string;
  description: string;
  image: string;
  category: string;
  stock: number;
};

type Order = {
  id: string;
  userId: string;
  email: string;
  items: { name: string; price: string; quantity: number }[];
  total: number;
  address: string;
  status: string;
  createdAt: any;
};

type UserProfile = {
  id: string;
  email: string;
  displayName: string;
  role: "admin" | "user";
  createdAt?: any;
};

type SupportTicket = {
  id: string;
  userId: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: string;
  replies: { author: string; text: string; time: string }[];
  createdAt: any;
};

export default function AdminPage() {
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<"dashboard" | "products" | "orders" | "users" | "support" | "settings">("dashboard");

  // Settings state
  const [settings, setSettings] = useState({
    supportEmail: "support@babyshophub.com",
    contactPhone: "+1 (555) 019-2834",
    currencySymbol: "$",
    reviewsEnabled: true,
    showOutOfStock: true,
    requireEmailVerification: false,
  });
  const [settingsSavedStatus, setSettingsSavedStatus] = useState("");

  // Firestore Lists
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);

  // Product CRUD states
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productName, setProductName] = useState("");
  const [productTag, setProductTag] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [productCategory, setProductCategory] = useState("Diapers");
  const [productStock, setProductStock] = useState(20);
  const [productDescription, setProductDescription] = useState("");
  const [productImage, setProductImage] = useState("");

  // Support Reply state
  const [replyTicketId, setReplyTicketId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  // Route security checks
  useEffect(() => {
    if (!loading && !user) router.push("/login");
    if (!loading && user && user.role !== "admin") router.push("/shop");
  }, [loading, router, user]);

  // Load Settings
  useEffect(() => {
    async function loadSettings() {
      const snap = await getDoc(doc(db, "admin_settings", "store"));
      if (snap.exists()) {
        setSettings((current) => ({ ...current, ...snap.data() }));
      }
    }
    if (user?.role === "admin") void loadSettings();
  }, [user]);

  // Live Sync Collections from Firestore
  useEffect(() => {
    if (user?.role !== "admin") return;

    const unsubProducts = onSnapshot(collection(db, "products"), (snap) => {
      const list: Product[] = [];
      snap.forEach((d) => list.push({ id: d.id, ...d.data() } as Product));
      setProducts(list);
    });

    const unsubOrders = onSnapshot(collection(db, "orders"), (snap) => {
      const list: Order[] = [];
      snap.forEach((d) => list.push({ id: d.id, ...d.data() } as Order));
      setOrders(list);
    });

    const unsubUsers = onSnapshot(collection(db, "users"), (snap) => {
      const list: UserProfile[] = [];
      snap.forEach((d) => list.push({ id: d.id, ...d.data() } as UserProfile));
      setUsers(list);
    });

    const unsubTickets = onSnapshot(collection(db, "support_tickets"), (snap) => {
      const list: SupportTicket[] = [];
      snap.forEach((d) => list.push({ id: d.id, ...d.data() } as SupportTicket));
      setTickets(list);
    });

    return () => {
      unsubProducts();
      unsubOrders();
      unsubUsers();
      unsubTickets();
    };
  }, [user]);

  // Save Settings
  async function saveSettings(event: FormEvent) {
    event.preventDefault();
    await setDoc(doc(db, "admin_settings", "store"), settings, { merge: true });
    setSettingsSavedStatus("All settings saved successfully.");
    setTimeout(() => setSettingsSavedStatus(""), 3000);
  }

  // Create or Update Product
  async function handleProductSubmit(e: FormEvent) {
    e.preventDefault();
    const payload = {
      name: productName.trim(),
      tag: productTag.trim(),
      price: productPrice.startsWith("$") ? productPrice : `$${productPrice}`,
      category: productCategory,
      stock: Number(productStock),
      description: productDescription.trim(),
      image: productImage.trim() || "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=600&q=80",
    };

    if (editingProduct) {
      // Update
      await updateDoc(doc(db, "products", editingProduct.id), payload);
    } else {
      // Create new
      await addDoc(collection(db, "products"), payload);
    }

    closeProductModal();
  }

  function openProductModal(prod: Product | null = null) {
    if (prod) {
      setEditingProduct(prod);
      setProductName(prod.name);
      setProductTag(prod.tag);
      setProductPrice(prod.price.replace("$", ""));
      setProductCategory(prod.category);
      setProductStock(prod.stock);
      setProductDescription(prod.description);
      setProductImage(prod.image);
    } else {
      setEditingProduct(null);
      setProductName("");
      setProductTag("New");
      setProductPrice("");
      setProductCategory("Diapers");
      setProductStock(20);
      setProductDescription("");
      setProductImage("");
    }
    setIsProductModalOpen(true);
  }

  function closeProductModal() {
    setIsProductModalOpen(false);
    setEditingProduct(null);
  }

  async function handleDeleteProduct(id: string) {
    if (confirm("Are you sure you want to delete this product?")) {
      await deleteDoc(doc(db, "products", id));
    }
  }

  // Update Order Status
  async function handleUpdateOrderStatus(orderId: string, currentStatus: string) {
    let nextStatus = "Pending";
    if (currentStatus === "Pending") nextStatus = "Shipped";
    else if (currentStatus === "Shipped") nextStatus = "Delivered";
    else return; // already Delivered

    await updateDoc(doc(db, "orders", orderId), { status: nextStatus });
  }

  // Toggle user role
  async function handleToggleUserRole(userId: string, currentRole: "admin" | "user") {
    const nextRole = currentRole === "admin" ? "user" : "admin";
    await updateDoc(doc(db, "users", userId), { role: nextRole });
  }

  // Submit Ticket Reply
  async function handleSendTicketReply(e: FormEvent, ticketId: string) {
    e.preventDefault();
    if (replyText.trim() === "") return;

    const ticket = tickets.find((t) => t.id === ticketId);
    if (!ticket) return;

    const repliesList = [...(ticket.replies || [])];
    repliesList.push({
      author: "Admin Support",
      text: replyText.trim(),
      time: new Date().toLocaleTimeString() + " " + new Date().toLocaleDateString(),
    });

    await updateDoc(doc(db, "support_tickets", ticketId), {
      replies: repliesList,
      status: "Responded",
    });

    setReplyText("");
    setReplyTicketId(null);
  }

  async function handleCloseTicket(ticketId: string) {
    await updateDoc(doc(db, "support_tickets", ticketId), { status: "Resolved" });
  }

  // Helper formatting variables with null checks to prevent crashes
  const formatPrice = (val: any) => {
    const clean = String(val || "").replace("$", "");
    const parsed = parseFloat(clean);
    return isNaN(parsed) ? "0.00" : parsed.toFixed(2);
  };

  const getStatusClass = (status?: string) => {
    return (status || "pending").toLowerCase();
  };

  const totalSales = orders.reduce((sum, o) => {
    const status = (o.status || "").toLowerCase();
    const orderTotal = parseFloat(String(o.total || "0"));
    return sum + (status === "delivered" ? (isNaN(orderTotal) ? 0 : orderTotal) : 0);
  }, 0);

  const pendingOrders = orders.filter((o) => (o.status || "").toLowerCase() !== "delivered").length;
  const openTickets = tickets.filter((t) => (t.status || "").toLowerCase() !== "resolved").length;

  if (loading || !user || user.role !== "admin") return <main className="loading-page">Loading Admin Panel...</main>;

  return (
    <main className="admin-page">
      {/* Sidebar navigation */}
      <aside className="app-sidebar">
        <strong className="sidebar-title">
          <Shield size={18} /> Admin Suite
        </strong>
        <nav className="sidebar-nav-links">
          <button className={activeTab === "dashboard" ? "active" : ""} onClick={() => setActiveTab("dashboard")}>
            <DollarSign size={18} /> Dashboard
          </button>
          <button className={activeTab === "products" ? "active" : ""} onClick={() => setActiveTab("products")}>
            <PackagePlus size={18} /> Products
          </button>
          <button className={activeTab === "orders" ? "active" : ""} onClick={() => setActiveTab("orders")}>
            <ReceiptText size={18} /> Orders ({pendingOrders})
          </button>
          <button className={activeTab === "users" ? "active" : ""} onClick={() => setActiveTab("users")}>
            <UsersRound size={18} /> Users
          </button>
          <button className={activeTab === "support" ? "active" : ""} onClick={() => setActiveTab("support")}>
            <Wrench size={18} /> Support ({openTickets})
          </button>
          <button className={activeTab === "settings" ? "active" : ""} onClick={() => setActiveTab("settings")}>
            <Settings size={18} /> Settings
          </button>
        </nav>
        <a href="/shop" className="sidebar-store-link">Storefront Panel</a>
        <button className="sidebar-logout-btn" onClick={async () => { await logout(); router.push("/login"); }}>
          <LogOut size={18} /> Logout
        </button>
      </aside>

      {/* Main Admin Section */}
      <section className="admin-main">
        {/* Admin Premium Hero Banner */}
        <div className="admin-hero-banner">
          <div className="hero-badge"><Shield size={14} /> Admin Workspace</div>
          <h1>System Control Panel</h1>
          <p>Manage products, view delivery statistics, configure server values, and reply to client tickets.</p>
        </div>

        {/* DASHBOARD TAB */}
        {activeTab === "dashboard" && (
          <div className="admin-tab-view animate-fade">
            <div className="admin-stats-grid">
              <article className="stat-card">
                <div className="icon-wrapper green-bg"><DollarSign size={24} /></div>
                <div>
                  <strong>${totalSales.toFixed(2)}</strong>
                  <span>Completed Sales</span>
                </div>
              </article>
              <article className="stat-card">
                <div className="icon-wrapper sky-bg"><ReceiptText size={24} /></div>
                <div>
                  <strong>{orders.length}</strong>
                  <span>Total Orders Placed</span>
                </div>
              </article>
              <article className="stat-card">
                <div className="icon-wrapper lavender-bg"><Wrench size={24} /></div>
                <div>
                  <strong>{openTickets}</strong>
                  <span>Active Tickets</span>
                </div>
              </article>
              <article className="stat-card">
                <div className="icon-wrapper peach-bg"><UsersRound size={24} /></div>
                <div>
                  <strong>{users.length}</strong>
                  <span>Registered Users</span>
                </div>
              </article>
            </div>

            <div className="dashboard-lists-preview">
              <div className="preview-box">
                <h3>Recent Placed Orders</h3>
                {orders.slice(0, 5).map((o) => (
                  <div className="preview-row" key={o.id}>
                    <span>{o.email}</span>
                    <strong className={`status-badge-inline ${getStatusClass(o.status)}`}>{o.status || "Pending"}</strong>
                    <strong>${formatPrice(o.total)}</strong>
                  </div>
                ))}
              </div>
              <div className="preview-box">
                <h3>Recent Support Requests</h3>
                {tickets.slice(0, 5).map((t) => (
                  <div className="preview-row" key={t.id}>
                    <span>{t.subject} ({t.name})</span>
                    <strong className={`status-badge-inline ${getStatusClass(t.status)}`}>{t.status || "Open"}</strong>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* PRODUCTS TAB */}
        {activeTab === "products" && (
          <div className="admin-tab-view animate-fade">
            <div className="view-header-row">
              <h2>Inventory & Catalog Management</h2>
              <button className="add-product-btn" onClick={() => openProductModal(null)}>
                <Plus size={16} /> Add Product
              </button>
            </div>

            <table className="admin-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Tag</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((prod) => (
                  <tr key={prod.id}>
                    <td>
                      <div className="table-product-cell">
                        <Image src={prod.image} alt="" width={60} height={60} />
                        <div>
                          <strong>{prod.name}</strong>
                          <span className="desc-short">{prod.description ? prod.description.slice(0, 40) : ""}...</span>
                        </div>
                      </div>
                    </td>
                    <td>{prod.category}</td>
                    <td><strong>{prod.price}</strong></td>
                    <td>{prod.stock} items</td>
                    <td><span className="tag-badge-table">{prod.tag}</span></td>
                    <td className="actions-cell">
                      <button onClick={() => openProductModal(prod)} title="Edit"><Edit2 size={16} /></button>
                      <button onClick={() => handleDeleteProduct(prod.id)} title="Delete" className="delete-btn-tbl"><Trash2 size={16} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ORDERS TAB */}
        {activeTab === "orders" && (
          <div className="admin-tab-view animate-fade">
            <h2>Order Deliveries Tracker</h2>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Invoice ID</th>
                  <th>Customer Email</th>
                  <th>Items Purchased</th>
                  <th>Total Amount</th>
                  <th>Shipping Address</th>
                  <th>Status</th>
                  <th>Action Dispatch</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id}>
                    <td><code>#{o.id}</code></td>
                    <td>{o.email}</td>
                    <td>
                      <div className="purchased-items-cell">
                        {o.items?.map((item: any, idx: number) => (
                          <div key={idx}>{item.name} (x{item.quantity})</div>
                        ))}
                      </div>
                    </td>
                    <td><strong>${formatPrice(o.total)}</strong></td>
                    <td><span className="address-span">{o.address}</span></td>
                    <td><span className={`status-pill ${getStatusClass(o.status)}`}>{o.status}</span></td>
                    <td>
                      {o.status !== "Delivered" ? (
                        <button
                          onClick={() => handleUpdateOrderStatus(o.id, o.status)}
                          className="dispatch-action-btn"
                        >
                          {o.status === "Pending" ? "Ship Package" : "Deliver Package"} <ArrowRight size={14} />
                        </button>
                      ) : (
                        <span className="text-green-success"><CheckCircle size={16} /> Completed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* USERS TAB */}
        {activeTab === "users" && (
          <div className="admin-tab-view animate-fade">
            <h2>Database Permissions & Roles</h2>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Display Name</th>
                  <th>Email ID</th>
                  <th>User Role</th>
                  <th>Action Permissions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>{u.displayName || "Parent Account"}</td>
                    <td>{u.email}</td>
                    <td>
                      <span className={`role-badge ${u.role}`}>
                        {u.role}
                      </span>
                    </td>
                    <td>
                      <button className="role-switch-btn" onClick={() => handleToggleUserRole(u.id, u.role)}>
                        {u.role === "admin" ? "Demote to User" : "Promote to Admin"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* SUPPORT TICKETS TAB */}
        {activeTab === "support" && (
          <div className="admin-tab-view animate-fade">
            <h2>Client Support Tickets Inbox</h2>
            <div className="tickets-grid-list">
              {tickets.length === 0 ? (
                <div className="empty-state">No client support tickets found in Firestore.</div>
              ) : (
                tickets.map((t) => (
                  <div className={`ticket-box-item ${getStatusClass(t.status)}`} key={t.id}>
                    <div className="ticket-header">
                      <div>
                        <h3>{t.subject}</h3>
                        <span>From: {t.name} ({t.email})</span>
                      </div>
                      <span className={`status-pill ${getStatusClass(t.status)}`}>{t.status || "Open"}</span>
                    </div>
                    <p className="ticket-message-content"><strong>Inquiry:</strong> {t.message}</p>
                    
                    {t.replies && t.replies.length > 0 && (
                      <div className="ticket-replies-list">
                        <h4>Replies History:</h4>
                        {t.replies.map((rep, idx) => (
                          <div className="reply-bubble" key={idx}>
                            <strong>{rep.author}:</strong>
                            <p>{rep.text}</p>
                            <span className="reply-time">{rep.time}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="ticket-actions-row">
                      {(t.status || "").toLowerCase() !== "resolved" ? (
                        <>
                          {replyTicketId === t.id ? (
                            <form onSubmit={(e) => handleSendTicketReply(e, t.id)} className="ticket-reply-form">
                              <textarea
                                placeholder="Type support reply (will update status to Responded)..."
                                required
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                              />
                              <div className="reply-form-actions">
                                <button type="button" onClick={() => setReplyTicketId(null)}>Cancel</button>
                                <button type="submit" className="submit-reply-btn">Send Response</button>
                              </div>
                            </form>
                          ) : (
                            <>
                              <button className="btn-reply-support" onClick={() => setReplyTicketId(t.id)}>
                                Reply Ticket
                              </button>
                              <button className="btn-resolve-support" onClick={() => handleCloseTicket(t.id)}>
                                Close / Mark Resolved
                              </button>
                            </>
                          )}
                        </>
                      ) : (
                        <strong className="text-resolved-tag">This ticket is fully resolved.</strong>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* SETTINGS TAB */}
        {activeTab === "settings" && (
          <form className="admin-settings-form animate-fade" onSubmit={saveSettings}>
            <div>
              <span className="section-kicker">Store Preferences</span>
              <h2>Configure App & Store Globals</h2>
            </div>
            <label>
              <span>Support Email Address</span>
              <input value={settings.supportEmail} onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })} />
            </label>
            <label>
              <span>Contact Support Phone</span>
              <input value={settings.contactPhone} onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })} />
            </label>
            <label>
              <span>Currency Symbol Prefix</span>
              <input value={settings.currencySymbol} onChange={(e) => setSettings({ ...settings, currencySymbol: e.target.value })} />
            </label>
            <label className="check-row">
              <input type="checkbox" checked={settings.reviewsEnabled} onChange={(e) => setSettings({ ...settings, reviewsEnabled: e.target.checked })} />
              Allow product ratings and feedback
            </label>
            <label className="check-row">
              <input type="checkbox" checked={settings.showOutOfStock} onChange={(e) => setSettings({ ...settings, showOutOfStock: e.target.checked })} />
              Show out-of-stock products
            </label>
            <label className="check-row">
              <input type="checkbox" checked={settings.requireEmailVerification} onChange={(e) => setSettings({ ...settings, requireEmailVerification: e.target.checked })} />
              Require email verification before orders
            </label>
            {settingsSavedStatus && <strong className="form-status">{settingsSavedStatus}</strong>}
            <button className="btn-save-settings">Save All Configuration</button>
          </form>
        )}
      </section>

      {/* CREATE / EDIT PRODUCT MODAL */}
      {isProductModalOpen && (
        <div className="modal-overlay">
          <div className="modal-card animate-scale-up">
            <div className="modal-header">
              <h2>{editingProduct ? "Modify Product Details" : "Create New Catalog Entry"}</h2>
              <button className="close-btn" onClick={closeProductModal}>×</button>
            </div>
            <form onSubmit={handleProductSubmit} className="admin-product-form">
              <label>
                <span>Product Name</span>
                <input type="text" required value={productName} onChange={(e) => setProductName(e.target.value)} />
              </label>
              <div className="form-row-double">
                <label>
                  <span>Category</span>
                  <select value={productCategory} onChange={(e) => setProductCategory(e.target.value)}>
                    <option value="Diapers">Diapers</option>
                    <option value="Feeding">Feeding</option>
                    <option value="Clothing">Clothing</option>
                    <option value="Bath Care">Bath Care</option>
                  </select>
                </label>
                <label>
                  <span>Stock Available</span>
                  <input type="number" required min={0} value={productStock} onChange={(e) => setProductStock(Number(e.target.value))} />
                </label>
              </div>
              <div className="form-row-double">
                <label>
                  <span>Price (USD)</span>
                  <input type="text" required placeholder="18.99" value={productPrice} onChange={(e) => setProductPrice(e.target.value)} />
                </label>
                <label>
                  <span>Marketing Tag (e.g. Best seller)</span>
                  <input type="text" value={productTag} onChange={(e) => setProductTag(e.target.value)} />
                </label>
              </div>
              <label>
                <span>Product Image URL</span>
                <input type="text" placeholder="https://images.unsplash.com/..." value={productImage} onChange={(e) => setProductImage(e.target.value)} />
              </label>
              <label>
                <span>Detailed Description</span>
                <textarea rows={4} required value={productDescription} onChange={(e) => setProductDescription(e.target.value)} />
              </label>

              <div className="checkout-actions">
                <button type="button" className="btn-cancel-btn" onClick={closeProductModal}>
                  Cancel
                </button>
                <button type="submit" className="btn-submit-btn">
                  {editingProduct ? "Save Changes" : "Create Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}


