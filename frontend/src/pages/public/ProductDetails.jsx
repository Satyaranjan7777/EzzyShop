import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import {
  ShoppingBag,
  Truck,
  ShieldCheck,
  ArrowLeft,
  Minus,
  Plus,
  AlertCircle,
  Check,
  Banknote,
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
import Loader from "../../components/common/Loader";
import ErrorState from "../../components/common/ErrorState";

export const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const addToCart = useCartStore((state) => state.addToCart);

  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState("");
  const [quantity, setQuantity] = useState(1);
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
    return <Loader fullScreen text="Loading product details..." />;
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
            <Button variant="outline" leftIcon={ArrowLeft}>
              Back to Catalog
            </Button>
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Breadcrumb & Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/products"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to all products
        </Link>

        {category && (
          <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-3.5 py-1.5 rounded-full border border-indigo-100">
            {category.name}
          </span>
        )}
      </div>

      {/* Main Product Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-start">
        {/* Left: Product Images Gallery */}
        <div className="space-y-4 lg:sticky lg:top-24">
          <div className="relative aspect-square w-full rounded-3xl bg-white border border-slate-200/80 shadow-md overflow-hidden flex items-center justify-center p-6 group">
            <img
              src={selectedImage}
              alt={title}
              className="w-full h-full object-contain max-h-[500px] transition-all duration-300 group-hover:scale-105"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src =
                  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80";
              }}
            />

            {discountPercent > 0 && (
              <span className="absolute top-5 left-5 px-3.5 py-1.5 text-xs font-black uppercase tracking-wider bg-rose-500 text-white rounded-xl shadow-lg">
                Save {discountPercent}% OFF
              </span>
            )}
          </div>

          {/* Image Thumbnails if more than 1 image */}
          {images.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {images.map((imgUrl, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedImage(imgUrl)}
                  className={`relative w-20 h-20 rounded-2xl bg-white border-2 overflow-hidden shrink-0 transition-all ${
                    selectedImage === imgUrl
                      ? "border-indigo-600 ring-4 ring-indigo-500/15 shadow-sm scale-95"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <img
                    src={imgUrl}
                    alt={`${title} thumbnail ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Details & Actions */}
        <div className="space-y-6">
          <div className="space-y-3">
            <h1 className="text-2xl sm:text-4xl font-black text-slate-900 font-heading leading-tight">
              {title}
            </h1>

            {/* Stock Availability indicator */}
            <div className="flex items-center gap-3">
              {isOutOfStock ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-700 bg-rose-50 px-3 py-1.5 rounded-xl border border-rose-200">
                  <AlertCircle className="w-4 h-4" />
                  Currently Sold Out
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  In Stock ({stock} available for dispatch)
                </span>
              )}
            </div>
          </div>

          {/* Pricing Box */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-50 to-indigo-50/30 border border-slate-200/80 space-y-1">
            <div className="flex items-baseline gap-4">
              <span className="text-3xl sm:text-4xl font-black text-slate-900 font-heading">
                {formatCurrency(displayPrice)}
              </span>
              {originalPrice && (
                <span className="text-lg text-slate-400 line-through font-semibold">
                  {formatCurrency(originalPrice)}
                </span>
              )}
            </div>
            {discountPercent > 0 && (
              <p className="text-xs font-bold text-emerald-600">
                You save {formatCurrency(originalPrice - displayPrice)} ({discountPercent}% discount)
              </p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
              Product Overview
            </h3>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed whitespace-pre-line">
              {description}
            </p>
          </div>

          {/* Quantity & CTA Buttons */}
          {!isOutOfStock && (
            <div className="space-y-4 pt-4 border-t border-slate-200/80">
              <div className="flex items-center gap-4">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Select Quantity:
                </span>
                <div className="flex items-center border border-slate-200 rounded-2xl bg-white p-1 shadow-xs">
                  <button
                    type="button"
                    onClick={handleQuantityDecrement}
                    disabled={quantity <= 1}
                    className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-50 text-slate-600 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-40 transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center text-sm font-black text-slate-800">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={handleQuantityIncrement}
                    disabled={quantity >= stock}
                    className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-50 text-slate-600 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-40 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <Button
                  type="button"
                  variant={isAdded ? "success" : "primary"}
                  size="lg"
                  onClick={handleAddToCart}
                  isLoading={isAdding}
                  leftIcon={isAdded ? Check : ShoppingBag}
                  className="w-full shadow-lg shadow-indigo-600/20 py-4 font-bold rounded-2xl text-sm"
                >
                  {isAdded ? "Added to Cart!" : `Add to Cart (${formatCurrency(displayPrice * quantity)})`}
                </Button>

                <Button
                  type="button"
                  variant="dark"
                  size="lg"
                  onClick={handleBuyNow}
                  leftIcon={Banknote}
                  className="w-full py-4 font-bold rounded-2xl text-sm bg-slate-900 hover:bg-slate-800"
                >
                  Buy Now (COD)
                </Button>
              </div>
            </div>
          )}

          {/* Delivery & Trust Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-6 border-t border-slate-200/80 text-xs">
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-slate-900">Cash on Delivery</p>
                <p className="text-slate-500">Pay safely upon receipt</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
              <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-slate-900">Fast Courier Dispatch</p>
                <p className="text-slate-500">Free delivery over ₹1,000</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
