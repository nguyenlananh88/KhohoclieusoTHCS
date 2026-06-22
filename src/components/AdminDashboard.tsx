import React, { useState, useEffect } from "react";
import { 
  Lock, Key, ShieldCheck, LogOut, Grid, Plus, Trash, Edit2, 
  Check, X, FileText, ShoppingCart, Loader2, DollarSign, 
  Layers, User, Mail, Phone, Calendar, RefreshCw, MessageSquare, AlertCircle, Sparkles, CheckCircle,
  UploadCloud, Paperclip, Eye, EyeOff, Image, Link
} from "lucide-react";
import { Product, Initiative, Order, Feedback } from "../types";

interface AdminDashboardProps {
  products: Product[];
  initiatives: Initiative[];
  onRefreshProducts: () => void;
  onRefreshInitiatives: () => void;
  isAdmin: boolean;
  onAdminLoginSuccess: (token: string) => void;
  onAdminLogout: () => void;
}

export default function AdminDashboard({
  products,
  initiatives,
  onRefreshProducts,
  onRefreshInitiatives,
  isAdmin,
  onAdminLoginSuccess,
  onAdminLogout
}: AdminDashboardProps) {
  // Login fields
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  // States inside admin panel
  const [subTab, setSubTab] = useState<"dashboard" | "products" | "orders" | "feedbacks" | "settings">("dashboard");
  const [orders, setOrders] = useState<Order[]>([]);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [loadingFeedbacks, setLoadingFeedbacks] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Change password fields
  const [changePasswordUsername, setChangePasswordUsername] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState("");
  const [pwLoading, setPwLoading] = useState(false);

  // Password visibility status toggles
  const [showLoginPass, setShowLoginPass] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showNewAdminPass, setShowNewAdminPass] = useState(false);

  // State profiles for multi-admin addition
  const [adminAccounts, setAdminAccounts] = useState<any[]>([]);
  const [loadingAdmins, setLoadingAdmins] = useState(false);
  const [newAdminUser, setNewAdminUser] = useState("");
  const [newAdminPass, setNewAdminPass] = useState("");
  const [addAdminError, setAddAdminError] = useState("");
  const [addAdminSuccess, setAddAdminSuccess] = useState("");
  const [addAdminLoading, setAddAdminLoading] = useState(false);

  // Product file fields for upload from local computer
  const [formFileData, setFormFileData] = useState("");
  const [formFileName, setFormFileName] = useState("");

  // Supabase Database Connection Status State
  const [dbStatus, setDbStatus] = useState<any>(null);

  const fetchDbStatus = async () => {
    try {
      const res = await fetch("/api/db-status");
      if (res.ok) {
        const data = await res.json();
        setDbStatus(data);
      }
    } catch (e) {
      console.error("Lỗi đồng bộ Supabase:", e);
    }
  };

  // Product Add/Edit Form State
  const [showProductForm, setShowProductForm] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  
  // Product form fields
  const [formTitle, setFormTitle] = useState("");
  const [formSubject, setFormSubject] = useState("Tin học");
  const [formGrade, setFormGrade] = useState(6);
  const [formType, setFormType] = useState("Giáo án Word");
  const [formPrice, setFormPrice] = useState(150000);
  const [formOriginalPrice, setFormOriginalPrice] = useState(200000);
  const [formTag, setFormTag] = useState("new");
  const [formImage, setFormImage] = useState("");
  const [formDescription, setFormDescription] = useState("");

  // Target item for Initiatives
  const [showInitForm, setShowInitForm] = useState(false);
  const [initFormMode, setInitFormMode] = useState<"create" | "edit">("create");
  const [selectedInitId, setSelectedInitId] = useState<string | null>(null);
  
  // Initiative form fields
  const [initCategory, setInitCategory] = useState("Bậc THCS");
  const [initTitle, setInitTitle] = useState("");
  const [initAuthor, setInitAuthor] = useState("");
  const [initDesc, setInitDesc] = useState("");
  const [initPrice, setInitPrice] = useState(120000);
  const [initImage, setInitImage] = useState("");

  // Notification Toast Helper
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Log in handler
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setLoginError("Vui lòng điền đầy đủ tài khoản và mật khẩu!");
      return;
    }
    setLoginLoading(true);
    setLoginError("");

    try {
      const loginPayload = { username, password };
      let res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginPayload)
      });
      let data = await res.json();

      if (!res.ok || !data.success) {
        // Self-healing check: sync credentials if client has custom backup list
        const backupStr = localStorage.getItem("backup_admin_accounts");
        if (backupStr) {
          try {
            const backedUp = JSON.parse(backupStr);
            const syncRes = await fetch("/api/admin/sync-accounts", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ admins: backedUp })
            });
            if (syncRes.ok) {
              // Retry login with newly synchronized database credentials
              res = await fetch("/api/admin/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(loginPayload)
              });
              data = await res.json();
            }
          } catch (syncErr) {
            console.error("Self-healing login sync error:", syncErr);
          }
        }
      }

      if (res.ok && data.success) {
        onAdminLoginSuccess(data.token);
        showToast("🔑 Đăng nhập quản trị viên thành công!");
      } else {
        setLoginError(data.error || "Tài khoản hoặc mật khẩu không chính xác.");
      }
    } catch (err) {
      setLoginError("Không thể kết nối với máy chủ backend.");
    } finally {
      setLoginLoading(false);
    }
  };

  // Load orders and feedbacks if logged in
  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      const res = await fetch("/api/admin/orders", {
        headers: { "Authorization": `Bearer admin-secret-token` }
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (err) {
      console.error("Fetch orders err", err);
    } finally {
      setLoadingOrders(false);
    }
  };

  const fetchFeedbacks = async () => {
    setLoadingFeedbacks(true);
    try {
      const res = await fetch("/api/admin/feedbacks", {
        headers: { "Authorization": `Bearer admin-secret-token` }
      });
      if (res.ok) {
        const data = await res.json();
        setFeedbacks(data);
      }
    } catch (err) {
      console.error("Fetch feedbacks err", err);
    } finally {
      setLoadingFeedbacks(false);
    }
  };

  const fetchAdminAccounts = async () => {
    setLoadingAdmins(true);
    try {
      const res = await fetch("/api/admin/accounts", {
        headers: { "Authorization": `Bearer admin-secret-token` }
      });
      if (res.ok) {
        const data = await res.json();
        const list = data.admins || [];
        setAdminAccounts(list);
        if (list.length > 0) {
          setChangePasswordUsername((prev) => prev || list[0].username || "admin");
        }
        localStorage.setItem("backup_admin_accounts", JSON.stringify(list));
      }
    } catch (err) {
      console.error("Fetch admins key err:", err);
    } finally {
      setLoadingAdmins(false);
    }
  };

  const handleCreateAdminAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddAdminError("");
    setAddAdminSuccess("");

    if (!newAdminUser.trim() || !newAdminPass) {
      setAddAdminError("Vui lòng điền đầy đủ cả tài khoản và mật mã mới!");
      return;
    }

    setAddAdminLoading(true);
    try {
      const res = await fetch("/api/admin/accounts", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer admin-secret-token`
        },
        body: JSON.stringify({ username: newAdminUser, password: newAdminPass })
      });
      const data = await res.json();
      if (res.ok) {
        setAddAdminSuccess(`🎉 Cấp quyền quản trị thành công cho: ${newAdminUser}`);
        setNewAdminUser("");
        setNewAdminPass("");
        fetchAdminAccounts();
        showToast("✓ Đã thêm tài khoản Admin mới!");
      } else {
        setAddAdminError(data.error || "Gặp lỗi khi tạo tài khoản.");
      }
    } catch (err) {
      setAddAdminError("Lỗi kết nối máy chủ khi cấp tài khoản.");
    } finally {
      setAddAdminLoading(false);
    }
  };

  const handleDeleteAdminAccount = async (delUsername: string) => {
    if (!window.confirm(`Bạn có chắc muốn thu hồi quyền truy cập (Xóa tài khoản) của "${delUsername}" không?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/accounts/${encodeURIComponent(delUsername)}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer admin-secret-token` }
      });
      const data = await res.json();
      if (res.ok) {
        showToast(`✓ Đã thu hồi quyền quản trị của: ${delUsername}`);
        fetchAdminAccounts();
      } else {
        showToast(`❌ ${data.error || "Không thể xóa tài khoản."}`);
      }
    } catch (err) {
      showToast("❌ Lỗi mạng khi xóa tài khoản.");
    }
  };

  useEffect(() => {
    if (isAdmin) {
      const syncAndLoad = async () => {
        const backupStr = localStorage.getItem("backup_admin_accounts");
        if (backupStr) {
          try {
            const backedUp = JSON.parse(backupStr);
            await fetch("/api/admin/sync-accounts", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ admins: backedUp })
            });
          } catch (syncErr) {
            console.error("Quiet admin sync warning:", syncErr);
          }
        }
        fetchOrders();
        fetchFeedbacks();
        fetchAdminAccounts();
        fetchDbStatus();
      };
      
      syncAndLoad();
    }
  }, [isAdmin, subTab]);

  // Handle Order Status Approval / Decline
  const handleUpdateOrderStatus = async (orderId: string, status: "paid" | "declined") => {
    setActionLoading(orderId);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer admin-secret-token`
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        showToast(`✓ Đã cập nhật đơn hàng sang: ${status === "paid" ? "Đã thanh toán (Duyệt tải)" : "Đã hủy"}`);
        fetchOrders();
      } else {
        showToast("❌ Không thể cập nhật trạng thái đơn hàng.");
      }
    } catch (err) {
      showToast("❌ Lỗi mạng khi cập nhật đơn hàng.");
    } finally {
      setActionLoading(null);
    }
  };

  // Handle delete order
  const handleDeleteOrder = async (orderId: string) => {
    if (!window.confirm("Thầy cô có chắc chắn xóa vĩnh viễn hóa đơn này khỏi hệ thống?")) return;
    setActionLoading(orderId + "-del");
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer admin-secret-token` }
      });
      if (res.ok) {
        showToast("✓ Đã xóa hóa đơn vĩnh viễn.");
        fetchOrders();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  // Handle delete product
  const handleDeleteProduct = async (prodId: string) => {
    if (!window.confirm("Bộ GDPT 2018: Thầy cô chắc chắn muốn xóa học liệu này?")) return;
    try {
      const res = await fetch(`/api/admin/products/${prodId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer admin-secret-token` }
      });
      if (res.ok) {
        showToast("🗑️ Đã xóa học liệu khỏi hệ thống thành công!");
        onRefreshProducts();
      }
    } catch (err) {
      showToast("❌ Không thể xóa sản phẩm.");
    }
  };

  // Handle delete initiative
  const handleDeleteInitiative = async (initId: string) => {
    if (!window.confirm("Thầy cô chắc chắn muốn xóa sáng kiến kinh nghiệm này?")) return;
    try {
      const res = await fetch(`/api/admin/initiatives/${initId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer admin-secret-token` }
      });
      if (res.ok) {
        showToast("🗑️ Đã xóa sáng kiến kinh nghiệm thành công!");
        onRefreshInitiatives();
      }
    } catch (err) {
      showToast("❌ Không thể xóa sáng kiến.");
    }
  };

  // Open product form for creating
  const openCreateProduct = () => {
    setFormMode("create");
    setFormTitle("");
    setFormSubject("Tin học");
    setFormGrade(6);
    setFormType("Giáo án Word");
    setFormPrice(150000);
    setFormOriginalPrice(200005);
    setFormTag("new");
    setFormImage("");
    setFormDescription("");
    setFormFileData("");
    setFormFileName("");
    setSelectedProductId(null);
    setShowProductForm(true);
  };

  // Open product form for editing
  const openEditProduct = (p: Product) => {
    setFormMode("edit");
    setFormTitle(p.title);
    setFormSubject(p.subject);
    setFormGrade(p.grade);
    setFormType(p.type);
    setFormPrice(p.price);
    setFormOriginalPrice(p.originalPrice);
    setFormTag(p.tag);
    setFormImage(p.image);
    setFormDescription(p.description);
    setFormFileData((p as any).fileData || "");
    setFormFileName((p as any).fileName || "");
    setSelectedProductId(p.id);
    setShowProductForm(true);
  };

  // Submit Product Form
  const handleSubmitProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      showToast("⚠️ Vui lòng nhập tiêu đề học liệu!");
      return;
    }

    const payload = {
      title: formTitle,
      subject: formSubject,
      grade: Number(formGrade),
      type: formType,
      price: Number(formPrice),
      originalPrice: Number(formOriginalPrice),
      tag: formTag,
      image: formImage || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500&auto=format&fit=crop&q=60",
      description: formDescription,
      fileData: formFileData,
      fileName: formFileName
    };

    try {
      const url = formMode === "create" ? "/api/admin/products" : `/api/admin/products/${selectedProductId}`;
      const method = formMode === "create" ? "POST" : "PUT";
      
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer admin-secret-token`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        showToast(formMode === "create" ? "🎉 Thêm học liệu số mới thành công!" : "💾 Cập nhật học liệu thành công!");
        setShowProductForm(false);
        onRefreshProducts();
      } else {
        showToast("❌ Gặp lỗi cấu trúc dữ liệu gửi đi.");
      }
    } catch (err) {
      showToast("❌ Lỗi mạng kết nối.");
    }
  };

  // Open init form for creating
  const openCreateInit = () => {
    setInitFormMode("create");
    setInitCategory("Bậc THCS");
    setInitTitle("");
    setInitAuthor("");
    setInitDesc("");
    setInitPrice(120000);
    setInitImage("");
    setSelectedInitId(null);
    setShowInitForm(true);
  };

  // Open init form for editing
  const openEditInit = (i: Initiative) => {
    setInitFormMode("edit");
    setInitCategory(i.category);
    setInitTitle(i.title);
    setInitAuthor(i.author);
    setInitDesc(i.desc);
    setInitPrice(i.price);
    setInitImage((i as any).image || "");
    setSelectedInitId(i.id);
    setShowInitForm(true);
  };

  // Submit Initiative Form
  const handleSubmitInit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!initTitle.trim()) {
      showToast("⚠️ Vui lòng nhập tiêu đề sáng kiến!");
      return;
    }

    const payload = {
      category: initCategory,
      title: initTitle,
      author: initAuthor,
      desc: initDesc,
      price: Number(initPrice),
      image: initImage
    };

    try {
      const url = initFormMode === "create" ? "/api/admin/initiatives" : `/api/admin/initiatives/${selectedInitId}`;
      const method = initFormMode === "create" ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer admin-secret-token`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        showToast(initFormMode === "create" ? "🎉 Thêm sáng kiến mới thành công!" : "💾 Đã lưu sáng kiến kinh nghiệm!");
        setShowInitForm(false);
        onRefreshInitiatives();
      } else {
        showToast("❌ Gửi dữ liệu thất bại.");
      }
    } catch (err) {
      showToast("❌ Kết nối bị gián đoạn.");
    }
  };

  // Analytics helper calculations
  const calculateStats = () => {
    const totalRevenue = orders
      .filter(o => o.status === "paid")
      .reduce((sum, o) => sum + o.totalAmount, 0);
    const pendingOrders = orders.filter(o => o.status === "pending").length;
    const completedOrders = orders.filter(o => o.status === "paid").length;
    
    return {
      totalRevenue,
      pendingOrders,
      completedOrders,
      totalCount: products.length + initiatives.length
    };
  };

  const stats = calculateStats();

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto my-12 bg-white rounded-[32px] border border-slate-100 shadow-xl p-8 space-y-6 text-left">
        <div className="text-center space-y-2">
          <div className="bg-indigo-50 text-indigo-600 p-4 rounded-full w-fit mx-auto">
            <Lock className="w-10 h-10" />
          </div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Cổng Đăng Nhập Quản Trị</h2>
          <p className="text-slate-400 text-xs font-semibold">Vui lòng đăng nhập bằng quyền quản trị để kiểm duyệt học liệu và xử lý hóa đơn khách hàng.</p>
        </div>

        {loginError && (
          <div className="bg-red-50 text-red-600 p-3 rounded-2xl border border-red-100 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4.5 h-4.5 shrink-0" />
            <span>{loginError}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Tài khoản quản quản lý</label>
            <div className="relative">
              <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4.5 h-4.5" />
              <input 
                type="text" 
                placeholder="Ví dụ: admin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-10 pr-3 py-3 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Mật mã bảo vệ</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4.5 h-4.5" />
              <input 
                type={showLoginPass ? "text" : "password"} 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-10 pr-10 py-3 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="button"
                onClick={() => setShowLoginPass(!showLoginPass)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
              >
                {showLoginPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loginLoading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold py-3.5 rounded-2xl text-xs transition-all flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
          >
            {loginLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Đang bảo mật đăng nhập...
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" /> Xác minh & Đăng nhập
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-2">
          <span className="text-[10px] font-black text-slate-400/95 block uppercase tracking-widest">Demo credential: admin / admin</span>
        </div>
      </div>
    );
  }

  // Handle Admin change password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError("");
    setPwSuccess("");

    if (!changePasswordUsername) {
      setPwError("Vui lòng chọn một tài khoản quản trị để đổi mật khẩu!");
      return;
    }

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPwError("Vui lòng điền đầy đủ tất cả các trường mật mã!");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPwError("Xác nhận mật khẩu mới không khớp!");
      return;
    }

    if (newPassword.length < 4) {
      setPwError("Mật khẩu mới phải từ 4 ký tự trở lên!");
      return;
    }

    setPwLoading(true);

    try {
      const res = await fetch("/api/admin/change-password", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer admin-secret-token`
        },
        body: JSON.stringify({ username: changePasswordUsername, currentPassword, newPassword })
      });

      const data = await res.json();
      if (res.ok) {
        setPwSuccess(`🎉 Thay đổi mật khẩu tài khoản "${changePasswordUsername}" thành công!`);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        showToast("✓ Đã đổi mật mã quản trị viên thành công!");
        fetchAdminAccounts();
      } else {
        setPwError(data.error || "Gặp lỗi khi đổi mật khẩu.");
      }
    } catch (err) {
      setPwError("Không thể kết nối máy chủ để cập nhật mật khẩu.");
    } finally {
      setPwLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in text-left">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white py-3 px-5 rounded-xl shadow-2xl flex items-center gap-3 border border-slate-750 animate-slide-in">
          <Sparkles className="text-yellow-400 w-5 h-5 flex-shrink-0 animate-pulse" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Admin Panel Header */}
      <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-[32px] flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden shadow-xl border border-slate-800">
        <div className="absolute right-0 bottom-0 w-80 h-80 bg-indigo-500 rounded-full filter blur-3xl opacity-10"></div>
        <div className="space-y-1 relative z-10">
          <div className="flex flex-wrap gap-2 items-center mb-1">
            <div className="inline-flex items-center gap-1 bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-full text-[11px] font-bold border border-indigo-500/20">
              <ShieldCheck className="w-3.5 h-3.5" /> Giao diện điều hành hệ thống
            </div>
            
            {dbStatus && (
              dbStatus.connected ? (
                <div className="inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-[11px] font-bold border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping mr-1"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 absolute mr-1"></span>
                  Supabase: Đã liên kết thực dạt
                </div>
              ) : (
                <div className="inline-flex items-center gap-1 bg-amber-500/20 text-amber-300 px-3 py-1 rounded-full text-[11px] font-bold border border-amber-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mr-1 animate-pulse"></span>
                  Dùng Cơ sở dữ liệu Dự phòng (Local JSON)
                </div>
              )
            )}
          </div>
          <h2 className="text-2xl sm:text-3xl font-black">Hệ Thống Phân Quyền Quản Trị Chặt Chẽ</h2>
          <p className="text-slate-400 text-xs font-medium">Thầy cô Admin: {username || "admin"} • Cấu hình trực tuyến thời gian thực các học liệu GDPT 2018.</p>
        </div>
      </div>

      {/* Tabs list */}
      <div className="flex flex-wrap border-b border-slate-200 gap-2 pb-2">
        <button
          onClick={() => setSubTab("dashboard")}
          className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all whitespace-nowrap ${subTab === "dashboard" ? "bg-slate-950 text-white" : "text-slate-500 hover:bg-slate-100"}`}
        >
          📊 Tổng quan doanh thu
        </button>
        <button
          onClick={() => setSubTab("products")}
          className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all whitespace-nowrap ${subTab === "products" ? "bg-slate-950 text-white" : "text-slate-500 hover:bg-slate-100"}`}
        >
          📂 Kho học liệu & Sáng kiến ({products.length + initiatives.length})
        </button>
        <button
          onClick={() => setSubTab("orders")}
          className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all whitespace-nowrap ${subTab === "orders" ? "bg-slate-950 text-white flex items-center gap-1.5" : "text-slate-500 hover:bg-slate-100 flex items-center gap-1.5"}`}
        >
          🛒 Duyệt hóa đơn đơn hàng
          {orders.filter(o => o.status === "pending").length > 0 && (
            <span className="bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full animate-bounce">
              {orders.filter(o => o.status === "pending").length}
            </span>
          )}
        </button>
        <button
          onClick={() => setSubTab("feedbacks")}
          className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all whitespace-nowrap ${subTab === "feedbacks" ? "bg-slate-950 text-white" : "text-slate-500 hover:bg-slate-100"}`}
        >
          💬 Góp ý & Phản hồi ({feedbacks.length})
        </button>
        <button
          onClick={() => setSubTab("settings")}
          className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all whitespace-nowrap ${subTab === "settings" ? "bg-slate-950 text-white" : "text-slate-500 hover:bg-slate-100"}`}
        >
          🔒 Bảo mật & Đổi mật khẩu
        </button>
      </div>

      {/* TAB CONTENT: GENERAL OVERVIEW */}
      {subTab === "dashboard" && (
        <div className="space-y-6 animate-fade-in">
          {/* Bento analytics layout */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
              <div className="bg-indigo-50 text-indigo-600 p-3.5 rounded-2xl">
                <DollarSign className="w-6 h-6" />
              </div>
              <div className="text-left leading-none">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Tổng Doanh Thu Duyệt</p>
                <p className="text-xl font-black text-slate-800 mt-1">{stats.totalRevenue.toLocaleString("vi-VN")}đ</p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
              <div className="bg-amber-50 text-amber-600 p-3.5 rounded-2xl">
                <ShoppingCart className="w-6 h-6" />
              </div>
              <div className="text-left leading-none">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Đơn Hàng Chờ Duyệt</p>
                <p className="text-xl font-black text-slate-800 mt-1">{stats.pendingOrders} đơn</p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
              <div className="bg-emerald-50 text-emerald-600 p-3.5 rounded-2xl">
                <Layers className="w-6 h-6" />
              </div>
              <div className="text-left leading-none">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Tổng số tài nguyên</p>
                <p className="text-xl font-black text-slate-800 mt-1">{stats.totalCount} học liệu</p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
              <div className="bg-purple-50 text-purple-600 p-3.5 rounded-2xl">
                <MessageSquare className="w-6 h-6" />
              </div>
              <div className="text-left leading-none">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Góp Ý Đóng Góp</p>
                <p className="text-xl font-black text-slate-800 mt-1">{feedbacks.length} ý kiến</p>
              </div>
            </div>

          </div>

          {/* SVG Graph block & Stats panel */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Visual Charts */}
            <div className="lg:col-span-2 bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-black text-slate-900 text-sm uppercase">Biểu đồ tăng trưởng doanh số (Dự toán 2026)</h3>
                <span className="bg-slate-100 text-slate-500 font-bold text-[10px] px-2 py-0.5 rounded-full">Dữ liệu thực tế</span>
              </div>
              <div className="h-64 flex items-end justify-between gap-1 sm:gap-2 pt-6 px-4">
                {[
                  { month: "T1", val: 30 },
                  { month: "T2", val: 45 },
                  { month: "T3", val: 60 },
                  { month: "T4", val: 40 },
                  { month: "T5", val: 80 },
                  { month: "T6 (Hiện tại)", val: 95 }
                ].map((col, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                    <div className="text-[10px] font-black text-indigo-600">{(col.val * 10000).toLocaleString("vi-VN")}đ</div>
                    <div 
                      className="w-full bg-gradient-to-t from-indigo-600 to-blue-500 rounded-t-xl transition-all duration-1000"
                      style={{ height: `${col.val}%` }}
                    ></div>
                    <div className="text-[11px] font-extrabold text-slate-400">{col.month}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-6 flex flex-col">
              {/* Admin activity log brief list */}
              <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm space-y-4 text-left">
                <h3 className="font-black text-slate-900 text-sm uppercase border-b border-slate-100 pb-2">Hướng dẫn phân quyền</h3>
                <div className="space-y-3 font-medium text-xs text-slate-500 leading-relaxed">
                  <div className="flex gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 font-bold">1</span>
                    <p>Mọi sửa đổi của Admin sẽ cập nhật trực tiếp vào tệp lưu trữ và hiển thị ra màn hình chính của giáo viên ngay lập tức.</p>
                  </div>
                  <div className="flex gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 font-bold">2</span>
                    <p>Các tài liệu miễn phí được tải tự động, còn tài liệu trả phí sẽ tạo hóa đơn chờ Admin xác nhận chuyển khoản ngân hàng thành công.</p>
                  </div>
                  <div className="flex gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 font-bold">3</span>
                    <p>Để đảm bảo an toàn cơ sở dữ liệu học tập, các tệp luôn có bản lưu dự phòng (.bak) trong hệ thống.</p>
                  </div>
                </div>
              </div>

              {/* Supabase Connection Monitor */}
              <div className="bg-slate-900 text-slate-100 p-6 rounded-[32px] border border-slate-800 shadow-xl space-y-4 text-left">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h4 className="font-black text-xs text-slate-400 tracking-wider flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${dbStatus && dbStatus.connected ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`}></span>
                    SUPABASE DATABASE CONSOLE
                  </h4>
                  <button 
                    onClick={async () => {
                      showToast("🔄 Đang quét trạng thái kết nối Supabase thực tế...");
                      await fetchDbStatus();
                      showToast("✓ Đã làm mới trạng thái liên kết!");
                    }}
                    className="text-[10px] bg-slate-800 hover:bg-slate-700 text-indigo-300 font-extrabold px-3 py-1 rounded-lg border border-slate-700 transition-all cursor-pointer"
                  >
                    Quét Lại
                  </button>
                </div>

                {dbStatus ? (
                  <div className="space-y-4">
                    {/* Status Alert Badge */}
                    <div className={`p-3 rounded-2xl flex flex-col gap-1 text-xs font-bold border ${
                      dbStatus.connected 
                        ? "bg-emerald-950/40 text-emerald-300 border-emerald-900/30" 
                        : "bg-amber-950/40 text-amber-300 border-amber-900/30"
                    }`}>
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${dbStatus.connected ? "bg-emerald-400 animate-ping" : "bg-amber-400"}`}></span>
                        <span>Trạng thái: {dbStatus.connected ? "ĐÃ KẾT NỐI CHÍNH THỨC" : "LỖI KẾT NỐI / DÙNG DỰ PHÒNG"}</span>
                      </div>
                      <p className="text-[10px] font-medium text-slate-400 mt-1">{dbStatus.message}</p>
                    </div>

                    {/* URL description */}
                    <div className="bg-slate-950/60 p-3 rounded-2xl space-y-1 font-mono text-[11px] border border-slate-800">
                      <p className="text-[10px] font-black text-slate-500 uppercase">PROJECT INSTANCE URL</p>
                      <p className="text-slate-300 truncate font-semibold">{dbStatus.url || "Chưa thiết lập"}</p>
                    </div>

                    {/* Database Tables Verification status */}
                    <div className="space-y-2">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider">CẤU TRÚC & DỮ LIỆU ĐỒNG BỘ</p>
                      
                      <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                        {/* Table Products */}
                        <div className="bg-slate-950/40 p-2 border border-slate-800 rounded-xl flex flex-col gap-0.5">
                          <span className="text-slate-405 font-bold">📂 products</span>
                          {dbStatus.tables?.products?.exists ? (
                            <span className="text-emerald-400 font-black">✓ {dbStatus.tables.products.count} hàng</span>
                          ) : (
                            <span className="text-red-400 font-extrabold">⚠️ Thiếu bảng</span>
                          )}
                        </div>

                        {/* Table Initiatives */}
                        <div className="bg-slate-950/40 p-2 border border-slate-800 rounded-xl flex flex-col gap-0.5">
                          <span className="text-slate-405 font-bold">📂 initiatives</span>
                          {dbStatus.tables?.initiatives?.exists ? (
                            <span className="text-emerald-400 font-black">✓ {dbStatus.tables.initiatives.count} hàng</span>
                          ) : (
                            <span className="text-red-400 font-extrabold">⚠️ Thiếu bảng</span>
                          )}
                        </div>

                        {/* Table Orders */}
                        <div className="bg-slate-950/40 p-2 border border-slate-800 rounded-xl flex flex-col gap-0.5">
                          <span className="text-slate-405 font-bold">🛒 orders</span>
                          {dbStatus.tables?.orders?.exists ? (
                            <span className="text-emerald-400 font-black">✓ {dbStatus.tables.orders.count} hàng</span>
                          ) : (
                            <span className="text-red-400 font-extrabold">⚠️ Thiếu bảng</span>
                          )}
                        </div>

                        {/* Table Feedbacks */}
                        <div className="bg-slate-950/40 p-2 border border-slate-800 rounded-xl flex flex-col gap-0.5">
                          <span className="text-slate-405 font-bold">💬 feedbacks</span>
                          {dbStatus.tables?.feedbacks?.exists ? (
                            <span className="text-emerald-400 font-black">✓ {dbStatus.tables.feedbacks.count} hàng</span>
                          ) : (
                            <span className="text-red-400 font-extrabold">⚠️ Thiếu bảng</span>
                          )}
                        </div>
                      </div>

                      {/* Diagnostic instruction */}
                      {dbStatus && dbStatus.tables && (!dbStatus.tables?.products?.exists || !dbStatus.tables?.initiatives?.exists || !dbStatus.tables?.orders?.exists || !dbStatus.tables?.feedbacks?.exists) && (
                        <div className="bg-amber-950/20 border border-amber-900/35 p-3 rounded-2xl text-[10px] text-amber-400 space-y-1 mt-2">
                          <p className="font-extrabold">💡 HƯỚNG DẪN KHẮC PHỤC:</p>
                          <p className="font-medium leading-relaxed">Cơ sở dữ liệu của thầy cô chưa có đầy đủ cấu trúc bảng. Vui lòng bấm sao chép và chạy mã SQL tạo bảng trong phần SQL Editor của Supabase.</p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-slate-950/30 rounded-2xl border border-slate-850 flex items-center justify-center text-slate-500 text-xs font-bold animate-pulse">
                    Đang nạp thông tin kết nối Cơ sở dữ liêu...
                  </div>
                )}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* TAB CONTENT: PRODUCTS AND INITIATIVES MANAGEMENT */}
      {subTab === "products" && (
        <div className="space-y-8 animate-fade-in">
          
          {/* Main header tools */}
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-extrabold text-lg text-slate-900">Danh mục tệp tài nguyên hiện tại</h3>
              <p className="text-slate-400 text-xs">Phục vụ giảng dạy bám sát môn Tin học và HĐTN cấp THCS</p>
            </div>
            
            <div className="flex gap-2 flex-wrap">
              <button 
                onClick={openCreateProduct}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold py-2 px-3.5 rounded-xl text-xs transition-all flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Thêm học liệu
              </button>
              <button 
                onClick={openCreateInit}
                className="bg-purple-600 hover:bg-purple-700 text-white font-extrabold py-2 px-3.5 rounded-xl text-xs transition-all flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Thêm sáng kiến
              </button>
            </div>
          </div>

          {/* List layout products and interactive controls */}
          <div className="space-y-6">
            
            {/* Products Sub-section */}
            <div className="space-y-3 bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2 flex items-center gap-1">
                <Grid className="w-4 h-4 text-indigo-500" /> Các học liệu giáo trình ({products.length})
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600 border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider text-[10px] font-black">
                      <th className="py-3 px-2">Học liệu</th>
                      <th className="py-3 px-2">Bậc môn</th>
                      <th className="py-3 px-2">Đơn giá</th>
                      <th className="py-3 px-2 text-center">Doanh số tải</th>
                      <th className="py-3 px-2 text-right">Tác vụ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((p) => (
                      <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                        <td className="py-3 px-2 max-w-sm">
                          <div className="flex items-center gap-3">
                            <img src={p.image} className="w-10 h-10 object-cover rounded-lg" alt="" />
                            <div>
                              <p className="font-extrabold text-slate-800 leading-tight line-clamp-1">{p.title}</p>
                              <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">{p.type}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-2 font-bold text-slate-700">Môn {p.subject} (Lớp {p.grade})</td>
                        <td className="py-3 px-2 font-black text-indigo-600 text-sm">{p.price.toLocaleString("vi-VN")}đ</td>
                        <td className="py-3 px-2 font-bold text-center text-slate-500">{p.sales || 0} lượt</td>
                        <td className="py-3 px-2">
                          <div className="flex items-center justify-end gap-1.5">
                            <button 
                              onClick={() => openEditProduct(p)}
                              className="text-indigo-600 hover:bg-indigo-50 p-1.5 rounded-lg transition-all"
                              title="Sửa"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDeleteProduct(p.id)}
                              className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-all"
                              title="Xóa"
                            >
                              <Trash className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Initiatives Sub-section */}
            <div className="space-y-3 bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2 flex items-center gap-1">
                <FileText className="w-4 h-4 text-purple-500" /> Tài liệu sáng kiến kinh nghiệm cấp cơ sở ({initiatives.length})
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600 border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider text-[10px] font-black">
                      <th className="py-3 px-2">Tiêu đề sáng kiến</th>
                      <th className="py-3 px-2">Hạng học cấp</th>
                      <th className="py-3 px-2">Giá tệp</th>
                      <th className="py-3 px-2 text-center">Tổng tải về</th>
                      <th className="py-3 px-2 text-right">Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {initiatives.map((item) => (
                      <tr key={item.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                        <td className="py-3 px-2 max-w-sm">
                          <p className="font-extrabold text-slate-800 leading-snug line-clamp-1">{item.title}</p>
                          <p className="text-[10px] text-slate-400 italic">Tác giả: {item.author}</p>
                        </td>
                        <td className="py-3 px-2 font-bold text-slate-700">{item.category}</td>
                        <td className="py-3 px-2 font-black text-indigo-600 text-sm">{item.price.toLocaleString("vi-VN")}đ</td>
                        <td className="py-3 px-2 font-bold text-center text-slate-500">{item.downloads || 0} lượt</td>
                        <td className="py-3 px-2">
                          <div className="flex items-center justify-end gap-1.5">
                            <button 
                              onClick={() => openEditInit(item)}
                              className="text-indigo-600 hover:bg-indigo-50 p-1.5 rounded-lg transition-all"
                              title="Sửa"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDeleteInitiative(item.id)}
                              className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-all"
                              title="Xóa"
                            >
                              <Trash className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

          {/* PRODUCT FORM MODAL popup */}
          {showProductForm && (
            <div className="fixed inset-0 z-55 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white rounded-[32px] border border-slate-100 max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
                
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                  <h3 className="font-black text-slate-900 text-sm uppercase flex items-center gap-1.5">
                    <Grid className="w-5 h-5 text-indigo-600" />
                    {formMode === "create" ? "Thêm học liệu GDPT 2018 mới" : "Chỉnh sửa thông số học liệu"}
                  </h3>
                  <button onClick={() => setShowProductForm(false)} className="bg-slate-100 p-1.5 rounded-xl">
                    <X className="w-4 h-4 text-slate-600" />
                  </button>
                </div>

                {/* Scrollable form body */}
                <form onSubmit={handleSubmitProduct} className="flex-grow overflow-y-auto pr-1 space-y-4 text-left scrollbar-none">
                  
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Tiêu đề học liệu (Chuẩn 2018)</label>
                    <input 
                      type="text" 
                      required
                      placeholder="Ví dụ: Slide ppt môn Tin Học 6..."
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3.5 py-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Môn bộ</label>
                      <select 
                        value={formSubject}
                        onChange={(e) => setFormSubject(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-700"
                      >
                        <option value="Tin học">Tin học</option>
                        <option value="Hoạt động trải nghiệm">Hoạt động trải nghiệm</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Phân loại tệp gốc</label>
                      <select 
                        value={formType}
                        onChange={(e) => setFormType(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-700"
                      >
                        <option value="Giáo án Word">Giáo án Word</option>
                        <option value="Giáo án điện tử">Giáo án điện tử (PowerPoint)</option>
                        <option value="Video">Video hỗ trợ bài học</option>
                        <option value="Phiếu bài tập">Phiếu bài tập</option>
                        <option value="Ngân hàng đề">Ngân hàng đề kiểm tra</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Khối lớp học</label>
                      <input 
                        type="number" 
                        required
                        min={6}
                        max={9}
                        value={formGrade}
                        onChange={(e) => setFormGrade(Number(e.target.value))}
                        className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-700"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Đơn giá bán tệp (đ)</label>
                      <input 
                        type="number" 
                        required
                        min={0}
                        value={formPrice}
                        onChange={(e) => setFormPrice(Number(e.target.value))}
                        className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-700"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Giá gốc chưa giảm (đ)</label>
                      <input 
                        type="number" 
                        required
                        min={0}
                        value={formOriginalPrice}
                        onChange={(e) => setFormOriginalPrice(Number(e.target.value))}
                        className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-700"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Phân loại nhãn dán</label>
                      <select
                        value={formTag}
                        onChange={(e) => setFormTag(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-700"
                      >
                        <option value="new">Học liệu mới (New)</option>
                        <option value="best-seller">Học liệu bán chạy (Best Seller)</option>
                        <option value="free">Học liệu tải miễn phí (Free)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Đường dẫn ảnh bìa học liệu</label>
                      <input 
                        type="text" 
                        placeholder="Link ảnh Unsplash..."
                        value={formImage}
                        onChange={(e) => setFormImage(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3.5 py-2 text-xs font-medium focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Mô tả tóm tắt giá trị học liệu</label>
                    <textarea 
                      rows={3}
                      required
                      placeholder="Ghi rõ chi tiết về file word/bài giảng ppt để thầy cô tin tưởng..."
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3.5 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  {/* Document File uploading or URL attachment */}
                  <div className="space-y-3.5 border border-slate-100 p-4 rounded-2xl bg-indigo-50/20">
                    <span className="text-[10px] font-black text-indigo-700 uppercase tracking-wider block mb-1 flex items-center gap-1">
                      <Paperclip className="w-3.5 h-3.5" /> ĐÍNH KÈM TỆP HỌC LIỆU GỐC (.DOCX, .PPTX, .PDF, .ZIP)
                    </span>
                    <p className="text-[10px] text-indigo-500 leading-normal font-semibold mb-2">Thầy cô đính kèm tệp tài nguyên thực tế để lưu vào hệ cơ sở dữ liệu. Có thể tải lên trực tiếp hoặc dán đường dẫn tải trực tiếp (Drive, Dropbox...).</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Way 1: Upload from computer */}
                      <div className="space-y-1 bg-white/50 p-2.5 rounded-xl border border-indigo-100/60">
                        <span className="text-[9px] text-indigo-755 font-black block mb-1">👉 CÁCH 1: TẢI TỪ MÁY TÍNH</span>
                        {formFileName && (formFileData && formFileData.startsWith("data:")) ? (
                          <div className="bg-white p-2 rounded-xl border border-indigo-100 flex items-center justify-between text-[11px] gap-1 shadow-sm">
                            <span className="font-extrabold text-slate-850 line-clamp-1 max-w-[120px]" title={formFileName}>📄 {formFileName}</span>
                            <button 
                              type="button" 
                              onClick={() => { setFormFileData(""); setFormFileName(""); }}
                              className="text-red-500 hover:text-red-700 font-bold text-[10px] shrink-0"
                            >
                              Xóa
                            </button>
                          </div>
                        ) : (
                          <div className="relative border border-indigo-200 bg-white hover:bg-indigo-50/30 transition-all rounded-xl p-2.5 text-center flex flex-col items-center justify-center cursor-pointer">
                            <input
                              type="file"
                              accept=".doc,.docx,.ppt,.pptx,.pdf,.zip"
                              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onload = (event) => {
                                    if (event.target?.result) {
                                      setFormFileData(event.target.result as string);
                                      setFormFileName(file.name);
                                      showToast(`✓ Đã nạp tệp: ${file.name}`);
                                    }
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                            />
                            <p className="text-[10px] font-black text-indigo-950">Chọn từ máy tính...</p>
                          </div>
                        )}
                      </div>

                      {/* Way 2: Paste link */}
                      <div className="space-y-1 bg-white/50 p-2.5 rounded-xl border border-indigo-100/60">
                        <span className="text-[9px] text-indigo-755 font-black block mb-1">👉 CÁCH 2: DÁN LIÊN KẾT TẢI TỆP</span>
                        <input
                          type="text"
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-550 text-slate-850 placeholder-slate-400"
                          placeholder="https://drive.google.com/..."
                          value={(formFileData && !formFileData.startsWith("data:")) ? formFileData : ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            setFormFileData(val);
                            if (val) {
                              try {
                                const urlObj = new URL(val);
                                const pathName = urlObj.pathname;
                                const lastPart = pathName.substring(pathName.lastIndexOf("/") + 1);
                                if (lastPart && lastPart.includes(".")) {
                                  setFormFileName(lastPart);
                                } else {
                                  setFormFileName("tai_lieu_goc_dinh_kem.zip");
                                }
                              } catch {
                                setFormFileName("tai_lieu_goc_dinh_kem.zip");
                              }
                            } else {
                              setFormFileName("");
                            }
                          }}
                        />
                      </div>
                    </div>

                    {formFileName && (
                      <div className="bg-emerald-50 text-emerald-850 p-2 rounded-xl text-[11px] font-bold border border-emerald-110 flex items-center gap-1.5">
                        <span>✓ Đã liên kết tài nguyên gốc: </span>
                        <span className="underline font-extrabold">{formFileName}</span>
                        <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded ml-auto">
                          {(formFileData && formFileData.startsWith("data:")) ? "Nhập từ máy tính" : "Nhập từ Cloud Link"}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Supabase SQL query command generator */}
                  <div className="space-y-1 bg-slate-900 text-slate-200 p-4 rounded-2xl border border-slate-800 text-left font-mono">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 mb-2">
                      <span className="text-[10px] text-amber-500 font-extrabold uppercase tracking-wider flex items-center gap-1">
                        💾 CÂU LỆNH SQL SUPABASE TƯƠNG ỨNG
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const sqlText = (() => {
                            const finalId = formMode === "edit" ? selectedProductId : "prod-" + Date.now();
                            const finalImage = formImage || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500&auto=format&fit=crop&q=60";
                            const safeTitle = (formTitle || "").replace(/'/g, "''");
                            const safeDesc = (formDescription || "").replace(/'/g, "''");
                            const safeFileName = (formFileName || "").replace(/'/g, "''");
                            const safeFileDataSnippet = formFileData ? (formFileData.startsWith("data:") ? "[DỮ LIỆU FILE BASE64]" : formFileData.replace(/'/g, "''")) : "";

                            if (formMode === "create") {
                              return `INSERT INTO products (id, title, subject, grade, type, price, original_price, rating, sales, tag, is_free, image, description, file_data, file_name)
VALUES (
  '${finalId}',
  '${safeTitle}',
  '${formSubject}',
  ${formGrade},
  '${formType}',
  ${formPrice},
  ${formOriginalPrice},
  5.0,
  0,
  '${formTag}',
  ${formPrice === 0},
  '${finalImage}',
  '${safeDesc}',
  '${safeFileDataSnippet}',
  '${safeFileName}'
);`;
                            } else {
                              return `UPDATE products 
SET 
  title = '${safeTitle}',
  subject = '${formSubject}',
  grade = ${formGrade},
  type = '${formType}',
  price = ${formPrice},
  original_price = ${formOriginalPrice},
  tag = '${formTag}',
  is_free = ${formPrice === 0},
  image = '${finalImage}',
  description = '${safeDesc}',
  file_data = '${safeFileDataSnippet}',
  file_name = '${safeFileName}'
WHERE id = '${finalId}';`;
                            }
                          })();
                          navigator.clipboard.writeText(sqlText);
                          showToast("📋 Đã sao chép SQL vào khay nhớ tạm!");
                        }}
                        className="text-[9px] bg-indigo-950 text-indigo-300 border border-indigo-900 px-2 py-1 rounded hover:bg-indigo-900 hover:text-white transition-all shrink-0 cursor-pointer font-bold"
                      >
                        Sao chép câu lệnh
                      </button>
                    </div>
                    <div className="text-[10px] overflow-x-auto max-h-[140px] leading-relaxed text-slate-350 select-all p-1 whitespace-pre-wrap">
                      {(() => {
                        const finalId = formMode === "edit" ? selectedProductId : "prod_tu_dong";
                        const finalImage = formImage ? (formImage.length > 30 ? formImage.substring(0, 30) + "..." : formImage) : "https://...";
                        const safeTitle = (formTitle || "").replace(/'/g, "''");
                        const safeDesc = formDescription ? (formDescription.length > 50 ? formDescription.substring(0, 50).replace(/'/g, "''") + "..." : formDescription.replace(/'/g, "''")) : "";
                        const safeFileName = (formFileName || "").replace(/'/g, "''");
                        const safeFileDataSnippet = formFileData ? (formFileData.startsWith("data:") ? "[Tệp Base64 chuyển đổi]" : formFileData.replace(/'/g, "''")) : "";

                        if (formMode === "create") {
                          return `INSERT INTO products (id, title, subject, grade, type, price, original_price, rating, sales, tag, is_free, image, description, file_data, file_name) \nVALUES ('${finalId}', '${safeTitle}', '${formSubject}', ${formGrade}, '${formType}', ${formPrice}, ${formOriginalPrice}, 5.0, 0, '${formTag}', ${formPrice === 0}, '${finalImage}', '${safeDesc}', '${safeFileDataSnippet ? "[BINARY_OR_URL]" : ""}', '${safeFileName}');`;
                        } else {
                          return `UPDATE products SET title='${safeTitle}', subject='${formSubject}', grade=${formGrade}, type='${formType}', price=${formPrice}, original_price=${formOriginalPrice}, tag='${formTag}', image='${finalImage}', description='${safeDesc}', file_data='${safeFileDataSnippet ? "[BINARY_OR_URL]" : ""}', file_name='${safeFileName}' WHERE id='${finalId}';`;
                        }
                      })()}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex gap-2 justify-end">
                    <button 
                      type="button" 
                      onClick={() => setShowProductForm(false)}
                      className="bg-slate-100 text-slate-600 hover:bg-slate-200 font-extrabold px-5 py-2.5 rounded-xl text-xs"
                    >
                      Hủy bỏ
                    </button>
                    <button 
                      type="submit" 
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold px-6 py-2.5 rounded-xl text-xs shadow-md shadow-indigo-600/10"
                    >
                      {formMode === "create" ? "Xác nhận tạo" : "Lưu thay đổi"}
                    </button>
                  </div>

                </form>

              </div>
            </div>
          )}

          {/* INITIATIVE FORM MODAL popup */}
          {showInitForm && (
            <div className="fixed inset-0 z-55 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white rounded-[32px] border border-slate-100 max-w-xl w-full p-6 sm:p-8 shadow-2xl relative overflow-hidden text-left">
                
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                  <h3 className="font-black text-slate-900 text-sm uppercase flex items-center gap-1.5">
                    <FileText className="w-5 h-5 text-purple-600" />
                    {initFormMode === "create" ? "Đăng ký sáng kiến kinh nghiệm mới" : "Chỉnh sửa sáng kiến"}
                  </h3>
                  <button onClick={() => setShowInitForm(false)} className="bg-slate-100 p-1.5 rounded-xl">
                    <X className="w-4 h-4 text-slate-600" />
                  </button>
                </div>

                <form onSubmit={handleSubmitInit} className="space-y-4">
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Cấp bậc</label>
                      <select 
                        value={initCategory}
                        onChange={(e) => setInitCategory(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-750"
                      >
                        <option value="Bậc THCS">Bậc THCS</option>
                        <option value="Tiểu học">Bậc Tiểu học</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Định giá tệp (đ)</label>
                      <input 
                        type="number" 
                        required
                        min={0}
                        value={initPrice}
                        onChange={(e) => setInitPrice(Number(e.target.value))}
                        className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-700"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Tiêu đề đề tài sáng kiến</label>
                    <input 
                      type="text" 
                      required
                      placeholder="Ví dụ: Đổi mới kịch bản sinh hoạt dưới cờ hiệu quả..."
                      value={initTitle}
                      onChange={(e) => setInitTitle(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3.5 py-2.5 text-xs font-medium focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Tác giả biên soạn (Học vị - Đơn vị công tác)</label>
                    <input 
                      type="text" 
                      required
                      placeholder="Ví dụ: Trần Thị Bình - GV Trường THCS Nguyễn Trãi"
                      value={initAuthor}
                      onChange={(e) => setInitAuthor(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3.5 py-2.5 text-xs font-medium focus:outline-none"
                    />
                  </div>

                  <div className="space-y-3.5 border border-slate-100 p-4 rounded-2xl bg-indigo-50/20">
                    <span className="text-[10px] font-black text-indigo-700 uppercase tracking-wider block mb-1 flex items-center gap-1">
                      <Image className="w-3.5 h-3.5" /> ẢNH NỀN THUMBNAIL SÁNG KIẾN
                    </span>
                    <p className="text-[10px] text-indigo-500 leading-normal font-semibold mb-2">Thầy cô chọn tải lên ảnh đại diện từ máy tính hoặc dán đường dẫn ảnh trực tuyến để tối ưu hiển thị.</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Way 1: Upload from computer */}
                      <div className="space-y-1 bg-white/50 p-2.5 rounded-xl border border-indigo-100/60">
                        <span className="text-[9px] text-indigo-755 font-black block mb-1 flex items-center gap-1">
                          <UploadCloud className="w-3 h-3" /> CÁCH 1: TẢI TỪ MÁY TÍNH
                        </span>
                        {initImage && initImage.startsWith("data:") ? (
                          <div className="bg-white p-2 rounded-xl border border-indigo-100 flex items-center justify-between text-[11px] gap-1 shadow-sm">
                            <span className="font-extrabold text-slate-850 line-clamp-1 max-w-[120px]">📄 Ảnh đã tải lên</span>
                            <button 
                              type="button" 
                              onClick={() => { setInitImage(""); }}
                              className="text-red-500 hover:text-red-700 font-bold text-[10px] shrink-0"
                            >
                              Xóa
                            </button>
                          </div>
                        ) : (
                          <div className="relative border border-indigo-200 bg-white hover:bg-indigo-50/30 transition-all rounded-xl p-2.5 text-center flex flex-col items-center justify-center cursor-pointer">
                            <input
                              type="file"
                              accept="image/*"
                              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onload = (event) => {
                                    if (event.target?.result) {
                                      setInitImage(event.target.result as string);
                                      showToast(`✓ Đã nạp ảnh: ${file.name}`);
                                    }
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                            />
                            <p className="text-[10px] font-black text-indigo-950">Chọn từ máy tính...</p>
                          </div>
                        )}
                      </div>

                      {/* Way 2: Paste link */}
                      <div className="space-y-1 bg-white/50 p-2.5 rounded-xl border border-indigo-100/60">
                        <span className="text-[9px] text-indigo-755 font-black block mb-1 flex items-center gap-1">
                          <Link className="w-3 h-3" /> CÁCH 2: DÂN LIÊN KẾT ẢNH
                        </span>
                        <input
                          type="text"
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-550 text-slate-850 placeholder-slate-400"
                          placeholder="https://images.unsplash.com/..."
                          value={(initImage && !initImage.startsWith("data:")) ? initImage : ""}
                          onChange={(e) => {
                            setInitImage(e.target.value);
                          }}
                        />
                      </div>
                    </div>

                    {initImage && (
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center gap-3">
                        <div className="w-12 h-12 bg-white border border-slate-200 rounded-lg overflow-hidden shrink-0">
                          <img src={initImage} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                        <div className="text-[11px] leading-tight space-y-0.5 overflow-hidden">
                          <p className="font-extrabold text-slate-800">Hình ảnh xem trước</p>
                          <p className="text-slate-400 font-medium line-clamp-1 text-[10px] max-w-[200px]">
                            {initImage.startsWith("data:") ? "Ảnh từ thiết bị của bạn" : initImage}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setInitImage("")}
                          className="text-[10px] font-black text-slate-400 hover:text-red-500 ml-auto border border-slate-200 hover:border-red-200 px-2 py-1 rounded bg-white"
                        >
                          Xóa ảnh
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Mô tả về sáng kiến và hiệu suất ứng dụng</label>
                    <textarea 
                      rows={3}
                      required
                      placeholder="Trình bày sơ lược cách giáo viên vượt qua các hội đồng chấm công tác thi đua..."
                      value={initDesc}
                      onChange={(e) => setInitDesc(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3.5 py-2 text-xs font-medium focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex gap-2 justify-end">
                    <button 
                      type="button" 
                      onClick={() => setShowInitForm(false)}
                      className="bg-slate-100 text-slate-600 hover:bg-slate-200 font-extrabold px-5 py-2.5 rounded-xl text-xs"
                    >
                      Quay lại
                    </button>
                    <button 
                      type="submit" 
                      className="bg-purple-600 hover:bg-purple-700 text-white font-extrabold px-6 py-2.5 rounded-xl text-xs shadow-md"
                    >
                      {initFormMode === "create" ? "Xác nhận thêm" : "Lưu dữ liệu"}
                    </button>
                  </div>

                </form>

              </div>
            </div>
          )}

        </div>
      )}

      {/* TAB CONTENT: ORDER CONFIRMATION AND STATUS CONTROL */}
      {subTab === "orders" && (
        <div className="space-y-6 animate-fade-in text-left">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-extrabold text-lg text-slate-900">Yêu cầu thanh toán tải file của giáo viên</h3>
            <p className="text-slate-400 text-xs">Vui lòng rà soát tài khoản ngân hàng chuyển khoản đúng nội dung trước khi bấm "Phê duyệt (Duyệt tải)"</p>
          </div>

          {loadingOrders ? (
            <div className="text-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto" />
              <p className="text-slate-400 text-xs mt-2">Đang nạp danh sách đơn hàng chuyển khoản...</p>
            </div>
          ) : orders.length > 0 ? (
            <div className="space-y-4">
              {orders.map((order) => (
                <div 
                  key={order.id} 
                  className={`bg-white p-5 rounded-3xl border ${order.status === "pending" ? "border-amber-200 bg-amber-50/5" : "border-slate-100"} shadow-sm text-xs text-slate-600 space-y-4 text-left`}
                >
                  
                  {/* Status header area */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Mã giao dịch</span>
                      <strong className="text-slate-900 text-sm font-extrabold">{order.id}</strong>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${order.status === "paid" ? "bg-green-50 text-green-600" : order.status === "declined" ? "bg-red-50 text-red-500" : "bg-amber-50 text-amber-600 animate-pulse"}`}>
                        {order.status === "paid" ? "✓ Đã thanh toán (Duyệt tải)" : order.status === "declined" ? "✗ Đã hủy" : "⏰ Chờ xác nhận chuyển khoản"}
                      </span>
                      <button
                        onClick={() => handleDeleteOrder(order.id)}
                        disabled={actionLoading === order.id + "-del"}
                        className="hover:bg-red-50 text-red-500 p-1 rounded-lg transition-all"
                        title="Xóa vĩnh viễn"
                      >
                        <Trash className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Buyer detail area */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-3.5 rounded-2xl">
                    <p className="flex items-center gap-1.5 font-semibold text-slate-700">
                      <User className="w-4 h-4 text-slate-400" />
                      <span>{order.buyerName}</span>
                    </p>
                    <p className="flex items-center gap-1.5 font-semibold text-slate-700">
                      <Mail className="w-4 h-4 text-slate-400" />
                      <span>{order.buyerEmail}</span>
                    </p>
                    <p className="flex items-center gap-1.5 font-semibold text-slate-700">
                      <Phone className="w-4 h-4 text-slate-400" />
                      <span>{order.buyerPhone || "Không có SĐT"}</span>
                    </p>
                  </div>

                  {/* Purchased resources table */}
                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Danh sách học liệu mua quyền tải:</p>
                    <div className="space-y-1.5">
                      {order.items.map((item: any, i) => (
                        <div key={i} className="flex justify-between items-center bg-slate-50/50 px-3 py-2 rounded-xl">
                          <span className="font-extrabold text-slate-800 shrink-0 select-all max-w-[280px] sm:max-w-md truncate">{item.title}</span>
                          <span className="font-bold text-slate-500">{item.price.toLocaleString("vi-VN")}đ</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action approval buttons */}
                  <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-baseline gap-1.5 text-left leading-none">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Tổng giá trị đơn:</span>
                      <strong className="text-base font-black text-indigo-600">{order.totalAmount.toLocaleString("vi-VN")}đ</strong>
                    </div>

                    {order.status === "pending" && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleUpdateOrderStatus(order.id, "declined")}
                          disabled={actionLoading !== null}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold px-4 py-2 rounded-xl text-xs transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" /> Hủy bỏ hóa đơn
                        </button>
                        <button
                          onClick={() => handleUpdateOrderStatus(order.id, "paid")}
                          disabled={actionLoading !== null}
                          className="bg-green-600 hover:bg-green-700 text-white font-extrabold px-4 py-2 rounded-xl text-xs transition-all flex items-center gap-1.5 shadow-md cursor-pointer"
                        >
                          {actionLoading === order.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Check className="w-3.5 h-3.5" />
                          )}
                          Duyệt Đã Chuyển Khoản
                        </button>
                      </div>
                    )}
                  </div>

                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white p-12 rounded-[32px] border border-slate-100 text-center shadow-sm max-w-sm mx-auto space-y-3">
              <div className="bg-slate-50 p-4 rounded-full w-fit mx-auto text-slate-300">
                <ShoppingCart className="w-8 h-8" />
              </div>
              <p className="font-extrabold text-slate-800 text-xs">Chưa có giao dịch tệp nào</p>
              <p className="text-[10px] text-slate-400">Các hóa đơn mua học liệu có phí của giáo viên sẽ hiển thị tại đây.</p>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: FEEDBACKS GUEST BOOK */}
      {subTab === "feedbacks" && (
        <div className="space-y-6 animate-fade-in text-left">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-extrabold text-lg text-slate-900">Danh sách ý kiến & Đóng góp ý tưởng giáo dục</h3>
            <p className="text-slate-400 text-xs">Các đóng góp quý báu từ thầy cô trên khắp cả nước nhằm phát triển kho học liệu 4.0</p>
          </div>

          {loadingFeedbacks ? (
            <div className="text-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto" />
            </div>
          ) : feedbacks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {feedbacks.map((fb) => (
                <div key={fb.id} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-3 text-left">
                  <div className="flex items-center justify-between border-b border-slate-50 pb-2">
                    <div>
                      <p className="font-extrabold text-slate-800 text-xs sm:text-sm">{fb.name}</p>
                      <p className="text-[10px] text-slate-400 font-medium">{fb.email}</p>
                    </div>
                    <span className="text-[10px] text-slate-400 font-bold">{new Date(fb.createdAt).toLocaleDateString("vi-VN")}</span>
                  </div>
                  <p className="text-slate-600 text-xs leading-relaxed font-semibold">"{fb.msg}"</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white p-12 rounded-[32px] border border-slate-100 text-center shadow-sm max-w-sm mx-auto space-y-3">
              <div className="bg-slate-50 p-4 rounded-full w-fit mx-auto text-slate-300">
                <MessageSquare className="w-8 h-8" />
              </div>
              <p className="font-extrabold text-slate-800 text-xs">Hòm thư góp ý trống</p>
              <p className="text-[10px] text-slate-400 font-medium">Chưa nhận được phản hồi góp ý từ giáo viên nào.</p>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: SECURITY & PASSWORD CHANGE */}
      {subTab === "settings" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start animate-fade-in">
          
          {/* LEFT COLUMN: CHANGE PASSWORD FOR CURRENT USER */}
          <div className="bg-white p-6 sm:p-8 rounded-[32px] border border-slate-100 shadow-sm space-y-6 text-left">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-lg text-slate-900 flex items-center gap-2">
                <Lock className="w-5 h-5 text-indigo-600" /> Đổi mật khẩu tài khoản Quản trị
              </h3>
              <p className="text-slate-400 text-xs font-semibold">Thầy cô quản trị viên có quyền hạn tối cao thay đổi mật khẩu truy cập hệ thống để bảo vệ cơ sở dữ liệu.</p>
            </div>

            {pwError && (
              <div className="bg-red-50 text-red-600 p-4 rounded-2xl border border-red-100 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4.5 h-4.5 shrink-0" />
                <span>{pwError}</span>
              </div>
            )}

            {pwSuccess && (
              <div className="bg-green-50 text-emerald-700 p-4 rounded-2xl border border-green-150 text-xs font-semibold flex items-center gap-2">
                <CheckCircle className="w-4.5 h-4.5 shrink-0" />
                <span>{pwSuccess}</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-indigo-700 uppercase tracking-widest block">Chọn tài khoản Quản trị cần đổi mật khẩu</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4.5 h-4.5 pointer-events-none" />
                  <select
                    value={changePasswordUsername}
                    onChange={(e) => setChangePasswordUsername(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-8 py-2.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none cursor-pointer text-slate-800"
                  >
                    {adminAccounts.length > 0 ? (
                      adminAccounts.map((account, idx) => (
                        <option key={idx} value={account.username}>
                          {account.username} (Mật khẩu cũ: {account.password})
                        </option>
                      ))
                    ) : (
                      <option value="admin">admin</option>
                    )}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-slate-400">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Mật khẩu hiện tại</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4.5 h-4.5" />
                  <input 
                    type={showCurrentPassword ? "text" : "password"} 
                    required
                    placeholder="Nhập mật khẩu hiện tại"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-105 rounded-xl pl-10 pr-10 py-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                  >
                    {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Mật khẩu mới</label>
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4.5 h-4.5" />
                    <input 
                      type={showNewPassword ? "text" : "password"} 
                      required
                      placeholder="Mật khẩu mới"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-105 rounded-xl pl-10 pr-10 py-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Xác nhận mật khẩu mới</label>
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4.5 h-4.5" />
                    <input 
                      type={showConfirmPassword ? "text" : "password"} 
                      required
                      placeholder="Nhập lại mật khẩu mới"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-105 rounded-xl pl-10 pr-10 py-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={pwLoading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold py-3 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 shadow-md cursor-pointer disabled:opacity-50"
              >
                {pwLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Đang cập nhật bảo mật...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" /> Xác nhận Thay đổi Mật khẩu
                  </>
                )}
              </button>
            </form>
          </div>

          {/* RIGHT COLUMN: MULTI-ADMIN ACCOUNTS CREATION & MANAGEMENT */}
          <div className="bg-white p-6 sm:p-8 rounded-[32px] border border-slate-100 shadow-sm space-y-6 text-left">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-lg text-slate-900 flex items-center gap-2">
                <User className="w-5 h-5 text-emerald-600" /> Cấp thêm tài khoản Quản trị
              </h3>
              <p className="text-slate-400 text-xs font-semibold">Cấp thêm quyền hạn quản lý cho thầy cô đồng nghiệp truy cập điều hành trang học liệu.</p>
            </div>

            {addAdminError && (
              <div className="bg-red-50 text-red-600 p-4 rounded-2xl border border-red-100 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4.5 h-4.5 shrink-0" />
                <span>{addAdminError}</span>
              </div>
            )}

            {addAdminSuccess && (
              <div className="bg-green-50 text-emerald-700 p-4 rounded-2xl border border-green-150 text-xs font-semibold flex items-center gap-2">
                <CheckCircle className="w-4.5 h-4.5 shrink-0" />
                <span>{addAdminSuccess}</span>
              </div>
            )}

            <form onSubmit={handleCreateAdminAccount} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Tên tài khoản mới</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4.5 h-4.5" />
                    <input 
                      type="text" 
                      required
                      placeholder="ví dụ: admin_tin_hoc"
                      value={newAdminUser}
                      onChange={(e) => setNewAdminUser(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-105 rounded-xl pl-10 pr-3.5 py-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Mật khẩu tài khoản</label>
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4.5 h-4.5" />
                    <input 
                      type={showNewAdminPass ? "text" : "password"} 
                      required
                      placeholder="Mật khẩu mới"
                      value={newAdminPass}
                      onChange={(e) => setNewAdminPass(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-105 rounded-xl pl-10 pr-10 py-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewAdminPass(!showNewAdminPass)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                    >
                      {showNewAdminPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={addAdminLoading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-3 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 shadow-md cursor-pointer disabled:opacity-50"
              >
                {addAdminLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Đang cấp quyền...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" /> Tạo & Cấp quyền tài khoản Admin
                  </>
                )}
              </button>
            </form>

            {/* List of existing administrators */}
            <div className="mt-6 pt-6 border-t border-slate-150 space-y-3">
              <h4 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider block">
                📋 Danh sách Quản trị viên ({adminAccounts.length})
              </h4>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {loadingAdmins ? (
                  <div className="flex justify-center p-4">
                    <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
                  </div>
                ) : adminAccounts.length > 0 ? (
                  adminAccounts.map((account, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-xs font-bold">
                      <div className="space-y-0.5">
                        <p className="text-slate-800">{account.username}</p>
                        <p className="text-[10px] text-slate-400 font-mono">Mật khẩu: {account.password}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteAdminAccount(account.username)}
                        className="bg-red-50 hover:bg-red-100 text-red-600 p-1.5 rounded-lg border border-red-200/50 transition-all cursor-pointer"
                        title="Xóa tài khoản này"
                      >
                        <Trash className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-[10px] text-slate-400 font-medium">Chưa nạp được danh sách tài khoản.</p>
                )}
              </div>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
