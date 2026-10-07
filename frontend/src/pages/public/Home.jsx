import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ShoppingBag,
  Sparkles,
  Truck,
  ShieldCheck,
  RotateCcw,
  Clock,
  Layers,
  Zap,
  TrendingUp,
  Tag,
  Star,
  ChevronRight,
} from "lucide-react";
import { productService } from "../../services/product.service";
import { categoryService } from "../../services/category.service";
import ProductGrid from "../../components/product/ProductGrid";
import Button from "../../components/common/Button";

export const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategoryTab, setSelectedCategoryTab] = useState("all");
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const loadHomeData = async () => {
      try {
        setIsLoading(true);
        const [productsRes, categoriesRes] = await Promise.allSettled([
          productService.getProducts({ limit: 12, sort: "newest" }),
          categoryService.getCategories(),
        ]);

        if (isMounted) {
          if (productsRes.status === "fulfilled" && productsRes.value?.data) {
            setFeaturedProducts(productsRes.value.data);
            setFilteredProducts(productsRes.value.data);
          }
          if (categoriesRes.status === "fulfilled" && categoriesRes.value?.data) {
            setCategories(categoriesRes.value.data);
          }
        }
      } catch (err) {
        console.error("Home data load error", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadHomeData();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleTabChange = (catId) => {
    setSelectedCategoryTab(catId);
    if (catId === "all") {
      setFilteredProducts(featuredProducts);
    } else {
      const filtered = featuredProducts.filter(
        (p) => p.category?._id === catId || p.category === catId
      );
      setFilteredProducts(filtered.length > 0 ? filtered : featuredProducts);
    }
  };

  return (
    <div className="space-y-10 sm:space-y-14 pb-16">
      {/* 1. Hero Showcase Section (Reference Style) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Main Hero Banner (2 Columns on Large Screens) */}
          <div className="lg:col-span-2 relative rounded-2xl overflow-hidden bg-gradient-to-r from-[#002d2b] to-[#0f172a] text-white p-6 sm:p-10 md:p-12 flex flex-col justify-between min-h-[340px] sm:min-h-[400px] shadow-sm">
            <div className="relative z-10 max-w-lg space-y-3 sm:space-y-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#ed1d24] text-white text-[11px] font-extrabold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Trending Collections 2026</span>
              </span>

              <h1 className="text-2xl sm:text-4xl md:text-5xl font-black font-heading leading-tight tracking-tight text-white">
                Discover Everyday <br />
                <span className="text-[#ff5252]">Essentials & Lifestyle</span>
              </h1>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                Enjoy 100% verified doorstep <strong className="text-white font-bold">Cash on Delivery</strong> with fast courier dispatch across India.
              </p>

              <div className="pt-2 flex items-center gap-3">
                <Link to="/products">
                  <Button
                    variant="primary"
                    size="md"
                    rightIcon={ArrowRight}
                    className="px-6 py-2.5 rounded-lg text-xs sm:text-sm shadow-md"
                  >
                    Shop Now
                  </Button>
                </Link>
                <Link to="/products?sort=newest">
                  <button
                    type="button"
                    className="px-5 py-2.5 rounded-lg text-xs sm:text-sm font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-colors cursor-pointer"
                  >
                    New Arrivals
                  </button>
                </Link>
              </div>
            </div>

            {/* Decorative promo tag */}
            <div className="relative z-10 pt-6 mt-auto flex items-center gap-4 text-xs text-slate-300">
              <div className="flex items-center gap-1 text-amber-400 font-bold">
                <Star className="w-4 h-4 fill-current" />
                <span>4.9 / 5 Customer Rating</span>
              </div>
              <span>•</span>
              <span className="text-emerald-400 font-semibold">Zero Prepayment Required</span>
            </div>

            {/* Ambient background accent */}
            <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-radial from-[#ed1d24]/15 to-transparent pointer-events-none" />
          </div>

          {/* Right Promotional Feature Banners (1 Column) */}
          <div className="flex flex-col gap-4 sm:gap-6">
            {/* Promo Box 1 */}
            <div className="flex-1 rounded-2xl bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-white border border-amber-200/80 p-6 flex flex-col justify-between relative overflow-hidden group">
              <div className="space-y-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                  Special Offer
                </span>
                <h3 className="text-lg sm:text-xl font-black text-slate-900 font-heading">
                  Latest Electronics & Gear
                </h3>
                <p className="text-xs text-slate-500">
                  Save up to 40% on verified daily accessories
                </p>
              </div>
              <Link
                to="/products"
                className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-[#ed1d24] group-hover:underline"
              >
                <span>Explore Gadgets</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Promo Box 2 */}
            <div className="flex-1 rounded-2xl bg-gradient-to-br from-rose-500/10 via-red-500/5 to-white border border-rose-200/80 p-6 flex flex-col justify-between relative overflow-hidden group">
              <div className="space-y-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-700 bg-rose-100 px-2 py-0.5 rounded">
                  Free Delivery
                </span>
                <h3 className="text-lg sm:text-xl font-black text-slate-900 font-heading">
                  Orders Above ₹1,000
                </h3>
                <p className="text-xs text-slate-500">
                  Delivered right to your doorstep with COD verification
                </p>
              </div>
              <Link
                to="/products"
                className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-[#ed1d24] group-hover:underline"
              >
                <span>Shop Catalog</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Featured Categories Row (Reference Style) */}
      {categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-200">
            <h2 className="text-lg sm:text-xl font-black text-slate-900 font-heading">
              Featured Categories
            </h2>
            <Link
              to="/products"
              className="text-xs font-bold text-[#ed1d24] hover:text-[#d32f2f] flex items-center gap-1 hover:underline"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
            {categories.slice(0, 6).map((cat) => (
              <Link
                key={cat._id}
                to={`/products?category=${cat.slug || cat._id}`}
                className="group flex flex-col items-center justify-center p-4 rounded-xl bg-white border border-slate-200 hover:border-[#ed1d24] hover:shadow-sm transition-all text-center"
              >
                <div className="w-12 h-12 rounded-full bg-red-50 text-[#ed1d24] group-hover:bg-[#ed1d24] group-hover:text-white transition-all flex items-center justify-center mb-2 shadow-xs group-hover:scale-105">
                  <Layers className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-slate-800 group-hover:text-[#ed1d24] transition-colors truncate w-full">
                  {cat.name}
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5">Explore</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 3. Popular Products with Category Filter Tabs (Reference Style) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-2 border-b border-slate-200">
          <div>
            <h2 className="text-lg sm:text-2xl font-black text-slate-900 font-heading">
              Popular Products
            </h2>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <button
              type="button"
              onClick={() => handleTabChange("all")}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap ${
                selectedCategoryTab === "all"
                  ? "bg-[#ed1d24] text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              All Products
            </button>
            {categories.slice(0, 5).map((cat) => (
              <button
                key={cat._id}
                type="button"
                onClick={() => handleTabChange(cat._id)}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap ${
                  selectedCategoryTab === cat._id
                    ? "bg-[#ed1d24] text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        <ProductGrid products={filteredProducts} isLoading={isLoading} />
      </section>

      {/* 4. Promotional Split Banner (Reference Style) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-2xl bg-gradient-to-r from-[#0f172a] to-[#1e293b] text-white p-6 sm:p-8 flex items-center justify-between overflow-hidden shadow-sm">
            <div className="space-y-2 max-w-sm">
              <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-[#ed1d24] text-white">
                Best Values
              </span>
              <h3 className="text-xl sm:text-2xl font-black font-heading text-white">
                Save Big with Cash on Delivery
              </h3>
              <p className="text-xs text-slate-300">
                Inspect your package before payment at your doorstep.
              </p>
              <div className="pt-2">
                <Link to="/products">
                  <Button variant="primary" size="sm" className="rounded-lg text-xs">
                    Shop Deals
                  </Button>
                </Link>
              </div>
            </div>
            <div className="hidden sm:block text-slate-600/40">
              <ShieldCheck className="w-24 h-24" />
            </div>
          </div>

          <div className="rounded-2xl bg-gradient-to-r from-red-600 to-[#ed1d24] text-white p-6 sm:p-8 flex items-center justify-between overflow-hidden shadow-sm">
            <div className="space-y-2 max-w-sm">
              <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-white text-[#ed1d24]">
                Free Shipping
              </span>
              <h3 className="text-xl sm:text-2xl font-black font-heading text-white">
                Free Delivery Above ₹1,000
              </h3>
              <p className="text-xs text-red-100">
                Automated threshold free courier dispatch throughout India.
              </p>
              <div className="pt-2">
                <Link to="/products">
                  <Button variant="white" size="sm" className="rounded-lg text-xs font-bold text-[#ed1d24]">
                    Browse Catalog
                  </Button>
                </Link>
              </div>
            </div>
            <div className="hidden sm:block text-white/20">
              <Truck className="w-24 h-24" />
            </div>
          </div>
        </div>
      </section>

      {/* 5. Trust / Benefit Pillars Bar (Reference Style) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white p-6 rounded-2xl border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-50 text-[#ed1d24] flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Free Delivery</h4>
              <p className="text-[11px] text-slate-500">Orders over ₹1,000</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-50 text-[#ed1d24] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">COD Guaranteed</h4>
              <p className="text-[11px] text-slate-500">Inspect before paying</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-50 text-[#ed1d24] flex items-center justify-center shrink-0">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">7-Day Easy Returns</h4>
              <p className="text-[11px] text-slate-500">Quick replacement</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-50 text-[#ed1d24] flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Dedicated Support</h4>
              <p className="text-[11px] text-slate-500">Mon-Sat 9AM-8PM</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
