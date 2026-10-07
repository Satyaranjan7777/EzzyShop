import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  ArrowLeft,
  RefreshCw,
  Mail,
  Calendar,
  CheckCircle,
  XCircle,
  Package,
  FolderTree,
  ShoppingBag,
  Activity,
  History,
  Clock,
  Boxes,
  Search,
  ExternalLink,
  LogOut,
  AlertTriangle,
  User,
  SlidersHorizontal,
} from "lucide-react";
import masterService from "../../services/master.service";
import useAuth from "../../hooks/useAuth";
import Button from "../../components/common/Button";
import Loader from "../../components/common/Loader";
import toast from "react-hot-toast";

export const MasterAdminActivity = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // State
  const [admin, setAdmin] = useState(null);
  const [stats, setStats] = useState(null);
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTab, setFilterTab] = useState("ALL");

  // Fetch administrator profile, KPI stats, and activity history
  const fetchAdminActivities = useCallback(async (isManualRefresh = false) => {
    if (!id) return;
    try {
      if (isManualRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setErrorMessage(null);

      const res = await masterService.getAdminActivities(id);
      const data = res.data;

      setAdmin(data.admin || null);
      setStats(data.stats || null);
      setActivities(data.activities || []);
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to load administrator activity details";
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [id]);

  useEffect(() => {
    fetchAdminActivities();
  }, [fetchAdminActivities]);

  // Toggle active/suspended status
  const handleToggleStatus = async () => {
    if (!admin) return;
    try {
      setIsUpdatingStatus(true);
      const nextStatus = !admin.isActive;
      await masterService.updateAdmin(admin._id, { isActive: nextStatus });
      toast.success(`Admin ${admin.name} ${nextStatus ? "reactivated" : "suspended"} successfully`);
      setAdmin((prev) => (prev ? { ...prev, isActive: nextStatus } : prev));
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update admin status");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Badge color mapping for actions
  const getActionBadgeColor = (action) => {
    if (action.includes("CREATE")) return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
    if (action.includes("UPDATE")) return "bg-sky-500/10 text-sky-400 border-sky-500/20";
    if (action.includes("DELETE") || action.includes("CANCEL")) return "bg-rose-500/10 text-rose-400 border-rose-500/20";
    if (action.includes("LOGIN")) return "bg-amber-500/10 text-amber-400 border-amber-500/20";
    return "bg-slate-800 text-slate-300 border-slate-700";
  };

  // Filter activities based on tab and search
  const filteredActivities = useMemo(() => {
    return activities.filter((act) => {
      // Tab filter
      if (filterTab !== "ALL" && act.entityType !== filterTab) {
        return false;
      }

      // Search filter
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();

      const actionMatch = act.action?.toLowerCase().includes(q);
      const titleMatch = act.entityTitle?.toLowerCase().includes(q);
      const entityMatch = act.entityType?.toLowerCase().includes(q);
      const detailsMatch = act.details && JSON.stringify(act.details).toLowerCase().includes(q);
      const ipMatch = act.ipAddress?.toLowerCase().includes(q);

      return actionMatch || titleMatch || entityMatch || detailsMatch || ipMatch;
    });
  }, [activities, filterTab, searchQuery]);

  // Tab counts
  const tabCounts = useMemo(() => {
    return {
      ALL: activities.length,
      Product: activities.filter((a) => a.entityType === "Product").length,
      Category: activities.filter((a) => a.entityType === "Category").length,
      Order: activities.filter((a) => a.entityType === "Order").length,
      Auth: activities.filter((a) => a.entityType === "Auth").length,
    };
  }, [activities]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0b1329] text-slate-100 flex items-center justify-center p-4">
        <Loader text="Loading administrator activity logs..." />
      </div>
    );
  }

  if (errorMessage && !admin) {
    return (
      <div className="min-h-screen bg-[#0b1329] text-slate-100 py-12 px-4 sm:px-6 lg:px-8 font-sans flex items-center justify-center">
        <div className="max-w-md w-full bg-[#0f172a] border border-slate-800 rounded-2xl p-8 text-center space-y-5 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 mx-auto flex items-center justify-center">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-white">Administrator Not Found</h2>
          <p className="text-sm text-slate-400">{errorMessage}</p>
          <div className="pt-2 flex justify-center gap-3">
            <Button
              variant="outline"
              onClick={() => navigate("/master/admins")}
              className="border-slate-700 text-slate-300 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Return to Admins
            </Button>
            <Button variant="primary" onClick={() => fetchAdminActivities(false)}>
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b1329] text-slate-100 py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Top Header & Navigation Bar */}
        <header className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link
              to="/master/admins"
              className="w-12 h-12 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 flex items-center justify-center transition-all group"
              title="Return to Master Admins Console"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/15 text-amber-300 border border-amber-500/30">
                  Master Console
                </span>
                <span className="text-xs text-slate-400">Admin Activity Dossier</span>
              </div>
              <h1 className="text-2xl font-extrabold text-white mt-1">
                Audit Trail & Operation History
              </h1>
              <p className="text-xs text-slate-400">
                Detailed chronological logs and performance breakdown for staff administrator
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <Link
              to="/master/admins"
              className="flex-1 md:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800/80 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700/80 hover:border-slate-600 transition-colors"
            >
              <ShieldCheck className="w-4 h-4 text-slate-400" />
              All Admins
            </Link>
            <Link
              to="/admin/products"
              className="flex-1 md:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800/80 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700/80 hover:border-slate-600 transition-colors"
            >
              <Boxes className="w-4 h-4 text-amber-400" />
              Catalog (Read-Only)
            </Link>
            <Button
              variant="outline"
              size="sm"
              onClick={logout}
              className="border-rose-900/40 text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 text-xs"
            >
              <LogOut className="w-4 h-4 mr-1.5" />
              Sign Out
            </Button>
          </div>
        </header>

        {/* Admin Profile Overview Banner */}
        {admin && (
          <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              {/* Profile Details */}
              <div className="flex items-start sm:items-center gap-5">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center font-black text-3xl sm:text-4xl text-amber-400 shadow-md shrink-0">
                  {admin.name?.charAt(0).toUpperCase() || "A"}
                </div>
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                      {admin.name}
                    </h2>
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                      Staff Administrator
                    </span>
                    {admin.isActive ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        Active Access
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        <span className="w-2 h-2 rounded-full bg-amber-400" />
                        Suspended
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-slate-400 pt-1">
                    <span className="flex items-center gap-1.5 text-slate-300">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      {admin.email}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      Member Since:{" "}
                      {new Date(admin.createdAt).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                    <span className="font-mono text-[11px] text-slate-500">
                      Admin ID: {admin._id}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status Actions & Refresh */}
              <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchAdminActivities(true)}
                  disabled={isRefreshing}
                  className="border-slate-700 text-slate-300 hover:text-white text-xs"
                  title="Reload activity trail"
                >
                  <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isRefreshing ? "animate-spin" : ""}`} />
                  Refresh
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleToggleStatus}
                  disabled={isUpdatingStatus}
                  className={`text-xs ${
                    admin.isActive
                      ? "border-amber-500/40 text-amber-300 hover:bg-amber-500/10"
                      : "border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/10"
                  }`}
                >
                  {isUpdatingStatus ? (
                    <RefreshCw className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                  ) : admin.isActive ? (
                    <XCircle className="w-3.5 h-3.5 mr-1.5" />
                  ) : (
                    <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
                  )}
                  {admin.isActive ? "Suspend Admin" : "Reactivate Admin"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Operational Management Breakdown Cards */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Boxes className="w-4 h-4 text-slate-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Operational Management Breakdown
              </h3>
            </div>
            {stats?.lastActiveAt && (
              <span className="flex items-center gap-1.5 text-xs text-slate-400">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                Last Recorded Action:{" "}
                <span className="text-slate-300 font-medium">
                  {new Date(stats.lastActiveAt).toLocaleString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* KPI 1: Catalog Products */}
            <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 shadow-sm relative overflow-hidden group hover:border-slate-700 transition-colors">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 shadow-sm">
                  <Package className="w-5 h-5" />
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-800 text-slate-300 border border-slate-700">
                  Catalog
                </span>
              </div>
              <div className="mt-4">
                <div className="text-3xl font-black text-white">
                  {stats?.products?.created ?? 0}
                </div>
                <div className="text-xs text-slate-400 font-medium mt-0.5">Products Created</div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  {stats?.products?.activeInCatalog ?? 0} Live
                </span>
                <span>{stats?.products?.updated ?? 0} Edited</span>
                <span className="text-rose-400">{stats?.products?.deleted ?? 0} Del</span>
              </div>
            </div>

            {/* KPI 2: Categories Managed */}
            <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 shadow-sm relative overflow-hidden group hover:border-slate-700 transition-colors">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-sm">
                  <FolderTree className="w-5 h-5" />
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-800 text-slate-300 border border-slate-700">
                  Taxonomy
                </span>
              </div>
              <div className="mt-4">
                <div className="text-3xl font-black text-white">
                  {stats?.categories?.created ?? 0}
                </div>
                <div className="text-xs text-slate-400 font-medium mt-0.5">Categories Created</div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  {stats?.categories?.activeInCatalog ?? 0} Live
                </span>
                <span>{stats?.categories?.updated ?? 0} Edited</span>
                <span className="text-rose-400">{stats?.categories?.deleted ?? 0} Del</span>
              </div>
            </div>

            {/* KPI 3: Orders Processed */}
            <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 shadow-sm relative overflow-hidden group hover:border-slate-700 transition-colors">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shadow-sm">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-800 text-slate-300 border border-slate-700">
                  Fulfillment
                </span>
              </div>
              <div className="mt-4">
                <div className="text-3xl font-black text-white">
                  {stats?.orders?.totalActions ?? 0}
                </div>
                <div className="text-xs text-slate-400 font-medium mt-0.5">Order Operations</div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <span className="text-slate-300 font-medium">
                  {stats?.orders?.statusUpdated ?? 0} Status Updates
                </span>
                <span className="text-rose-400">
                  {stats?.orders?.cancelled ?? 0} Cancelled
                </span>
              </div>
            </div>

            {/* KPI 4: Security & Audit */}
            <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 shadow-sm relative overflow-hidden group hover:border-slate-700 transition-colors">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 shadow-sm">
                  <Activity className="w-5 h-5" />
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-800 text-slate-300 border border-slate-700">
                  Security
                </span>
              </div>
              <div className="mt-4">
                <div className="text-3xl font-black text-white">
                  {stats?.logins?.total ?? 0}
                </div>
                <div className="text-xs text-slate-400 font-medium mt-0.5">Login Sessions</div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <span className="text-slate-300">
                  {stats?.totalActivities ?? activities.length} Audit Records
                </span>
                <span className="text-amber-400 font-medium">Verified Trail</span>
              </div>
            </div>
          </div>
        </section>

        {/* Activity Stream Section */}
        <section className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
          {/* Header & Search */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <History className="w-5 h-5 text-slate-400" />
              <div>
                <h3 className="text-lg font-bold text-white">
                  Activity Audit Stream ({filteredActivities.length})
                </h3>
                <p className="text-xs text-slate-400">
                  Complete immutable log of all catalog, inventory, order, and security events
                </p>
              </div>
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search by action, item title, details..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#ed1d24]/20 focus:border-[#ed1d24]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white text-xs font-bold"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Filter Category Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: "ALL", label: "All Activities", count: tabCounts.ALL },
              { id: "Product", label: "Catalog / Products", count: tabCounts.Product },
              { id: "Category", label: "Taxonomy / Categories", count: tabCounts.Category },
              { id: "Order", label: "Order Operations", count: tabCounts.Order },
              { id: "Auth", label: "Authentication & Logins", count: tabCounts.Auth },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterTab(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-2 ${
                  filterTab === tab.id
                    ? "bg-[#ed1d24] text-white font-semibold shadow-md shadow-[#ed1d24]/20 border border-[#ed1d24]"
                    : "bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-700/80"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] ${
                    filterTab === tab.id
                      ? "bg-white/20 text-white"
                      : "bg-slate-700/60 text-slate-400"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Activity Stream List */}
          <div className="space-y-3">
            {filteredActivities.length === 0 ? (
              <div className="py-16 text-center space-y-3 bg-slate-800/20 border border-slate-800/60 rounded-xl">
                <History className="w-10 h-10 text-slate-600 mx-auto" />
                <h4 className="text-sm font-bold text-slate-300">No Activity Logs Found</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  {searchQuery
                    ? `No activity records match "${searchQuery}". Try clearing your search keyword.`
                    : "No operations have been recorded in this category for this administrator."}
                </p>
                {searchQuery && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSearchQuery("")}
                    className="border-slate-700 text-slate-300 text-xs mt-2"
                  >
                    Clear Search
                  </Button>
                )}
              </div>
            ) : (
              filteredActivities.map((act) => (
                <div
                  key={act._id}
                  className="p-4 sm:p-5 rounded-xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-slate-700/80 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs group"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getActionBadgeColor(
                          act.action
                        )}`}
                      >
                        {act.action?.replace(/_/g, " ")}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                        {act.entityType}
                      </span>
                      <span className="font-bold text-white text-sm sm:text-base">
                        {act.entityTitle || "Untitled Entity"}
                      </span>
                    </div>

                    {/* Render Details Chips */}
                    {act.details && Object.keys(act.details).length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        {Object.entries(act.details).map(([key, val]) => (
                          <span
                            key={key}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800/90 border border-slate-700/60 text-[11px] text-slate-300 font-mono"
                          >
                            <span className="text-slate-400 capitalize">
                              {key.replace(/([A-Z])/g, " $1")}:
                            </span>
                            <span className="text-slate-200 font-semibold">
                              {typeof val === "object" ? JSON.stringify(val) : String(val)}
                            </span>
                          </span>
                        ))}
                      </div>
                    )}

                    {act.ipAddress && (
                      <div className="text-[11px] text-slate-500 font-mono">
                        IP: {act.ipAddress}
                      </div>
                    )}
                  </div>

                  <div className="text-left md:text-right text-[11px] text-slate-400 whitespace-nowrap border-t md:border-t-0 pt-2 md:pt-0 border-slate-800 w-full md:w-auto">
                    <div className="font-semibold text-slate-200">
                      {new Date(act.createdAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </div>
                    <div className="flex items-center md:justify-end gap-1 text-slate-400 mt-0.5">
                      <Clock className="w-3 h-3 text-slate-500" />
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

          {/* Section Footer */}
          <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
            <span>
              Showing {filteredActivities.length} of {activities.length} recorded operations for{" "}
              <strong className="text-slate-200">{admin?.name}</strong>
            </span>
            <Link
              to="/master/admins"
              className="inline-flex items-center gap-1 text-[#ed1d24] hover:text-[#d32f2f] font-medium transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Administrator List
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};

export default MasterAdminActivity;
