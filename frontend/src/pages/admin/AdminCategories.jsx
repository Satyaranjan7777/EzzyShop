import React, { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Layers } from "lucide-react";
import { categoryService } from "../../services/category.service";
import { getErrorMessage } from "../../utils/helpers";
import CategoryForm from "../../components/admin/CategoryForm";
import Modal from "../../components/common/Modal";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import Loader from "../../components/common/Loader";
import Button from "../../components/common/Button";
import toast from "react-hot-toast";

export const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form modal state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete modal state
  const [deletingCategory, setDeletingCategory] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchAdminCategories = async () => {
    try {
      setIsLoading(true);
      const res = await categoryService.getCategories({ all: true });
      setCategories(res.data || []);
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to load categories"));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminCategories();
  }, []);

  const handleOpenCreateModal = () => {
    setEditingCategory(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (category) => {
    setEditingCategory(category);
    setIsFormModalOpen(true);
  };

  const handleCloseFormModal = () => {
    setIsFormModalOpen(false);
    setEditingCategory(null);
  };

  const handleFormSubmit = async (formData) => {
    try {
      setIsSubmitting(true);
      if (editingCategory) {
        await categoryService.updateCategory(editingCategory._id, formData);
        toast.success("Category updated successfully!");
      } else {
        await categoryService.createCategory(formData);
        toast.success("Category created successfully!");
      }
      handleCloseFormModal();
      await fetchAdminCategories();
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to save category"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingCategory) return;
    try {
      setIsDeleting(true);
      await categoryService.deleteCategory(deletingCategory._id);
      toast.success("Category deleted successfully");
      setDeletingCategory(null);
      await fetchAdminCategories();
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to delete category"));
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
            Manage Categories
          </h1>
          <p className="text-sm text-slate-500">
            Create, update, and manage the hierarchy of product departments
          </p>
        </div>

        <Button
          variant="primary"
          leftIcon={Plus}
          onClick={handleOpenCreateModal}
        >
          Add New Category
        </Button>
      </div>

      {/* Categories Table */}
      {isLoading && categories.length === 0 ? (
        <Loader text="Loading categories..." />
      ) : categories.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
          <Layers className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800 font-heading">
            No categories created yet
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Create categories like Electronics, Fashion, or Home Decor to categorize products.
          </p>
          <Button
            variant="primary"
            size="sm"
            leftIcon={Plus}
            onClick={handleOpenCreateModal}
          >
            Create First Category
          </Button>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-4 sm:px-6">Category Name</th>
                  <th className="py-3.5 px-4">Slug Identifier</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {categories.map((category) => (
                  <tr
                    key={category._id}
                    className="hover:bg-slate-50/70 transition-colors"
                  >
                    {/* Category Name */}
                    <td className="py-4 px-4 sm:px-6 font-bold text-slate-900">
                      {category.name}
                    </td>

                    {/* Slug */}
                    <td className="py-4 px-4 text-xs font-mono text-slate-500">
                      {category.slug}
                    </td>

                    {/* Status */}
                    <td className="py-4 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                          category.isActive
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-slate-100 text-slate-600 border-slate-200"
                        }`}
                      >
                        {category.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-4 sm:px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(category)}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Edit Category"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingCategory(category)}
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete Category"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={handleCloseFormModal}
        title={editingCategory ? "Edit Category" : "Create New Category"}
        description="Configure category name and active visibility."
        maxWidth="max-w-md"
      >
        <CategoryForm
          key={editingCategory?._id || "new"}
          initialData={editingCategory}
          onSubmit={handleFormSubmit}
          onCancel={handleCloseFormModal}
          isLoading={isSubmitting}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={Boolean(deletingCategory)}
        onClose={() => setDeletingCategory(null)}
        onConfirm={handleDeleteConfirm}
        isLoading={isDeleting}
        title="Delete Category"
        message={`Are you sure you want to delete the category "${deletingCategory?.name}"? You cannot delete categories linked to active products.`}
        confirmLabel="Yes, Delete Category"
      />
    </div>
  );
};

export default AdminCategories;
