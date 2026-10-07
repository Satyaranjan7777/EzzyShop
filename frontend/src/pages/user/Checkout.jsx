import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  MapPin,
  ShieldCheck,
  Plus,
  ArrowLeft,
  CheckCircle,
  Banknote,
} from "lucide-react";
import { addressService } from "../../services/address.service";
import { orderService } from "../../services/order.service";
import { useCartStore } from "../../store/cart.store";
import { formatCurrency } from "../../utils/formatCurrency";
import { getErrorMessage, getPrimaryImage } from "../../utils/helpers";
import AddressCard from "../../components/address/AddressCard";
import AddressForm from "../../components/address/AddressForm";
import Modal from "../../components/common/Modal";
import Loader from "../../components/common/Loader";
import Button from "../../components/common/Button";
import toast from "react-hot-toast";

export const Checkout = () => {
  const navigate = useNavigate();
  const { items, summary, fetchCart } = useCartStore();

  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(true);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  // Address creation modal state
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isSavingAddress, setIsSavingAddress] = useState(false);

  // Load addresses on mount
  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      try {
        setIsLoadingAddresses(true);
        const [addrRes] = await Promise.all([
          addressService.getAddresses(),
          fetchCart(),
        ]);

        if (isMounted && addrRes.data) {
          setAddresses(addrRes.data);
          const defaultAddr = addrRes.data.find((a) => a.isDefault);
          if (defaultAddr) {
            setSelectedAddressId(defaultAddr._id);
          } else if (addrRes.data.length > 0) {
            setSelectedAddressId(addrRes.data[0]._id);
          }
        }
      } catch (err) {
        toast.error(getErrorMessage(err, "Failed to load checkout data"));
      } finally {
        if (isMounted) setIsLoadingAddresses(false);
      }
    };

    loadData();
    return () => {
      isMounted = false;
    };
  }, [fetchCart]);

  // If cart is empty, prompt user back to cart
  if (!items || items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-2xl font-black text-slate-900 font-heading">
          Your Cart is Empty
        </h2>
        <p className="text-sm text-slate-500">
          Add items to your cart before proceeding to checkout.
        </p>
        <Link to="/products">
          <Button variant="primary">Browse Products</Button>
        </Link>
      </div>
    );
  }

  const handleCreateAddressSubmit = async (formData) => {
    try {
      setIsSavingAddress(true);
      const res = await addressService.createAddress(formData);
      const newAddress = res.data;
      toast.success("New address added!");
      setIsAddressModalOpen(false);

      // Refresh address list and select new address
      const updatedList = await addressService.getAddresses();
      if (updatedList.data) {
        setAddresses(updatedList.data);
        if (newAddress?._id) {
          setSelectedAddressId(newAddress._id);
        }
      }
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to save address"));
    } finally {
      setIsSavingAddress(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      toast.error("Please select or add a delivery address.");
      return;
    }

    try {
      setIsPlacingOrder(true);
      const orderPayload = {
        addressId: selectedAddressId,
        paymentMethod: "COD",
      };

      const response = await orderService.createOrder(orderPayload);
      const createdOrder = response.data;

      // Sync updated cart state (cleared by backend)
      await fetchCart();

      toast.success(response.message || "Order placed successfully!");
      navigate(`/orders/${createdOrder._id}`, { replace: true });
    } catch (error) {
      const msg = getErrorMessage(error, "Failed to place order. Please try again.");
      toast.error(msg);
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const subtotal = summary.subtotal || 0;
  const shippingFee = subtotal >= 1000 ? 0 : 50;
  const total = subtotal + shippingFee;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8 space-y-6">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
        <Link to="/" className="hover:text-[#ed1d24] flex items-center gap-1">
          <span>Home</span>
        </Link>
        <span>/</span>
        <Link to="/cart" className="hover:text-[#ed1d24]">
          <span>Cart</span>
        </Link>
        <span>/</span>
        <span className="text-slate-800 font-bold">Checkout</span>
      </nav>

      {/* Header */}
      <div className="pb-3 border-b border-slate-200">
        <h1 className="text-xl sm:text-3xl font-black text-slate-900 font-heading">
          Secure Express Checkout
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Confirm your delivery address and Cash on Delivery order placement
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
        {/* Left 2 Cols: Shipping Address & Payment Selection */}
        <div className="lg:col-span-2 space-y-6">
          {/* Step 1: Shipping Address */}
          <div className="bg-white rounded-xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-[#ed1d24] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  1
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 font-heading">
                    Delivery Address
                  </h3>
                  <p className="text-[11px] text-slate-400">Select where we should deliver</p>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                leftIcon={Plus}
                onClick={() => setIsAddressModalOpen(true)}
                className="rounded-lg font-bold text-xs"
              >
                Add Address
              </Button>
            </div>

            {isLoadingAddresses ? (
              <Loader text="Loading your addresses..." />
            ) : addresses.length === 0 ? (
              <div className="text-center py-6 border-2 border-dashed border-slate-200 rounded-xl p-5 space-y-3">
                <div className="w-10 h-10 rounded-full bg-red-50 text-[#ed1d24] flex items-center justify-center mx-auto">
                  <MapPin className="w-5 h-5" />
                </div>
                <p className="text-xs font-semibold text-slate-700">
                  No address found. Please add a shipping address to proceed.
                </p>
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={Plus}
                  onClick={() => setIsAddressModalOpen(true)}
                >
                  Add New Delivery Address
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {addresses.map((address) => (
                  <AddressCard
                    key={address._id}
                    address={address}
                    isSelectable={true}
                    isSelected={selectedAddressId === address._id}
                    onSelect={(addr) => setSelectedAddressId(addr._id)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Step 2: Payment Method (COD Only) */}
          <div className="bg-white rounded-xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <div className="w-7 h-7 rounded-lg bg-[#ed1d24] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                2
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 font-heading">
                  Payment Method
                </h3>
                <p className="text-[11px] text-slate-400">Zero prepayment required</p>
              </div>
            </div>

            <div className="p-4 rounded-xl border-2 border-[#ed1d24] bg-red-50/20 flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-lg bg-[#ed1d24] text-white flex items-center justify-center shrink-0 shadow-xs">
                <Banknote className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h4 className="font-extrabold text-slate-900 text-sm font-heading">
                    Cash on Delivery (COD)
                  </h4>
                  <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
                    Verified
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Pay with cash when your parcel is delivered to your doorstep. You can inspect the package upon courier arrival.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Order Snapshot & Confirmation */}
        <div className="lg:col-span-1 space-y-4 sticky top-28">
          <div className="bg-white rounded-xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-5">
            <h3 className="text-base font-black text-slate-900 font-heading pb-3 border-b border-slate-100 flex items-center justify-between">
              <span>Order Summary</span>
              <span className="text-xs font-bold text-slate-400">
                {summary.totalItems} {summary.totalItems === 1 ? "item" : "items"}
              </span>
            </h3>

            {/* Compact items list */}
            <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1 divide-y divide-slate-100">
              {items.map((item) => (
                <div
                  key={item.product?._id || item._id}
                  className="flex items-center gap-3 pt-2.5 first:pt-0"
                >
                  <img
                    src={getPrimaryImage(item.product?.images)}
                    alt={item.product?.title}
                    className="w-11 h-11 rounded-lg object-contain bg-[#fbfbfb] shrink-0 border border-slate-200 p-0.5"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate">
                      {item.product?.title}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Qty: {item.quantity} × {formatCurrency(item.product?.effectivePrice || item.product?.price)}
                    </p>
                  </div>
                  <span className="text-xs font-black text-slate-900">
                    {formatCurrency(item.itemTotal || (item.product?.price * item.quantity))}
                  </span>
                </div>
              ))}
            </div>

            {/* Pricing Breakdown */}
            <div className="space-y-3 pt-4 border-t border-slate-100 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Items Subtotal</span>
                <span className="font-bold text-slate-900">
                  {formatCurrency(subtotal)}
                </span>
              </div>

              <div className="flex justify-between text-slate-600">
                <span>Delivery Fee</span>
                <span className="font-bold">
                  {shippingFee === 0 ? (
                    <span className="text-emerald-600 uppercase text-xs font-black bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      FREE
                    </span>
                  ) : (
                    formatCurrency(shippingFee)
                  )}
                </span>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-between items-baseline">
                <span className="text-base font-black text-slate-900 font-heading">
                  Total Payable
                </span>
                <span className="text-2xl font-black text-[#ed1d24] font-heading">
                  {formatCurrency(total)}
                </span>
              </div>
            </div>

            {/* Place Order CTA */}
            <Button
              type="button"
              variant="primary"
              size="lg"
              onClick={handlePlaceOrder}
              disabled={!selectedAddressId || items.length === 0}
              isLoading={isPlacingOrder}
              rightIcon={CheckCircle}
              className="w-full shadow-lg shadow-[#ed1d24]/25 py-3.5 font-bold rounded-xl text-sm"
            >
              Confirm & Place Order (COD)
            </Button>

            <div className="flex items-center justify-center gap-2 text-xs text-slate-400 font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>100% Doorstep Purchase Protection</span>
            </div>
          </div>
        </div>
      </div>

      {/* Add Address In-place Modal */}
      <Modal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        title="Add New Delivery Address"
        description="Provide your accurate delivery address."
        maxWidth="max-w-xl"
      >
        <AddressForm
          onSubmit={handleCreateAddressSubmit}
          onCancel={() => setIsAddressModalOpen(false)}
          isLoading={isSavingAddress}
        />
      </Modal>
    </div>
  );
};

export default Checkout;
