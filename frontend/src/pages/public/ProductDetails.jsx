import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import {
  ShoppingBag,
  Truck,
  ShieldCheck,
  ChevronRight,
  Minus,
  Plus,
  AlertCircle,
  Check,
  Banknote,
  Star,
  RotateCcw,
  Clock,
  Heart,
  Home,
} from "lucide-react";
import { productService } from "../../services/product.service";
import { formatCurrency } from "../../utils/formatCurrency";
import {
  calculateDiscountPercent,
  getErrorMessage,
  getPrimaryImage,
} from "../../utils/helpers";
import { useCartStore } from "../../store/cart.store";
import useAuth from "../../hooks/useAuth";
import Button from "../../components/common/Button";
import ProductCard from "../../components/product/ProductCard";
import ErrorState from "../../components/common/ErrorState";
import toast from "react-hot-toast";

export const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const addToCart = useCartStore((state) => state.addToCart);

  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchProduct = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const res = await productService.getProductById(id);
        if (isMounted && res.data) {
          setProduct(res.data);
          const images = res.data.images;
          setSelectedImage(getPrimaryImage(images));

          // Fetch related products in the same category
          const catId = res.data.category?._id || res.data.category;
          if (catId) {
            try {
              const relRes = await productService.getProducts({
                category: catId,
                limit: 4,
              });
              if (relRes.data) {
                setRelatedProducts(relRes.data.filter((p) => p._id !== res.data._id));
              }
            } catch {}
          }
        }
      } catch (err) {
        if (isMounted) {
          setError(getErrorMessage(err, "Product not found or unavailable"));
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchProduct();
    return () => {
      isMounted = false;
    };
  }, [id]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 animate-pulse">
        <div className="h-4 w-48 bg-slate-200 rounded" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          <div className="aspect-square w-full rounded-2xl bg-slate-200" />
          <div className="space-y-4">
            <div className="h-8 w-3/4 bg-slate-200 rounded" />
            <div className="h-6 w-1/3 bg-slate-200 rounded" />
            <div className="h-20 w-full bg-slate-200 rounded-xl" />
            <div className="h-12 w-full bg-slate-200 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <ErrorState
          title="Product Unavailable"
          message={error || "The requested product was not found."}
          onRetry={() => window.location.reload()}
        />
        <div className="mt-6">
          <Link to="/products">
            <Button variant="outline">Back to Catalog</Button>
          </Link>
        </div>
      </div>
    );
  }

  const {
    title,
    description,
    price,
    discountPrice,
    category,
    images = [],
    stock,
  } = product;

  const isOutOfStock = stock <= 0;
  const discountPercent = calculateDiscountPercent(price, discountPrice);
  const displayPrice = discountPrice && discountPrice > 0 ? discountPrice : price;
  const originalPrice = discountPrice && discountPrice > 0 ? price : null;

  const handleQuantityIncrement = () => {
    if (quantity < stock) {
      setQuantity((prev) => prev + 1);
    }
  };

  const handleQuantityDecrement = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: location } });
      return;
    }

    if (isOutOfStock) return;

    try {
      setIsAdding(true);
      await addToCart(product._id, quantity);
      setIsAdded(true);
      setTimeout(() => setIsAdded(false), 2000);
    } catch {
      // Handled in store toast
    } finally {
      setIsAdding(false);
    }
  };

  const handleBuyNow = async () => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: location } });
      return;
    }

    if (isOutOfStock) return;

    try {
      setIsAdding(true);
      await addToCart(product._id, quantity);
      navigate("/checkout");
    } catch {
      // Handled in store toast
    } finally {
      setIsAdding(false);
    }
  };

  const handleToggleWishlist = () => {
    setIsWishlisted(!isWishlisted);
    toast.success(isWishlisted ? "Removed from wishlist" : "Added to wishlist!");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8 space-y-10">
      {/* Breadcrumb Navigation (Reference Style) */}
      <nav className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
        <Link to="/" className="hover:text-[#ed1d24] flex items-center gap-1">
          <Home className="w-3.5 h-3.5" />
          <span>Home</span>
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <Link to="/products" className="hover:text-[#ed1d24]">
          Products
        </Link>
        {category && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <Link
              to={`/products?category=${category.slug || category._id}`}
              className="hover:text-[#ed1d24]"
            >
              {category.name}
            </Link>
          </>
        )}
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-slate-800 font-bold truncate max-w-xs">{title}</span>
      </nav>

      {/* Main Dual-Column Product Layout (Reference Style) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start bg-white p-6 sm:p-8 rounded-2xl border border-slate-200">
        {/* Left: Product Images Gallery */}
        <div className="space-y-4">
          <div className="relative aspect-square w-full rounded-xl bg-[#fbfbfb] border border-slate-200 overflow-hidden flex items-center justify-center p-6 group">
            <img
              src={selectedImage}
              alt={title}
              className="w-full h-full object-contain mix-blend-multiply transition-transform duration-300 group-hover:scale-105"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src =
                  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80";
              }}
            />

            {discountPercent > 0 && (
              <span className="absolute top-4 left-4 px-2.5 py-1 text-xs font-black uppercase tracking-wider bg-[#ed1d24] text-white rounded">
                {discountPercent}% OFF
              </span>
            )}

            <button
              type="button"
              onClick={handleToggleWishlist}
              className={`absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center shadow-xs transition-colors cursor-pointer ${
                isWishlisted
                  ? "bg-[#ed1d24] text-white"
                  : "bg-white text-slate-500 hover:text-[#ed1d24] border border-slate-200"
              }`}
              title="Add to Wishlist"
              aria-label="Wishlist"
            >
              <Heart className={`w-4 h-4 ${isWishlisted ? "fill-current" : ""}`} />
            </button>
          </div>

          {/* Image Thumbnails if more than 1 image */}
          {images.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-1">
              {images.map((imgUrl, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedImage(imgUrl)}
                  className={`relative w-18 h-18 rounded-lg bg-[#fbfbfb] border-2 overflow-hidden shrink-0 transition-all p-1 cursor-pointer ${
                    selectedImage === imgUrl
                      ? "border-[#ed1d24] ring-2 ring-red-500/20"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <img
                    src={imgUrl}
                    alt={`${title} thumbnail ${idx + 1}`}
                    className="w-full h-full object-contain mix-blend-multiply"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Details & Actions */}
        <div className="space-y-5">
          <div>
            {category && (
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#ed1d24] bg-red-50 px-2.5 py-1 rounded inline-block mb-2">
                {category.name}
              </span>
            )}
            <h1 className="text-xl sm:text-3xl font-black text-slate-900 font-heading leading-tight">
              {title}
            </h1>

            {/* Star Rating Presentation */}
            <div className="flex items-center gap-3 mt-2 text-xs">
              <div className="flex items-center text-amber-400">
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
              </div>
              <span className="font-bold text-slate-700">4.8</span>
              <span className="text-slate-400">|</span>
              <span className="text-slate-500">24 Customer Ratings</span>
            </div>
          </div>

          {/* Pricing Box (Reference Style) */}
          <div className="p-4 rounded-xl bg-[#f8f9fa] border border-slate-200 flex items-baseline gap-3">
            <span className="text-2xl sm:text-3xl font-extrabold text-[#ed1d24]">
              {formatCurrency(displayPrice)}
            </span>
            {originalPrice && (
              <span className="text-sm sm:text-base text-slate-400 line-through font-medium">
                {formatCurrency(originalPrice)}
              </span>
            )}
            {discountPercent > 0 && (
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Save {formatCurrency(originalPrice - displayPrice)}
              </span>
            )}
          </div>

          {/* Stock Status Indicator */}
          <div>
            {isOutOfStock ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-700 bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-200">
                <AlertCircle className="w-4 h-4" />
                Currently Sold Out
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                In Stock ({stock} units ready for immediate dispatch)
              </span>
            )}
          </div>

          {/* Quantity Selector & CTAs */}
          {!isOutOfStock && (
            <div className="space-y-4 pt-3 border-t border-slate-100">
              <div className="flex items-center gap-4">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Quantity:
                </span>
                <div className="flex items-center border border-slate-300 rounded-lg bg-white p-0.5">
                  <button
                    type="button"
                    onClick={handleQuantityDecrement}
                    disabled={quantity <= 1}
                    className="w-8 h-8 flex items-center justify-center rounded bg-slate-50 text-slate-600 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-10 text-center text-sm font-bold text-slate-800">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={handleQuantityIncrement}
                    disabled={quantity >= stock}
                    className="w-8 h-8 flex items-center justify-center rounded bg-slate-50 text-slate-600 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={isAdding}
                  className={`py-3.5 px-4 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    isAdded
                      ? "bg-emerald-600 text-white"
                      : "bg-[#ed1d24] hover:bg-[#d32f2f] text-white shadow-md shadow-red-500/20"
                  }`}
                >
                  {isAdded ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Added to Cart!</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" />
                      <span>{isAdding ? "Adding..." : "Add to Cart"}</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleBuyNow}
                  className="py-3.5 px-4 rounded-lg font-bold text-sm bg-slate-900 hover:bg-slate-800 text-white flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Banknote className="w-4 h-4" />
                  <span>Buy Now (COD)</span>
                </button>
              </div>
            </div>
          )}

          {/* Delivery & Trust Box */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-slate-100 text-xs">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200">
              <div className="w-8 h-8 rounded-full bg-red-50 text-[#ed1d24] flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-slate-900">Cash on Delivery</p>
                <p className="text-slate-500">Inspect parcel at doorstep</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200">
              <div className="w-8 h-8 rounded-full bg-red-50 text-[#ed1d24] flex items-center justify-center shrink-0">
                <Truck className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-slate-900">Free Express Delivery</p>
                <p className="text-slate-500">Orders above ₹1,000</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Product Overview Tabs (Reference Style) */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="flex items-center border-b border-slate-200 bg-slate-50/50">
          <button
            type="button"
            onClick={() => setActiveTab("description")}
            className={`px-6 py-3.5 text-xs font-bold uppercase tracking-wider cursor-pointer border-b-2 transition-colors ${
              activeTab === "description"
                ? "border-[#ed1d24] text-[#ed1d24] bg-white"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            Product Overview
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("shipping")}
            className={`px-6 py-3.5 text-xs font-bold uppercase tracking-wider cursor-pointer border-b-2 transition-colors ${
              activeTab === "shipping"
                ? "border-[#ed1d24] text-[#ed1d24] bg-white"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            Shipping & COD Terms
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("reviews")}
            className={`px-6 py-3.5 text-xs font-bold uppercase tracking-wider cursor-pointer border-b-2 transition-colors ${
              activeTab === "reviews"
                ? "border-[#ed1d24] text-[#ed1d24] bg-white"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            Customer Reviews
          </button>
        </div>

        <div className="p-6 sm:p-8 text-sm leading-relaxed text-slate-700">
          {activeTab === "description" && (
            <div className="space-y-4">
              <h3 className="font-bold text-slate-900 text-base">Product Description</h3>
              <p className="whitespace-pre-line text-slate-600">{description}</p>
            </div>
          )}

          {activeTab === "shipping" && (
            <div className="space-y-3">
              <h3 className="font-bold text-slate-900 text-base">Doorstep Delivery Policy</h3>
              <p className="text-slate-600">
                All items are dispatched promptly with certified couriers. When choosing Cash on Delivery, you may inspect the sealed package before completing the payment to the delivery agent.
              </p>
              <ul className="list-disc pl-5 space-y-1 text-slate-600 pt-2">
                <li>Free shipping on orders ₹1,000 or greater.</li>
                <li>Estimated delivery within 2 to 5 business days across India.</li>
                <li>Hassle-free 7-day replacement guarantee if the product is damaged or defective.</li>
              </ul>
            </div>
          )}

          {activeTab === "reviews" && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
                <div className="text-center">
                  <span className="text-3xl font-black text-slate-900">4.8</span>
                  <div className="flex items-center text-amber-400 mt-1">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <Star className="w-3.5 h-3.5 fill-current" />
                  </div>
                </div>
                <div className="text-xs text-slate-500">
                  Based on 24 verified reviews from authenticated shoppers.
                </div>
              </div>
              <p className="text-xs text-slate-500 italic">
                All reviews are verified after successful order fulfillment.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Related Products Showcase */}
      {relatedProducts.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <h2 className="text-lg sm:text-xl font-black text-slate-900 font-heading">
              Related Products
            </h2>
            <Link
              to="/products"
              className="text-xs font-bold text-[#ed1d24] hover:underline"
            >
              Browse Category
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {relatedProducts.map((relProduct) => (
              <ProductCard key={relProduct._id} product={relProduct} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default ProductDetails;
