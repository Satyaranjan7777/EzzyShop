import React, { useState, useEffect } from "react";
import { Plus, MapPin } from "lucide-react";
import { addressService } from "../../services/address.service";
import { getErrorMessage } from "../../utils/helpers";
import AddressCard from "../../components/address/AddressCard";
import AddressForm from "../../components/address/AddressForm";
import Modal from "../../components/common/Modal";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import EmptyState from "../../components/common/EmptyState";
import Loader from "../../components/common/Loader";
import Button from "../../components/common/Button";
import toast from "react-hot-toast";

export const Addresses = () => {
  const [addresses, setAddresses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete confirm state
  const [deletingAddress, setDeletingAddress] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchAddresses = async () => {
    try {
      setIsLoading(true);
      const res = await addressService.getAddresses();
      setAddresses(res.data || []);
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to load addresses"));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleOpenCreateModal = () => {
    setEditingAddress(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (address) => {
    setEditingAddress(address);
    setIsFormModalOpen(true);
  };

  const handleCloseFormModal = () => {
    setIsFormModalOpen(false);
    setEditingAddress(null);
  };

  const handleFormSubmit = async (formData) => {
    try {
      setIsSubmitting(true);
      if (editingAddress) {
        await addressService.updateAddress(editingAddress._id, formData);
        toast.success("Address updated successfully!");
      } else {
        await addressService.createAddress(formData);
        toast.success("Address created successfully!");
      }
      handleCloseFormModal();
      await fetchAddresses();
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to save address"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSetDefault = async (addressId) => {
    try {
      await addressService.updateAddress(addressId, { isDefault: true });
      toast.success("Default address updated!");
      await fetchAddresses();
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to set default address"));
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingAddress) return;
    try {
      setIsDeleting(true);
      await addressService.deleteAddress(deletingAddress._id);
      toast.success("Address deleted successfully");
      setDeletingAddress(null);
      await fetchAddresses();
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to delete address"));
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading && addresses.length === 0) {
    return <Loader fullScreen text="Loading saved addresses..." />;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-slate-200 gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading">
            Saved Addresses
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage your delivery destinations for quick and effortless checkout
          </p>
        </div>

        <Button
          variant="primary"
          leftIcon={Plus}
          onClick={handleOpenCreateModal}
        >
          Add New Address
        </Button>
      </div>

      {/* Addresses Grid or Empty State */}
      {addresses.length === 0 ? (
        <EmptyState
          icon={MapPin}
          title="No Addresses Saved Yet"
          description="Add your first delivery address so you can place orders smoothly."
          actionLabel="Add New Address"
          actionIcon={Plus}
          onAction={handleOpenCreateModal}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {addresses.map((address) => (
            <AddressCard
              key={address._id}
              address={address}
              onEdit={handleOpenEditModal}
              onDelete={setDeletingAddress}
              onSetDefault={handleSetDefault}
            />
          ))}
        </div>
      )}

      {/* Create / Edit Address Modal */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={handleCloseFormModal}
        title={editingAddress ? "Edit Delivery Address" : "Add Delivery Address"}
        description="Provide your shipping details accurately for timely courier delivery."
        maxWidth="max-w-xl"
      >
        <AddressForm
          key={editingAddress?._id || "new"}
          initialData={editingAddress}
          onSubmit={handleFormSubmit}
          onCancel={handleCloseFormModal}
          isLoading={isSubmitting}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={Boolean(deletingAddress)}
        onClose={() => setDeletingAddress(null)}
        onConfirm={handleDeleteConfirm}
        isLoading={isDeleting}
        title="Delete Address"
        message="Are you sure you want to remove this delivery address from your profile?"
        confirmLabel="Yes, Delete"
      />
    </div>
  );
};

export default Addresses;
