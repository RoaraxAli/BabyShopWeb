"use client";

import { Bot, Heart, Home, Package, Search, ShoppingBag, Truck, UserRound, ShoppingCart, Trash2, X, Plus, Minus, ArrowRight, ShieldCheck, HeartHandshake } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Footer } from "@/components/Footer";
import { Nav } from "@/components/Nav";
import { useAuth } from "@/components/AuthProvider";
import { categories, products as initialMockProducts } from "@/lib/data";
import { collection, doc, getDocs, setDoc, addDoc, getDoc, query, where, writeBatch, serverTimestamp, onSnapshot } from "firebase/firestore";
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

type CartItem = {
  product: Product;
  quantity: number;
};

type Order = {
  id: string;
  items: { name: string; price: string; quantity: number }[];
  total: number;
  address: string;
  status: string;
  createdAt: any;
};

export default function ShopPage() {
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<"home" | "shop" | "wishlist" | "orders" | "assistant" | "profile">("home");
  
  // Products & Category State
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [productsLoading, setProductsLoading] = useState(true);

  // Cart & Wishlist State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);

  // Order & Checkout State
  const [orders, setOrders] = useState<Order[]>([]);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [shippingAddress, setShippingAddress] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [checkoutStatus, setCheckoutStatus] = useState("");
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  // AI Chat State
  const [chatMessages, setChatMessages] = useState<{ sender: "bot" | "user"; text: string }[]>([
    { sender: "bot", text: "Hello! I am your BabyShopHub Personal Assistant. Ask me anything about our diapers, organic baby foods, sizing, shipping, or returns!" }
  ]);
  const [chatInput, setChatInput] = useState("");

  // Profile Form States
  const [profileName, setProfileName] = useState("");
  const [profileAddress, setProfileAddress] = useState("");
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [profileStatus, setProfileStatus] = useState("");

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [loading, router, user]);

  // Load products from Firestore (with automatic seeder fallback)
  useEffect(() => {
    if (!user) return;
    async function syncProducts() {
      try {
        const querySnapshot = await getDocs(collection(db, "products"));
        let fetchedProducts: Product[] = [];
        querySnapshot.forEach((docSnap) => {
          fetchedProducts.push({ id: docSnap.id, ...docSnap.data() } as Product);
        });

        // Seed products if collection is completely empty
        if (fetchedProducts.length === 0) {
          const batch = writeBatch(db);
          initialMockProducts.forEach((mockProd, idx) => {
            const newDocRef = doc(collection(db, "products"));
            const seededData = {
              name: mockProd.name,
              tag: mockProd.tag,
              price: mockProd.price,
              description: mockProd.description,
              image: mockProd.image,
              category: mockProd.name.toLowerCase().includes("diaper") ? "Diapers" :
                        mockProd.name.toLowerCase().includes("puree") ? "Feeding" :
                        mockProd.name.toLowerCase().includes("onesie") ? "Clothing" : "Bath Care",
              stock: 20 + idx * 5,
            };
            batch.set(newDocRef, seededData);
            fetchedProducts.push({ id: newDocRef.id, ...seededData } as Product);
          });
          await batch.commit();
        }
        setProducts(fetchedProducts);
        setFilteredProducts(fetchedProducts);
      } catch (err) {
        console.error("Error loading products:", err);
      } finally {
        setProductsLoading(false);
      }
    }
    void syncProducts();
  }, [user]);

  // Load User Profile (Wishlist, Saved Address, MFA settings)
  useEffect(() => {
    if (!user?.uid) return;
    const unsub = onSnapshot(doc(db, "users", user.uid), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setUserProfile(data);
        setWishlistIds(data.wishlistedProductIds || []);
        setProfileName(data.displayName || user.displayName || "");
        setProfileAddress(data.savedAddress || "");
        setMfaEnabled(data.isMfaEnabled || data.isTotpEnabled || false);
      }
    });
    return () => unsub();
  }, [user]);

  // Load Orders from Firestore
  useEffect(() => {
    if (!user?.uid) return;
    const q = query(collection(db, "orders"), where("userId", "==", user.uid));
    const unsub = onSnapshot(q, (snapshot) => {
      const fetchedOrders: Order[] = [];
      snapshot.forEach((docSnap) => {
        const orderData = docSnap.data();
        fetchedOrders.push({
          id: docSnap.id,
          items: orderData.items || [],
          total: orderData.total || 0,
          address: orderData.address || "",
          status: orderData.status || "Pending",
          createdAt: orderData.createdAt,
        });
      });
      // Sort orders by date descending
      fetchedOrders.sort((a, b) => {
        const dateA = a.createdAt?.seconds || 0;
        const dateB = b.createdAt?.seconds || 0;
        return dateB - dateA;
      });
      setOrders(fetchedOrders);
    });
    return () => unsub();
  }, [user]);

  // Filter & Search Products
  useEffect(() => {
    let result = products;
    if (selectedCategory !== "All") {
      result = result.filter((p) => p.category === selectedCategory);
    }
    if (searchQuery.trim() !== "") {
      const queryLower = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(queryLower) ||
          p.description.toLowerCase().includes(queryLower) ||
          p.category.toLowerCase().includes(queryLower)
      );
    }
    setFilteredProducts(result);
  }, [selectedCategory, searchQuery, products]);

  // Wishlist Handling
  async function toggleWishlist(productId: string) {
    if (!user?.uid) return;
    const currentWishlist = [...wishlistIds];
    const index = currentWishlist.indexOf(productId);
    if (index > -1) {
      currentWishlist.splice(index, 1);
    } else {
      currentWishlist.push(productId);
    }
    setWishlistIds(currentWishlist);
    await setDoc(doc(db, "users", user.uid), { wishlistedProductIds: currentWishlist }, { merge: true });
  }

  // Cart Operations
  function addToCart(product: Product) {
    const existing = cart.find((item) => item.product.id === product.id);
    if (existing) {
      setCart(
        cart.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      );
    } else {
      setCart([...cart, { product, quantity: 1 }]);
    }
  }

  function updateCartQuantity(productId: string, delta: number) {
    setCart(
      cart
        .map((item) => {
          if (item.product.id === productId) {
            const nextQty = item.quantity + delta;
            return nextQty > 0 ? { ...item, quantity: nextQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  }

  function removeFromCart(productId: string) {
    setCart(cart.filter((item) => item.product.id !== productId));
  }

  const cartTotal = cart.reduce((sum, item) => {
    const priceNum = parseFloat(item.product.price.replace("$", ""));
    return sum + priceNum * item.quantity;
  }, 0);

  // Submit Order Checkout
  async function handleCheckout(e: React.FormEvent) {
    e.preventDefault();
    if (!user?.uid || cart.length === 0) return;
    setIsCheckingOut(true);
    setCheckoutStatus("");

    try {
      // 1. Write the order object to Firestore
      const orderRef = await addDoc(collection(db, "orders"), {
        userId: user.uid,
        email: user.email,
        items: cart.map((item) => ({
          id: item.product.id,
          name: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
        })),
        total: parseFloat(cartTotal.toFixed(2)),
        address: shippingAddress.trim(),
        status: "Pending",
        createdAt: serverTimestamp(),
      });

      // 2. Clear cart and close dialogs
      setCart([]);
      setIsCheckoutOpen(false);
      setIsCartOpen(false);
      setCheckoutStatus("");
      setActiveTab("orders");
      alert(`Order Placed Successfully! Your invoice ID is: ${orderRef.id}`);
    } catch (err) {
      console.error(err);
      setCheckoutStatus("Checkout failed. Please try again.");
    } finally {
      setIsCheckingOut(false);
    }
  }

  // Update Profile info
  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!user?.uid) return;
    setProfileStatus("Saving...");
    try {
      await setDoc(
        doc(db, "users", user.uid),
        {
          displayName: profileName.trim(),
          savedAddress: profileAddress.trim(),
          isMfaEnabled: mfaEnabled,
        },
        { merge: true }
      );
      setProfileStatus("Profile updated successfully!");
    } catch {
      setProfileStatus("Error updating profile.");
    }
  }

  // AI Assistant simulated answers
  function handleSendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (chatInput.trim() === "") return;
    const userMsg = chatInput.trim();
    setChatMessages((prev) => [...prev, { sender: "user", text: userMsg }]);
    setChatInput("");

    setTimeout(() => {
      const msgLower = userMsg.toLowerCase();
      let botResponse = "I appreciate your message! I'm scanning our knowledge base. For specific order issues, you can file a request in the Profile -> Support page.";

      if (msgLower.includes("diaper")) {
        botResponse = "Our CloudSoft Diapers are hypoallergenic, dermatologically certified, and feature breathability perfect for overnight protection. Standard options start at $18.99!";
      } else if (msgLower.includes("food") || msgLower.includes("puree") || msgLower.includes("feeding")) {
        botResponse = "We only sell 100% organic baby food purees with no synthetic fillers or added sugar. Pediatricians recommend our organic apple purees for infants 6 months and older.";
      } else if (msgLower.includes("delivery") || msgLower.includes("shipping")) {
        botResponse = "Standard delivery is completely free for all items! Orders usually arrive within 2-3 business days. You can track all packages in the 'Orders' tab.";
      } else if (msgLower.includes("return") || msgLower.includes("refund")) {
        botResponse = "We offer a 30-day hassle-free return policy on all unopened baby essentials. You can request a return directly through the contact/support forms.";
      } else if (msgLower.includes("mfa") || msgLower.includes("security")) {
        botResponse = "You can toggle Multi-Factor Authentication in the 'Profile' tab. This secures your checkout and triggers safety email warnings for unknown locations.";
      }
      setChatMessages((prev) => [...prev, { sender: "bot", text: botResponse }]);
    }, 800);
  }

  if (loading || !user) return <main className="loading-page">Loading BabyShopHub...</main>;

  return (
    <>
      <Nav />
      <main className="app-shell">
        {/* Navigation Sidebar */}
        <aside className="app-sidebar">
          <strong>BabyShopHub Client</strong>
          <nav className="sidebar-nav-links">
            <button className={activeTab === "home" ? "active" : ""} onClick={() => setActiveTab("home")}>
              <Home size={18} /> Home
            </button>
            <button className={activeTab === "shop" ? "active" : ""} onClick={() => setActiveTab("shop")}>
              <ShoppingBag size={18} /> Shop Catalog
            </button>
            <button className={activeTab === "wishlist" ? "active" : ""} onClick={() => setActiveTab("wishlist")}>
              <Heart size={18} /> Wishlist
            </button>
            <button className={activeTab === "orders" ? "active" : ""} onClick={() => setActiveTab("orders")}>
              <Truck size={18} /> Track Orders
            </button>
            <button className={activeTab === "assistant" ? "active" : ""} onClick={() => setActiveTab("assistant")}>
              <Bot size={18} /> AI Assistant
            </button>
            <button className={activeTab === "profile" ? "active" : ""} onClick={() => setActiveTab("profile")}>
              <UserRound size={18} /> My Profile
            </button>
          </nav>

          {/* Cart Status in Sidebar */}
          <div className="sidebar-cart-indicator">
            <button onClick={() => setIsCartOpen(true)} className="sidebar-cart-btn">
              <ShoppingCart size={18} />
              <span>Cart ({cart.reduce((s, i) => s + i.quantity, 0)})</span>
            </button>
          </div>

          <button className="sidebar-logout" onClick={async () => { await logout(); router.push("/login"); }}>
            Sign Out
          </button>
        </aside>

        {/* Main Application Area */}
        <section className="app-main">
          {/* HEADER/TOP BAR */}
          <div className="app-topbar">
            <div>
              <span className="section-kicker">Storefront Client</span>
              <h1>Welcome, {userProfile?.displayName || user.displayName}</h1>
            </div>
            <div className="search-pill-v2">
              <Search size={17} />
              <input
                type="text"
                placeholder="Search catalog, clothing, feeding..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (activeTab !== "shop") setActiveTab("shop");
                }}
              />
            </div>
          </div>

          {/* HOME TAB */}
          {activeTab === "home" && (
            <div className="tab-view home-view animate-fade">
              {/* Premium Promo Slider Hero */}
              <div className="store-promo-hero">
                <div className="promo-text">
                  <span className="kicker-white">Seasonal Offer</span>
                  <h2>Organic Cotton Clothing Set</h2>
                  <p>Breathable fabric, completely non-toxic dyes, now 20% off in our shop catalog.</p>
                  <button onClick={() => setActiveTab("shop")} className="btn-light-rounded">
                    Shop Now <ArrowRight size={16} />
                  </button>
                </div>
                <div className="promo-bg-icon">🧸</div>
              </div>

              {/* Highlight statistics */}
              <div className="shop-dashboard-stats">
                <article>
                  <Package size={22} className="text-rose" />
                  <div>
                    <strong>{products.length} Products</strong>
                    <span>Premium Essentials Selections</span>
                  </div>
                </article>
                <article>
                  <Heart size={22} className="text-amber" />
                  <div>
                    <strong>{wishlistIds.length} Saved Items</strong>
                    <span>Your Bookmarked Wishlist</span>
                  </div>
                </article>
                <article>
                  <Truck size={22} className="text-mint" />
                  <div>
                    <strong>{orders.length} Placed Orders</strong>
                    <span>Track Status & Invoices</span>
                  </div>
                </article>
              </div>

              {/* Quick Info Grid */}
              <div className="home-parent-guides">
                <div>
                  <HeartHandshake size={28} />
                  <h3>Pediatric Certified Care</h3>
                  <p>Our catalog matches strict dermatological profiles. Protect babies from rash and irritation.</p>
                </div>
                <div>
                  <ShieldCheck size={28} />
                  <h3>Dynamic Safe Checkout</h3>
                  <p>Full secure payment validation, address book persistence, and real-time status alerts.</p>
                </div>
              </div>
            </div>
          )}

          {/* SHOP CATALOG TAB */}
          {activeTab === "shop" && (
            <div className="tab-view shop-view animate-fade">
              <div className="catalog-filters">
                <button className={selectedCategory === "All" ? "active" : ""} onClick={() => setSelectedCategory("All")}>All</button>
                <button className={selectedCategory === "Diapers" ? "active" : ""} onClick={() => setSelectedCategory("Diapers")}>Diapers</button>
                <button className={selectedCategory === "Feeding" ? "active" : ""} onClick={() => setSelectedCategory("Feeding")}>Feeding</button>
                <button className={selectedCategory === "Clothing" ? "active" : ""} onClick={() => setSelectedCategory("Clothing")}>Clothing</button>
                <button className={selectedCategory === "Bath Care" ? "active" : ""} onClick={() => setSelectedCategory("Bath Care")}>Bath Care</button>
              </div>

              {productsLoading ? (
                <div className="loading-spinner">Syncing Firebase Catalog...</div>
              ) : filteredProducts.length === 0 ? (
                <div className="empty-state">No products found matching your filter options.</div>
              ) : (
                <div className="product-grid-catalog">
                  {filteredProducts.map((product) => {
                    const isWishlisted = wishlistIds.includes(product.id);
                    return (
                      <article className="product-premium-card" key={product.id}>
                        <div className="card-image-wrapper">
                          <Image src={product.image} alt={product.name} width={400} height={400} />
                          <button
                            onClick={() => toggleWishlist(product.id)}
                            className={`wishlist-toggle-btn ${isWishlisted ? "active" : ""}`}
                            aria-label="Toggle Wishlist"
                          >
                            <Heart size={18} fill={isWishlisted ? "var(--rose-dark)" : "none"} />
                          </button>
                        </div>
                        <div className="product-body">
                          <span className="product-tag-badge">{product.tag}</span>
                          <h3>{product.name}</h3>
                          <p>{product.description}</p>
                          <div className="product-card-footer">
                            <strong className="product-price">{product.price}</strong>
                            <button className="add-to-cart-btn" onClick={() => addToCart(product)}>
                              Add to Cart
                            </button>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* WISHLIST TAB */}
          {activeTab === "wishlist" && (
            <div className="tab-view wishlist-view animate-fade">
              <h2>My Wishlisted Items ({wishlistIds.length})</h2>
              {wishlistIds.length === 0 ? (
                <div className="empty-state">
                  <p>Your wishlist is empty. Go browse the catalog and save your favorites!</p>
                  <button onClick={() => setActiveTab("shop")} className="btn-primary-gradient">Browse Catalog</button>
                </div>
              ) : (
                <div className="product-grid-catalog">
                  {products
                    .filter((p) => wishlistIds.includes(p.id))
                    .map((product) => (
                      <article className="product-premium-card" key={product.id}>
                        <div className="card-image-wrapper">
                          <Image src={product.image} alt={product.name} width={400} height={400} />
                          <button
                            onClick={() => toggleWishlist(product.id)}
                            className="wishlist-toggle-btn active"
                          >
                            <Heart size={18} fill="var(--rose-dark)" />
                          </button>
                        </div>
                        <div className="product-body">
                          <span className="product-tag-badge">{product.tag}</span>
                          <h3>{product.name}</h3>
                          <p>{product.description}</p>
                          <div className="product-card-footer">
                            <strong className="product-price">{product.price}</strong>
                            <button className="add-to-cart-btn" onClick={() => addToCart(product)}>
                              Add to Cart
                            </button>
                          </div>
                        </div>
                      </article>
                    ))}
                </div>
              )}
            </div>
          )}

          {/* ORDERS TRACKING TAB */}
          {activeTab === "orders" && (
            <div className="tab-view orders-view animate-fade">
              <h2>My Order History & Tracking</h2>
              {orders.length === 0 ? (
                <div className="empty-state">
                  <p>You have not placed any orders yet.</p>
                  <button onClick={() => setActiveTab("shop")} className="btn-primary-gradient">Order Now</button>
                </div>
              ) : (
                <div className="orders-log-list">
                  {orders.map((order) => (
                    <article key={order.id} className="order-log-card">
                      <div className="order-header">
                        <div>
                          <strong>Invoice ID: #{order.id}</strong>
                          <span className="order-date">
                            {order.createdAt?.seconds
                              ? new Date(order.createdAt.seconds * 1000).toLocaleDateString()
                              : "Processing..."}
                          </span>
                        </div>
                        <span className={`status-pill ${order.status.toLowerCase()}`}>
                          {order.status}
                        </span>
                      </div>
                      <div className="order-items-summary">
                        {order.items.map((item, idx) => (
                          <div className="order-item-row" key={idx}>
                            <span>{item.name} (x{item.quantity})</span>
                            <strong>{item.price}</strong>
                          </div>
                        ))}
                      </div>
                      <div className="order-footer">
                        <div>
                          <span>Delivery Address:</span>
                          <p>{order.address}</p>
                        </div>
                        <div className="order-total-sum">
                          <span>Total Paid:</span>
                          <strong>${order.total.toFixed(2)}</strong>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* AI ASSISTANT CHAT TAB */}
          {activeTab === "assistant" && (
            <div className="tab-view assistant-view animate-fade">
              <h2>Grounded Parent Help Assistant</h2>
              <p className="assistant-desc">Ask questions about organic labels, secure MFA toggles, diaper listings, and checkout guides.</p>
              <div className="ai-chat-window-dashboard">
                <div className="chat-messages-box">
                  {chatMessages.map((msg, idx) => (
                    <div key={idx} className={`chat-bubble-row ${msg.sender === "bot" ? "bot" : "user"}`}>
                      <div className="chat-bubble">
                        <p>{msg.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <form className="chat-input-form" onSubmit={handleSendMessage}>
                  <input
                    type="text"
                    placeholder="Type questions (e.g. Do you sell organic food? How does shipping work?)..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                  />
                  <button type="submit">Ask Assistant</button>
                </form>
              </div>
            </div>
          )}

          {/* PROFILE MANAGEMENT TAB */}
          {activeTab === "profile" && (
            <div className="tab-view profile-view animate-fade">
              <h2>My Customer Settings</h2>
              <form className="profile-edit-form" onSubmit={saveProfile}>
                <label>
                  <span>Full Display Name</span>
                  <input
                    type="text"
                    required
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                  />
                </label>
                <label>
                  <span>Primary Shipping Address</span>
                  <textarea
                    rows={3}
                    required
                    placeholder="Enter default shipping street address, postal code, and country"
                    value={profileAddress}
                    onChange={(e) => setProfileAddress(e.target.value)}
                  />
                </label>
                <div className="mfa-security-box">
                  <div className="mfa-text">
                    <h3>Multi-Factor Authentication (MFA)</h3>
                    <p>Secures your shopping checkout. Dispatches a 6-digit verification code to your email account on logins and warns you about unknown device locations.</p>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={mfaEnabled}
                      onChange={(e) => setMfaEnabled(e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
                {profileStatus && <strong className="profile-status-alert">{profileStatus}</strong>}
                <button type="submit" className="btn-primary-gradient">Save Account Changes</button>
              </form>
            </div>
          )}
        </section>
      </main>

      {/* SHOPPING CART DRAWER (SLIDE OUT) */}
      {isCartOpen && (
        <div className="cart-drawer-overlay">
          <div className="cart-drawer animate-slide-left">
            <div className="cart-header">
              <h2>My Shopping Cart</h2>
              <button className="close-cart-btn" onClick={() => setIsCartOpen(false)}>
                <X size={20} />
              </button>
            </div>

            {cart.length === 0 ? (
              <div className="cart-empty-body">
                <ShoppingCart size={48} className="text-muted" />
                <p>Your shopping cart is currently empty.</p>
                <button className="btn-primary-gradient" onClick={() => { setIsCartOpen(false); setActiveTab("shop"); }}>
                  Shop Baby Essentials
                </button>
              </div>
            ) : (
              <>
                <div className="cart-items-list">
                  {cart.map((item) => (
                    <div className="cart-item-card" key={item.product.id}>
                      <Image src={item.product.image} alt={item.product.name} width={80} height={80} />
                      <div className="cart-item-info">
                        <h3>{item.product.name}</h3>
                        <strong className="cart-item-price">{item.product.price}</strong>
                        <div className="quantity-controls">
                          <button onClick={() => updateCartQuantity(item.product.id, -1)}><Minus size={14} /></button>
                          <span>{item.quantity}</span>
                          <button onClick={() => updateCartQuantity(item.product.id, 1)}><Plus size={14} /></button>
                        </div>
                      </div>
                      <button className="remove-item-btn" onClick={() => removeFromCart(item.product.id)}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="cart-summary-footer">
                  <div className="summary-row">
                    <span>Subtotal:</span>
                    <strong>${cartTotal.toFixed(2)}</strong>
                  </div>
                  <div className="summary-row">
                    <span>Shipping:</span>
                    <strong className="text-green">FREE</strong>
                  </div>
                  <button
                    className="checkout-btn"
                    onClick={() => {
                      setShippingAddress(profileAddress);
                      setIsCheckoutOpen(true);
                    }}
                  >
                    Proceed to Checkout
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* CHECKOUT MODAL WINDOW */}
      {isCheckoutOpen && (
        <div className="modal-overlay">
          <div className="modal-card checkout-modal-card animate-scale-up">
            <div className="modal-header">
              <h2>Secure Order Checkout</h2>
              <button className="close-btn" onClick={() => setIsCheckoutOpen(false)}>×</button>
            </div>
            <form onSubmit={handleCheckout} className="checkout-form">
              <label>
                <span>Delivery Shipping Address</span>
                <input
                  type="text"
                  required
                  placeholder="Street Address, City, Postal Code"
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                />
              </label>

              <div className="payment-credit-section">
                <h3>Card Payment details (Simulated)</h3>
                <label>
                  <span>Name on Card</span>
                  <input
                    type="text"
                    required
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                  />
                </label>
                <label>
                  <span>Card Number</span>
                  <input
                    type="text"
                    required
                    maxLength={16}
                    placeholder="4111 2222 3333 4444"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                  />
                </label>
                <div className="card-row-double">
                  <label>
                    <span>Expiry Date</span>
                    <input
                      type="text"
                      required
                      placeholder="MM/YY"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                    />
                  </label>
                  <label>
                    <span>CVV</span>
                    <input
                      type="password"
                      required
                      maxLength={3}
                      placeholder="123"
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value)}
                    />
                  </label>
                </div>
              </div>

              <div className="checkout-totals">
                <div><span>Total Items:</span><strong>{cart.reduce((s, i) => s + i.quantity, 0)}</strong></div>
                <div><span>Total Price:</span><strong>${cartTotal.toFixed(2)}</strong></div>
              </div>

              {checkoutStatus && <strong className="checkout-error-text">{checkoutStatus}</strong>}
              <div className="checkout-actions">
                <button type="button" className="btn-cancel-btn" onClick={() => setIsCheckoutOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-submit-btn" disabled={isCheckingOut}>
                  {isCheckingOut ? "Processing..." : `Pay $${cartTotal.toFixed(2)}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}

