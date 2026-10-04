import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  ShieldCheck,
  UserPlus,
  Trash2,
  CheckCircle,
  XCircle,
  Search,
  RefreshCw,
  Mail,
  User,
  Lock,
  Eye,
  EyeOff,
  AlertTriangle,
  LayoutDashboard,
  LogOut,
  Activity,
  History,
  Clock,
  Boxes,
  ShoppingBag,
  Users,
  Filter,
  Package,
  FolderTree,
  Calendar,
  ExternalLink,
} from "lucide-react";
import masterService from "../../services/master.service";
import useAuth from "../../hooks/useAuth";
import Button from "../../components/common/Button";
import Loader from "../../components/common/Loader";
import toast from "react-hot-toast";
import { formatCurrency } from "../../utils/formatCurrency";

export const MasterAdmins = () => {
  const { user, logout } = useAuth();

  // Navigation tab: 'admins' | 'activities'
  const [activeTab, setActiveTab] = useState("admins");

  // Admins state
  const [admins, setAdmins] = useState([]);
  const [isLoadingAdmins, setIsLoadingAdmins] = useState(true);
  const [adminSearchQuery, setAdminSearchQuery] = useState("");

  // Overview metrics state
  const [overviewStats, setOverviewStats] = useState(null);

  // Global activity logs state
  const [activities, setActivities] = useState([]);
  const [isLoadingActivities, setIsLoadingActivities] = useState(false);
  const [activityFilter, setActivityFilter] = useState({
    action: "",
    entityType: "",
    search: "",
  });

  // Drill-down: View activities & details of a specific admin modal
  const [selectedAdminForActivity, setSelectedAdminForActivity] = useState(null);
  const [singleAdminData, setSingleAdminData] = useState(null);
  const [singleAdminActivities, setSingleAdminActivities] = useState([]);
  const [isLoadingSingleAdminActivities, setIsLoadingSingleAdminActivities] = useState(false);
  const [singleAdminFilter, setSingleAdminFilter] = useState("ALL");
  const [singleAdminSearch, setSingleAdminSearch] = useState("");

  // Modal: Create Admin
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [formErrors, setFormErrors] = useState({});

  // Modal: Delete Admin Confirmation
  const [adminToDelete, setAdminToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // 1. Fetch Admins List
  const fetchAdmins = useCallback(async (query = adminSearchQuery) => {
    try {
      setIsLoadingAdmins(true);
      const res = await masterService.getAdmins(query);
      setAdmins(res.data.admins || []);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load admins");
    } finally {
      setIsLoadingAdmins(false);
    }
  }, [adminSearchQuery]);

  // 2. Fetch Master Overview
  const fetchOverview = useCallback(async () => {
    try {
      const res = await masterService.getOverview();
      setOverviewStats(res.data?.stats || null);
    } catch {
      // ignore
    }
  }, []);

  // 3. Fetch Global Activities
  const fetchActivities = useCallback(async (filters = activityFilter) => {
    try {
      setIsLoadingActivities(true);
      const params = {};
      if (filters.action) params.action = filters.action;
      if (filters.entityType) params.entityType = filters.entityType;
      if (filters.search) params.search = filters.search;
      const res = await masterService.getActivities(params);
      setActivities(res.data?.activities || []);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load activity logs");
    } finally {
      setIsLoadingActivities(false);
    }
  }, [activityFilter]);

  // Initial load
  useEffect(() => {
    fetchAdmins();
    fetchOverview();
  }, [fetchAdmins, fetchOverview]);

  // Load activities when switching to activities tab
  useEffect(() => {
    if (activeTab === "activities") {
      fetchActivities();
    }
  }, [activeTab, fetchActivities]);

  // View specific admin activities drill-down
  const handleOpenAdminActivities = async (admin) => {
    setSelectedAdminForActivity(admin);
    setSingleAdminData(null);
    setSingleAdminActivities([]);
    setSingleAdminFilter("ALL");
    setSingleAdminSearch("");
    try {
      setIsLoadingSingleAdminActivities(true);
      const res = await masterService.getAdminActivities(admin._id);
      setSingleAdminData({
        admin: res.data?.admin || admin,
        stats: res.data?.stats || null,
      });
      setSingleAdminActivities(res.data?.activities || []);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to fetch activities for this admin");
    } finally {
      setIsLoadingSingleAdminActivities(false);
    }
  };

  const handleToggleStatusFromModal = async () => {
    if (!selectedAdminForActivity) return;
    try {
      const nextStatus = !selectedAdminForActivity.isActive;
      await masterService.updateAdmin(selectedAdminForActivity._id, { isActive: nextStatus });
      toast.success(
        `Admin ${selectedAdminForActivity.name} ${nextStatus ? "activated" : "deactivated"}`
      );
      setSelectedAdminForActivity((prev) => ({ ...prev, isActive: nextStatus }));
      setSingleAdminData((prev) =>
        prev
          ? {
              ...prev,
              admin: { ...prev.admin, isActive: nextStatus },
            }
          : prev
      );
      fetchAdmins();
      fetchOverview();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update admin status");
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim() || formData.name.trim().length < 2) {
      errors.name = "Name must be at least 2 characters";
    }
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errors.email = "Valid email is required";
    }
    if (!formData.password || formData.password.length < 8) {
      errors.password = "Password must be at least 8 characters long";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setIsSubmitting(true);
      const res = await masterService.createAdmin({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      });

      toast.success(res.message || "Admin created successfully");
      setIsCreateModalOpen(false);
      setFormData({ name: "", email: "", password: "" });
      setFormErrors({});
      fetchAdmins();
      fetchOverview();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create admin");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (admin) => {
    try {
      const nextStatus = !admin.isActive;
      await masterService.updateAdmin(admin._id, { isActive: nextStatus });
      toast.success(`Admin ${admin.name} ${nextStatus ? "activated" : "deactivated"}`);
      fetchAdmins();
      fetchOverview();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update admin status");
    }
  };

  const handleDeleteAdmin = async () => {
    if (!adminToDelete) return;

    try {
      setIsDeleting(true);
      await masterService.deleteAdmin(adminToDelete._id);
      toast.success(`Admin ${adminToDelete.name} deleted successfully`);
      setAdminToDelete(null);
      fetchAdmins();
      fetchOverview();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete admin");
    } finally {
      setIsDeleting(false);
    }
  };

  const getActionBadgeColor = (action) => {
    if (action.includes("CREATE")) return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
    if (action.includes("UPDATE")) return "bg-indigo-500/20 text-indigo-400 border-indigo-500/30";
    if (action.includes("DELETE") || action.includes("CANCEL")) return "bg-rose-500/20 text-rose-400 border-rose-500/30";
    if (action.includes("LOGIN")) return "bg-amber-500/20 text-amber-400 border-amber-500/30";
    return "bg-slate-500/20 text-slate-300 border-slate-500/30";
  };

  const filteredSingleAdminActivities = (singleAdminActivities || []).filter((act) => {
    if (singleAdminFilter !== "ALL") {
      if (act.entityType !== singleAdminFilter) return false;
    }
    if (singleAdminSearch.trim()) {
      const q = singleAdminSearch.trim().toLowerCase();
      const matchAction = act.action?.toLowerCase().includes(q);
      const matchTitle = act.entityTitle?.toLowerCase().includes(q);
      const matchDetails = JSON.stringify(act.details || {}).toLowerCase().includes(q);
      if (!matchAction && !matchTitle && !matchDetails) return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Master Navigation & Hero Bar */}
        <header className="bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/30 text-white border border-white/20">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Master Console
                </span>
                <span className="text-xs text-slate-400">Governance & Audit Oversight</span>
              </div>
              <h1 className="text-2xl font-extrabold text-white mt-1">
                Platform Master Hub
              </h1>
              <p className="text-xs text-slate-400">
                Logged in as <strong className="text-amber-400">{user?.email}</strong> (Separation of duties: Governance & Audit Trail only)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <Link
              to="/admin/products"
              className="flex-1 md:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
            >
              <Boxes className="w-4 h-4 text-amber-400" />
              View Catalog (Read-Only)
            </Link>
            <Button
              variant="outline"
              size="sm"
              onClick={logout}
              className="border-rose-900/50 text-rose-400 hover:bg-rose-950/50 hover:text-rose-300 text-xs"
            >
              <LogOut className="w-4 h-4 mr-1.5" />
              Sign Out
            </Button>
          </div>
        </header>

        {/* Executive Overview Stats */}
        {overviewStats && (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
            <div className="bg-slate-900/70 border border-indigo-900/40 p-4 rounded-2xl">
              <div className="flex items-center gap-2 text-indigo-400 text-xs font-medium uppercase">
                <ShieldCheck className="w-4 h-4" />
                <span>Admins</span>
              </div>
              <div className="text-2xl font-extrabold text-white mt-1">
                {overviewStats.admins.total}
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {overviewStats.admins.active} Active • {overviewStats.admins.inactive} Suspended
              </p>
            </div>

            <div className="bg-slate-900/70 border border-slate-800 p-4 rounded-2xl">
              <div className="flex items-center gap-2 text-slate-400 text-xs font-medium uppercase">
                <Users className="w-4 h-4" />
                <span>Customers</span>
              </div>
              <div className="text-2xl font-extrabold text-white mt-1">
                {overviewStats.customers}
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">Registered customer base</p>
            </div>

            <div className="bg-slate-900/70 border border-slate-800 p-4 rounded-2xl">
              <div className="flex items-center gap-2 text-slate-400 text-xs font-medium uppercase">
                <Boxes className="w-4 h-4" />
                <span>Products</span>
              </div>
              <div className="text-2xl font-extrabold text-white mt-1">
                {overviewStats.products}
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">Catalog SKU count</p>
            </div>

            <div className="bg-slate-900/70 border border-slate-800 p-4 rounded-2xl">
              <div className="flex items-center gap-2 text-slate-400 text-xs font-medium uppercase">
                <ShoppingBag className="w-4 h-4" />
                <span>Orders</span>
              </div>
              <div className="text-2xl font-extrabold text-white mt-1">
                {overviewStats.orders}
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">Platform total orders</p>
            </div>

            <div className="bg-slate-900/70 border border-emerald-900/40 p-4 rounded-2xl col-span-2 sm:col-span-1">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-medium uppercase">
                <Activity className="w-4 h-4" />
                <span>Paid Revenue</span>
              </div>
              <div className="text-2xl font-extrabold text-emerald-300 mt-1">
                {formatCurrency(overviewStats.revenue)}
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">Fulfilled sales</p>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <button
            onClick={() => setActiveTab("admins")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === "admins"
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                : "bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800"
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            Administrator Management ({admins.length})
          </button>
          <button
            onClick={() => setActiveTab("activities")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === "activities"
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                : "bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800"
            }`}
          >
            <Activity className="w-4 h-4" />
            Audit Trail & Admin Activities
          </button>
        </div>

        {/* TAB 1: ADMINS MANAGEMENT */}
        {activeTab === "admins" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  fetchAdmins(adminSearchQuery);
                }}
                className="relative flex-1 max-w-md"
              >
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search admin by name or email..."
                  value={adminSearchQuery}
                  onChange={(e) => setAdminSearchQuery(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl pl-10 pr-20 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-2.5 py-1 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 rounded-lg"
                >
                  Search
                </button>
              </form>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchAdmins()}
                  disabled={isLoadingAdmins}
                  className="border-slate-800 text-slate-300 hover:bg-slate-800"
                >
                  <RefreshCw className={`w-4 h-4 mr-1.5 ${isLoadingAdmins ? "animate-spin" : ""}`} />
                  Refresh
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setIsCreateModalOpen(true)}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30"
                >
                  <UserPlus className="w-4 h-4 mr-1.5" />
                  Add New Admin
                </Button>
              </div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
              {isLoadingAdmins ? (
                <div className="py-20 flex justify-center">
                  <Loader text="Fetching administrator directory..." />
                </div>
              ) : admins.length === 0 ? (
                <div className="py-20 text-center space-y-3">
                  <ShieldCheck className="w-12 h-12 text-slate-600 mx-auto" />
                  <h3 className="text-lg font-bold text-white">No administrators found</h3>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    {adminSearchQuery
                      ? "No admins match your search query."
                      : "No operational admins exist yet. Use 'Add New Admin' to create staff accounts."}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 bg-slate-900/90 text-xs font-semibold uppercase tracking-wider text-slate-400">
                        <th className="py-4 px-6">Administrator</th>
                        <th className="py-4 px-6">Role</th>
                        <th className="py-4 px-6">Status</th>
                        <th className="py-4 px-6">Created Date</th>
                        <th className="py-4 px-6 text-right">Actions & Audit</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-xs text-slate-300">
                      {admins.map((admin) => (
                        <tr key={admin._id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-indigo-950 border border-indigo-500/30 flex items-center justify-center font-bold text-indigo-300">
                                {admin.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="font-semibold text-white">{admin.name}</div>
                                <div className="text-slate-400 text-[11px]">{admin.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                              <ShieldCheck className="w-3 h-3" />
                              Admin
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            {admin.isActive ? (
                              <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
                                <CheckCircle className="w-3.5 h-3.5" />
                                Active
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-amber-400 font-medium">
                                <XCircle className="w-3.5 h-3.5" />
                                Suspended
                              </span>
                            )}
                          </td>
                          <td className="py-4 px-6 text-slate-400">
                            {new Date(admin.createdAt).toLocaleDateString(undefined, {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </td>
                          <td className="py-4 px-6 text-right space-x-2">
                            <Link
                              to={`/master/admins/${admin._id}/activity`}
                              className="px-3 py-1.5 rounded-lg font-medium bg-slate-800 hover:bg-slate-700 text-indigo-300 hover:text-indigo-200 border border-slate-700 transition-colors inline-flex items-center gap-1.5"
                              title="Open dedicated activity page in new view"
                            >
                              <History className="w-3.5 h-3.5" />
                              <span>View Activity</span>
                              <ExternalLink className="w-3 h-3 text-indigo-400/80" />
                            </Link>
                            <button
                              onClick={() => handleToggleStatus(admin)}
                              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                                admin.isActive
                                  ? "bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 border border-amber-500/30"
                                  : "bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 border border-emerald-500/30"
                              }`}
                            >
                              {admin.isActive ? "Deactivate" : "Activate"}
                            </button>
                            <button
                              onClick={() => setAdminToDelete(admin)}
                              className="px-3 py-1.5 rounded-lg font-medium bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 border border-rose-500/30 transition-colors inline-flex items-center gap-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              Revoke
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: AUDIT TRAIL / ACTIVITIES */}
        {activeTab === "activities" && (
          <div className="space-y-4">
            {/* Filter Bar */}
            <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Filter className="w-3.5 h-3.5" />
                  <span>Filter by:</span>
                </div>
                <select
                  value={activityFilter.entityType}
                  onChange={(e) => {
                    const next = { ...activityFilter, entityType: e.target.value };
                    setActivityFilter(next);
                    fetchActivities(next);
                  }}
                  className="bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-1.5 text-xs focus:outline-none"
                >
                  <option value="">All Entities</option>
                  <option value="Product">Products</option>
                  <option value="Order">Orders</option>
                  <option value="Category">Categories</option>
                  <option value="Auth">Logins</option>
                </select>

                <select
                  value={activityFilter.action}
                  onChange={(e) => {
                    const next = { ...activityFilter, action: e.target.value };
                    setActivityFilter(next);
                    fetchActivities(next);
                  }}
                  className="bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-1.5 text-xs focus:outline-none"
                >
                  <option value="">All Actions</option>
                  <option value="CREATE_PRODUCT">Create Product</option>
                  <option value="UPDATE_PRODUCT">Update Product</option>
                  <option value="DELETE_PRODUCT">Delete Product</option>
                  <option value="UPDATE_ORDER_STATUS">Update Order Status</option>
                  <option value="CANCEL_ORDER">Cancel Order</option>
                  <option value="CREATE_CATEGORY">Create Category</option>
                  <option value="ADMIN_LOGIN">Admin Login</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Search action or entity..."
                  value={activityFilter.search}
                  onChange={(e) => setActivityFilter({ ...activityFilter, search: e.target.value })}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") fetchActivities(activityFilter);
                  }}
                  className="bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-1.5 text-xs placeholder:text-slate-500 focus:outline-none"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchActivities(activityFilter)}
                  className="border-slate-700 text-slate-300"
                >
                  Apply
                </Button>
              </div>
            </div>

            {/* Activities Table */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
              {isLoadingActivities ? (
                <div className="py-20 flex justify-center">
                  <Loader text="Loading audit trail..." />
                </div>
              ) : activities.length === 0 ? (
                <div className="py-20 text-center space-y-3">
                  <History className="w-12 h-12 text-slate-600 mx-auto" />
                  <h3 className="text-lg font-bold text-white">No activity logs found</h3>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Admin actions like modifying products, changing order statuses, and category updates will appear here automatically.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 bg-slate-900/90 text-xs font-semibold uppercase tracking-wider text-slate-400">
                        <th className="py-4 px-6">Timestamp</th>
                        <th className="py-4 px-6">Admin Staff</th>
                        <th className="py-4 px-6">Action</th>
                        <th className="py-4 px-6">Entity</th>
                        <th className="py-4 px-6">Details / Summary</th>
                        <th className="py-4 px-6">IP Address</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-xs text-slate-300">
                      {activities.map((act) => (
                        <tr key={act._id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="py-4 px-6 whitespace-nowrap text-slate-400">
                            <div className="flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-slate-500" />
                              {new Date(act.createdAt).toLocaleString(undefined, {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                                second: "2-digit",
                              })}
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            {act.admin ? (
                              <Link
                                to={`/master/admins/${act.admin}/activity`}
                                className="group/admin inline-block text-left"
                                title="Open this administrator's dedicated activity page"
                              >
                                <div className="font-semibold text-white group-hover/admin:text-indigo-400 transition-colors flex items-center gap-1">
                                  <span>{act.adminName}</span>
                                  <ExternalLink className="w-3 h-3 text-slate-500 group-hover/admin:text-indigo-400 transition-colors" />
                                </div>
                                <div className="text-[11px] text-slate-400">{act.adminEmail}</div>
                              </Link>
                            ) : (
                              <div>
                                <div className="font-semibold text-white">{act.adminName}</div>
                                <div className="text-[11px] text-slate-400">{act.adminEmail}</div>
                              </div>
                            )}
                          </td>
                          <td className="py-4 px-6">
                            <span
                              className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getActionBadgeColor(
                                act.action
                              )}`}
                            >
                              {act.action.replace(/_/g, " ")}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <div className="font-medium text-slate-200">{act.entityTitle || "—"}</div>
                            <div className="text-[10px] text-slate-500">{act.entityType}</div>
                          </td>
                          <td className="py-4 px-6 max-w-xs truncate text-slate-400 font-mono text-[11px]">
                            {JSON.stringify(act.details)}
                          </td>
                          <td className="py-4 px-6 text-slate-500 font-mono text-[11px]">
                            {act.ipAddress || "127.0.0.1"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* DRILL-DOWN MODAL: Specific Admin Details & Activities */}
      {selectedAdminForActivity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
          <div className="max-w-5xl w-full my-auto max-h-[92vh] bg-slate-900 border border-indigo-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl text-white flex flex-col space-y-6 overflow-hidden">
            {/* Modal Header: Admin Profile & Quick Status */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-slate-800">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center font-extrabold text-2xl text-white shadow-lg shadow-indigo-500/20 border border-white/20">
                  {selectedAdminForActivity.name?.charAt(0).toUpperCase() || "A"}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-xl font-extrabold text-white">
                      {selectedAdminForActivity.name}
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      Staff Administrator
                    </span>
                    {selectedAdminForActivity.isActive ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Active Access
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                        Suspended
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 mt-1">
                    <span className="flex items-center gap-1.5 text-slate-300">
                      <Mail className="w-3.5 h-3.5 text-indigo-400" />
                      {selectedAdminForActivity.email}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      Member Since:{" "}
                      {new Date(selectedAdminForActivity.createdAt).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                    <span className="font-mono text-[11px] text-slate-500">
                      ID: {selectedAdminForActivity._id}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <Link
                  to={`/master/admins/${selectedAdminForActivity._id}/activity`}
                  className="px-3 py-1.5 rounded-xl font-medium bg-indigo-600 hover:bg-indigo-500 text-white text-xs transition-colors inline-flex items-center gap-1.5 shadow-sm"
                  title="Open this activity view in a dedicated full page"
                >
                  <span>Open Full Page</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleToggleStatusFromModal}
                  className={`text-xs ${
                    selectedAdminForActivity.isActive
                      ? "border-amber-500/40 text-amber-300 hover:bg-amber-500/10"
                      : "border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/10"
                  }`}
                >
                  {selectedAdminForActivity.isActive ? "Suspend Admin" : "Reactivate Admin"}
                </Button>
                <button
                  onClick={() => setSelectedAdminForActivity(null)}
                  className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors text-sm font-bold border border-slate-700"
                  title="Close modal"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Modal Body: Scrollable area */}
            <div className="flex-1 overflow-y-auto space-y-6 pr-1">
              {/* SECTION 1: Metrics & Operational Breakdown (Products, Categories, Orders, Logins) */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Boxes className="w-4 h-4 text-indigo-400" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                      Operational Management Breakdown
                    </h4>
                  </div>
                  {singleAdminData?.stats?.lastActiveAt && (
                    <span className="flex items-center gap-1 text-[11px] text-slate-400">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      Last Active:{" "}
                      {new Date(singleAdminData.stats.lastActiveAt).toLocaleString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  )}
                </div>

                {isLoadingSingleAdminActivities ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="h-28 rounded-2xl bg-slate-800/40 border border-slate-800 animate-pulse"
                      />
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {/* KPI 1: Products Managed */}
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-900 border border-indigo-500/20 shadow-lg relative overflow-hidden group">
                      <div className="flex items-center justify-between">
                        <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                          <Package className="w-5 h-5" />
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                          Catalog
                        </span>
                      </div>
                      <div className="mt-3">
                        <div className="text-2xl font-black text-white">
                          {singleAdminData?.stats?.products?.created ?? 0}
                        </div>
                        <div className="text-xs text-slate-400 font-medium">Products Created</div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                        <span className="flex items-center gap-1 text-emerald-400 font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          {singleAdminData?.stats?.products?.activeInCatalog ?? 0} In Store
                        </span>
                        <span>{singleAdminData?.stats?.products?.updated ?? 0} Edited</span>
                        <span className="text-rose-400">
                          {singleAdminData?.stats?.products?.deleted ?? 0} Del
                        </span>
                      </div>
                    </div>

                    {/* KPI 2: Categories Managed */}
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-950/40 via-slate-900 to-slate-900 border border-purple-500/20 shadow-lg relative overflow-hidden group">
                      <div className="flex items-center justify-between">
                        <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                          <FolderTree className="w-5 h-5" />
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-purple-500/10 text-purple-300 border border-purple-500/20">
                          Taxonomy
                        </span>
                      </div>
                      <div className="mt-3">
                        <div className="text-2xl font-black text-white">
                          {singleAdminData?.stats?.categories?.created ?? 0}
                        </div>
                        <div className="text-xs text-slate-400 font-medium">Categories Created</div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                        <span className="flex items-center gap-1 text-emerald-400 font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          {singleAdminData?.stats?.categories?.activeInCatalog ?? 0} In Store
                        </span>
                        <span>{singleAdminData?.stats?.categories?.updated ?? 0} Edited</span>
                        <span className="text-rose-400">
                          {singleAdminData?.stats?.categories?.deleted ?? 0} Del
                        </span>
                      </div>
                    </div>

                    {/* KPI 3: Orders Processed */}
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/20 shadow-lg relative overflow-hidden group">
                      <div className="flex items-center justify-between">
                        <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                          <ShoppingBag className="w-5 h-5" />
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                          Fulfillment
                        </span>
                      </div>
                      <div className="mt-3">
                        <div className="text-2xl font-black text-white">
                          {singleAdminData?.stats?.orders?.totalActions ?? 0}
                        </div>
                        <div className="text-xs text-slate-400 font-medium">Order Operations</div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                        <span className="text-indigo-400 font-medium">
                          {singleAdminData?.stats?.orders?.statusUpdated ?? 0} Status Updates
                        </span>
                        <span className="text-rose-400">
                          {singleAdminData?.stats?.orders?.cancelled ?? 0} Cancelled
                        </span>
                      </div>
                    </div>

                    {/* KPI 4: Logins & Audit */}
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-950/40 via-slate-900 to-slate-900 border border-amber-500/20 shadow-lg relative overflow-hidden group">
                      <div className="flex items-center justify-between">
                        <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                          <Activity className="w-5 h-5" />
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-500/10 text-amber-300 border border-amber-500/20">
                          Security
                        </span>
                      </div>
                      <div className="mt-3">
                        <div className="text-2xl font-black text-white">
                          {singleAdminData?.stats?.logins?.total ?? 0}
                        </div>
                        <div className="text-xs text-slate-400 font-medium">Login Sessions</div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                        <span className="text-slate-300">
                          {singleAdminData?.stats?.totalActivities ?? 0} Total Records
                        </span>
                        <span className="text-amber-400 font-medium">Audit Verified</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* SECTION 2: Filterable Admin Activity Trail */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2">
                  <div className="flex items-center gap-2">
                    <History className="w-4 h-4 text-indigo-400" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                      Activity Audit Log ({filteredSingleAdminActivities.length})
                    </h4>
                  </div>

                  {/* Search inside modal */}
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                    <input
                      type="text"
                      placeholder="Filter by title, action..."
                      value={singleAdminSearch}
                      onChange={(e) => setSingleAdminSearch(e.target.value)}
                      className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
                    />
                  </div>
                </div>

                {/* Filter Tabs */}
                <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-800/80 pb-2">
                  {[
                    { id: "ALL", label: "All Events", count: singleAdminActivities.length },
                    {
                      id: "Product",
                      label: "Products",
                      count: singleAdminActivities.filter((a) => a.entityType === "Product").length,
                    },
                    {
                      id: "Category",
                      label: "Categories",
                      count: singleAdminActivities.filter((a) => a.entityType === "Category").length,
                    },
                    {
                      id: "Order",
                      label: "Orders",
                      count: singleAdminActivities.filter((a) => a.entityType === "Order").length,
                    },
                    {
                      id: "Auth",
                      label: "Logins",
                      count: singleAdminActivities.filter((a) => a.entityType === "Auth").length,
                    },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setSingleAdminFilter(tab.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors flex items-center gap-1.5 ${
                        singleAdminFilter === tab.id
                          ? "bg-indigo-600 text-white font-semibold shadow-sm"
                          : "bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-white"
                      }`}
                    >
                      <span>{tab.label}</span>
                      <span
                        className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                          singleAdminFilter === tab.id
                            ? "bg-white/20 text-white"
                            : "bg-slate-700/60 text-slate-400"
                        }`}
                      >
                        {tab.count}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Activity List */}
                <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
                  {isLoadingSingleAdminActivities ? (
                    <div className="py-12 flex justify-center">
                      <Loader text="Fetching activity stream..." />
                    </div>
                  ) : filteredSingleAdminActivities.length === 0 ? (
                    <div className="py-12 text-center space-y-2 bg-slate-800/20 border border-slate-800/60 rounded-2xl">
                      <History className="w-8 h-8 text-slate-600 mx-auto" />
                      <p className="text-xs text-slate-400 font-medium">
                        {singleAdminSearch
                          ? "No activities match your search keyword."
                          : "No activity records found in this category for this administrator."}
                      </p>
                    </div>
                  ) : (
                    filteredSingleAdminActivities.map((act) => (
                      <div
                        key={act._id}
                        className="p-3.5 rounded-2xl bg-slate-800/50 hover:bg-slate-800/80 border border-slate-700/50 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                      >
                        <div className="space-y-1.5 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getActionBadgeColor(
                                act.action
                              )}`}
                            >
                              {act.action.replace(/_/g, " ")}
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-700/50 text-slate-300 border border-slate-700">
                              {act.entityType}
                            </span>
                            <span className="font-bold text-white text-sm">
                              {act.entityTitle || "Untitled Entity"}
                            </span>
                          </div>

                          {/* Render Details Chips */}
                          {act.details && Object.keys(act.details).length > 0 && (
                            <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                              {Object.entries(act.details).map(([key, val]) => (
                                <span
                                  key={key}
                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-900/90 border border-slate-700/60 text-[11px] text-slate-300 font-mono"
                                >
                                  <span className="text-slate-400 capitalize">
                                    {key.replace(/([A-Z])/g, " $1")}:
                                  </span>
                                  <span className="text-indigo-300 font-semibold">
                                    {typeof val === "object" ? JSON.stringify(val) : String(val)}
                                  </span>
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="text-right text-[11px] text-slate-400 whitespace-nowrap self-end sm:self-center">
                          <div className="font-medium text-slate-300">
                            {new Date(act.createdAt).toLocaleDateString(undefined, {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </div>
                          <div>
                            {new Date(act.createdAt).toLocaleTimeString(undefined, {
                              hour: "2-digit",
                              minute: "2-digit",
                              second: "2-digit",
                            })}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs text-slate-400">
              <span>
                Showing {filteredSingleAdminActivities.length} of {singleAdminActivities.length} recorded operations
              </span>
              <div className="flex items-center gap-3">
                <Link
                  to={`/master/admins/${selectedAdminForActivity._id}/activity`}
                  className="inline-flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
                >
                  <span>Open Full Page View</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedAdminForActivity(null)}
                  className="border-slate-700 text-slate-300 hover:text-white"
                >
                  Close Audit View
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Create New Admin */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="max-w-md w-full bg-slate-900 border border-indigo-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl text-white space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600/30 border border-indigo-500/50 flex items-center justify-center text-indigo-300">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">Add Administrator</h3>
                  <p className="text-xs text-slate-400">Exclusive Master Permission</p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateAdmin} className="space-y-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 block mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Admin Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  />
                </div>
                {formErrors.name && (
                  <p className="text-[11px] text-rose-400 mt-1">{formErrors.name}</p>
                )}
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 block mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    placeholder="admin@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  />
                </div>
                {formErrors.email && (
                  <p className="text-[11px] text-rose-400 mt-1">{formErrors.email}</p>
                )}
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 block mb-1">
                  Initial Password (min 8 chars)
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-10 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {formErrors.password && (
                  <p className="text-[11px] text-rose-400 mt-1">{formErrors.password}</p>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="border-slate-700 text-slate-300"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  isLoading={isSubmitting}
                  className="bg-indigo-600 hover:bg-indigo-500"
                >
                  Create Admin User
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Revoke Admin Confirmation */}
      {adminToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="max-w-md w-full bg-slate-900 border border-rose-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl text-white space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/30">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Revoke Administrator</h3>
                <p className="text-xs text-slate-400">Confirm Deletion</p>
              </div>
            </div>

            <p className="text-xs text-slate-300">
              Are you sure you want to permanently delete administrator account{" "}
              <strong className="text-white">{adminToDelete.name}</strong> (
              <span className="text-indigo-400">{adminToDelete.email}</span>)?
              They will permanently lose access to all store management capabilities.
            </p>

            <div className="flex items-center justify-end gap-3 pt-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setAdminToDelete(null)}
                className="border-slate-700 text-slate-300"
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="danger"
                size="sm"
                isLoading={isDeleting}
                onClick={handleDeleteAdmin}
                className="bg-rose-600 hover:bg-rose-500"
              >
                Delete Administrator
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MasterAdmins;
