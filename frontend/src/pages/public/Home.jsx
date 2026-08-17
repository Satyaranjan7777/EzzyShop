import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ShoppingBag,
  Sparkles,
  Truck,
  ShieldCheck,
  RotateCcw,
  Store,
  Layers,
  Zap,
  TrendingUp,
} from "lucide-react";
import { productService } from "../../services/product.service";
import { categoryService } from "../../services/category.service";
import ProductGrid from "../../components/product/ProductGrid";
import Button from "../../components/common/Button";

export const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const loadHomeData = async () => {
      try {
        setIsLoading(true);
        const [productsRes, categoriesRes] = await Promise.allSettled([
          productService.getProducts({ limit: 8, sort: "newest" }),
          categoryService.getCategories(),
        ]);

        if (isMounted) {
          if (productsRes.status === "fulfilled" && productsRes.value?.data) {
            setFeaturedProducts(productsRes.value.data);
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

  return (
    <div className="space-y-16 sm:space-y-24 pb-20">
      {/* 1. Hero Section with Mesh Gradient & Floating Elements */}
      <section className="relative overflow-hidden mesh-gradient-hero pt-12 pb-20 sm:pt-20 sm:pb-28 border-b border-slate-200/80">
        {/* Glow ambient background orbs */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Tag Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-200/80 text-indigo-700 text-xs font-bold uppercase tracking-wider mb-6 shadow-xs animate-in fade-in duration-300">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Discover Handcrafted Essentials & Premium Tech</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight max-w-4xl mx-auto leading-[1.1] font-heading text-slate-900">
            Shop the best products with{" "}
            <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 bg-clip-text text-transparent">
              Zero Prepayment.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-base sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed font-normal">
            Enjoy reliable doorstep <strong className="text-slate-900 font-semibold">Cash on Delivery</strong> on thousands of electronics, fashion, and home accessories. Free delivery on orders over ₹1,000.
          </p>

          {/* Action CTAs */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/products" className="w-full sm:w-auto">
              <Button
                variant="primary"
                size="lg"
                rightIcon={ArrowRight}
                className="w-full sm:w-auto text-base px-8 py-4 bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-600/25 hover:shadow-indigo-600/35 rounded-2xl"
              >
                Explore All Products
              </Button>
            </Link>
            <Link to="/products?sort=newest" className="w-full sm:w-auto">
              <Button
                variant="secondary"
                size="lg"
                leftIcon={Zap}
                className="w-full sm:w-auto text-base px-7 py-4 bg-white hover:bg-slate-50 border-slate-200/80 rounded-2xl shadow-xs"
              >
                New Arrivals
              </Button>
            </Link>
          </div>

          {/* Floating Key Benefits Badges */}
          <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/80 backdrop-blur-md border border-slate-200/80 shadow-xs text-left">
              <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">Free Delivery</p>
                <p className="text-[11px] text-slate-500">Orders above ₹1,000</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/80 backdrop-blur-md border border-slate-200/80 shadow-xs text-left">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">COD Guaranteed</p>
                <p className="text-[11px] text-slate-500">Inspect before paying</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/80 backdrop-blur-md border border-slate-200/80 shadow-xs text-left">
              <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">7-Day Returns</p>
                <p className="text-[11px] text-slate-500">Easy replacement</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/80 backdrop-blur-md border border-slate-200/80 shadow-xs text-left">
              <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <Store className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">100% Genuine</p>
                <p className="text-[11px] text-slate-500">Verified products</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Category Showcase */}
      {categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-8 pb-4 border-b border-slate-200/80">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-indigo-600 mb-1">
                <Layers className="w-3.5 h-3.5" />
                <span>Departments</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 font-heading">
                Explore Popular Categories
              </h2>
            </div>
            <Link
              to="/products"
              className="text-xs sm:text-sm font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 hover:underline"
            >
              Browse All
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {categories.slice(0, 6).map((cat, idx) => {
              const bgGradients = [
                "from-indigo-500/10 to-indigo-500/5 text-indigo-600 group-hover:bg-indigo-600",
                "from-purple-500/10 to-purple-500/5 text-purple-600 group-hover:bg-purple-600",
                "from-emerald-500/10 to-emerald-500/5 text-emerald-600 group-hover:bg-emerald-600",
                "from-amber-500/10 to-amber-500/5 text-amber-600 group-hover:bg-amber-600",
                "from-rose-500/10 to-rose-500/5 text-rose-600 group-hover:bg-rose-600",
                "from-cyan-500/10 to-cyan-500/5 text-cyan-600 group-hover:bg-cyan-600",
              ];
              const gradient = bgGradients[idx % bgGradients.length];

              return (
                <Link
                  key={cat._id}
                  to={`/products?category=${cat.slug || cat._id}`}
                  className="group flex flex-col items-center justify-center p-6 rounded-3xl bg-white border border-slate-200/80 hover:border-indigo-500/50 hover:shadow-lg glow-card transition-all text-center"
                >
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${gradient} flex items-center justify-center mb-3 group-hover:text-white transition-all shadow-xs group-hover:scale-110`}>
                    <Layers className="w-6 h-6" />
                  </div>
                  <span className="text-sm font-bold text-slate-800 group-hover:text-indigo-600 transition-colors font-heading truncate w-full">
                    {cat.name}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-400 mt-0.5">
                    Explore items
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* 3. Featured / New Arrivals Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 pb-4 border-b border-slate-200/80 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-indigo-600 mb-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Trending & Handpicked</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 font-heading">
              Newest Arrivals
            </h2>
          </div>
          <Link
            to="/products?sort=newest"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100/70 px-4 py-2 rounded-xl transition-colors w-fit"
          >
            <span>View Full Catalog</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <ProductGrid products={featuredProducts} isLoading={isLoading} />
      </section>

      {/* 4. High-Impact Call to Action Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white p-8 sm:p-12 md:p-16 overflow-hidden shadow-2xl">
          {/* Glow backdrop */}
          <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-radial from-indigo-400/20 to-transparent pointer-events-none" />

          <div className="relative max-w-xl space-y-4">
            <span className="px-3.5 py-1.5 rounded-full bg-indigo-500/30 border border-indigo-400/30 text-indigo-200 text-xs font-extrabold uppercase tracking-wider inline-block">
              ⚡ Cash on Delivery Guaranteed
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black font-heading leading-tight">
              Experience hassle-free shopping today.
            </h2>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Order now with zero upfront payment. Inspect your items right at your doorstep before handing over cash.
            </p>
            <div className="pt-4 flex flex-wrap items-center gap-3">
              <Link to="/products">
                <Button
                  variant="white"
                  size="lg"
                  rightIcon={ShoppingBag}
                  className="rounded-2xl px-8 py-3.5"
                >
                  Start Shopping Now
                </Button>
              </Link>
              <Link to="/register">
                <Button
                  variant="dark"
                  size="lg"
                  className="border border-indigo-400/30 bg-indigo-950/60 hover:bg-indigo-950/80 text-white rounded-2xl px-6 py-3.5"
                >
                  Create Account
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
