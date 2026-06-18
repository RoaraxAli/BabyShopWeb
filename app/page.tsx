import { ArrowRight, BookOpen, Download, Heart, ShieldCheck, Star, ShoppingBag, Baby, Sparkles } from "lucide-react";
import Image from "next/image";
import { Footer } from "@/components/Footer";
import { Nav } from "@/components/Nav";

export default function HomePage() {
  return (
    <>
      <Nav />
      <main className="landing-container">
        {/* Premium Hero Section */}
        <section className="marketing-hero-v2">
          <div className="hero-grid">
            <div className="hero-text-content">
              <span className="premium-tag">
                <Sparkles size={14} className="text-rose" /> Curated for Your Little One
              </span>
              <h1>Nurture and Care with Premium Baby Essentials</h1>
              <p>
                Discover clinically tested diapers, 100% organic meals, soft cotton clothing, and soothing bath essentials, backed by round-the-clock parent support and a smart AI assistant.
              </p>
              <div className="hero-actions-v2">
                <a className="btn-primary-gradient" href="/login">
                  Shop Catalog
                  <ShoppingBag size={18} />
                </a>
                <a className="btn-secondary-outline" href="/downloads">
                  Download App
                  <Download size={18} />
                </a>
              </div>
            </div>
            <div className="hero-visual-v2">
              <div className="visual-wrapper">
                <Image
                  src="https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=1200&q=85"
                  alt="Baby essentials arranged in a nursery"
                  width={900}
                  height={760}
                  priority
                  className="rounded-hero-img"
                />
                <div className="floating-card-rating">
                  <div className="stars">
                    <Star size={14} fill="#ffbc63" color="#ffbc63" />
                    <Star size={14} fill="#ffbc63" color="#ffbc63" />
                    <Star size={14} fill="#ffbc63" color="#ffbc63" />
                    <Star size={14} fill="#ffbc63" color="#ffbc63" />
                    <Star size={14} fill="#ffbc63" color="#ffbc63" />
                  </div>
                  <strong>4.9/5 Rating</strong>
                  <span>Loved by 10k+ Parents</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Categories Spotlight */}
        <section className="section-categories">
          <div className="section-header-center">
            <span className="section-kicker">Shop By Category</span>
            <h2>Designed for delicate skins & happy milestones</h2>
            <p>Every product is handpicked, pediatric-approved, and tested to meet premium standards.</p>
          </div>
          <div className="categories-spotlight-grid">
            {[
              { name: "CloudSoft Diapers", desc: "Overnight absorbency, hypoallergenic material.", color: "mint-bg", icon: "🍼", count: "36 Options" },
              { name: "Organic Feeding", desc: "Natural purees & formulas, zero preservatives.", color: "peach-bg", icon: "🍎", count: "24 Options" },
              { name: "Comfort Clothes", desc: "100% organic combed cotton everyday onesies.", color: "sky-bg", icon: "👕", count: "42 Options" },
              { name: "Gentle Bath Care", desc: "Dermatologist tested tear-free soaps and lotions.", color: "lavender-bg", icon: "🛁", count: "18 Options" }
            ].map((cat) => (
              <div key={cat.name} className={`category-premium-card ${cat.color}`}>
                <div className="cat-icon-bubble">{cat.icon}</div>
                <h3>{cat.name}</h3>
                <p>{cat.desc}</p>
                <div className="cat-footer">
                  <span>{cat.count}</span>
                  <a href="/login" className="cat-arrow"><ArrowRight size={16} /></a>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Features Split Section */}
        <section className="premium-split-info">
          <div className="split-wrapper">
            <div className="split-image">
              <Image
                src="https://images.unsplash.com/photo-1522771930-78848d9293e8?auto=format&fit=crop&w=900&q=80"
                alt="Soft baby clothing and towels"
                width={600}
                height={500}
                className="split-rounded-img"
              />
            </div>
            <div className="split-copy">
              <span className="section-kicker">Safe & Transparent</span>
              <h2>Clinically Certified, Pediatric-Tested Products</h2>
              <p>
                We collaborate with pediatricians and child care experts to guarantee that every batch of baby food, diapers, and apparel is free of heavy metals, toxic chemical dyes, and skin-sensitizing fragrances.
              </p>
              <ul className="split-benefits-list">
                <li>
                  <div className="bullet-icon"><ShieldCheck size={18} /></div>
                  <div>
                    <strong>Dermatologically Certified</strong>
                    <p>Ideal for sensitive newborn skin subject to eczema or redness.</p>
                  </div>
                </li>
                <li>
                  <div className="bullet-icon"><ShieldCheck size={18} /></div>
                  <div>
                    <strong>Sustainably Sourced Fabrics</strong>
                    <p>GOTS certified organic cotton ensuring a soft touch and breathability.</p>
                  </div>
                </li>
              </ul>
              <a href="/about" className="learn-more-link">
                Learn about our clinical standards <ArrowRight size={16} />
              </a>
            </div>
          </div>
        </section>

        {/* Quick App Link / Downloads Callout */}
        <section className="app-download-banner">
          <div className="download-banner-card">
            <div className="banner-text">
              <h2>Ready to shop? Get the App.</h2>
              <p>
                Download BabyShopHub on Android, iOS, Windows, or shop online directly on our modern web platform. Keep your nursery fully stocked.
              </p>
              <div className="banner-buttons">
                <a className="button dark-rounded" href="/downloads">
                  <Download size={18} />
                  Get Downloads
                </a>
                <a className="button light-rounded" href="/docs/documentation">
                  <BookOpen size={18} />
                  Read Setup Docs
                </a>
              </div>
            </div>
            <div className="banner-icon-bg">👶</div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

