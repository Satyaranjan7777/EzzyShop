import React, { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Search, Package } from "lucide-react";
import { productService } from "../../services/product.service";
import { formatCurrency } from "../../utils/formatCurrency";
import { getErrorMessage, getPrimaryImage } from "../../utils/helpers";
import ProductForm from "../../components/admin/ProductForm";
import Modal from "../../components/common/Modal";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import Pagination from "../../components/common/Pagination";
import Loader from "../../components/common/Loader";
import Button from "../../components/common/Button";
import toast from "react-hot-toast";

export const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Form modal state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete modal state
  const [deletingProduct, setDeletingProduct] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchAdminProducts = async (page = 1, search = "") => {
    try {
      setIsLoading(true);
      const params = { page, limit: 10 };
      if (search.trim()) params.search = search.trim();

      const res = await productService.getProducts(params);
      setProducts(res.data || []);
      if (res.pagination) {
        setPagination(res.pagination);
      }
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to load products"));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminProducts(currentPage, searchTerm);
  }, [currentPage]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchAdminProducts(1, searchTerm);
  };

  const handleOpenCreateModal = () => {
    setEditingProduct(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (product) => {
    setEditingProduct(product);
    setIsFormModalOpen(true);
  };

  const handleCloseFormModal = () => {
    setIsFormModalOpen(false);
    setEditingProduct(null);
  };

  const handleFormSubmit = async (formData) => {
    try {
      setIsSubmitting(true);
      if (editingProduct) {
        await productService.updateProduct(editingProduct._id, formData);
        toast.success("Product updated successfully!");
      } else {
        await productService.createProduct(formData);
        toast.success("Product created successfully!");
      }
      handleCloseFormModal();
      await fetchAdminProducts(currentPage, searchTerm);
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to save product"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingProduct) return;
    try {
      setIsDeleting(true);
      await productService.deleteProduct(deletingProduct._id);
      toast.success("Product deleted successfully");
      setDeletingProduct(null);
      await fetchAdminProducts(currentPage, searchTerm);
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to delete product"));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Create Action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 font-heading">
            Manage Products
          </h1>
          <p className="text-sm text-slate-500">
            Create, update, stock manage, and organize store items
          </p>
        </div>

        <Button
          variant="primary"
          leftIcon={Plus}
          onClick={handleOpenCreateModal}
        >
          Add New Product
        </Button>
      </div>

      {/* Search bar */}
      <form onSubmit={handleSearchSubmit} className="flex gap-2 max-w-md">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search products by title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-slate-200 text-slate-900 text-sm rounded-xl pl-10 pr-4 py-2.5 shadow-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
        <Button type="submit" variant="secondary" size="md">
          Search
        </Button>
      </form>

      {/* Products Table */}
      {isLoading && products.length === 0 ? (
        <Loader text="Loading product catalog..." />
      ) : products.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
          <Package className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800 font-heading">
            No products found
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {searchTerm
              ? `No products matched the search query "${searchTerm}".`
              : "Get started by adding your first product to the catalog."}
          </p>
          <Button
            variant="primary"
            size="sm"
            leftIcon={Plus}
            onClick={handleOpenCreateModal}
          >
            Create Product
          </Button>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[750px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-4 sm:px-6">Product</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Price</th>
                  <th className="py-3.5 px-4">Stock</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {products.map((product) => {
                  const imageUrl = getPrimaryImage(product.images);
                  return (
                    <tr
                      key={product._id}
                      className="hover:bg-slate-50/70 transition-colors"
                    >
                      {/* Product details */}
                      <td className="py-3.5 px-4 sm:px-6">
                        <div className="flex items-center gap-3.5">
                          <img
                            src={imageUrl}
                            alt={product.title}
                            className="w-12 h-12 rounded-xl object-cover bg-slate-100 shrink-0 border border-slate-100"
                          />
                          <div className="min-w-0 max-w-xs">
                            <span className="font-bold text-slate-900 line-clamp-1">
                              {product.title}
                            </span>
                            <span className="text-xs text-slate-400 font-mono">
                              #{product._id.slice(-6)}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4 text-xs font-semibold text-slate-600">
                        {product.category?.name || "Uncategorized"}
                      </td>

                      {/* Price */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900">
                            {formatCurrency(
                              product.discountPrice && product.discountPrice > 0
                                ? product.discountPrice
                                : product.price
                            )}
                          </span>
                          {product.discountPrice && product.discountPrice > 0 && (
                            <span className="text-[11px] text-slate-400 line-through">
                              {formatCurrency(product.price)}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Stock */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`text-xs font-bold ${
                            product.stock === 0
                              ? "text-rose-600"
                              : product.stock <= 5
                              ? "text-amber-600"
                              : "text-slate-700"
                          }`}
                        >
                          {product.stock} units
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                            product.isActive
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-slate-100 text-slate-600 border-slate-200"
                          }`}
                        >
                          {product.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 sm:px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(product)}
                            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="Edit Product"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeletingProduct(product)}
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Delete Product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {pagination.totalPages > 1 && (
            <div className="p-4 border-t border-slate-100">
              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                onPageChange={(p) => setCurrentPage(p)}
              />
            </div>
          )}
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={handleCloseFormModal}
        title={editingProduct ? "Edit Product" : "Create New Product"}
        description="Fill in product specifications and direct image URLs."
        maxWidth="max-w-2xl"
      >
        <ProductForm
          key={editingProduct?._id || "new"}
          initialData={editingProduct}
          onSubmit={handleFormSubmit}
          onCancel={handleCloseFormModal}
          isLoading={isSubmitting}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={Boolean(deletingProduct)}
        onClose={() => setDeletingProduct(null)}
        onConfirm={handleDeleteConfirm}
        isLoading={isDeleting}
        title="Delete Product"
        message={`Are you sure you want to delete "${deletingProduct?.title}"? This action cannot be undone.`}
        confirmLabel="Yes, Delete Product"
      />
    </div>
  );
};

export default AdminProducts;
