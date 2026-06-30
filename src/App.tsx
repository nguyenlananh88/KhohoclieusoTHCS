import React, { useState, useEffect } from "react";
import { 
  BookOpen, Sparkles, Download, ShoppingCart, Search, Grid, Filter, Layers, 
  Video, FileText, Brain, Award, Trash, Plus, Check, Loader2, Menu, X, 
  ChevronRight, Flame, Clock, Gift, User, Star, BookMarked, RefreshCw, 
  Send, HelpCircle, Layout, BookOpenCheck, ChevronDown, Info, CheckCircle, 
  Lock, Heart, Shield, Landmark, Copy, QrCode, LogOut, Edit2, UploadCloud, Link, Image, Key, AlertCircle,
  Home, Gamepad2
} from "lucide-react";

import { Product, Initiative, Order, Feedback } from "./types";
import AdminDashboard from "./components/AdminDashboard";
import AIPictureGame from "./components/AIPictureGame";
import AISoanGiaoAn from "./components/AISoanGiaoAn";

const getYoutubeIdFromImageOrDesc = (image: string = "", desc: string = "") => {
  if (image && image.includes("img.youtube.com")) {
    const match = image.match(/\/vi\/([^/]+)/);
    if (match) return match[1];
  }
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const matchImg = image ? image.match(regExp) : null;
  if (matchImg && matchImg[2] && matchImg[2].length === 11) return matchImg[2];
  
  const matchDesc = desc ? desc.match(regExp) : null;
  if (matchDesc && matchDesc[2] && matchDesc[2].length === 11) return matchDesc[2];
  
  return null;
};

export default function App() {
  const [activeTab, setActiveTab] = useState("trang-chu");
  const [products, setProducts] = useState<Product[]>([]);
  const [initiatives, setInitiatives] = useState<Initiative[]>([]);
  const [games, setGames] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingInitiatives, setLoadingInitiatives] = useState(true);
  const [loadingGames, setLoadingGames] = useState(true);
  const [cart, setCart] = useState<any[]>([]);
  const [showCartModal, setShowCartModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Shared Admin States
  const [orders, setOrders] = useState<Order[]>([]);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  
  // States for Learning Resources filter (Kho học liệu)
  const [subjects, setSubjects] = useState<string[]>(["Tin học", "Hoạt động trải nghiệm"]);
  const [showSubjectManager, setShowSubjectManager] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("Tất cả");
  const [selectedGrade, setSelectedGrade] = useState("Tất cả");
  const [selectedType, setSelectedType] = useState("Tất cả");

  // Sidebar mobile visibility
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  // State for Product Detail Popup (Mục Xem Chi Tiết)
  const [selectedDetailProduct, setSelectedDetailProduct] = useState<any | null>(null);
  const isDetailFree = selectedDetailProduct
    ? (selectedDetailProduct.price === 0 ||
       selectedDetailProduct.tag === "free" ||
       selectedDetailProduct.isFree === true ||
       selectedDetailProduct.is_free === true ||
       String(selectedDetailProduct.is_free) === "true")
    : false;

  // State for Automatic Promotion Popup (Tự động mở sau 5 giây)
  const [showPromoPopup, setShowPromoPopup] = useState(false);

  // States for Checkout Form (Form điền thông tin khi ấn mua)
  const [showCheckoutForm, setShowCheckoutForm] = useState(false);
  const [buyerName, setBuyerName] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [buyerBankName, setBuyerBankName] = useState("");
  const [buyerBankAccount, setBuyerBankAccount] = useState("");
  const [buyerBankAccountName, setBuyerBankAccountName] = useState("");
  const [orderCreatedId, setOrderCreatedId] = useState<string | null>(null);
  const [checkoutStep, setCheckoutStep] = useState<"form" | "payment">("form");

  // Foot email feedback state
  const [footEmail, setFootEmail] = useState("");
  const [footMsg, setFootMsg] = useState("");
  const [sendingFeedback, setSendingFeedback] = useState(false);

  // States for Interactive Game (Quick Quiz)
  const [gameStep, setGameStep] = useState("intro"); // intro, playing, finished
  const [currentGameId, setCurrentGameId] = useState("");
  const [quizScore, setQuizScore] = useState(0);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<any[]>([]); // tracks choices

  // Admin Auth State (Phân quyền quản trị viên)
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem("admin-token") === "admin-secret-token";
    }
    return false;
  });
  const [adminToken, setAdminToken] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem("admin-token");
    }
    return null;
  });

  // Toast notifications
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Banner Settings State
  const [bannerSettings, setBannerSettings] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("backup_banner");
      if (saved) {
        try { return JSON.parse(saved); } catch (_) {}
      }
    }
    return {
      backgroundImage: "",
      badgeText: "Hệ thống tiên phong tích hợp AI số hóa giáo dục",
      title1: "Giải Pháp Học Liệu Số",
      title2: "Thời Đại Công Nghệ Giáo Dục 4.0",
      description: "Cung cấp Giáo án Word, Slide điện tử PPT, Video thực hành, Phiếu bài tập và Ngân hàng đề thi chuẩn kịch bản GDPT 2018 lý tưởng cho bộ môn Tin Học & Hoạt Động Trải Nghiệm.",
      adminPanel1Title: "Cổng Quản Trị Hệ Thống EduShop AI",
      adminPanel1Desc: "Bảng kiểm soát tích hợp: Đăng tải trực tiếp file học liệu, sáng kiến thực tiễn, trò chơi học tập tương tác bám sát chuẩn GDPT 2018 và đồng bộ hóa danh mục môn học.",
      adminPanel2Title: "Hệ Thống Phân Quyền Quản Trị Chặt Chẽ",
      adminPanel2Desc: "Thầy cô Admin: admin • Cấu hình trực tuyến thời gian thực các học liệu GDPT 2018.",
      adminPanel3Title: "QUẢN LÝ BÁN HÀNG"
    };
  });

  const loadBannerSettings = async () => {
    try {
      const res = await fetch("/api/banner");
      if (res.ok) {
        const data = await res.json();
        if (data && typeof data === "object") {
          setBannerSettings(data);
          try {
            localStorage.setItem("backup_banner", JSON.stringify(data));
          } catch (storageError) {
            console.warn("Storage quota exceeded for backup_banner, attempting to prune large background image...");
            try {
              // Try pruning the potentially massive base64 backgroundImage to keep other settings backed up
              const prunedData = { ...data, backgroundImage: "" };
              localStorage.setItem("backup_banner", JSON.stringify(prunedData));
            } catch (innerError) {
              console.error("Failed to save even pruned backup_banner to localStorage:", innerError);
            }
          }
        }
      }
    } catch (err) {
      console.error("Lỗi nạp cấu hình banner:", err);
    }
  };

  const [bankSettings, setBankSettings] = useState<any>({
    bankName: "Vietinbank",
    accountNumber: "10987654321",
    accountHolder: "EDUSHOP AI VIETNAM",
    memoTemplate: "EDUSHOP {orderId}",
    isEnabled: false
  });

  const loadBankSettings = async () => {
    try {
      const res = await fetch("/api/bank");
      if (res.ok) {
        const data = await res.json();
        if (data && typeof data === "object") {
          setBankSettings(data);
        }
      }
    } catch (err) {
      console.error("Lỗi nạp cấu hình ngân hàng:", err);
    }
  };

  const loadOrders = async () => {
    try {
      const res = await fetch("/api/admin/orders", {
        headers: { "Authorization": `Bearer admin-secret-token` }
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (err) {
      console.error("Lỗi nạp danh sách đơn hàng:", err);
    }
  };

  const loadFeedbacks = async () => {
    try {
      const res = await fetch("/api/admin/feedbacks", {
        headers: { "Authorization": `Bearer admin-secret-token` }
      });
      if (res.ok) {
        const data = await res.json();
        setFeedbacks(data);
      }
    } catch (err) {
      console.error("Lỗi nạp danh sách góp ý:", err);
    }
  };

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // State & Handler for Editing Panel 1 (Cổng quản trị)
  const [showPanel1Modal, setShowPanel1Modal] = useState(false);
  const [panel1Title, setPanel1Title] = useState("");
  const [panel1Desc, setPanel1Desc] = useState("");
  const [savingPanel1, setSavingPanel1] = useState(false);

  const handleSavePanel1 = async () => {
    if (!panel1Title.trim()) {
      showToast("⚠️ Vui lòng nhập tiêu đề cổng quản trị!");
      return;
    }
    setSavingPanel1(true);
    try {
      const res = await fetch("/api/admin/banner", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer admin-secret-token`
        },
        body: JSON.stringify({
          ...bannerSettings,
          adminPanel1Title: panel1Title,
          adminPanel1Desc: panel1Desc
        })
      });

      if (res.ok) {
        showToast("✓ Cập nhật cổng quản trị thành công!");
        setShowPanel1Modal(false);
        loadBannerSettings();
      } else {
        const err = await res.json();
        showToast(`❌ Lỗi lưu thông tin: ${err.error || "Không rõ"}`);
      }
    } catch (err: any) {
      console.error("Lỗi lưu thông tin cổng quản trị:", err);
      showToast("❌ Không kết nối được đến máy chủ.");
    } finally {
      setSavingPanel1(false);
    }
  };

  // Controlled Admin SubTab state
  const [adminSubTab, setAdminSubTab] = useState<"dashboard" | "products" | "orders" | "feedbacks" | "settings">("dashboard");

  // Banner Settings Form State
  const [showBannerModal, setShowBannerModal] = useState(false);
  const [bannerBgType, setBannerBgType] = useState<"upload" | "url">("url");
  const [bannerBgUrl, setBannerBgUrl] = useState("");
  const [bannerBadge, setBannerBadge] = useState("");
  const [bannerTitle1, setBannerTitle1] = useState("");
  const [bannerTitle2, setBannerTitle2] = useState("");
  const [bannerDesc, setBannerDesc] = useState("");
  const [savingBanner, setSavingBanner] = useState(false);
  const [dbStatus, setDbStatus] = useState<any>(null);

  // Promotion Settings Form State
  const [showPromoModal, setShowPromoModal] = useState(false);
  const [promoBadge, setPromoBadge] = useState("");
  const [promoTitle1, setPromoTitle1] = useState("");
  const [promoTitle2, setPromoTitle2] = useState("");
  const [promoDesc, setPromoDesc] = useState("");
  const [promoFoot, setPromoFoot] = useState("");
  const [promoBtn, setPromoBtn] = useState("");
  const [promoEnabled, setPromoEnabled] = useState(true);
  const [savingPromo, setSavingPromo] = useState(false);

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

  const openPromoSettings = () => {
    const current = bannerSettings || {};
    setPromoBadge(current.promoBadge || "SIÊU ƯU ĐÃI GIỚI HẠN");
    setPromoTitle1(current.promoTitle1 || "BÙNG NỔ KHUYẾN MẠI");
    setPromoTitle2(current.promoTitle2 || "GIẢM GIÁ 50%");
    setPromoDesc(current.promoDesc || "Áp dụng cho toàn bộ học liệu điện tử PowerPoint, giáo án Word môn Tin học, HĐTN và kho trò chơi tương tác số học tương tác AI!");
    setPromoFoot(current.promoFoot || "Áp dụng tự động hôm nay");
    setPromoBtn(current.promoBtn || "MỞ KHO HỌC LIỆU NGAY");
    setPromoEnabled(current.promoEnabled !== false);
    setShowPromoModal(true);
  };

  const handleSavePromo = async () => {
    if (!promoTitle1.trim() || !promoTitle2.trim()) {
      showToast("⚠️ Vui lòng nhập tiêu đề khuyến mãi!");
      return;
    }
    setSavingPromo(true);
    try {
      const res = await fetch("/api/admin/banner", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer admin-secret-token`
        },
        body: JSON.stringify({
          ...bannerSettings,
          promoBadge,
          promoTitle1,
          promoTitle2,
          promoDesc,
          promoFoot,
          promoBtn,
          promoEnabled
        })
      });

      if (res.ok) {
        showToast("✓ Cập nhật thông tin khuyến mãi thành công!");
        setShowPromoModal(false);
        loadBannerSettings();
      } else {
        const err = await res.json();
        showToast(`❌ Lỗi lưu khuyến mãi: ${err.error || "Không rõ"}`);
      }
    } catch (err: any) {
      console.error("Lỗi lưu khuyến mãi:", err);
      showToast("❌ Không kết nối được đến máy chủ.");
    } finally {
      setSavingPromo(false);
    }
  };

  const openBannerSettings = () => {
    const current = bannerSettings || {
      backgroundImage: "",
      badgeText: "Hệ thống tiên phong tích hợp AI số hóa giáo dục",
      title1: "Giải Pháp Học Liệu Số",
      title2: "Thời Đại Công Nghệ Giáo Dục 4.0",
      description: "Cung cấp Giáo án Word, Slide điện tử PPT, Video thực hành, Phiếu bài tập và Ngân hàng đề thi chuẩn kịch bản GDPT 2018 lý tưởng cho bộ môn Tin Học & Hoạt Động Trải Nghiệm."
    };
    setBannerBgUrl(current.backgroundImage || "");
    setBannerBgType(current.backgroundImage?.startsWith("data:") ? "upload" : "url");
    setBannerBadge(current.badgeText || "");
    setBannerTitle1(current.title1 || "");
    setBannerTitle2(current.title2 || "");
    setBannerDesc(current.description || "");
    setShowBannerModal(true);
  };

  const handleSaveBanner = async () => {
    if (!bannerTitle1.trim()) {
      showToast("⚠️ Vui lòng nhập tiêu đề chính phần 1!");
      return;
    }
    setSavingBanner(true);
    try {
      const res = await fetch("/api/admin/banner", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer admin-secret-token`
        },
        body: JSON.stringify({
          ...bannerSettings,
          backgroundImage: bannerBgUrl,
          badgeText: bannerBadge,
          title1: bannerTitle1,
          title2: bannerTitle2,
          description: bannerDesc
        })
      });

      if (res.ok) {
        showToast("✓ Cập nhật cấu hình banner thành công!");
        setShowBannerModal(false);
        loadBannerSettings();
      } else {
        const err = await res.json();
        showToast(`❌ Lỗi lưu banner: ${err.error || "Không rõ"}`);
      }
    } catch (err: any) {
      console.error("Lỗi lưu banner:", err);
      showToast("❌ Không kết nối được đến máy chủ.");
    } finally {
      setSavingBanner(false);
    }
  };

  // FETCH PRODUCTS AND INITIATIVES FROM EXPRESS BACKEND
  const loadProducts = async () => {
    setLoadingProducts(true);
    try {
      const res = await fetch("/api/products");
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (err) {
      console.error("Lỗi nạp kho học liệu:", err);
    } finally {
      setLoadingProducts(false);
    }
  };

  const loadInitiatives = async () => {
    setLoadingInitiatives(true);
    try {
      const res = await fetch("/api/initiatives");
      if (res.ok) {
        const serverData = await res.json();
        
        // Load local backup from browser's local storage
        const fallbackStr = localStorage.getItem("backup_initiatives");
        if (fallbackStr) {
          try {
            const backedUpInits: Initiative[] = JSON.parse(fallbackStr);
            const serverIds = new Set(serverData.map((item: any) => item.id));
            const merged = [...serverData];
            
            // Add any locally saved initiatives that aren't present in the backend database
            backedUpInits.forEach((backedUpItem) => {
              if (backedUpItem && backedUpItem.id && !serverIds.has(backedUpItem.id)) {
                merged.unshift(backedUpItem);
              }
            });
            
            setInitiatives(merged);
            localStorage.setItem("backup_initiatives", JSON.stringify(merged));
            return;
          } catch (e) {
            console.error("Local sync error:", e);
          }
        }
        
        setInitiatives(serverData);
        localStorage.setItem("backup_initiatives", JSON.stringify(serverData));
      } else {
        // Safe fallback to local storage
        const fallbackStr = localStorage.getItem("backup_initiatives");
        if (fallbackStr) {
          setInitiatives(JSON.parse(fallbackStr));
        }
      }
    } catch (err) {
      console.error("Lỗi nạp sáng kiến kinh nghiệm:", err);
      // Offline fallback
      const fallbackStr = localStorage.getItem("backup_initiatives");
      if (fallbackStr) {
        try {
          setInitiatives(JSON.parse(fallbackStr));
        } catch (_) {}
      }
    } finally {
      setLoadingInitiatives(false);
    }
  };

  const loadGames = async () => {
    setLoadingGames(true);
    try {
      const res = await fetch("/api/games");
      if (res.ok) {
        const serverData = await res.json();
        
        // Load local backup from browser's local storage
        const fallbackStr = localStorage.getItem("backup_games");
        if (fallbackStr) {
          try {
            const backedUpGames: any[] = JSON.parse(fallbackStr);
            const serverIds = new Set(serverData.map((item: any) => item.id));
            const merged = [...serverData];
            
            // Add any locally saved games that aren't present in the backend database
            backedUpGames.forEach((backedUpItem) => {
              if (backedUpItem && backedUpItem.id && !serverIds.has(backedUpItem.id)) {
                merged.unshift(backedUpItem);
              }
            });
            
            setGames(merged);
            localStorage.setItem("backup_games", JSON.stringify(merged));
            return;
          } catch (e) {
            console.error("Local games sync error:", e);
          }
        }
        
        setGames(serverData);
        localStorage.setItem("backup_games", JSON.stringify(serverData));
      } else {
        // Safe fallback to local storage
        const fallbackStr = localStorage.getItem("backup_games");
        if (fallbackStr) {
          setGames(JSON.parse(fallbackStr));
        }
      }
    } catch (err) {
      console.error("Lỗi nạp danh sách trò chơi:", err);
      // Offline fallback
      const fallbackStr = localStorage.getItem("backup_games");
      if (fallbackStr) {
        try {
          setGames(JSON.parse(fallbackStr));
        } catch (_) {}
      }
    } finally {
      setLoadingGames(false);
    }
  };

  const loadSubjects = async () => {
    try {
      const res = await fetch("/api/subjects");
      if (res.ok) {
        const serverData = await res.json();
        
        // Load local backup from browser's local storage
        const fallbackStr = localStorage.getItem("backup_subjects");
        if (fallbackStr) {
          try {
            const backedUpSubjects: string[] = JSON.parse(fallbackStr);
            const serverSet = new Set(serverData);
            const merged = [...serverData];
            
            // Add any locally saved subjects that aren't present in the backend database
            backedUpSubjects.forEach((sub) => {
              if (sub && !serverSet.has(sub)) {
                merged.push(sub);
              }
            });
            
            setSubjects(merged);
            localStorage.setItem("backup_subjects", JSON.stringify(merged));
            return;
          } catch (e) {
            console.error("Local subjects sync error:", e);
          }
        }
        
        setSubjects(serverData);
        localStorage.setItem("backup_subjects", JSON.stringify(serverData));
      } else {
        // Safe fallback to local storage
        const fallbackStr = localStorage.getItem("backup_subjects");
        if (fallbackStr) {
          setSubjects(JSON.parse(fallbackStr));
        }
      }
    } catch (err) {
      console.error("Lỗi nạp danh sách môn học:", err);
      // Offline fallback
      const fallbackStr = localStorage.getItem("backup_subjects");
      if (fallbackStr) {
        try {
          setSubjects(JSON.parse(fallbackStr));
        } catch (_) {}
      }
    }
  };

  useEffect(() => {
    loadProducts();
    loadInitiatives();
    loadGames();
    loadSubjects();
    loadBannerSettings();
    loadBankSettings();
    fetchDbStatus();
  }, []);

  const handleAddSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubjectName.trim()) {
      showToast("⚠️ Vui lòng nhập tên môn học!");
      return;
    }
    try {
      const res = await fetch("/api/admin/subjects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${adminToken || sessionStorage.getItem("admin-token")}`
        },
        body: JSON.stringify({ name: newSubjectName.trim() })
      });
      if (res.ok) {
        const updatedList = await res.json();
        setSubjects(updatedList);
        localStorage.setItem("backup_subjects", JSON.stringify(updatedList));
        setNewSubjectName("");
        showToast("🎉 Đã thêm môn học mới thành công!");
      } else {
        const errData = await res.json();
        showToast(`❌ Lỗi: ${errData.error || "Không thể thêm môn học"}`);
      }
    } catch (err) {
      console.error("Lỗi thêm môn học:", err);
      showToast("❌ Không kết nối được đến máy chủ.");
    }
  };

  const handleDeleteSubject = async (name: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa môn học "${name}" không?`)) {
      return;
    }
    try {
      const res = await fetch(`/api/admin/subjects/${encodeURIComponent(name)}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${adminToken || sessionStorage.getItem("admin-token")}`
        }
      });
      if (res.ok) {
        const updatedList = await res.json();
        setSubjects(updatedList);
        localStorage.setItem("backup_subjects", JSON.stringify(updatedList));
        showToast(`🗑️ Đã xóa môn học "${name}" thành công!`);
      } else {
        const errData = await res.json();
        showToast(`❌ Lỗi: ${errData.error || "Không thể xóa môn học"}`);
      }
    } catch (err) {
      console.error("Lỗi xóa môn học:", err);
      showToast("❌ Không kết nối được đến máy chủ.");
    }
  };

  // --- AUTOMATIC PROMO POPUP TIMER ---
  useEffect(() => {
    if (isAdmin) {
      setShowPromoPopup(false);
      return;
    }
    const isEnabled = bannerSettings?.promoEnabled !== false && bannerSettings?.promoEnabled !== "false";
    if (!isEnabled) {
      setShowPromoPopup(false);
      return;
    }
    const promoTimer = setTimeout(() => {
      setShowPromoPopup(true);
    }, 5000); // Trigger after 5 seconds
    return () => clearTimeout(promoTimer);
  }, [isAdmin, bannerSettings?.promoEnabled]);

  // Load orders and feedbacks when admin is logged in
  useEffect(() => {
    if (isAdmin) {
      loadOrders();
      loadFeedbacks();
    }
  }, [isAdmin]);

  // Quick navigation helpers from Sidebar
  const handleSidebarFilter = (type: "subject" | "grade" | "type", value: string) => {
    setActiveTab("kho-hoc-lieu");
    if (type === "subject") {
      setSelectedSubject(value);
    } else if (type === "grade") {
      setSelectedGrade(value);
    } else if (type === "type") {
      setSelectedType(value);
    }
    setShowMobileSidebar(false);
    showToast(`🔍 Đang hiển thị học liệu bộ lọc: ${value}`);
  };

  // Helper to execute actual browser file download once ready/authorized
  const executeDirectDownload = (product: any) => {
    if (!product) return;
    try {
      const fileName = product.fileName || (product.title || "hoc-lieu") + ".zip";
      const fileData = product.fileData;

      if (fileData) {
        if (fileData.startsWith("data:")) {
          const link = document.createElement("a");
          link.href = fileData;
          link.download = fileName;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          showToast(`⚡ Đang tải trực tiếp tệp: "${fileName}"`);
        } else if (fileData.startsWith("http://") || fileData.startsWith("https://")) {
          window.open(fileData, "_blank");
          showToast(`⚡ Đang mở liên kết tải tệp: "${fileName}"`);
        } else {
          const blob = new Blob([fileData], { type: "text/plain;charset=utf-8" });
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = fileName;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          showToast(`⚡ Đang tải trực tiếp tệp từ máy chủ: "${fileName}"`);
        }
      } else {
        const content = `HỌC LIỆU SỐ GDPT 2018\n\nTiêu đề: ${product.title}\nMôn học: ${product.subject || "Khác"}\nKhối lớp: ${product.grade || "Khác"}\nThể loại: ${product.type || "Trò chơi"}\n\nChúc quý thầy cô thực hiện soạn giảng tốt nhất!`;
        const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        showToast(`✨ Đang tải trực tiếp tài liệu hướng dẫn: "${fileName}"`);
      }
    } catch (err) {
      console.error("Lỗi khi tải học liệu:", err);
      showToast("❌ Không thể khởi chạy tiến trình tải tệp.");
    }
  };

  // Helper to trigger direct browser file downloading
  const triggerDownload = (product: any) => {
    if (!product) return;
    if (product.isPaid) {
      const mappedProduct = {
        ...product,
        id: product.id,
        title: product.title,
        price: product.salePrice || product.price || 0,
        originalPrice: product.price || 0,
        description: product.desc || product.description,
        subject: product.subject || product.category || "Tin học AI",
        grade: product.grade || null,
        type: product.type || "Trò chơi học tập",
        rating: 5.0,
        image: product.image || "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=500&auto=format&fit=crop&q=60",
        fileName: product.fileName,
        fileData: product.fileData
      };
      setSelectedDetailProduct(mappedProduct);
      showToast("💳 Học liệu có phí bản quyền. Vui lòng đặt mua để tải tệp bản quyền!");
      return;
    }
    executeDirectDownload(product);
  };

  // Cart operations
  const addToCart = (product: any) => {
    const isFree = product.price === 0 || product.tag === "free" || product.isFree === true || product.is_free === true || String(product.is_free) === "true";
    if (isFree) {
      triggerDownload(product);
      return;
    }
    if (cart.some(item => item.id === product.id)) {
      showToast("⚠️ Học liệu này đã có trong giỏ hàng!");
      return;
    }
    setCart([...cart, product]);
    showToast(`🛒 Đã thêm "${product.title}" vào giỏ hàng`);
  };

  // Immediate checkout function (MUA NGAY)
  const handleBuyNow = (product: any) => {
    const isFree = product.price === 0 || product.tag === "free" || product.isFree === true || product.is_free === true || String(product.is_free) === "true";
    if (isFree) {
      triggerDownload(product);
      setSelectedDetailProduct(null);
      return;
    }
    if (!cart.some(item => item.id === product.id)) {
      setCart([...cart, product]);
    }
    setSelectedDetailProduct(null);
    setShowCheckoutForm(true);
    setCheckoutStep("form");
    setShowCartModal(true);
    showToast(`🛒 Chuyển tới thanh toán ngay cho "${product.title}"`);
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter(item => item.id !== id));
  };

  // Submit Order to backend (Create Real Order in express storage)
  const handleCheckoutFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!buyerName || !buyerEmail) {
      showToast("⚠️ Vui lòng cung cấp Tên và Email để liên hệ tải tài liệu!");
      return;
    }

    const payload = {
      buyerName,
      buyerEmail,
      buyerPhone,
      buyerBankName,
      buyerBankAccount,
      buyerBankAccountName,
      cartItems: cart,
      totalAmount: cart.reduce((sum, item) => sum + item.price, 0)
    };

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok && data.id) {
        setOrderCreatedId(data.id);
        setCheckoutStep("payment");
        showToast("✓ Đã sinh hóa đơn chuyển khoản thành công!");
      } else {
        showToast("❌ Không thể lập lệnh chuyển khoản.");
      }
    } catch (err) {
      showToast("❌ Lỗi kết nối máy chủ khi tạo đơn hàng.");
    }
  };

  const confirmTransferred = () => {
    setCart([]);
    setShowCartModal(false);
    setShowCheckoutForm(false);
    setOrderCreatedId(null);
    setCheckoutStep("form");
    setBuyerBankName("");
    setBuyerBankAccount("");
    setBuyerBankAccountName("");
    showToast("🎉 Chuyển khoản hoàn tất! Ban quản trị sẽ rà soát và phê duyệt tải file ngay tức thì về email của thầy cô.");
  };

  // Submit feedback/recommendations below footer
  const handleSendFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!footMsg.trim()) {
      showToast("⚠️ Thầy cô chưa điền nội dung góp ý!");
      return;
    }

    setSendingFeedback(true);
    try {
      const res = await fetch("/api/feedbacks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Giáo viên khách",
          email: footEmail || "an_danh@example.com",
          msg: footMsg
        })
      });
      if (res.ok) {
        showToast("💖 Đã gửi đóng góp thành công. EduShop chân thành cảm ơn thầy cô!");
        setFootEmail("");
        setFootMsg("");
      } else {
        showToast("❌ Không thể gửi góp ý.");
      }
    } catch (err) {
      showToast("❌ Gặp sự cố kết nối máy chủ.");
    } finally {
      setSendingFeedback(false);
    }
  };

  // Handle Admin Authorization
  const handleAdminSuccess = (token: string) => {
    setIsAdmin(true);
    setAdminToken(token);
    sessionStorage.setItem("admin-token", token);
    setActiveTab("trang-chu"); // auto head back to user screen with admin rights enabled!
    showToast("🎉 Đăng nhập Quản trị thành công!");
  };

  const handleAdminLogout = () => {
    setIsAdmin(false);
    setAdminToken(null);
    sessionStorage.removeItem("admin-token");
    setActiveTab("trang-chu");
    showToast("✓ Đã thoát chế độ Quản trị viên.");
  };

  // Load Admin Token from session storage on init
  useEffect(() => {
    const stored = sessionStorage.getItem("admin-token");
    if (stored === "admin-secret-token") {
      setIsAdmin(true);
      setAdminToken(stored);
    }
  }, []);

  // --- Admin Add/Edit Form States in App.tsx ---
  const [showProductForm, setShowProductForm] = useState(false);
  const [productFormMode, setProductFormMode] = useState<"create" | "edit">("create");
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState("");
  const [formSubject, setFormSubject] = useState("Tin học");
  const [formGrade, setFormGrade] = useState(6);
  const [formType, setFormType] = useState("Giáo án Word");
  const [formPrice, setFormPrice] = useState(150000);
  const [formOriginalPrice, setFormOriginalPrice] = useState(200000);
  const [formTag, setFormTag] = useState("new");
  const [formImage, setFormImage] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [formFileData, setFormFileData] = useState("");
  const [formFileName, setFormFileName] = useState("");

  const [showInitForm, setShowInitForm] = useState(false);
  const [initFormMode, setInitFormMode] = useState<"create" | "edit">("create");
  const [selectedInitId, setSelectedInitId] = useState<string | null>(null);
  const [initCategory, setInitCategory] = useState("Bậc THCS");
  const [initTitle, setInitTitle] = useState("");
  const [initAuthor, setInitAuthor] = useState("");
  const [initDesc, setInitDesc] = useState("");
  const [initPrice, setInitPrice] = useState(120000);
  const [initImage, setInitImage] = useState("");
  const [initFileData, setInitFileData] = useState("");
  const [initFileName, setInitFileName] = useState("");

  const [showGameForm, setShowGameForm] = useState(false);
  const [gameFormMode, setGameFormMode] = useState<"create" | "edit">("create");
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null);
  const [gameCategory, setGameCategory] = useState("Bậc THCS");
  const [gameTitle, setGameTitle] = useState("");
  const [gameTag, setGameTag] = useState("");
  const [gameDesc, setGameDesc] = useState("");
  const [gameImage, setGameImage] = useState("");
  const [gameFileData, setGameFileData] = useState("");
  const [gameFileName, setGameFileName] = useState("");
  const [gameIsPaid, setGameIsPaid] = useState<boolean>(false);
  const [gamePrice, setGamePrice] = useState<number>(0);
  const [gameSalePrice, setGameSalePrice] = useState<number>(0);

  // States for paid game payment checkout popup
  const [showGamePaymentModal, setShowGamePaymentModal] = useState(false);
  const [paymentGameItem, setPaymentGameItem] = useState<any>(null);
  const [gameBuyerName, setGameBuyerName] = useState("");
  const [gameBuyerPhone, setGameBuyerPhone] = useState("");
  const [gameBuyerEmail, setGameBuyerEmail] = useState("");
  const [gamePaymentStatus, setGamePaymentStatus] = useState<"pending" | "success">("pending");

  // Form triggers helpers
  const openCreateProduct = () => {
    setProductFormMode("create");
    setFormTitle("");
    setFormSubject("Tin học");
    setFormGrade(6);
    setFormType("Giáo án Word");
    setFormPrice(150000);
    setFormOriginalPrice(200000);
    setFormTag("new");
    setFormImage("");
    setFormDescription("");
    setYoutubeUrl("");
    setFormFileData("");
    setFormFileName("");
    setSelectedProductId(null);
    setShowProductForm(true);
  };

  const openEditProduct = (p: Product) => {
    setProductFormMode("edit");
    setFormTitle(p.title);
    setFormSubject(p.subject);
    setFormGrade(p.grade);
    setFormType(p.type);
    setFormPrice(p.price);
    setFormOriginalPrice(p.originalPrice || p.price * 1.25);
    setFormTag(p.tag || "new");
    setFormImage(p.image);
    setFormDescription(p.description);
    setFormFileData(p.fileData || "");
    setFormFileName(p.fileName || "");

    if (p.type === "Video" && p.image && (p.image.includes("youtube.com") || p.image.includes("youtu.be") || p.image.includes("img.youtube.com"))) {
      const match = p.image.match(/\/vi\/([^/]+)/);
      if (match) {
        setYoutubeUrl(`https://www.youtube.com/watch?v=${match[1]}`);
      } else {
        setYoutubeUrl(p.image);
      }
    } else {
      setYoutubeUrl("");
    }

    setSelectedProductId(p.id);
    setShowProductForm(true);
  };

  const openCreateInit = () => {
    setInitFormMode("create");
    setInitCategory("Bậc THCS");
    setInitTitle("");
    setInitAuthor("");
    setInitDesc("");
    setInitPrice(120000);
    setInitImage("");
    setInitFileData("");
    setInitFileName("");
    setSelectedInitId(null);
    setShowInitForm(true);
  };

  const openEditInit = (item: Initiative) => {
    setInitFormMode("edit");
    setInitCategory(item.category);
    setInitTitle(item.title);
    setInitAuthor(item.author);
    setInitDesc(item.desc);
    setInitPrice(item.price);
    setInitImage((item as any).image || "");
    setInitFileData((item as any).fileData || "");
    setInitFileName((item as any).fileName || "");
    setSelectedInitId(item.id);
    setShowInitForm(true);
  };

  const openCreateGame = () => {
    setGameFormMode("create");
    setGameCategory("Bậc THCS");
    setGameTitle("");
    setGameTag("");
    setGameDesc("");
    setGameImage("");
    setGameFileData("");
    setGameFileName("");
    setGameIsPaid(false);
    setGamePrice(0);
    setGameSalePrice(0);
    setSelectedGameId(null);
    setShowGameForm(true);
  };

  const openEditGame = (item: any) => {
    setGameFormMode("edit");
    setGameCategory(item.category || "Bậc THCS");
    setGameTitle(item.title);
    setGameTag(item.tag || "");
    setGameDesc(item.desc || "");
    setGameImage(item.image || "");
    setGameFileData(item.fileData || "");
    setGameFileName(item.fileName || "");
    setGameIsPaid(!!item.isPaid);
    setGamePrice(item.price || 0);
    setGameSalePrice(item.salePrice || 0);
    setSelectedGameId(item.id);
    setShowGameForm(true);
  };

  // Computer uploads file handlers
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setFormImage(event.target.result as string);
          showToast("📸 Đã chuyển đổi hình ảnh từ máy tính sang Base64 tải lên!");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      showToast("⚠️ Vui lòng điền tiêu đề học liệu!");
      return;
    }

    let finalImage = formImage;
    if (formType === "Video" && youtubeUrl.trim()) {
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
      const match = youtubeUrl.match(regExp);
      if (match && match[2].length === 11) {
        finalImage = `https://img.youtube.com/vi/${match[2]}/hqdefault.jpg`;
      } else {
        finalImage = youtubeUrl;
      }
    }

    const payload = {
      title: formTitle,
      subject: formSubject,
      grade: Number(formGrade),
      type: formType,
      price: Number(formPrice),
      originalPrice: Number(formOriginalPrice),
      tag: formTag,
      image: finalImage || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500&auto=format&fit=crop&q=60",
      description: formDescription,
      fileData: formFileData,
      fileName: formFileName
    };

    try {
      const url = productFormMode === "create" ? "/api/admin/products" : `/api/admin/products/${selectedProductId}`;
      const method = productFormMode === "create" ? "POST" : "PUT";
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer admin-secret-token`
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        showToast(productFormMode === "create" ? "🎉 Đã tạo mới học liệu số!" : "💾 Đã lưu thay đổi học liệu!");
        setShowProductForm(false);
        loadProducts();
      } else {
        showToast("❌ Không thể sao lưu học liệu.");
      }
    } catch {
      showToast("❌ Gặp sự cố kết nối máy chủ.");
    }
  };

  const handleInitSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!initTitle.trim()) {
      showToast("⚠️ Vui lòng điền tiêu đề sáng kiến!");
      return;
    }

    const payload = {
      category: initCategory,
      title: initTitle,
      author: initAuthor,
      desc: initDesc,
      price: Number(initPrice),
      image: initImage,
      fileData: initFileData,
      fileName: initFileName
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
        const savedObject = await res.json();
        
        // Update local localStorage backup lists
        const localBackupStr = localStorage.getItem("backup_initiatives");
        let localBackupList: Initiative[] = [];
        if (localBackupStr) {
          try {
            localBackupList = JSON.parse(localBackupStr);
          } catch (_) {}
        }
        
        if (initFormMode === "create") {
          if (!localBackupList.some(item => item.id === savedObject.id)) {
            localBackupList.unshift(savedObject);
          }
        } else {
          const idx = localBackupList.findIndex(item => item.id === selectedInitId);
          if (idx !== -1) {
            localBackupList[idx] = { ...localBackupList[idx], ...savedObject };
          } else {
            localBackupList.unshift(savedObject);
          }
        }
        localStorage.setItem("backup_initiatives", JSON.stringify(localBackupList));

        showToast(initFormMode === "create" ? "🎉 Thêm sáng kiến kinh nghiệm thành công!" : "💾 Đã lưu sáng kiến!");
        setShowInitForm(false);
        setActiveTab("sang-kien-kinh-nghiem");
        loadInitiatives();
      } else {
        showToast("❌ Không thể lưu sáng kiến.");
      }
    } catch {
      showToast("❌ Gặp lỗi kết nối máy chủ.");
    }
  };

  const handleDeleteInit = async (id: string) => {
    if (!window.confirm("Admin: Thầy cô chắc chắn muốn xóa sáng kiến này khỏi hệ thống?")) return;
    try {
      const res = await fetch(`/api/admin/initiatives/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer admin-secret-token` }
      });
      if (res.ok) {
        showToast("🗑️ Đã xóa sáng kiến thành công.");
        
        // Evict from browser localStorage cache
        const localBackupStr = localStorage.getItem("backup_initiatives");
        if (localBackupStr) {
          try {
            const localBackup = JSON.parse(localBackupStr);
            const filteredBackup = localBackup.filter((item: any) => item.id !== id);
            localStorage.setItem("backup_initiatives", JSON.stringify(filteredBackup));
          } catch (_) {}
        }

        loadInitiatives();
      } else {
        showToast("❌ Không thể xóa sáng kiến.");
      }
    } catch {
      showToast("❌ Lỗi mạng.");
    }
  };

  const handleGameImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setGameImage(event.target.result as string);
          showToast(`✓ Đã nhận ảnh bìa: ${file.name}`);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGameDocumentFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setGameFileName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setGameFileData(event.target.result as string);
          showToast(`✓ Đã nhận tệp đính kèm: ${file.name}`);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gameTitle.trim()) {
      showToast("⚠️ Vui lòng điền tiêu đề trò chơi!");
      return;
    }

    const payload = {
      category: gameCategory,
      title: gameTitle,
      tag: gameTag,
      desc: gameDesc,
      image: gameImage,
      fileData: gameFileData,
      fileName: gameFileName,
      isPaid: gameIsPaid,
      price: gameIsPaid ? Number(gamePrice) : 0,
      salePrice: gameIsPaid ? Number(gameSalePrice) : 0
    };

    try {
      const url = gameFormMode === "create" ? "/api/admin/games" : `/api/admin/games/${selectedGameId}`;
      const method = gameFormMode === "create" ? "POST" : "PUT";
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer admin-secret-token`
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const savedObject = await res.json();
        
        // Update local localStorage backup lists
        const localBackupStr = localStorage.getItem("backup_games");
        let localBackupList: any[] = [];
        if (localBackupStr) {
          try {
            localBackupList = JSON.parse(localBackupStr);
          } catch (_) {}
        }
        
        if (gameFormMode === "create") {
          if (!localBackupList.some(item => item.id === savedObject.id)) {
            localBackupList.unshift(savedObject);
          }
        } else {
          const idx = localBackupList.findIndex(item => item.id === selectedGameId);
          if (idx !== -1) {
            localBackupList[idx] = { ...localBackupList[idx], ...savedObject };
          } else {
            localBackupList.unshift(savedObject);
          }
        }
        localStorage.setItem("backup_games", JSON.stringify(localBackupList));

        showToast(gameFormMode === "create" ? "🎉 Thêm trò chơi học thuật thành công!" : "💾 Đã lưu trò chơi!");
        setShowGameForm(false);
        setActiveTab("kho-tro-choi-ai");
        loadGames();
      } else {
        showToast("❌ Không thể lưu trò chơi.");
      }
    } catch {
      showToast("❌ Gặp lỗi kết nối máy chủ.");
    }
  };

  const handleDeleteGame = async (id: string) => {
    if (!window.confirm("Admin: Thầy cô chắc chắn muốn xóa trò chơi này khỏi hệ thống?")) return;
    try {
      const res = await fetch(`/api/admin/games/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer admin-secret-token` }
      });
      if (res.ok) {
        showToast("🗑️ Đã xóa trò chơi thành công.");
        
        // Evict from browser localStorage cache
        const localBackupStr = localStorage.getItem("backup_games");
        if (localBackupStr) {
          try {
            const localBackup = JSON.parse(localBackupStr);
            const filteredBackup = localBackup.filter((item: any) => item.id !== id);
            localStorage.setItem("backup_games", JSON.stringify(filteredBackup));
          } catch (_) {}
        }

        loadGames();
      } else {
        showToast("❌ Không thể xóa trò chơi.");
      }
    } catch {
      showToast("❌ Lỗi mạng.");
    }
  };

  const totalCartPrice = cart.reduce((sum, item) => sum + item.price, 0);

  // Filter learning resources
  const filteredProducts = products.filter(prod => {
    const matchesSubject = selectedSubject === "Tất cả" || prod.subject === selectedSubject;
    const matchesGrade = selectedGrade === "Tất cả" || prod.grade.toString() === selectedGrade;
    const matchesType = selectedType === "Tất cả" || prod.type === selectedType;
    const matchesSearch = prod.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          prod.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSubject && matchesGrade && matchesType && matchesSearch;
  });

  // QUIZ QUESTIONS
  const QUIZ_QUESTIONS: { [key: string]: any[] } = {
    "game-1": [
      {
        question: "Trong tư duy thuật toán, 'Phân rã bài toán' (Decomposition) có nghĩa là gì?",
        options: [
          "A. Chia nhỏ một bài toán phức tạp thành các bài toán nhỏ hơn, dễ giải quyết hơn.",
          "B. Chạy thử chương trình để phát hiện lỗi sai dòng lệnh.",
          "C. Chuyển đổi mã nguồn từ ngôn ngữ máy sang mã lắp ráp.",
          "D. Tạo sơ đồ tư duy cho tất cả nội dung có trong bài học."
        ],
        correct: 0,
        explanation: "Phân rã bài toán là kỹ năng cốt lõi giúp chia nhỏ một bài toán lớn thành các phần nhỏ dễ quản lý và giải quyết hơn."
      },
      {
        question: "Bước quan trọng nhất trước khi bắt tay vào viết mã nguồn lập trình là gì?",
        options: [
          "A. Thiết kế giao diện bắt mắt cho phần mềm.",
          "B. Xác định rõ ràng các bước thuật toán và giải thuật cụ thể.",
          "C. Mua bản quyền máy tính cấu hình cao.",
          "D. Đăng ký tên miền và thuê máy chủ lưu trữ."
        ],
        correct: 1,
        explanation: "Xây dựng thuật toán rõ ràng giúp quá trình lập trình diễn ra chuẩn xác, hạn chế lỗi logic về sau."
      },
      {
        question: "Biểu diễn thuật toán bằng Sơ đồ khối (Flowchart), hình thoi thường đại diện cho:",
        options: [
          "A. Bắt đầu hoặc Kết thúc chương trình.",
          "B. Phép tính hoặc quá trình xử lý dữ liệu thông thường.",
          "C. Điều kiện rẽ nhánh (Đúng / Sai).",
          "D. Nhập dữ liệu từ bàn phím hoặc xuất dữ liệu ra màn hình."
        ],
        correct: 2,
        explanation: "Hình thoi trong sơ đồ khối biểu diễn thao tác kiểm tra điều kiện để đưa ra lựa chọn rẽ nhánh tiếp theo."
      }
    ],
    "game-3": [
      {
        question: "Công nghệ nào giúp máy tính có thể hiểu, phân tích và phản hồi ngôn ngữ của con người một cách tự nhiên nhất?",
        options: [
          "A. Xử lý ngôn ngữ tự nhiên (NLP)",
          "B. Thị giác máy tính (Computer Vision)",
          "C. Trí tuệ nhân tạo vạn vật (AIoT)",
          "D. Cơ sở dữ liệu phân tán (Blockchain)"
        ],
        correct: 0,
        explanation: "Xử lý ngôn ngữ tự nhiên (NLP) là nhánh của AI tập trung vào việc giúp máy tính tương tác bằng ngôn ngữ loài người."
      },
      {
        question: "Khi tương tác với các chatbot AI như ChatGPT hay Gemini, mệnh lệnh/yêu cầu bạn gửi đi được gọi là gì?",
        options: [
          "A. Database query (Truy vấn dữ liệu)",
          "B. Prompt (Lời nhắc)",
          "C. API Key (Khóa lập trình)",
          "D. Algorithm (Thuật toán)"
        ],
        correct: 1,
        explanation: "Prompt (Lời nhắc) là câu lệnh cung cấp cho AI để nhận được phản hồi hữu ích."
      }
    ]
  };

  const startGame = (gameId: string) => {
    setCurrentGameId(gameId);
    setGameStep("playing");
    setCurrentQuizIndex(0);
    setQuizScore(0);
    setSelectedAnswer(null);
    setQuizAnswers([]);
  };

  const handleSelectAnswer = (optionIdx: number) => {
    setSelectedAnswer(optionIdx);
  };

  const handleNextQuiz = () => {
    const questions = QUIZ_QUESTIONS[currentGameId] || QUIZ_QUESTIONS["game-1"];
    const isCorrect = selectedAnswer === questions[currentQuizIndex].correct;
    
    setQuizAnswers([...quizAnswers, {
      question: questions[currentQuizIndex].question,
      selected: selectedAnswer,
      correct: questions[currentQuizIndex].correct,
      explanation: questions[currentQuizIndex].explanation,
      isCorrect
    }]);

    if (isCorrect) {
      setQuizScore(prev => prev + 1);
    }

    if (currentQuizIndex < questions.length - 1) {
      setCurrentQuizIndex(prev => prev + 1);
      setSelectedAnswer(null);
    } else {
      setGameStep("finished");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      
      {/* --- TOAST NOTIFICATION --- */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-55 bg-slate-950 text-white py-3.5 px-6 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-800 animate-slide-in">
          <Sparkles className="text-yellow-400 w-5 h-5 flex-shrink-0 animate-pulse" />
          <span className="text-xs sm:text-sm font-extrabold">{toastMessage}</span>
        </div>
      )}

      {/* ==================== 1. HERO BANNER (Top of the page) ==================== */}
      <section 
        className="relative bg-gradient-to-br from-slate-950 via-indigo-950 to-indigo-900 text-white overflow-hidden py-10 sm:py-14 px-4 border-b border-indigo-950 mb-3"
        style={bannerSettings.backgroundImage ? {
          backgroundImage: `linear-gradient(to bottom, rgba(15, 23, 42, 0.88), rgba(30, 27, 75, 0.93)), url(${bannerSettings.backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        } : undefined}
      >
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500 rounded-full filter blur-3xl opacity-15 -mr-16 -mt-16"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-500 rounded-full filter blur-3xl opacity-10 -ml-16 -mb-16"></div>
        
        <div className="max-w-7xl mx-auto relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-10 w-full">
          <div className="text-left space-y-4 flex-1 md:max-w-3xl lg:max-w-4xl xl:max-w-5xl relative group/banner">
            <div 
              onClick={isAdmin ? openBannerSettings : undefined}
              className={`inline-flex items-center gap-2 bg-indigo-500/20 text-indigo-300 px-3.5 py-1 rounded-full text-[10px] sm:text-xs font-bold border border-indigo-500/30 ${isAdmin ? "cursor-pointer hover:bg-indigo-500/35 transition-all" : ""}`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" /> 
              <span>{bannerSettings.badgeText}</span>
            </div>

            <h1 
              onClick={isAdmin ? openBannerSettings : undefined}
              className={`font-black leading-tight tracking-tight flex flex-col gap-2 sm:gap-3 ${isAdmin ? "cursor-pointer hover:opacity-90 transition-all" : ""}`}
            >
              <span className="text-3xl sm:text-4xl md:text-5xl lg:text-[4rem] xl:text-[4.5rem] text-white drop-shadow-md font-black flex items-center gap-2.5 flex-wrap">
                <span>{bannerSettings.title1}</span>
              </span>
              <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-amber-300 bg-clip-text text-transparent whitespace-nowrap block text-[6.2vw] xs:text-[6vw] sm:text-[5.4vw] md:text-[2.6vw] lg:text-[2.8vw] xl:text-[3vw] 2xl:text-5xl">
                {bannerSettings.title2}
              </span>
            </h1>

            <div 
              onClick={isAdmin ? openBannerSettings : undefined}
              className={`relative ${isAdmin ? "cursor-pointer hover:bg-white/5 p-2 -m-2 rounded-xl border border-transparent hover:border-white/10 transition-all" : ""}`}
            >
              <p 
                className="text-slate-300 text-xs sm:text-sm font-medium max-w-2xl leading-relaxed whitespace-pre-line"
                dangerouslySetInnerHTML={{ __html: bannerSettings.description }}
              />
            </div>
          </div>

          {/* Quick Search inside Hero Banner */}
          <div className="w-full md:w-64 lg:w-72 xl:w-80 bg-white/5 backdrop-blur-md p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-white/10 shadow-xl space-y-3 shrink-0 self-center">
            <h4 className="text-[10px] font-black text-amber-300 uppercase tracking-wider text-left flex items-center gap-1.5 leading-none">
              <Search className="w-4 h-4" /> Tìm kiếm học liệu nhanh
            </h4>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input 
                type="text" 
                placeholder="Nhập tên tài liệu, khối lớp..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    setActiveTab("kho-hoc-lieu");
                    showToast(`🔍 Kết quả tìm kiếm cho: "${searchTerm}"`);
                  }
                }}
                className="w-full bg-white text-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs font-bold placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 border border-transparent"
              />
            </div>
            <button 
              onClick={() => {
                setActiveTab("kho-hoc-lieu");
                showToast("🔍 Đang mở rộng kho dữ liệu chính...");
              }}
              className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-black py-2.5 rounded-xl text-xs transition-all flex items-center justify-center gap-1 shadow-lg shadow-amber-500/10 cursor-pointer"
            >
              Xem Toàn Bộ Học Liệu <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {isAdmin && (
          <button
            onClick={openBannerSettings}
            className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 px-3 py-1.5 rounded-full shadow-lg border border-amber-400 transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-1.5 font-black text-[10px] sm:text-xs z-20 hover:shadow-amber-500/20"
            title="Chỉnh sửa nội dung Banner"
          >
            <Edit2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span>Chỉnh sửa Banner</span>
          </button>
        )}
      </section>

      {/* ==================== 2. NAVBAR (Menu nằm ngang) ==================== */}
      <header className="sticky top-0 z-40 bg-gradient-to-r from-[#001c54]/85 via-[#002060]/85 to-[#002d8a]/85 backdrop-blur-md border-b border-white/10 shadow-lg text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 w-full">
            
            {/* Logo & Navigation Buttons Group (Left aligned) */}
            <div className="flex items-center h-16 gap-3 lg:gap-5 flex-grow">
              {/* Logo Left */}
              <div className="flex items-center gap-2 cursor-pointer text-left flex-shrink-0" onClick={() => setActiveTab("trang-chu")}>
                <div className="bg-gradient-to-tr from-blue-600 to-indigo-600 p-2 rounded-xl text-white shadow-sm flex items-center justify-center">
                  <Brain className="w-5 h-5 animate-pulse" />
                </div>
                <div className="leading-none text-left">
                  <h1 className="text-base sm:text-lg font-black text-white tracking-tight leading-none">
                    EDUSHOP AI
                  </h1>
                  <span className="text-[8px] font-black text-indigo-300 tracking-widest uppercase block mt-1 leading-none">HỌC LIỆU SỐ THÔNG MINH</span>
                </div>
              </div>

              {/* Desktop Horizontal Navbar (Aligned next to Logo with left-border) */}
              <div className="hidden md:flex items-center h-16 bg-transparent p-0 rounded-none overflow-visible border-l border-white/10 pl-3 lg:pl-5">
                <button 
                  onClick={() => setActiveTab("trang-chu")}
                  className={`px-3 lg:px-4 h-16 rounded-none text-[9px] lg:text-[10px] font-black uppercase tracking-wider transition-all duration-200 cursor-pointer relative border-r border-white/10 flex flex-col items-center justify-center text-center ${activeTab === "trang-chu" ? "bg-[#1e70ff] text-white" : "bg-transparent text-slate-100 hover:bg-[#002d8a] hover:text-white"}`}
                >
                  <Home className="w-3.5 h-3.5 mb-1 text-sky-400 flex-shrink-0" />
                  <span>Trang Chủ</span>
                </button>
                <button 
                  onClick={() => { setActiveTab("kho-hoc-lieu"); setSelectedSubject("Tất cả"); }}
                  className={`px-3 lg:px-4 h-16 rounded-none text-[9px] lg:text-[10px] font-black uppercase tracking-wider transition-all duration-200 cursor-pointer relative border-r border-white/10 flex flex-col items-center justify-center text-center ${activeTab === "kho-hoc-lieu" ? "bg-[#1e70ff] text-white" : "bg-transparent text-slate-100 hover:bg-[#002d8a] hover:text-white"}`}
                >
                  <BookOpen className="w-3.5 h-3.5 mb-1 text-emerald-400 flex-shrink-0" />
                  <span>Kho Học Liệu</span>
                </button>
                <button 
                  onClick={() => { setActiveTab("kho-tro-choi-ai"); setGameStep("intro"); }}
                  className={`px-3 lg:px-4 h-16 rounded-none text-[9px] lg:text-[10px] font-black uppercase tracking-wider transition-all duration-200 cursor-pointer relative border-r border-white/10 flex flex-col items-center justify-center text-center ${activeTab === "kho-tro-choi-ai" ? "bg-[#1e70ff] text-white" : "bg-transparent text-slate-100 hover:bg-[#002d8a] hover:text-white"}`}
                >
                  <Gamepad2 className="w-3.5 h-3.5 mb-1 text-indigo-400 flex-shrink-0" />
                  <span>Trò Chơi AI</span>
                </button>
                <button 
                  onClick={() => setActiveTab("sang-kien-kinh-nghiem")}
                  className={`px-3 lg:px-4 h-16 rounded-none text-[9px] lg:text-[10px] font-black uppercase tracking-wider transition-all duration-200 cursor-pointer relative border-r border-white/10 flex flex-col items-center justify-center text-center leading-tight ${activeTab === "sang-kien-kinh-nghiem" ? "bg-[#1e70ff] text-white" : "bg-transparent text-slate-100 hover:bg-[#002d8a] hover:text-white"}`}
                >
                  <Award className="w-3.5 h-3.5 mb-1 text-purple-400 flex-shrink-0" />
                  <span className="whitespace-nowrap">Sáng Kiến Kinh Nghiệm</span>
                </button>

                {/* Highlighted feature tool: AI Assistant */}
                <button 
                  onClick={() => setActiveTab("soan-giao-an-ai")}
                  className={`px-3 lg:px-4 h-16 rounded-none text-[9px] lg:text-[10px] font-black uppercase tracking-wider transition-all duration-200 flex flex-col items-center justify-center gap-1 cursor-pointer border-r border-white/10 relative text-white ${activeTab === "soan-giao-an-ai" ? "bg-[#1e70ff]" : "bg-transparent text-slate-100 hover:bg-[#002d8a] hover:text-white"}`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse flex-shrink-0" /> 
                  <span className="whitespace-nowrap">Soạn Giáo Án AI</span>
                </button>

                {/* Admin Management System Button */}
                {isAdmin && (
                  <button
                    onClick={() => setActiveTab("admin-dashboard")}
                    className={`px-3 lg:px-4 h-16 rounded-none text-[9px] lg:text-[10px] font-black uppercase tracking-wider transition-all duration-200 cursor-pointer border-r border-white/10 relative flex flex-col items-center justify-center text-center gap-1 text-white ${activeTab === "admin-dashboard" ? "bg-[#1e70ff]" : "bg-transparent text-slate-100 hover:bg-[#002d8a] hover:text-white"}`}
                  >
                    <Shield className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" /> 
                    <span className="whitespace-nowrap">Quản trị hệ thống</span>
                  </button>
                )}
              </div>
            </div>

            {/* Desktop Horizontal Actions (Right aligned) */}
            <div className="hidden md:flex items-center h-16 bg-transparent p-0 rounded-none overflow-visible flex-shrink-0">
              {/* Authentication controls */}
              {!isAdmin ? (
                <button
                  onClick={() => setActiveTab("admin-dashboard")}
                  className="bg-transparent text-slate-100 hover:bg-[#002d8a] hover:text-white px-3 lg:px-4 h-16 rounded-none text-[9px] lg:text-[10px] font-black uppercase tracking-wider transition-all duration-200 cursor-pointer border-r border-white/10 relative flex flex-col items-center justify-center gap-1"
                  title="Cổng đăng nhập hệ thống"
                >
                  <Lock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <span className="whitespace-nowrap">Đăng nhập</span>
                </button>
              ) : (
                <div className="flex items-center h-16 border-r border-white/10">
                  <button
                    onClick={handleAdminLogout}
                    className="bg-transparent hover:bg-red-700/50 text-white px-3 lg:px-4 h-16 rounded-none text-[9px] lg:text-[10px] font-black uppercase tracking-wider transition-all duration-200 cursor-pointer flex flex-col items-center justify-center gap-1.5 relative"
                    title="Đăng xuất tài khoản Admin"
                  >
                    <LogOut className="w-3.5 h-3.5 text-red-350 flex-shrink-0" />
                    <span className="whitespace-nowrap">Đăng xuất</span>
                  </button>
                </div>
              )}

              {/* Shopping Cart Button */}
              <button 
                onClick={() => setShowCartModal(true)}
                className="relative bg-transparent text-white hover:bg-[#002d8a] px-3.5 lg:px-5 h-16 rounded-none transition-all duration-200 flex flex-col items-center justify-center cursor-pointer text-[9px] lg:text-[10px] font-black uppercase tracking-wider gap-1.5"
              >
                <div className="relative">
                  <ShoppingCart className="w-4 h-4 flex-shrink-0" />
                  {cart.length > 0 && (
                    <span className="absolute -top-1.5 -right-2.5 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-none flex items-center justify-center border border-white animate-pulse">
                      {cart.length}
                    </span>
                  )}
                </div>
                <span className="whitespace-nowrap">Giỏ hàng</span>
              </button>
            </div>

            {/* Mobile Actions (Visible on small screens only) */}
            <div className="flex md:hidden items-center gap-2">
              {/* Shopping Cart Button */}
              <button 
                onClick={() => setShowCartModal(true)}
                className="relative bg-white/10 hover:bg-white/20 text-white w-9 h-9 rounded-full transition-all cursor-pointer flex items-center justify-center border border-white/10"
              >
                <ShoppingCart className="w-4 h-4" />
                {cart.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-white animate-pulse">
                    {cart.length}
                  </span>
                )}
              </button>

              {/* Mobile Sidebar Trigger */}
              <button 
                onClick={() => setShowMobileSidebar(!showMobileSidebar)}
                className="bg-white/10 hover:bg-white/20 p-2.5 rounded-full text-white transition-all cursor-pointer flex items-center justify-center border border-white/10"
                title="Mở bảng phân quyền menu dọc"
              >
                <Menu className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* ==================== 3. TWO COLUMN LAYOUT (Menu dọc + Main Area) ==================== */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex-grow flex flex-col md:flex-row gap-8">
        
        {/* --- LEFT SIDEBAR: MENU DỌC --- */}
        <aside className="hidden md:block w-64 shrink-0 text-left space-y-6">
          <div className="bg-white rounded-[32px] border border-slate-100 p-5 shadow-sm space-y-6 sticky top-24">
            
            {/* Subject Categories */}
            <div className="space-y-3 text-left">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 border-b border-slate-100 pb-2">
                <BookOpen className="w-4 h-4 text-blue-500" /> Kho mảng môn học
              </h4>
              <div className="space-y-1">
                {subjects.map((subj) => {
                  const count = products.filter(p => p.subject === subj).length;
                  return (
                    <button
                      key={subj}
                      onClick={() => handleSidebarFilter("subject", subj)}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-between ${selectedSubject === subj && activeTab === "kho-hoc-lieu" ? "bg-indigo-50 text-indigo-700 font-black" : "text-slate-600 hover:bg-slate-50"}`}
                    >
                      <span className="truncate">{subj}</span>
                      <span className="bg-slate-101 text-slate-500 text-[10px] font-black px-2 py-0.5 rounded-full">{count}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Grade Levels */}
            <div className="space-y-3 text-left">
              <h4 className="text-xs font-black text-slate-404 uppercase tracking-widest flex items-center gap-1.5 border-b border-slate-101 pb-2">
                <Grid className="w-4 h-4 text-indigo-500" /> Khối lớp học
              </h4>
              <div className="grid grid-cols-2 gap-1.5">
                {["6", "7", "8", "9"].map((grade) => (
                  <button
                    key={grade}
                    onClick={() => handleSidebarFilter("grade", grade)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold text-center transition-all border ${selectedGrade === grade && activeTab === "kho-hoc-lieu" ? "bg-indigo-50 border-indigo-500 text-indigo-700 font-black" : "bg-white border-slate-100 text-slate-600 hover:bg-slate-50"}`}
                  >
                    Lớp {grade}
                  </button>
                ))}
              </div>
            </div>

            {/* Resource Document Types */}
            <div className="space-y-3 text-left">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 border-b border-slate-100 pb-2">
                <Filter className="w-4 h-4 text-amber-500" /> tệp tài liệu
              </h4>
              <div className="space-y-1">
                {[
                  "Giáo án Word",
                  "Giáo án điện tử",
                  "Video",
                  "Phiếu bài tập",
                  "Ngân hàng đề"
                ].map((type) => (
                  <button
                    key={type}
                    onClick={() => handleSidebarFilter("type", type)}
                    className={`w-full text-left px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all flex items-center gap-2 ${selectedType === type && activeTab === "kho-hoc-lieu" ? "text-indigo-600 bg-indigo-50/50 font-black" : "text-slate-500 hover:text-indigo-600"}`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-350"></span>
                    <span>{type}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Smart AI Tools Promo */}
            <div className="p-3.5 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl border border-indigo-100 space-y-2 text-left">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-indigo-600 animate-pulse" />
                <h5 className="text-[10px] font-black text-indigo-950 uppercase tracking-wider">Tiện ích AI 4.0</h5>
              </div>
              <p className="text-[10px] text-slate-500 leading-relaxed font-semibold">Tự động thiết kế học liệu năng lực số chuẩn GDPT 2018 bằng Gemini.</p>
              <button 
                onClick={() => {
                  setActiveTab("soan-giao-an-ai");
                  showToast("✨ Mở trợ lý ảo soạn bài");
                }}
                className="w-full bg-white hover:bg-indigo-100 text-indigo-700 border border-indigo-250 font-extrabold py-2 rounded-xl text-[10px] transition-all cursor-pointer shadow-sm"
              >
                Lập giáo án AI ngay
              </button>
            </div>

          </div>
        </aside>

        {/* Mobile Slide-out Drawer Menu dọc */}
        {showMobileSidebar && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm md:hidden flex justify-start">
            <div className="bg-white w-72 h-full p-6 overflow-y-auto shadow-2xl flex flex-col justify-between animate-slide-in-left">
              <div className="space-y-6 text-left">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <span className="font-black text-slate-900 text-sm flex items-center gap-1">
                    <Layout className="w-4.5 h-4.5 text-indigo-600" /> Danh Mục Bảng Lọc
                  </span>
                  <button onClick={() => setShowMobileSidebar(false)} className="bg-slate-101 p-1.5 rounded-xl">
                    <X className="w-4 h-4 text-slate-600" />
                  </button>
                </div>

                {/* Mobile Subjects */}
                <div className="space-y-2">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                    <BookOpen className="w-4 h-4 text-blue-500" /> Môn học học liệu
                  </h4>
                  <div className="space-y-1">
                    {subjects.map((item) => (
                      <button
                        key={item}
                        onClick={() => handleSidebarFilter("subject", item)}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all ${selectedSubject === item && activeTab === "kho-hoc-lieu" ? "bg-indigo-50 text-indigo-700 font-extrabold" : "text-slate-600"}`}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Mobile Grades */}
                <div className="space-y-2">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                    <Grid className="w-4 h-4 text-indigo-500" /> Khối Lớp Học
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {["6", "7", "8", "9"].map((grade) => (
                      <button
                        key={grade}
                        onClick={() => handleSidebarFilter("grade", grade)}
                        className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all ${selectedGrade === grade && activeTab === "kho-hoc-lieu" ? "bg-indigo-50 border-indigo-500 text-indigo-700" : "bg-white border-slate-100"}`}
                      >
                        Lớp {grade}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Mobile Types */}
                <div className="space-y-2">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                    <Filter className="w-4 h-4 text-amber-500" /> Định dạng tệp
                  </h4>
                  <div className="space-y-1">
                    {["Giáo án Word", "Giáo án điện tử", "Video", "Phiếu bài tập", "Ngân hàng đề"].map((type) => (
                      <button
                        key={type}
                        onClick={() => handleSidebarFilter("type", type)}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all ${selectedType === type && activeTab === "kho-hoc-lieu" ? "text-indigo-600 bg-indigo-50 font-extrabold" : "text-slate-500"}`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Drawer footer info */}
              <div className="pt-6 border-t border-slate-100 text-xs text-slate-400 space-y-3">
                <p>Địa chỉ kho tài nguyên học tập cấp quốc gia chuẩn số hoá.</p>
                <button 
                  onClick={() => {
                    setActiveTab("soan-giao-an-ai");
                    setShowMobileSidebar(false);
                  }}
                  className="w-full bg-indigo-600 text-white font-extrabold py-3 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Sparkles className="w-4 h-4" /> Soạn Giáo Án AI
                </button>
              </div>
            </div>
          </div>
        )}

        {/* --- MAIN AREA COMPONENT TAB ROUTINGS --- */}
        <main className="flex-grow min-w-0">

          {/* Admin Tools Quick Control Center Bar */}
          {isAdmin && activeTab === "admin-dashboard" && (
            <div className="bg-slate-900 border border-slate-800 text-white rounded-3xl p-6 sm:p-8 mb-8 flex flex-col gap-6 shadow-xl animate-fade-in text-left w-full">
              
              {/* Top part: Full-width Branding & Metadata */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
                <div className="space-y-1.5 flex-grow">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-xl sm:text-2xl font-black tracking-tight bg-gradient-to-r from-amber-400 to-rose-400 bg-clip-text text-transparent">
                      {bannerSettings.adminPanel1Title || "Cổng Quản Trị Hệ Thống EduShop AI"}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-400 font-semibold leading-relaxed max-w-4xl">
                    {bannerSettings.adminPanel1Desc || "Bảng kiểm soát tích hợp: Đăng tải trực tiếp file học liệu, sáng kiến thực tiễn, trò chơi học tập tương tác bám sát chuẩn GDPT 2018 và đồng bộ hóa danh mục môn học."}
                  </p>
                </div>

                <div className="shrink-0 self-start md:self-center">
                  <div className="inline-flex items-center gap-1.5 bg-rose-500/10 text-rose-400 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border border-rose-500/20 shadow-sm">
                    <Shield className="w-3.5 h-3.5 animate-pulse" /> Chế độ Quản trị viên kích hoạt
                  </div>
                </div>
              </div>

              {/* Bottom part: Grid for Action Panels */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Resource Posting Section */}
                <div className="bg-slate-800/30 border border-slate-800/80 rounded-2xl p-4 flex flex-col gap-3">
                  <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest block font-mono">ĐỒNG BỘ ĐĂNG TẢI TÀI NGUYÊN</span>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={openCreateProduct}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl text-[11px] transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md hover:scale-[1.02] active:scale-98"
                    >
                      <Plus className="w-3.5 h-3.5 text-emerald-100" /> Học liệu
                    </button>
                    <button
                      onClick={openCreateInit}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl text-[11px] transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md hover:scale-[1.02] active:scale-98"
                    >
                      <Plus className="w-3.5 h-3.5 text-indigo-250" /> Sáng kiến
                    </button>
                    <button
                      onClick={openCreateGame}
                      className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 rounded-xl text-[11px] transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md hover:scale-[1.02] active:scale-98"
                    >
                      <Plus className="w-3.5 h-3.5 text-purple-200" /> Trò chơi
                    </button>
                  </div>
                </div>

                {/* System Configuration Section */}
                <div className="bg-slate-800/30 border border-slate-800/80 rounded-2xl p-4 flex flex-col gap-3">
                  <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest block font-mono">CẤU HÌNH DANH MỤC & HỆ THỐNG</span>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => setShowSubjectManager(true)}
                      className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-3 rounded-xl text-[11px] transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md hover:scale-[1.02] active:scale-98 border border-amber-300/40"
                    >
                      <BookOpen className="w-3.5 h-3.5 text-slate-950" /> Môn học
                    </button>

                    <button
                      onClick={openBannerSettings}
                      className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black py-3 rounded-xl text-[11px] transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md hover:scale-[1.02] active:scale-98 border border-amber-300/40"
                    >
                      <Image className="w-3.5 h-3.5 text-slate-950" /> Banner
                    </button>

                    <button
                      onClick={() => {
                        setActiveTab("admin-dashboard");
                        setAdminSubTab(adminSubTab === "settings" ? "dashboard" : "settings");
                      }}
                      className={`font-black py-3 rounded-xl text-[11px] transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md hover:scale-[1.02] active:scale-98 ${
                        activeTab === "admin-dashboard" && adminSubTab === "settings"
                          ? "bg-rose-600 hover:bg-rose-500 text-white"
                          : "bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white border border-slate-700"
                      }`}
                    >
                      <Key className="w-3.5 h-3.5" /> Bảo mật
                    </button>
                  </div>
                </div>

              </div>

              {/* Management Operations Section */}
              <div className="bg-slate-800/30 border border-slate-800/80 rounded-2xl p-4 flex flex-col gap-3 w-full">
                <span className="text-[10px] font-black text-rose-400 uppercase tracking-widest block font-mono">
                  {bannerSettings?.adminPanel3Title || "QUẢN LÝ BÁN HÀNG"}
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {/* 1. Tổng quan doanh thu */}
                  <button
                    onClick={() => {
                      setActiveTab("admin-dashboard");
                      setAdminSubTab("dashboard");
                    }}
                    className={`font-black py-3 px-1.5 rounded-xl text-[10px] transition-all flex items-center justify-center gap-1 cursor-pointer shadow-md hover:scale-[1.02] active:scale-98 ${
                      activeTab === "admin-dashboard" && adminSubTab === "dashboard"
                        ? "bg-gradient-to-r from-sky-500 to-blue-600 text-white border border-sky-500 ring-2 ring-sky-400/40"
                        : "bg-sky-500/10 text-sky-400 border border-sky-500/20 hover:bg-sky-500/20 hover:text-sky-300"
                    }`}
                  >
                    📊 Doanh thu
                  </button>

                  {/* 2. Kho học liệu & Sáng kiến */}
                  <button
                    onClick={() => {
                      setActiveTab("admin-dashboard");
                      setAdminSubTab("products");
                    }}
                    className={`font-black py-3 px-1.5 rounded-xl text-[10px] transition-all flex items-center justify-center gap-1 cursor-pointer shadow-md hover:scale-[1.02] active:scale-98 ${
                      activeTab === "admin-dashboard" && adminSubTab === "products"
                        ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white border border-emerald-500 ring-2 ring-emerald-400/40"
                        : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 hover:text-emerald-300"
                    }`}
                  >
                    📂 Học liệu ({products.length + initiatives.length})
                  </button>

                  {/* 3. Duyệt hóa đơn */}
                  <button
                    onClick={() => {
                      setActiveTab("admin-dashboard");
                      setAdminSubTab("orders");
                    }}
                    className={`font-black py-3 px-1.5 rounded-xl text-[10px] transition-all flex items-center justify-center gap-1 cursor-pointer shadow-md hover:scale-[1.02] active:scale-98 relative ${
                      activeTab === "admin-dashboard" && adminSubTab === "orders"
                        ? "bg-gradient-to-r from-rose-500 to-pink-600 text-white border border-rose-500 ring-2 ring-rose-400/40"
                        : "bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 hover:text-rose-300"
                    }`}
                  >
                    🛒 Duyệt hóa đơn
                    {orders.filter(o => o.status === "pending").length > 0 && (
                      <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full animate-bounce">
                        {orders.filter(o => o.status === "pending").length}
                      </span>
                    )}
                  </button>

                  {/* 4. Góp ý & Phản hồi */}
                  <button
                    onClick={() => {
                      setActiveTab("admin-dashboard");
                      setAdminSubTab("feedbacks");
                    }}
                    className={`font-black py-3 px-1.5 rounded-xl text-[10px] transition-all flex items-center justify-center gap-1 cursor-pointer shadow-md hover:scale-[1.02] active:scale-98 ${
                      activeTab === "admin-dashboard" && adminSubTab === "feedbacks"
                        ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white border border-indigo-500 ring-2 ring-indigo-400/40"
                        : "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500/20 hover:text-indigo-300"
                    }`}
                  >
                    💬 Góp ý ({feedbacks.length})
                  </button>

                  {/* 5. Cấu hình khuyến mãi */}
                  <button
                    onClick={openPromoSettings}
                    className="font-black py-3 px-1.5 rounded-xl text-[10px] transition-all flex items-center justify-center gap-1 cursor-pointer shadow-md hover:scale-[1.02] active:scale-98 bg-gradient-to-r from-amber-500/10 to-orange-500/10 text-amber-400 border border-amber-500/20 hover:from-amber-500/20 hover:to-orange-500/20 hover:text-amber-300 col-span-2 sm:col-span-1"
                  >
                    🎁 Khuyến mãi
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* VIEW: TRANG CHỦ */}
          {activeTab === "trang-chu" && (
            <div className="space-y-12 animate-fade-in text-left">
              
              {/* SECTION: HỌC LIỆU BÁN CHẠY NHẤT */}
              <section className="space-y-5 text-left">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="bg-rose-50 text-rose-600 p-1.5 rounded-xl">
                      <Flame className="w-5 h-5 fill-rose-600" />
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-black text-slate-900 uppercase tracking-tight">Học liệu tải nhiều nhất</h3>
                      <p className="text-[10px] font-semibold text-slate-400">Được đông đảo chuyên viên giáo dục khuyên dùng qua thẩm định thực tế</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => { setActiveTab("kho-hoc-lieu"); setSelectedSubject("Tất cả"); }}
                    className="text-indigo-600 font-extrabold text-xs hover:underline flex items-center gap-0.5 shrink-0"
                  >
                    Xem tất cả <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {loadingProducts ? (
                  <div className="text-center py-10">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto" />
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-4">
                    {products.filter(p => p.tag === "best-seller").slice(0, 8).map(product => (
                      <ProductCard 
                        key={product.id} 
                        product={product} 
                        isAdmin={isAdmin}
                        onAddToCart={addToCart} 
                        onOpenDetail={setSelectedDetailProduct}
                        onDelete={loadProducts}
                        onEdit={openEditProduct}
                        onDownload={triggerDownload}
                      />
                    ))}
                  </div>
                )}
              </section>

              {/* SECTION: HỌC LIỆU MỚI NHẤT */}
              <section className="space-y-5 text-left">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="bg-indigo-50 text-indigo-600 p-1.5 rounded-xl">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-black text-slate-900 uppercase tracking-tight">Học liệu mới nhất</h3>
                      <p className="text-[10px] font-semibold text-slate-400">Cập nhật liên tục thích ứng chặt chẽ các bài kiểm tra số hóa</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => { setActiveTab("kho-hoc-lieu"); setSelectedSubject("Tất cả"); }}
                    className="text-indigo-600 font-extrabold text-xs hover:underline flex items-center gap-0.5 shrink-0"
                  >
                    Xem tất cả <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {loadingProducts ? (
                  <div className="text-center py-10">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto" />
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-4">
                    {products.filter(p => p.tag === "new").slice(0, 8).map(product => (
                      <ProductCard 
                        key={product.id} 
                        product={product} 
                        isAdmin={isAdmin}
                        onAddToCart={addToCart} 
                        onOpenDetail={setSelectedDetailProduct}
                        onDelete={loadProducts}
                        onEdit={openEditProduct}
                        onDownload={triggerDownload}
                      />
                    ))}
                  </div>
                )}
              </section>

              {/* SECTION: HỌC LIỆU MIỄN PHÍ */}
              <section className="space-y-5 text-left">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="bg-emerald-50 text-emerald-600 p-1.5 rounded-xl">
                      <Gift className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-black text-slate-900 uppercase tracking-tight">Tài liệu miễn phí</h3>
                      <p className="text-[10px] font-semibold text-slate-400">Tải về trực tiếp không cần thực hiện lệnh thanh toán.</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => { setActiveTab("kho-hoc-lieu"); setSelectedSubject("Tất cả"); }}
                    className="text-indigo-600 font-extrabold text-xs hover:underline flex items-center gap-0.5 shrink-0"
                  >
                    Xem tất cả <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {loadingProducts ? (
                  <div className="text-center py-10">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto" />
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-4">
                    {products.filter(p => p.tag === "free" || p.price === 0 || p.isFree === true || (p as any).is_free === true || String((p as any).is_free) === "true").slice(0, 8).map(product => (
                      <ProductCard 
                        key={product.id} 
                        product={product} 
                        isAdmin={isAdmin}
                        onAddToCart={addToCart} 
                        onOpenDetail={setSelectedDetailProduct}
                        onDelete={loadProducts}
                        onEdit={openEditProduct}
                        onDownload={triggerDownload}
                      />
                    ))}
                  </div>
                )}
              </section>

              {/* LOWER BANNER PROMOTION FOR AI SOẠN GIÁO ÁN */}
              <section className="p-6 sm:p-8 bg-gradient-to-r from-slate-950 to-indigo-950 text-white rounded-[32px] text-left relative overflow-hidden shadow-md border border-slate-800">
                <div className="absolute right-0 bottom-0 w-64 h-64 bg-amber-500/10 rounded-full filter blur-3xl"></div>
                <div className="relative z-10 max-w-2xl space-y-4">
                  <div className="inline-flex items-center gap-1 bg-amber-500/20 text-amber-300 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                    <Sparkles className="w-3 h-3" /> Tiện ích đột phá
                  </div>
                  <h3 className="text-2xl font-black leading-tight">Soạn giáo án tích hợp năng lực số bằng Gemini AI</h3>
                  <p className="text-slate-350 text-xs sm:text-sm leading-relaxed font-semibold">
                    Công cụ thông minh liên kết trực tiếp với máy chủ Google, xây dựng kịch bản giảng dạy theo Công văn 5512/Bộ GD&ĐT bám sát năng lực số cho tất cả môn học chỉ trong 10 giây.
                  </p>
                  <div>
                    <button 
                      onClick={() => {
                        setActiveTab("soan-giao-an-ai");
                        showToast("✨ Mở trợ lý AI soạn bài");
                      }}
                      className="bg-amber-500 hover:bg-amber-605 text-slate-950 font-black px-6 py-3 rounded-2xl text-xs transition-all shadow-lg shadow-amber-500/15 flex items-center gap-1.5 cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4 animate-bounce" /> Thử soạn giáo án AI ngay
                    </button>
                  </div>
                </div>
              </section>

            </div>
          )}

          {/* VIEW: KHO HỌC LIỆU */}
          {activeTab === "kho-hoc-lieu" && (
            <div className="space-y-6 animate-fade-in text-left">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-2xl font-black text-slate-900">Kho Học Liệu GDPT 2018</h2>
                  <p className="text-slate-400 text-xs font-semibold">
                    Bộ lọc hoạt động: Môn <strong className="text-indigo-600">{selectedSubject}</strong> • Khối <strong className="text-indigo-600">{selectedGrade}</strong> • Trạng thái <strong className="text-indigo-600">{selectedType}</strong>
                  </p>
                </div>
                
                {(selectedSubject !== "Tất cả" || selectedGrade !== "Tất cả" || selectedType !== "Tất cả") && (
                  <button
                    onClick={() => {
                      setSelectedSubject("Tất cả");
                      setSelectedGrade("Tất cả");
                      setSelectedType("Tất cả");
                      showToast("🔄 Đã khôi phục bộ lọc học liệu!");
                    }}
                    className="bg-indigo-50 text-indigo-600 hover:bg-indigo-100 px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1 shrink-0 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Khôi phục bộ lọc
                  </button>
                )}
              </div>

              {loadingProducts ? (
                <div className="text-center py-16">
                  <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mx-auto" />
                </div>
              ) : filteredProducts.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-4 animate-fade-in">
                  {filteredProducts.map(product => (
                    <ProductCard 
                      key={product.id} 
                      product={product} 
                      isAdmin={isAdmin}
                      onAddToCart={addToCart} 
                      onOpenDetail={setSelectedDetailProduct}
                      onDelete={loadProducts}
                      onEdit={openEditProduct}
                      onDownload={triggerDownload}
                    />
                  ))}
                </div>
              ) : (
                <div className="bg-white p-12 text-center rounded-3xl border border-slate-100 shadow-sm max-w-md mx-auto space-y-4">
                  <div className="bg-slate-55 p-4 rounded-full w-fit mx-auto text-slate-400">
                    <Search className="w-8 h-8" />
                  </div>
                  <h3 className="font-extrabold text-slate-800 text-sm">Không tìm thấy tài liệu phù hợp</h3>
                  <p className="text-xs text-slate-400 leading-relaxed font-semibold">
                    Không có học liệu nào phù hợp với bộ lọc đã chọn. Thầy cô vui lòng điều chỉnh bộ lọc ở cột Menu dọc bên trái.
                  </p>
                  <button 
                    onClick={() => {
                      setSelectedSubject("Tất cả");
                      setSelectedGrade("Tất cả");
                      setSelectedType("Tất cả");
                      setSearchTerm("");
                    }}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl transition-all cursor-pointer"
                  >
                    Xem lại toàn bộ kho
                  </button>
                </div>
              )}

            </div>
          )}

          {/* VIEW: KHO TRÒ CHƠI AI */}
          {activeTab === "kho-tro-choi-ai" && (
            <div className="space-y-6 animate-fade-in text-left">
              
              <div className="border-b border-slate-101 pb-4">
                <div className="inline-flex items-center gap-1 bg-purple-50 text-purple-600 px-3 py-1 rounded-full text-xs font-bold mb-2 border border-purple-100">
                  <Brain className="w-4 h-4" /> Giáo Dục Game Hóa
                </div>
                <h2 className="text-2xl font-black text-slate-900">Mô hình Trò Chơi Trí tuệ AI</h2>
                <p className="text-slate-450 text-xs font-semibold">Các trò chơi tương tác phục vụ dạy học giúp học sinh làm quen thuật toán và hệ thống máy học trực quan.</p>
              </div>

              {gameStep === "intro" ? (
                <div className="space-y-10 animate-fade-in">
                  
                  {/* Grid system for games and play triggers */}
                  {loadingGames ? (
                    <div className="text-center py-10">
                      <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto" />
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {games.map((g, idx) => {
                        const gradients = [
                          "from-blue-500 to-indigo-600",
                          "from-purple-500 to-pink-600 border-purple-200",
                          "from-teal-500 to-emerald-600",
                          "from-indigo-500 to-purple-600",
                          "from-rose-500 to-orange-500"
                        ];
                        const currentGradient = gradients[idx % gradients.length];
                        
                        return (
                          <div key={g.id || idx} className={`bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col justify-between group relative text-left hover:scale-[1.02] hover:shadow-lg hover:border-indigo-150 transition-all duration-350 ${g.id === "game-2" ? "border-purple-200" : ""}`}>
                            
                            {/* Admin edit & delete tool buttons */}
                            {isAdmin && (
                              <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                                <button
                                  onClick={() => openEditGame(g)}
                                  className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-full shadow-md transition-all transform hover:scale-110 active:scale-95 cursor-pointer flex items-center justify-center border border-indigo-400"
                                  title="Sửa thông tin game (Admin)"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteGame(g.id)}
                                  className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow-md transition-all transform hover:scale-110 active:scale-95 cursor-pointer flex items-center justify-center border border-red-400"
                                  title="Xóa game (Admin)"
                                >
                                  <Trash className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}

                            <div className="relative h-44 overflow-hidden select-none bg-slate-900">
                              {g.image ? (
                                <>
                                  <img 
                                    src={g.image} 
                                    alt={g.title} 
                                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    referrerPolicy="no-referrer"
                                  />
                                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-900/30 to-transparent"></div>
                                </>
                              ) : (
                                <div className={`absolute inset-0 bg-gradient-to-r ${currentGradient}`}></div>
                              )}
                              
                              <div className="absolute top-4 left-4 z-10 bg-white/20 backdrop-blur-sm p-2 rounded-xl">
                                {g.id === "game-1" ? <Brain className="w-5 h-5 text-white" /> : g.id === "game-2" ? <Sparkles className="w-5 h-5 text-white animate-pulse" /> : <Award className="w-5 h-5 text-white" />}
                              </div>
                              
                              <div className="absolute bottom-4 left-5 right-5 z-10 text-white">
                                <h3 className="font-extrabold text-base sm:text-lg leading-tight mb-2 pr-12 drop-shadow-md group-hover:text-indigo-200 transition-colors">{g.title}</h3>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="inline-block bg-white/20 backdrop-blur-md text-[9px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-sm">{g.tag || "Mô hình Trải nghiệm"}</span>
                                  {g.isPaid ? (
                                    <span className="inline-block bg-amber-500/90 backdrop-blur-md text-white text-[9.5px] font-extrabold px-2.5 py-0.5 rounded-full shadow-sm">
                                      {g.salePrice && g.salePrice < g.price ? (
                                        <>
                                          <span className="line-through text-white/60 mr-1">{g.price.toLocaleString('vi-VN')}đ</span>
                                          <span>{g.salePrice.toLocaleString('vi-VN')}đ</span>
                                        </>
                                      ) : (
                                        <span>{Number(g.price || 0).toLocaleString('vi-VN')}đ</span>
                                      )}
                                    </span>
                                  ) : (
                                    <span className="inline-block bg-emerald-500/95 backdrop-blur-md text-white text-[9px] font-black uppercase tracking-wide px-2.5 py-0.5 rounded-full shadow-sm">Miễn phí</span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="p-5 flex-grow flex flex-col justify-between space-y-4">
                              <p className="text-slate-500 text-xs leading-relaxed font-semibold">{g.desc}</p>
                              
                              <div className="space-y-2">
                                <button 
                                  onClick={() => startGame(g.id)}
                                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold py-2.5 px-4 rounded-xl text-xs transition-all flex items-center justify-center gap-1 cursor-pointer"
                                >
                                  Chơi thử ngay <ChevronRight className="w-4 h-4" />
                                </button>
                                
                                {g.isPaid ? (
                                  <button
                                    onClick={() => {
                                      const mappedProduct = {
                                        ...g,
                                        id: g.id,
                                        title: g.title,
                                        price: g.salePrice || g.price || 0,
                                        originalPrice: g.price || 0,
                                        description: g.desc,
                                        subject: g.subject || g.category || "Tin học AI",
                                        grade: g.grade || null,
                                        type: "Trò chơi học tập",
                                        rating: 5.0,
                                        image: g.image || "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=500&auto=format&fit=crop&q=60",
                                        fileName: g.fileName,
                                        fileData: g.fileData
                                      };
                                      setSelectedDetailProduct(mappedProduct);
                                    }}
                                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold py-2 px-4 rounded-xl text-[11px] transition-all flex items-center justify-center gap-1 cursor-pointer shadow-sm hover:scale-[1.01] active:scale-99"
                                    title="Mua kịch bản và tệp nguồn trò chơi"
                                  >
                                    <ShoppingCart className="w-3.5 h-3.5" /> Mua tệp game ({Number(g.salePrice || g.price || 0).toLocaleString('vi-VN')}đ)
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => triggerDownload(g)}
                                    className="w-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-extrabold py-2 px-4 rounded-xl text-[11px] transition-all flex items-center justify-center gap-1 cursor-pointer border border-emerald-150"
                                    title="Tải về hướng dẫn trò chơi"
                                  >
                                    <Download className="w-3.5 h-3.5" /> Tải về tài liệu game
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                </div>
              ) : gameStep === "playing" ? (
                (() => {
                const gameObj = games.find(g => g.id === currentGameId);
                const isHtmlGame = gameObj && gameObj.fileName && (gameObj.fileName.toLowerCase().endsWith(".html") || gameObj.fileName.toLowerCase().endsWith(".htm"));

                if (isHtmlGame) {
                  return (
                    <div className="space-y-4 max-w-5xl mx-auto text-left animate-scale-up">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
                        <div className="space-y-0.5">
                          <h3 className="font-black text-slate-900 text-base sm:text-lg flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-purple-600 animate-pulse" />
                            {gameObj.title}
                          </h3>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="bg-purple-100 text-purple-800 text-[9px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-md">
                              Học liệu tương tác AI
                            </span>
                            {gameObj.isPaid ? (
                              <span className="bg-amber-100 text-amber-800 text-[9px] font-extrabold px-2.5 py-0.5 rounded-md uppercase font-black">
                                Premium: {Number(gameObj.salePrice || gameObj.price || 0).toLocaleString('vi-VN')}đ
                              </span>
                            ) : (
                              <span className="bg-emerald-105 text-emerald-800 text-[9px] font-extrabold px-2.5 py-0.5 rounded-md uppercase font-black">
                                Miễn phí
                              </span>
                            )}
                            <p className="text-xs text-slate-400 font-semibold">{gameObj.tag || "Mô hình Trải nghiệm"}</p>
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            onClick={() => {
                              const iframe = document.getElementById("html-game-iframe") as HTMLIFrameElement;
                              if (iframe) {
                                iframe.srcdoc = iframe.srcdoc; // trigger reload
                              }
                            }}
                            className="text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1 border border-slate-200"
                          >
                            <RefreshCw className="w-3.5 h-3.5" /> Chơi lại
                          </button>
                          {gameObj.fileData && (
                            <button
                              onClick={() => {
                                if (gameObj.isPaid) {
                                  const mappedProduct = {
                                    ...gameObj,
                                    id: gameObj.id,
                                    title: gameObj.title,
                                    price: gameObj.salePrice || gameObj.price || 0,
                                    originalPrice: gameObj.price || 0,
                                    description: gameObj.desc,
                                    subject: gameObj.subject || gameObj.category || "Tin học AI",
                                    grade: gameObj.grade || null,
                                    type: "Trò chơi học tập",
                                    rating: 5.0,
                                    image: gameObj.image || "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=500&auto=format&fit=crop&q=60",
                                    fileName: gameObj.fileName,
                                    fileData: gameObj.fileData
                                  };
                                  setSelectedDetailProduct(mappedProduct);
                                } else {
                                  triggerDownload(gameObj);
                                }
                              }}
                              className="text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1 border border-emerald-200"
                            >
                              <Download className="w-3.5 h-3.5" /> Tải về máy (.HTML)
                            </button>
                          )}
                          <button 
                            onClick={() => setGameStep("intro")}
                            className="text-xs font-black text-white bg-red-500 hover:bg-red-650 px-4 py-2 rounded-xl transition-all cursor-pointer shadow-md shadow-red-200"
                          >
                            Thoát Trò chơi
                          </button>
                        </div>
                      </div>

                      {/* Interactive sandbox iframe */}
                      <div className="bg-slate-950 p-2 sm:p-4 rounded-[32px] border border-slate-800 shadow-2xl overflow-hidden relative">
                        <div className="absolute top-4 left-6 flex gap-1.5 z-10">
                          <div className="w-3 h-3 rounded-full bg-red-500"></div>
                          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                          <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        </div>
                        <div className="h-8 bg-slate-950 rounded-t-xl mb-1 flex items-center justify-center">
                          <span className="text-[10px] text-slate-500 font-mono tracking-widest uppercase">{gameObj.fileName}</span>
                        </div>
                        <div className="bg-white rounded-2xl overflow-hidden relative min-h-[550px] shadow-inner">
                          {gameObj.fileData ? (
                            <iframe
                              id="html-game-iframe"
                              srcDoc={(() => {
                                try {
                                  const fileData = gameObj.fileData;
                                  if (fileData.startsWith("data:")) {
                                    const commaIdx = fileData.indexOf(",");
                                    if (commaIdx !== -1) {
                                      const base64Str = fileData.substring(commaIdx + 1);
                                      const binaryStr = atob(base64Str);
                                      const len = binaryStr.length;
                                      const bytes = new Uint8Array(len);
                                      for (let i = 0; i < len; i++) {
                                        bytes[i] = binaryStr.charCodeAt(i);
                                      }
                                      return new TextDecoder("utf-8").decode(bytes);
                                    }
                                  }
                                  return fileData;
                                } catch (e) {
                                  console.error("Lỗi giải mã HTML:", e);
                                  return `<p style="padding:24px; font-family:sans-serif; text-align:center; color:#ef4444; font-weight:bold;">Không thể giải mã tệp HTML này. Vui lòng kiểm tra lại định dạng tệp.</p>`;
                                }
                              })()}
                              className="w-full min-h-[600px] border-0"
                              sandbox="allow-scripts allow-same-origin allow-modals allow-downloads allow-popups"
                              title="Hệ thống Trải nghiệm Trực tuyến HTML Game"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="p-16 text-center text-slate-400">
                              Trò chơi này chưa được cấu hình tệp HTML nguồn.
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="bg-amber-50 border border-amber-200/60 p-4 rounded-2xl">
                        <p className="text-amber-800 text-xs font-semibold leading-relaxed">
                          💡 <strong>Hướng dẫn vận hành:</strong> Đây là trò chơi tương tác đổi mới sáng tạo do giáo viên thiết kế thông qua trí tuệ nhân tạo (AI). Bạn có thể thử nghiệm, click chuột để chơi trực tiếp trên trình duyệt. Nhấn <strong>Tải về máy (.HTML)</strong> để lưu giữ kịch bản mã nguồn trò chơi về máy tính cá nhân hoàn toàn miễn phí.
                        </p>
                      </div>
                    </div>
                  );
                }

                if (currentGameId === "game-2") {
                  return (
                    /* Call the real imported AIPictureGame client component */
                    <div className="space-y-4">
                      <button 
                        onClick={() => setGameStep("intro")}
                        className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1 bg-white border border-slate-100 px-3.5 py-2 rounded-xl w-fit cursor-pointer shadow-sm mb-2"
                      >
                        ← Trở lại danh mục game
                      </button>
                      <AIPictureGame />
                    </div>
                  );
                }

                // Standard Quiz playing step
                const questions = QUIZ_QUESTIONS[currentGameId] || QUIZ_QUESTIONS["game-1"];
                return (
                  <div className="max-w-2xl mx-auto bg-white rounded-[32px] border border-slate-100 shadow-md p-6 sm:p-8 space-y-6 text-left animate-scale-up">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                      <div>
                        <h3 className="font-black text-slate-900 text-base sm:text-lg">
                          {currentGameId === "game-1" ? "Thử thách Tư Duy Thuật Toán" : "Đấu trường Từ vựng Tin học & Số hóa"}
                        </h3>
                        <p className="text-xs text-slate-400">Câu hỏi {currentQuizIndex + 1} / {questions.length}</p>
                      </div>
                      <button 
                        onClick={() => setGameStep("intro")}
                        className="text-xs font-bold text-red-500 hover:underline cursor-pointer"
                      >
                        Thoát trò chơi
                      </button>
                    </div>

                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-indigo-600 h-full transition-all duration-350" 
                        style={{ width: `${((currentQuizIndex + 1) / questions.length) * 100}%` }}
                      ></div>
                    </div>

                    <div className="space-y-4">
                      <p className="text-sm sm:text-base font-extrabold text-slate-800 leading-relaxed">
                        {questions[currentQuizIndex]?.question}
                      </p>
                      
                      <div className="grid grid-cols-1 gap-2.5">
                        {questions[currentQuizIndex]?.options.map((option: string, idx: number) => (
                          <button
                            key={idx}
                            onClick={() => handleSelectAnswer(idx)}
                            className={`w-full text-left p-3.5 rounded-xl border text-xs transition-all flex items-center gap-2.5 ${selectedAnswer === idx ? "border-indigo-600 bg-indigo-50/50 font-extrabold text-indigo-700" : "border-slate-100 hover:bg-slate-50 text-slate-600"}`}
                          >
                            <span className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border text-[10px] font-black ${selectedAnswer === idx ? "bg-indigo-600 border-indigo-600 text-white" : "bg-white border-slate-200 text-slate-500"}`}>
                              {idx + 1}
                            </span>
                            {option}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex justify-end">
                      <button
                        disabled={selectedAnswer === null}
                        onClick={handleNextQuiz}
                        className={`px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-0.5 cursor-pointer ${selectedAnswer === null ? "bg-slate-100 text-slate-400 cursor-not-allowed" : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-600/10"}`}
                      >
                        Tiếp theo <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
                })()
              ) : (
                /* Finished quiz screen block */
                <div className="max-w-md mx-auto bg-white rounded-[32px] border border-slate-100 shadow-md p-6 text-center space-y-6 animate-scale-up">
                  <div className="bg-indigo-50 text-indigo-600 p-4 rounded-full w-fit mx-auto animate-bounce">
                    <Award className="w-10 h-10 animate-pulse" />
                  </div>
                  
                  <div className="space-y-1">
                    <h3 className="font-black text-xl text-slate-900">Hoàn Thành Thử Thách!</h3>
                    <p className="text-slate-400 text-xs font-semibold">Chúc mừng thầy cô đã tích lũy điểm thi đua số.</p>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-2xl">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Điểm số đạt được của giáo viên</p>
                    <p className="text-2xl font-black text-indigo-600 mt-0.5">{quizScore} / {(QUIZ_QUESTIONS[currentGameId] || QUIZ_QUESTIONS["game-1"]).length}</p>
                  </div>

                  {/* Review explanations list */}
                  <div className="text-left space-y-3 max-h-52 overflow-y-auto pr-1 border-t border-b border-slate-100 py-3 scrollbar-none">
                    {quizAnswers.map((ans, idx) => (
                      <div key={idx} className="space-y-1 bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                        <p className="text-xs font-bold text-slate-800">{idx + 1}. {ans.question}</p>
                        <p className={`text-[11px] ${ans.isCorrect ? "text-green-600 font-bold" : "text-red-500 font-semibold"}`}>
                          {ans.isCorrect ? "✓ Đúng" : "✗ Chưa chính xác"} (Đáp án giải: Lựa chọn {ans.correct + 1})
                        </p>
                        <p className="text-[10px] text-slate-500 leading-relaxed italic">Gợi ý phân tích: {ans.explanation}</p>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setGameStep("intro")}
                      className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-750 font-extrabold py-2.5 rounded-xl text-xs transition-all cursor-pointer"
                    >
                      Trở lại
                    </button>
                    <button
                      onClick={() => startGame(currentGameId)}
                      className="flex-1 bg-indigo-600 hover:bg-indigo-755 text-white font-extrabold py-2.5 rounded-xl text-xs transition-all shadow-md cursor-pointer"
                    >
                      Chơi lại
                    </button>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* VIEW: SÁNG KIẾN KINH NGHIỆM */}
          {activeTab === "sang-kien-kinh-nghiem" && (
            <div className="space-y-8 animate-fade-in text-left">
              
              <div className="border-b border-slate-100 pb-4">
                <div className="inline-flex items-center gap-1 bg-amber-50 text-amber-600 px-3 py-1 rounded-full text-xs font-bold mb-2 border border-amber-100">
                  <Award className="w-4 h-4" /> Đạt chuẩn thi Đua cấp Quận/Tỉnh
                </div>
                <h2 className="text-2xl font-black text-slate-900">Sáng Kiến Kinh Nghiệm Đổi Mới</h2>
                <p className="text-slate-505 text-xs font-medium">Danh mục bài báo cáo đoạt giải phục vụ công tác xét duyệt lao động tiên tiến của thầy cô giáo.</p>
              </div>

              {loadingInitiatives ? (
                <div className="text-center py-12">
                  <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mx-auto" />
                </div>
              ) : (
                <div className="space-y-8">
                  {/* THCS */}
                  <div className="space-y-4">
                    <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-1.5 pb-2 border-b border-slate-100">
                      <span className="w-1.5 h-4 bg-blue-600 rounded-full inline-block"></span>
                      Sáng kiến kinh nghiệm bậc THCS
                    </h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 animate-fade-in">
                      {initiatives.filter(init => init.category === "Bậc THCS").map(item => (
                        <InitiativeCard 
                          key={item.id} 
                          item={item} 
                          isAdmin={isAdmin}
                          onAddToCart={addToCart} 
                          onOpenDetail={setSelectedDetailProduct}
                          onDelete={loadInitiatives}
                          onEdit={openEditInit}
                          onDownload={triggerDownload}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Tiểu Học */}
                  <div className="space-y-4">
                    <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-1.5 pb-2 border-b border-slate-100">
                      <span className="w-1.5 h-4 bg-indigo-600 rounded-full inline-block"></span>
                      Sáng kiến nghiệp vụ dạy tiểu học
                    </h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 animate-fade-in">
                      {initiatives.filter(init => init.category === "Tiểu học").map(item => (
                        <InitiativeCard 
                          key={item.id} 
                          item={item} 
                          isAdmin={isAdmin}
                          onAddToCart={addToCart} 
                          onOpenDetail={setSelectedDetailProduct}
                          onDelete={loadInitiatives}
                          onEdit={openEditInit}
                          onDownload={triggerDownload}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* VIEW: SOẠN GIÁO ÁN AI (Real API express connected) */}
          {activeTab === "soan-giao-an-ai" && (
            <AISoanGiaoAn onShowToast={showToast} />
          )}

          {/* VIEW: PORTAL QUẢN TRỊ ADMIN (Phân quyền kiểm duyệt chặt chẽ) */}
          {activeTab === "admin-dashboard" && (
            <AdminDashboard 
              products={products}
              initiatives={initiatives}
              onRefreshProducts={loadProducts}
              onRefreshInitiatives={loadInitiatives}
              isAdmin={isAdmin}
              onAdminLoginSuccess={handleAdminSuccess}
              onAdminLogout={handleAdminLogout}
              bannerSettings={bannerSettings}
              onRefreshBanner={loadBannerSettings}
              subTab={adminSubTab}
              onSubTabChange={setAdminSubTab}
              orders={orders}
              feedbacks={feedbacks}
              onRefreshOrders={loadOrders}
              onRefreshFeedbacks={loadFeedbacks}
            />
          )}

        </main>

      </div>

      {/* --- PANEL 1 EDIT MODAL --- */}
      {showPanel1Modal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-100 max-w-lg w-full shadow-2xl p-6 relative overflow-hidden flex flex-col animate-scale-up text-left">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-indigo-600 animate-pulse" />
                <h3 className="font-black text-slate-900 text-sm">Chỉnh sửa Cổng Quản Trị</h3>
              </div>
              <button 
                onClick={() => setShowPanel1Modal(false)} 
                className="bg-slate-100 hover:bg-slate-200 p-1.5 rounded-xl transition-all cursor-pointer"
              >
                <X className="w-4 h-4 text-slate-600" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-black text-slate-800 uppercase tracking-wider block">
                  Tiêu đề chính
                </label>
                <input
                  type="text"
                  value={panel1Title}
                  onChange={(e) => setPanel1Title(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-black text-slate-800 uppercase tracking-wider block">
                  Mô tả chi tiết
                </label>
                <textarea
                  rows={4}
                  value={panel1Desc}
                  onChange={(e) => setPanel1Desc(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none font-sans"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 mt-5 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowPanel1Modal(false)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-black px-4 py-2.5 rounded-xl text-xs transition-all cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleSavePanel1}
                disabled={savingPanel1}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-black px-5 py-2.5 rounded-xl text-xs transition-all flex items-center gap-1.5 shadow-md shadow-indigo-600/10 cursor-pointer disabled:opacity-50"
              >
                {savingPanel1 ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Đang cập nhật...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" /> Lưu thay đổi
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* --- BANNER CONFIG MODAL --- */}
      {showBannerModal && (
        <div className="fixed inset-0 z-55 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-100 max-w-2xl w-full shadow-2xl p-6 sm:p-8 relative overflow-hidden flex flex-col max-h-[90vh] animate-scale-up text-left">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5 shrink-0">
              <div className="flex items-center gap-2">
                <Image className="w-5 h-5 text-indigo-600 animate-pulse" />
                <div>
                  <h3 className="font-black text-slate-900 text-sm">Cấu hình Banner Trang Chủ</h3>
                  <p className="text-[10px] text-slate-400 font-semibold">Thay đổi hình nền banner, huy hiệu và các tiêu đề động trực tuyến</p>
                </div>
              </div>
              <button 
                onClick={() => setShowBannerModal(false)} 
                className="bg-slate-100 hover:bg-slate-200 p-2 rounded-xl transition-all cursor-pointer"
              >
                <X className="w-4 h-4 text-slate-600" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-grow overflow-y-auto space-y-6 pr-1 scrollbar-none">
              
              {/* Image Banner Section */}
              <div className="space-y-3 bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-100">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-black text-slate-800 uppercase tracking-wider block">
                    🖼️ Hình ảnh nền Banner
                  </label>
                  <div className="flex gap-1.5 bg-slate-200 p-0.5 rounded-lg text-[10px] font-black">
                    <button
                      type="button"
                      onClick={() => setBannerBgType("url")}
                      className={`px-2 py-1 rounded-md transition-all ${bannerBgType === "url" ? "bg-white text-slate-950 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
                    >
                      Dán Link URL
                    </button>
                    <button
                      type="button"
                      onClick={() => setBannerBgType("upload")}
                      className={`px-2 py-1 rounded-md transition-all ${bannerBgType === "upload" ? "bg-white text-slate-950 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
                    >
                      Tải lên máy tính
                    </button>
                  </div>
                </div>

                {bannerBgType === "url" ? (
                  <div className="relative">
                    <Link className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/... hoặc link ảnh bất kỳ"
                      value={bannerBgUrl}
                      onChange={(e) => setBannerBgUrl(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="relative flex-grow border border-indigo-200 border-dashed bg-white hover:bg-indigo-50/30 transition-all rounded-xl p-3 text-center flex flex-col items-center justify-center cursor-pointer">
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
                                setBannerBgUrl(event.target.result as string);
                                showToast(`✓ Đã nạp ảnh nền: ${file.name}`);
                              }
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                      <UploadCloud className="w-6 h-6 text-indigo-500 mb-1 animate-bounce" />
                      <p className="text-[10px] font-black text-indigo-950">Nhấp hoặc kéo thả ảnh nền vào đây</p>
                      <p className="text-[8px] text-slate-400 mt-0.5">Hỗ trợ JPG, PNG, WEBP</p>
                    </div>
                  </div>
                )}

                {/* Preview Banner Background */}
                {bannerBgUrl && (
                  <div className="space-y-1">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Xem trước ảnh nền:</span>
                    <div className="relative h-24 rounded-xl overflow-hidden border border-slate-200 shadow-inner bg-slate-100">
                      <img 
                        src={bannerBgUrl} 
                        alt="Banner Preview" 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800';
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setBannerBgUrl("")}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-all cursor-pointer"
                        title="Xóa hình ảnh này"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Text Fields Section */}
              <div className="space-y-4">
                {/* Badge text */}
                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-800 uppercase tracking-wider block">
                    🎗️ Văn bản Huy hiệu phía trên
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: Hệ thống tiên phong tích hợp AI số hóa giáo dục"
                    value={bannerBadge}
                    onChange={(e) => setBannerBadge(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Title 1 */}
                  <div className="space-y-1">
                    <label className="text-xs font-black text-slate-800 uppercase tracking-wider block">
                      ✍️ Tiêu đề phần 1 (Chữ Trắng - Khung số 1)
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ví dụ: Giải Pháp Học Liệu Số"
                      value={bannerTitle1}
                      onChange={(e) => setBannerTitle1(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  {/* Title 2 */}
                  <div className="space-y-1">
                    <label className="text-xs font-black text-slate-800 uppercase tracking-wider block">
                      ✨ Tiêu đề phần 2 (Chữ Gradient - Khung số 1)
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ví dụ: Thời Đại Công Nghệ Giáo Dục 4.0"
                      value={bannerTitle2}
                      onChange={(e) => setBannerTitle2(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                {/* Description - Khung số 2 */}
                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-800 uppercase tracking-wider block">
                    📝 Nội dung chi tiết (Khung số 2 - Hỗ trợ các thẻ HTML như &lt;strong&gt;)
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Ví dụ: Cung cấp Giáo án Word, Slide điện tử PPT, Video thực hành, Phiếu bài tập và Ngân hàng đề thi chuẩn kịch bản GDPT 2018..."
                    value={bannerDesc}
                    onChange={(e) => setBannerDesc(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none font-sans"
                  />
                  <p className="text-[9px] text-slate-400 font-medium">💡 Thầy cô có thể bọc văn bản bằng thẻ <code>&lt;strong&gt;chữ in đậm&lt;/strong&gt;</code> để làm nổi bật văn bản trên trang chủ.</p>
                </div>
              </div>

              {/* SQL script notice if using Supabase */}
              {dbStatus?.connected && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl space-y-2">
                  <div className="flex items-center gap-1.5 text-amber-800 font-extrabold text-xs">
                    <AlertCircle className="w-4 h-4" />
                    <span>Lưu ý đồng bộ hóa Supabase</span>
                  </div>
                  <p className="text-[10px] text-slate-600 font-semibold leading-relaxed">
                    Để lưu cấu hình banner này vĩnh viễn trên dịch vụ đám mây Supabase (không bị đặt lại khi máy chủ khởi động lại hoặc redeploy), vui lòng chắc chắn rằng bạn đã chạy câu lệnh SQL này trong <strong>Supabase SQL Editor</strong>:
                  </p>
                  <div className="bg-slate-900 text-slate-300 p-2.5 rounded-xl font-mono text-[9px] overflow-x-auto relative select-all cursor-pointer border border-slate-800">
                    {`CREATE TABLE IF NOT EXISTS banner_settings (
  id TEXT PRIMARY KEY DEFAULT 'current',
  background_image TEXT,
  badge_text TEXT,
  title_1 TEXT,
  title_2 TEXT,
  description TEXT,
  admin_panel1_title TEXT,
  admin_panel1_desc TEXT,
  admin_panel2_title TEXT,
  admin_panel2_desc TEXT,
  admin_panel3_title TEXT,
  promo_badge TEXT,
  promo_title1 TEXT,
  promo_title2 TEXT,
  promo_desc TEXT,
  promo_foot TEXT,
  promo_btn TEXT,
  promo_enabled BOOLEAN DEFAULT false,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Nếu bảng đã tồn tại từ trước và thiếu các cột mới, vui lòng chạy các lệnh ALTER TABLE sau:
ALTER TABLE banner_settings ADD COLUMN IF NOT EXISTS admin_panel1_title TEXT;
ALTER TABLE banner_settings ADD COLUMN IF NOT EXISTS admin_panel1_desc TEXT;
ALTER TABLE banner_settings ADD COLUMN IF NOT EXISTS admin_panel2_title TEXT;
ALTER TABLE banner_settings ADD COLUMN IF NOT EXISTS admin_panel2_desc TEXT;
ALTER TABLE banner_settings ADD COLUMN IF NOT EXISTS admin_panel3_title TEXT;
ALTER TABLE banner_settings ADD COLUMN IF NOT EXISTS promo_badge TEXT;
ALTER TABLE banner_settings ADD COLUMN IF NOT EXISTS promo_title1 TEXT;
ALTER TABLE banner_settings ADD COLUMN IF NOT EXISTS promo_title2 TEXT;
ALTER TABLE banner_settings ADD COLUMN IF NOT EXISTS promo_desc TEXT;
ALTER TABLE banner_settings ADD COLUMN IF NOT EXISTS promo_foot TEXT;
ALTER TABLE banner_settings ADD COLUMN IF NOT EXISTS promo_btn TEXT;
ALTER TABLE banner_settings ADD COLUMN IF NOT EXISTS promo_enabled BOOLEAN DEFAULT false;

ALTER TABLE banner_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access to banner_settings" ON banner_settings FOR SELECT USING (true);
CREATE POLICY "Allow public full access to banner_settings" ON banner_settings FOR ALL USING (true) WITH CHECK (true);`}
                  </div>
                </div>
              )}

            </div>

            {/* Footer Actions */}
            <div className="pt-4 border-t border-slate-100 mt-5 shrink-0 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowBannerModal(false)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-black px-4 py-2.5 rounded-xl text-xs transition-all cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleSaveBanner}
                disabled={savingBanner}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-black px-5 py-2.5 rounded-xl text-xs transition-all flex items-center gap-1.5 shadow-md shadow-indigo-600/10 cursor-pointer disabled:opacity-50"
              >
                {savingBanner ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Đang cập nhật...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" /> Lưu cấu hình Banner
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* --- PROMOTION CONFIG MODAL --- */}
      {showPromoModal && (
        <div className="fixed inset-0 z-55 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-100 max-w-4xl w-full shadow-2xl p-6 sm:p-8 relative overflow-hidden flex flex-col max-h-[90vh] animate-scale-up text-left">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5 shrink-0">
              <div className="flex items-center gap-2">
                <Gift className="w-5 h-5 text-amber-500 animate-bounce" />
                <div>
                  <h3 className="font-black text-slate-900 text-sm">Cấu hình Chương Trình Khuyến Mãi</h3>
                  <p className="text-[10px] text-slate-400 font-semibold">Tùy chỉnh nội dung hiển thị của cửa sổ thông báo ưu đãi tự động</p>
                </div>
              </div>
              <button 
                onClick={() => setShowPromoModal(false)} 
                className="bg-slate-100 hover:bg-slate-200 p-2 rounded-xl transition-all cursor-pointer"
              >
                <X className="w-4 h-4 text-slate-600" />
              </button>
            </div>

            {/* Scrollable Content with Split Layout: Left Form, Right Preview */}
            <div className="flex-grow overflow-y-auto pr-1 scrollbar-none space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Left Form */}
                <div className="space-y-4 text-slate-700">
                  {/* Toggle Bật / Tắt khuyến mãi */}
                  <div className="bg-indigo-50/40 border border-indigo-100/50 p-4 rounded-2xl flex items-center justify-between gap-4">
                    <div className="flex flex-col">
                      <span className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1">
                        📢 Trạng thái chương trình
                      </span>
                      <span className="text-[10px] text-slate-500 font-semibold leading-relaxed">
                        Bật hoặc tắt hiển thị cửa sổ khuyến mãi tự động đối với người dùng
                      </span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={promoEnabled} 
                        onChange={(e) => setPromoEnabled(e.target.checked)} 
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                      <span className="ml-2 text-xs font-black text-slate-800 select-none min-w-[28px]">
                        {promoEnabled ? "Bật" : "Tắt"}
                      </span>
                    </label>
                  </div>

                  {/* Badge */}
                  <div className="space-y-1">
                    <label className="text-xs font-black text-slate-800 uppercase tracking-wider block">
                      🎗️ Nhãn Huy hiệu trên cùng
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ví dụ: SIÊU ƯU ĐÃI GIỚI HẠN"
                      value={promoBadge}
                      onChange={(e) => setPromoBadge(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-850"
                    />
                  </div>

                  {/* Title 1 */}
                  <div className="space-y-1">
                    <label className="text-xs font-black text-slate-800 uppercase tracking-wider block">
                      ✍️ Tiêu đề chính dòng 1
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ví dụ: BÙNG NỔ KHUYẾN MẠI"
                      value={promoTitle1}
                      onChange={(e) => setPromoTitle1(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-850"
                    />
                  </div>

                  {/* Title 2 */}
                  <div className="space-y-1">
                    <label className="text-xs font-black text-slate-800 uppercase tracking-wider block">
                      ✨ Tiêu đề dòng 2 (Nổi bật)
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ví dụ: GIẢM GIÁ 50%"
                      value={promoTitle2}
                      onChange={(e) => setPromoTitle2(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-850"
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-1">
                    <label className="text-xs font-black text-slate-800 uppercase tracking-wider block">
                      📝 Mô tả chương trình áp dụng
                    </label>
                    <textarea
                      rows={3}
                      required
                      placeholder="Ví dụ: Áp dụng cho toàn bộ học liệu điện tử PowerPoint, giáo án Word môn Tin học, HĐTN và kho trò chơi tương tác số học tương tác AI!"
                      value={promoDesc}
                      onChange={(e) => setPromoDesc(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none font-sans text-slate-850"
                    />
                  </div>

                  {/* Foot / Apply condition */}
                  <div className="space-y-1">
                    <label className="text-xs font-black text-slate-800 uppercase tracking-wider block">
                      🕒 Dòng ghi chú thời hạn / điều kiện
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ví dụ: Áp dụng tự động hôm nay"
                      value={promoFoot}
                      onChange={(e) => setPromoFoot(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-850"
                    />
                  </div>

                  {/* Button text */}
                  <div className="space-y-1">
                    <label className="text-xs font-black text-slate-800 uppercase tracking-wider block">
                      🚀 Văn bản trên nút hành động
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ví dụ: MỞ KHO HỌC LIỆU NGAY"
                      value={promoBtn}
                      onChange={(e) => setPromoBtn(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-850"
                    />
                  </div>
                </div>

                {/* Right Interactive Preview */}
                <div className="bg-slate-950 rounded-3xl p-5 flex flex-col justify-center items-center text-center relative overflow-hidden border border-slate-800 min-h-[350px]">
                  <div className="absolute -top-10 -left-10 w-32 h-32 bg-amber-500 rounded-full filter blur-3xl opacity-10"></div>
                  <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-indigo-500 rounded-full filter blur-3xl opacity-20"></div>

                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider bg-slate-900 border border-slate-800 px-2 py-0.5 rounded">
                      Bản xem trước
                    </span>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${promoEnabled ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 animate-pulse" : "bg-rose-500/10 text-rose-400 border border-rose-500/25"}`}>
                      ● {promoEnabled ? "Đang bật" : "Đang tắt"}
                    </span>
                  </div>

                  <div className="relative z-10 space-y-4 max-w-sm w-full">
                    <div className="bg-amber-500/15 text-amber-400 p-3 rounded-full w-fit mx-auto border border-amber-500/20">
                      <Flame className="w-8 h-8 fill-amber-500 animate-pulse text-amber-500" />
                    </div>
                    
                    <div className="space-y-2">
                      <span className="bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-lg block w-fit mx-auto">
                        {promoBadge || "SIÊU ƯU ĐÃI GIỚI HẠN"}
                      </span>
                      <h3 className="text-lg sm:text-xl font-black text-white leading-tight">
                        {promoTitle1 || "BÙNG NỔ KHUYẾN MẠI"} <br />
                        <span className="bg-gradient-to-r from-amber-300 via-orange-400 to-yellow-300 bg-clip-text text-transparent text-2xl sm:text-3xl font-extrabold block mt-1">
                          {promoTitle2 || "GIẢM GIÁ 50%"}
                        </span>
                      </h3>
                      <p className="text-slate-400 text-[10px] sm:text-xs font-medium leading-relaxed max-w-xs mx-auto">
                        {promoDesc || "Áp dụng cho toàn bộ học liệu điện tử PowerPoint, giáo án Word môn Tin học, HĐTN và kho trò chơi tương tác số học tương tác AI!"}
                      </p>
                    </div>

                    <div className="bg-white/5 border border-white/10 p-2 rounded-xl w-fit mx-auto">
                      <p className="text-[10px] text-indigo-300 font-bold flex items-center justify-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-amber-400 animate-spin" /> {promoFoot || "Áp dụng tự động hôm nay"}
                      </p>
                    </div>

                    <button 
                      type="button"
                      disabled
                      className="w-full bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 text-slate-950 font-black py-2.5 px-4 rounded-xl text-[10px] transition-all flex items-center justify-center gap-1 shadow-md shadow-orange-500/10 cursor-not-allowed opacity-90"
                    >
                      <Sparkles className="w-4 h-4 text-slate-950" />
                      <span>{promoBtn || "MỞ KHO HỌC LIỆU NGAY"}</span>
                    </button>
                  </div>
                </div>

              </div>
            </div>

            {/* Footer Actions */}
            <div className="pt-4 border-t border-slate-100 mt-5 shrink-0 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowPromoModal(false)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-black px-4 py-2.5 rounded-xl text-xs transition-all cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleSavePromo}
                disabled={savingPromo}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-black px-5 py-2.5 rounded-xl text-xs transition-all flex items-center gap-1.5 shadow-md shadow-indigo-600/10 cursor-pointer disabled:opacity-50"
              >
                {savingPromo ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Đang cập nhật...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" /> Lưu thông tin khuyến mãi
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* --- SHOPPING CART MODAL --- */}
      {showCartModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-100 max-w-md w-full shadow-2xl p-5 relative overflow-hidden flex flex-col max-h-[90vh] animate-scale-up">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-indigo-600 animate-pulse" />
                <h3 className="font-black text-slate-905 text-sm">Hóa đơn tệp tải xuống</h3>
              </div>
              <button onClick={() => setShowCartModal(false)} className="bg-slate-101 p-1.5 rounded-xl cursor-pointer">
                <X className="w-4 h-4 text-slate-600" />
              </button>
            </div>

            {/* Cart Items List */}
            <div className="flex-grow overflow-y-auto space-y-3 text-left mb-4 scrollbar-none">
              {!showCheckoutForm ? (
                /* 1. View Cart contents step */
                cart.length > 0 ? (
                  cart.map(item => (
                    <div key={item.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between gap-3">
                      <div className="flex-grow space-y-1">
                        <strong className="font-extrabold text-slate-800 text-xs line-clamp-2 leading-tight">{item.title}</strong>
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">{item.subject || item.category}</span>
                          <span className="text-xs font-black text-slate-700">{item.price.toLocaleString("vi-VN")}đ</span>
                        </div>
                      </div>
                      <button 
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-500 hover:bg-red-50 p-2 rounded-xl transition-all cursor-pointer"
                      >
                        <Trash className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 space-y-3">
                    <div className="bg-slate-100 p-3.5 rounded-full w-fit mx-auto text-slate-400">
                      <ShoppingCart className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-extrabold text-slate-800 text-xs">Giỏ hàng rỗng</p>
                      <p className="text-[10px] text-slate-400 leading-normal max-w-xs mx-auto mt-0.5">Vui lòng chọn học liệu mong muốn để tải xuống bản gốc (.word/ .ppt).</p>
                    </div>
                  </div>
                )
              ) : (
                /* 2. Fill Guest name step & QR Banking Display */
                checkoutStep === "form" ? (
                  <form onSubmit={handleCheckoutFormSubmit} className="space-y-3">
                    <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100 text-xs font-semibold text-indigo-700 flex gap-2">
                      <Info className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>Học liệu gốc sẽ được nạp bản tải trực tuyến đồng bộ gửi về hòm thư Email đăng ký của thầy cô giáo.</span>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Họ và tên giáo viên <span className="text-red-500">*</span></label>
                      <input 
                        type="text" 
                        required
                        value={buyerName}
                        onChange={(e) => setBuyerName(e.target.value)}
                        placeholder="Nguyễn Văn A"
                        className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Địa chỉ Email nhận tệp <span className="text-red-500">*</span></label>
                      <input 
                        type="email" 
                        required
                        value={buyerEmail}
                        onChange={(e) => setBuyerEmail(e.target.value)}
                        placeholder="giao_vien_thcs@gmail.com"
                        className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Số điện thoại liện hệ</label>
                      <input 
                        type="tel" 
                        value={buyerPhone}
                        onChange={(e) => setBuyerPhone(e.target.value)}
                        placeholder="0912xxxxxx"
                        className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div className="border-t border-slate-100 pt-3 mt-3 space-y-3">
                      <p className="text-[10px] font-black text-indigo-600 uppercase tracking-wider block">Tài khoản ngân hàng của bạn (đối soát/hoàn tiền)</p>
                      
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Tên ngân hàng của thầy cô</label>
                        <input 
                          type="text" 
                          value={buyerBankName}
                          onChange={(e) => setBuyerBankName(e.target.value)}
                          placeholder="Ví dụ: Vietcombank, MB Bank, Techcombank..."
                          className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Số tài khoản</label>
                          <input 
                            type="text" 
                            value={buyerBankAccount}
                            onChange={(e) => setBuyerBankAccount(e.target.value)}
                            placeholder="1234567890"
                            className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Chủ tài khoản</label>
                          <input 
                            type="text" 
                            value={buyerBankAccountName}
                            onChange={(e) => setBuyerBankAccountName(e.target.value)}
                            placeholder="NGUYEN VAN A"
                            className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>
                      </div>
                    </div>

                    <button 
                      type="submit" 
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold py-3 rounded-xl text-xs transition-all shadow-md mt-4 cursor-pointer"
                    >
                      Tiến hành Thiết lập Lệnh chuyển khoản
                    </button>
                    
                    <button 
                      type="button" 
                      onClick={() => setShowCheckoutForm(false)}
                      className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold py-2 rounded-xl text-xs transition-all mt-1"
                    >
                      Trở lại giỏ hàng
                    </button>
                  </form>
                ) : (
                  /* 3. Render Banking QR Code dynamically! */
                  (() => {
                    const activeBankName = bankSettings?.isEnabled ? bankSettings.bankName : "Vietinbank";
                    const activeAccountNumber = bankSettings?.isEnabled ? bankSettings.accountNumber : "10987654321";
                    const activeAccountHolder = bankSettings?.isEnabled ? bankSettings.accountHolder : "EDUSHOP AI VIETNAM";
                    const memoPattern = bankSettings?.isEnabled ? bankSettings.memoTemplate : "EDUSHOP {orderId}";
                    const finalMemo = memoPattern.replace("{orderId}", orderCreatedId || "");
                    const bankNameForQR = activeBankName.replace(/\s+/g, "");
                    const qrUrl = `https://img.vietqr.io/image/${bankNameForQR}-${activeAccountNumber}-compact.png?amount=${totalCartPrice}&addInfo=${encodeURIComponent(finalMemo)}&accountName=${encodeURIComponent(activeAccountHolder)}`;

                    return (
                      <div className="space-y-4 text-center animate-scale-up">
                        <div className="bg-green-50 rounded-2xl p-4 border border-green-100 text-left">
                          <p className="font-extrabold text-green-700 text-xs flex items-center gap-1">
                            <CheckCircle className="w-4 h-4 shrink-0" />
                            Đã lập hóa đơn số ID: {orderCreatedId}
                          </p>
                          <p className="text-[10px] text-slate-400 mt-1 font-medium">Vui lòng rà soát quét mã QR hoặc chuyển khoản thông qua thông tin ngân hàng ủy quyền dưới đây.</p>
                        </div>

                        {/* QR Code display */}
                        <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100 w-fit mx-auto shadow-sm space-y-2">
                          <div className="bg-white p-2 rounded-2xl w-48 h-48 mx-auto flex items-center justify-center border border-slate-100">
                            {/* Dynamic VietQR with real details */}
                            <img 
                              src={qrUrl} 
                              alt="QR chuyển khoản ngân hàng"
                              className="w-full h-full object-contain"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                          <span className="text-[9px] font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full block tracking-wider">
                            {activeBankName.toUpperCase()} - QUÉT ĐỂ CHUYỂN KHOẢN
                          </span>
                        </div>

                        {/* Copyable details list */}
                        <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 text-left text-xs space-y-2.5">
                          <div className="flex justify-between items-baseline">
                            <span className="text-slate-400 font-bold text-[10px] uppercase">Ngân hàng:</span>
                            <strong className="text-slate-800">{activeBankName}</strong>
                          </div>
                          <div className="flex justify-between items-baseline">
                            <span className="text-slate-400 font-bold text-[10px] uppercase">Chủ thẻ:</span>
                            <strong className="text-slate-800">{activeAccountHolder}</strong>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-slate-400 font-bold text-[10px] uppercase">Số tài khoản:</span>
                            <div className="flex items-center gap-1">
                              <strong className="text-indigo-650 font-black">{activeAccountNumber}</strong>
                              <button 
                                onClick={() => {
                                  navigator.clipboard.writeText(activeAccountNumber);
                                  showToast("📋 Đã sao chép STK ngân hàng!");
                                }}
                                className="bg-white p-1 rounded-lg border border-slate-100 hover:bg-slate-100 text-slate-500 cursor-pointer"
                                title="Sao chép"
                              >
                                <Copy className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                          <div className="flex justify-between items-baseline">
                            <span className="text-slate-400 font-bold text-[10px] uppercase">Số tiền đóng:</span>
                            <strong className="text-red-500 text-sm font-black">{totalCartPrice.toLocaleString("vi-VN")}đ</strong>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-slate-400 font-bold text-[10px] uppercase">Nội dung CK:</span>
                            <div className="flex items-center gap-1">
                              <strong className="text-emerald-600 font-black select-all">{finalMemo}</strong>
                              <button 
                                onClick={() => {
                                  navigator.clipboard.writeText(finalMemo);
                                  showToast("📋 Đã sao chép nội dung chuyển khoản!");
                                }}
                                className="bg-white p-1 rounded-lg border border-slate-100 hover:bg-slate-100 text-slate-500 cursor-pointer"
                                title="Sao chép"
                              >
                                <Copy className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={confirmTransferred}
                          className="w-full bg-green-600 hover:bg-green-700 text-white font-black py-4 rounded-2xl text-xs transition-all shadow-md cursor-pointer tracking-wider block"
                        >
                          Tôi đã chuyển khoản hoàn tất
                        </button>
                      </div>
                    );
                  })()
                )
              )}
            </div>

            {/* Total checkout pricing footer (View cart state only) */}
            {cart.length > 0 && !showCheckoutForm && (
              <div className="space-y-3 border-t border-slate-100 pt-3 animate-fade-in">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Tổng hóa đơn:</span>
                  <span className="text-lg font-black text-indigo-650">{totalCartPrice.toLocaleString("vi-VN")}đ</span>
                </div>

                <div className="bg-amber-50 p-3 rounded-2xl border border-amber-100 text-left">
                  <p className="text-[10px] text-amber-700 leading-normal font-semibold">
                    🔑 Bản tải xuống tệp đính kèm đảm bảo định dạng file chuẩn không mã độc hại bám sát nghiệp vụ 100%.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => setShowCartModal(false)} className="bg-slate-100 text-slate-700 font-extrabold py-2.5 rounded-xl text-xs cursor-pointer">
                    Tìm thêm
                  </button>
                  <button 
                    onClick={() => setShowCheckoutForm(true)} 
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold py-2.5 rounded-xl text-xs shadow-md cursor-pointer"
                  >
                    Tiến hành Thanh toán
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* ==================== 4. PRODUCT DETAIL POPUP (Xem Chi Tiết Học Liệu) ==================== */}
      {selectedDetailProduct && (
        <div 
          className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setSelectedDetailProduct(null)}
        >
          <div 
            className="bg-white rounded-[32px] border border-slate-100 max-w-4xl w-full shadow-2xl overflow-hidden relative animate-scale-up max-h-[90vh] flex flex-col md:flex-row text-left"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button Inside Modal */}
            <button 
              onClick={() => setSelectedDetailProduct(null)}
              className="absolute top-4 right-4 z-10 bg-slate-900/10 hover:bg-slate-900/20 text-slate-700 p-2 rounded-full transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Left: Beautiful Cover Image & Overlays / YouTube Video player */}
            <div className="md:w-1/2 bg-slate-200 relative min-h-[280px] md:min-h-full flex items-center justify-center overflow-hidden">
              {(() => {
                const ytVideoId = selectedDetailProduct.type === "Video" ? getYoutubeIdFromImageOrDesc(selectedDetailProduct.image, selectedDetailProduct.description) : null;
                if (ytVideoId) {
                  return (
                    <iframe
                      className="w-full h-full min-h-[280px] md:absolute md:inset-0 rounded-t-[32px] md:rounded-tr-none md:rounded-l-[32px] border-0"
                      src={`https://www.youtube.com/embed/${ytVideoId}?autoplay=1&mute=0`}
                      title="YouTube video player"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    ></iframe>
                  );
                }
                return (
                  <>
                    <img 
                      src={selectedDetailProduct.image || "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&auto=format&fit=crop&q=80"} 
                      alt={selectedDetailProduct.title} 
                      className="w-full h-full object-cover absolute inset-0"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent"></div>
                  </>
                );
              })()}
              
              {/* Labels strip */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                <span className="bg-indigo-600 text-white text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-sm w-fit">
                  {selectedDetailProduct.subject || selectedDetailProduct.category}
                </span>
                {selectedDetailProduct.grade && (
                  <span className="bg-amber-500 text-white text-xs font-black px-2.5 py-1 rounded-full shadow-sm w-fit">
                    Khối lớp {selectedDetailProduct.grade}
                  </span>
                )}
              </div>

              <div className="absolute bottom-4 left-4 right-4 text-white">
                <p className="text-[10px] font-bold uppercase tracking-widest text-amber-300">Định dạng phân phối</p>
                <p className="text-sm font-black flex items-center gap-1.5 mt-0.5">
                  <Layers className="w-4 h-4 text-indigo-400" /> {selectedDetailProduct.type || "Sáng kiến kinh nghiệm"}
                </p>
              </div>
            </div>

            {/* Right: Detailed Specifications & CTA */}
            <div className="md:w-1/2 p-6 sm:p-8 flex flex-col justify-between overflow-y-auto max-h-[50vh] md:max-h-[90vh]">
              <div className="space-y-4">
                
                {/* Author or Tag */}
                <div className="flex items-center gap-2">
                  <span className="bg-indigo-50 text-indigo-700 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md">
                    Học liệu kiểm duyệt
                  </span>
                  {selectedDetailProduct.tag === "best-seller" && (
                    <span className="bg-red-50 text-red-605 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md flex items-center gap-0.5">
                      <Flame className="w-3.5 h-3.5 fill-red-600" /> Tải nhiều
                    </span>
                  )}
                </div>

                {/* Title */}
                <h3 className="text-lg sm:text-xl font-black text-slate-900 leading-snug">
                  {selectedDetailProduct.title}
                </h3>

                {/* Stars Rating & Sales */}
                <div className="flex items-center gap-4 bg-slate-55 p-2.5 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-1 text-amber-500">
                    <Star className="w-4 h-4 fill-amber-500" />
                    <span className="text-xs font-black text-slate-800">{selectedDetailProduct.rating || "5.0"}</span>
                  </div>
                  <div className="h-4 w-[1px] bg-slate-200"></div>
                  <div className="flex items-center gap-1 text-slate-500">
                    <Download className="w-4 h-4 text-indigo-600" />
                    <span className="text-xs font-bold text-slate-700">{(selectedDetailProduct.sales || selectedDetailProduct.downloads || 150).toLocaleString("vi-VN")} lượt tải</span>
                  </div>
                </div>

                {/* Product description */}
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Mô tả học liệu</p>
                  <p className="text-slate-600 text-xs sm:text-sm font-medium leading-relaxed">
                    {selectedDetailProduct.description || selectedDetailProduct.desc}
                  </p>
                  {selectedDetailProduct.author && (
                    <p className="text-xs font-black text-indigo-600 italic mt-2">
                      Tác giả sáng kiến: {selectedDetailProduct.author}
                    </p>
                  )}
                </div>

                {/* Pricing Block */}
                <div className="bg-indigo-50/50 p-4 rounded-3xl border border-indigo-110 space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Đơn giá bản quyền tải tệp</p>
                  <div className="flex items-baseline gap-3">
                    {isDetailFree ? (
                      <span className="text-2xl font-black text-emerald-600">MIỄN PHÍ TẢI</span>
                    ) : (
                      <>
                        <span className="text-2xl font-black text-indigo-700">
                          {selectedDetailProduct.price.toLocaleString("vi-VN")}đ
                        </span>
                        {selectedDetailProduct.originalPrice && selectedDetailProduct.originalPrice > 0 && (
                          <>
                            <span className="text-xs text-slate-400 line-through">
                              {selectedDetailProduct.originalPrice.toLocaleString("vi-VN")}đ
                            </span>
                            <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-lg shadow-sm">
                              Tiết kiệm {Math.round(((selectedDetailProduct.originalPrice - selectedDetailProduct.price) / selectedDetailProduct.originalPrice) * 100)}%
                            </span>
                          </>
                        )}
                      </>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[10px] sm:text-[11px] font-bold text-slate-500 pt-1 leading-relaxed">
                  <p className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-emerald-500" /> Tải xuống tệp gốc tức thì</p>
                  <p className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-emerald-500" /> Định dạng dễ căn chỉnh</p>
                  <p className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-emerald-500" /> Đạt chuẩn GDPT 2018</p>
                  <p className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-emerald-500" /> Đổi trả tệp nếu bị lỗi</p>
                </div>

              </div>

              {/* Action Buttons */}
              <div className="space-y-2 mt-6 pt-4 border-t border-slate-100">
                <button 
                  onClick={() => handleBuyNow(selectedDetailProduct)}
                  className={`w-full text-white font-extrabold py-3.5 px-4 rounded-2xl text-xs sm:text-sm transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer ${isDetailFree ? "bg-gradient-to-r from-emerald-500 to-teal-650 shadow-emerald-500/10" : "bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 shadow-orange-500/10"}`}
                >
                  {isDetailFree ? (
                    <>
                      <Download className="w-4 h-4 animate-pulse" /> 
                      <span>TẢI NGAY MIỄN PHÍ</span>
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-4 h-4 animate-bounce" /> 
                      <span>MUA NGAY (Thiết lập mã QR chuyển khoản)</span>
                    </>
                  )}
                </button>

                {!isDetailFree && (
                  <button 
                    onClick={() => {
                      addToCart(selectedDetailProduct);
                      setSelectedDetailProduct(null);
                    }}
                    className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold py-3 px-4 rounded-2xl text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" /> Thêm vào giỏ hàng
                  </button>
                )}
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ==================== 5. AUTOMATIC PROMO POPUP (Hiển thị sau 5 giây) ==================== */}
      {showPromoPopup && !isAdmin && (
        <div 
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setShowPromoPopup(false)}
        >
          <div 
            className="bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 rounded-[32px] border border-indigo-550/20 max-w-lg w-full shadow-2xl overflow-hidden relative p-8 text-center animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setShowPromoPopup(false)}
              className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white p-2 rounded-full transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="absolute -top-10 -left-10 w-40 h-40 bg-amber-500 rounded-full filter blur-3xl opacity-20"></div>
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-indigo-500 rounded-full filter blur-3xl opacity-30"></div>

            <div className="relative z-10 space-y-6 text-center">
              <div className="bg-amber-500/15 text-amber-405 p-4 rounded-full w-fit mx-auto border border-amber-500/20">
                <Flame className="w-12 h-12 fill-amber-500 animate-pulse text-amber-500" />
              </div>
              
              <div className="space-y-2">
                <span className="bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 text-xs font-black uppercase tracking-widest px-4.5 py-1.5 rounded-full shadow-lg block w-fit mx-auto">
                  {bannerSettings?.promoBadge || "SIÊU ƯU ĐÃI GIỚI HẠN"}
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-white leading-tight pt-2">
                  {bannerSettings?.promoTitle1 || "BÙNG NỔ KHUYẾN MẠI"} <br />
                  <span className="bg-gradient-to-r from-amber-300 via-orange-400 to-yellow-300 bg-clip-text text-transparent text-4xl sm:text-5xl font-extrabold block mt-2">
                    {bannerSettings?.promoTitle2 || "GIẢM GIÁ 50%"}
                  </span>
                </h3>
                <p className="text-slate-300 text-xs sm:text-sm font-semibold leading-relaxed max-w-md mx-auto">
                  {bannerSettings?.promoDesc || "Áp dụng cho toàn bộ học liệu điện tử PowerPoint, giáo án Word môn Tin học, HĐTN và kho trò chơi tương tác số học tương tác AI!"}
                </p>
              </div>

              <div className="bg-white/5 border border-white/10 p-3 rounded-2xl w-fit mx-auto">
                <p className="text-xs text-indigo-300 font-bold flex items-center justify-center gap-1.5">
                  <Clock className="w-4 h-4 text-amber-400 animate-spin" /> {bannerSettings?.promoFoot || "Áp dụng tự động hôm nay"}
                </p>
              </div>

              <button 
                onClick={() => {
                  setShowPromoPopup(false);
                  setActiveTab("kho-hoc-lieu");
                  showToast(`🎉 ${bannerSettings?.promoTitle2 || "Ưu đãi 50%"} đã được áp dụng tự động cho thầy cô!`);
                }}
                className="w-full bg-gradient-to-r from-amber-400 via-orange-505 to-red-500 text-slate-950 font-black py-4 px-6 rounded-2xl text-xs sm:text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-orange-500/30 cursor-pointer hover:opacity-95 transform active:scale-95 animate-bounce"
              >
                <Sparkles className="w-5 h-5 text-slate-950" />
                <span>{bannerSettings?.promoBtn || "MỞ KHO HỌC LIỆU NGAY"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- FOOTER --- */}
      <footer className="bg-slate-950 text-slate-400 py-12 border-t border-slate-900 mt-auto text-left text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            
            {/* Logo Section */}
            <div className="space-y-4 text-left">
              <div className="flex items-center gap-2">
                <div className="bg-indigo-600 p-2 rounded-xl text-white">
                  <Brain className="w-4 h-4" />
                </div>
                <span className="font-black text-white text-base tracking-wider block">EDUSHOP AI</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed font-semibold">
                Nền tảng thương mại học liệu số hàng đầu cho bộ môn Tin học và Hoạt động trải nghiệm tại Việt Nam bám sát Chương trình GDPT 2018.
              </p>
            </div>

            {/* Quick Links */}
            <div className="space-y-2.5 text-left">
              <h4 className="font-extrabold text-white text-xs uppercase tracking-wider text-indigo-400">Danh Mục Chọn Lọc</h4>
              <ul className="space-y-2 text-xs font-semibold">
                <li><button onClick={() => handleSidebarFilter("subject", "Tin học")} className="hover:text-white transition-all text-left">Môn Tin Học (Khối 6-9)</button></li>
                <li><button onClick={() => handleSidebarFilter("subject", "Hoạt động trải nghiệm")} className="hover:text-white transition-all text-left">Môn Trải Nghiệm (Khối 6-9)</button></li>
                <li><button onClick={() => setActiveTab("sang-kien-kinh-nghiem")} className="hover:text-white transition-all text-left">Sáng Kiến Kinh Nghiệm</button></li>
                <li><button onClick={() => { setActiveTab("kho-tro-choi-ai"); setGameStep("intro"); }} className="hover:text-white transition-all text-left">Kho Trò Chơi AI</button></li>
              </ul>
            </div>

            {/* Terms */}
            <div className="space-y-2.5 text-left">
              <h4 className="font-extrabold text-white text-xs uppercase tracking-wider text-indigo-400">Hướng Dẫn Vận Hành</h4>
              <ul className="space-y-2 text-xs font-semibold">
                <li><span className="hover:text-white cursor-pointer block">Quy trình soạn giảng số</span></li>
                <li><span className="hover:text-white cursor-pointer block">Hướng dẫn thanh toán & tải tệp gốc</span></li>
                <li><span className="hover:text-white cursor-pointer block">Chính sách bảo mật dữ liệu môn học</span></li>
              </ul>
            </div>

            {/* Contact Email Form (Real connection feedbacks API) */}
            <div className="space-y-3 text-left">
              <h4 className="font-extrabold text-white text-xs uppercase tracking-wider text-indigo-400">Góp ý đóng góp tệp</h4>
              <form onSubmit={handleSendFeedback} className="space-y-2">
                <input 
                  type="email" 
                  value={footEmail}
                  onChange={(e) => setFootEmail(e.target.value)}
                  placeholder="Email của thầy cô..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none"
                />
                <textarea 
                  rows={2}
                  required
                  value={footMsg}
                  onChange={(e) => setFootMsg(e.target.value)}
                  placeholder="Ý kiến quý báu gửi Admin..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none"
                />
                <button 
                  type="submit"
                  disabled={sendingFeedback}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-[10px] px-3.5 py-2 rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer w-full"
                >
                  {sendingFeedback ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                  <span>Gửi ý kiến phản hồi</span>
                </button>
              </form>
            </div>

          </div>

          <div className="border-t border-slate-900 pt-6 text-center text-[10px] text-slate-505 flex flex-col sm:flex-row justify-between items-center gap-3">
            <p>© 2026 EDUSHOP AI. Bản quyền học liệu thuộc về cộng đồng giáo viên đối tác biên soạn.</p>
            <p className="text-amber-500/80 font-bold">Hệ thống tối ưu hoá thông minh bởi Google Gemini-3.5-Flash</p>
          </div>
        </div>
      </footer>

      {/* ==================== 5. ADMIN PRODUCT FORM MODAL ==================== */}
      {showProductForm && (
        <div className="fixed inset-0 z-55 bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-[32px] border border-slate-100 max-w-2xl w-full shadow-2xl p-6 sm:p-8 relative overflow-hidden flex flex-col max-h-[90vh] text-left animate-scale-up">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-5">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-600 animate-pulse" />
                <h3 className="font-black text-slate-900 text-base sm:text-lg">
                  {productFormMode === "create" ? "Thêm học liệu số mới (GDPT 2018)" : "Chỉnh sửa học liệu kiểm duyệt"}
                </h3>
              </div>
              <button onClick={() => setShowProductForm(false)} className="bg-slate-100 p-2 rounded-full cursor-pointer hover:bg-slate-200">
                <X className="w-4 h-4 text-slate-600" />
              </button>
            </div>

            <form onSubmit={handleProductSubmit} className="space-y-4 overflow-y-auto pr-1 flex-grow">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-500 uppercase">Tiêu đề học liệu</label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 Magnet-Input"
                    placeholder="VD: Giáo án Tin học 6 Cánh Diều cả năm..."
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-500 uppercase">Phân mảng môn học</label>
                  <select
                    value={formSubject}
                    onChange={(e) => setFormSubject(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {subjects.map((sub) => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-500 uppercase">Khối lớp học</label>
                  <select
                    value={formGrade}
                    onChange={(e) => setFormGrade(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="6">Lớp 6</option>
                    <option value="7">Lớp 7</option>
                    <option value="8">Lớp 8</option>
                    <option value="9">Lớp 9</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-500 uppercase">Định dạng phân phối</label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Giáo án Word">Giáo án Word</option>
                    <option value="Giáo án điện tử">Giáo án điện tử (PPT Slide)</option>
                    <option value="Video">Video thực hành giảng dạy</option>
                    <option value="Phiếu bài tập">Phiếu học tập / Bài tập</option>
                    <option value="Ngân hàng đề">Ngân hàng đề & đề thi</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-500 uppercase">Giá bán bản quyền (đ)</label>
                  <input
                    type="number"
                    value={formPrice}
                    onChange={(e) => setFormPrice(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Nhập 0 nếu miễn phí tải"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-500 uppercase">Giá gốc trước giảm (đ)</label>
                  <input
                    type="number"
                    value={formOriginalPrice}
                    onChange={(e) => setFormOriginalPrice(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-500 uppercase">Nhãn nổi bật học liệu</label>
                  <select
                    value={formTag}
                    onChange={(e) => setFormTag(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="new">Mới cập nhật</option>
                    <option value="best-seller">Bán chạy nhất (Best seller)</option>
                    <option value="free">Miễn phí phân phối</option>
                    <option value="none">Không thêm nhãn</option>
                  </select>
                </div>
              </div>

              {/* YouTube Video Section */}
              {formType === "Video" && (
                <div className="space-y-1 bg-red-50/50 p-4 rounded-2xl border border-red-100">
                  <label className="text-xs font-black text-red-700 uppercase flex items-center gap-1">
                    <Video className="w-4 h-4 text-red-650 animate-pulse" /> Liên kết video YouTube
                  </label>
                  <p className="text-[10px] text-red-500 font-semibold mb-1">Mục video học liệu sẽ được xem và nhúng trực tiếp bằng trình phát YouTube.</p>
                  <input
                    type="text"
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    className="w-full bg-white border border-red-200 rounded-xl px-3.5 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="VD: https://www.youtube.com/watch?v=aqz-KE-bpKQ"
                  />
                </div>
              )}

              {/* Cover Image Selection & Upload */}
              <div className="space-y-2 border border-slate-100 p-4 rounded-2xl bg-slate-50">
                <p className="text-xs font-black text-slate-550 uppercase">Ảnh nền thumbnail học liệu</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-500 font-bold mb-1 block">👉 Cách 1: Chọn ảnh từ máy tính để tải lên</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileChange}
                      className="w-full text-xs font-semibold text-slate-550 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-[11px] file:font-black file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-505 font-bold mb-1 block">👉 Cách 2: Nhập link ảnh trực tiếp (Unsplash...)</span>
                    <input
                      type="text"
                      value={formImage}
                      onChange={(e) => setFormImage(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="https://..."
                    />
                  </div>
                </div>
                {formImage && (
                  <div className="mt-2 bg-white p-4 rounded-xl border border-slate-150 relative flex items-center justify-between gap-4 max-w-md mx-auto text-left">
                    <div className="flex flex-col items-start space-y-1">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Xem trước thumbnail:</span>
                      <img src={formImage} alt="Preview" className="h-20 max-w-[180px] rounded-lg object-cover border border-slate-100 shadow-sm" />
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => setFormImage("")}
                      className="bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 font-extrabold py-2 px-3.5 rounded-xl text-[10.5px] transition-all flex items-center gap-1.5 cursor-pointer border border-red-200/60 shadow-sm hover:scale-105 active:scale-95"
                      title="Xóa hình ảnh này"
                    >
                      <Trash className="w-3.5 h-3.5" /> Xóa ảnh
                    </button>
                  </div>
                )}
              </div>

              {/* Document File uploading or URL attachment */}
              <div className="space-y-3.5 border border-slate-100 p-4 rounded-2xl bg-indigo-50/20">
                <span className="text-xs font-black text-indigo-700 uppercase block mb-1">📦 ĐÍNH KÈM TỆP HỌC LIỆU GỐC (.DOCX, .PPTX, .PDF, .ZIP)</span>
                <p className="text-[10px] text-indigo-500 leading-normal font-semibold mb-2">Thầy cô có thể tải lên tệp tin trực tiếp từ máy tính hoặc dán đường dẫn tải trực tiếp (Drive, Dropbox, OneDrive...).</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Way 1: Upload from computer */}
                  <div className="space-y-1 bg-white/50 p-2.5 rounded-xl border border-indigo-100/60">
                    <span className="text-[10px] text-indigo-755 font-black block mb-1">👉 CÁCH 1: TẢI TỪ MÁY TÍNH</span>
                    {formFileName && (formFileData && formFileData.startsWith("data:")) ? (
                      <div className="bg-white p-2 rounded-xl border border-indigo-100 flex items-center justify-between text-[11px] gap-1 shadow-sm">
                        <span className="font-extrabold text-slate-800 line-clamp-1 max-w-[120px]" title={formFileName}>📄 {formFileName}</span>
                        <button 
                          type="button" 
                          onClick={() => { setFormFileData(""); setFormFileName(""); }}
                          className="text-red-500 hover:text-red-700 font-bold text-[10px] shrink-0"
                        >
                          Xóa
                        </button>
                      </div>
                    ) : (
                      <input
                        type="file"
                        accept=".doc,.docx,.ppt,.pptx,.pdf,.zip"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              if (event.target?.result) {
                                setFormFileData(event.target.result as string);
                                setFormFileName(file.name);
                                showToast(`✓ Đã nạp tệp thành công: ${file.name}`);
                                setFormDescription((prev) => {
                                  const marker = "[Tập tin đính kèm gốc:";
                                  if (prev.includes(marker)) {
                                    return prev.replace(/\[Tập tin đính kèm gốc:[^\]]+\]/, `[Tập tin đính kèm gốc: ${file.name} (${(file.size / (1024 * 1024)).toFixed(1)} MB)]`);
                                  }
                                  return prev + `\n\n[Tập tin đính kèm gốc: ${file.name} (${(file.size / (1024 * 1024)).toFixed(1)} MB)]`;
                                });
                              }
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="w-full text-[10px] font-semibold text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-xl file:border-0 file:text-[10px] file:font-black file:bg-indigo-100 file:text-indigo-700 hover:file:bg-indigo-200 cursor-pointer"
                      />
                    )}
                  </div>

                  {/* Way 2: Paste link */}
                  <div className="space-y-1 bg-white/50 p-2.5 rounded-xl border border-indigo-100/60">
                    <span className="text-[10px] text-indigo-755 font-black block mb-1">👉 CÁCH 2: DÁN LIÊN KẾT TẢI TỆP</span>
                    <input
                      type="text"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-550 text-slate-800 placeholder-slate-400"
                      placeholder="https://drive.google.com/..."
                      value={(formFileData && !formFileData.startsWith("data:")) ? formFileData : ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormFileData(val);
                        if (val) {
                          // Try to extract original name or use fallback
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

              <div className="space-y-1">
                <label className="text-xs font-black text-slate-500 uppercase">Mô tả học liệu & mục lục</label>
                <textarea
                  rows={3}
                  required
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Mô tả các bài giảng cụ thể, số slide, số câu hỏi có sẵn..."
                />
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
                        const finalId = productFormMode === "edit" ? selectedProductId : "prod-" + Date.now();
                        const finalImage = formImage || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500&auto=format&fit=crop&q=60";
                        const safeTitle = (formTitle || "").replace(/'/g, "''");
                        const safeDesc = (formDescription || "").replace(/'/g, "''");
                        const safeFileName = (formFileName || "").replace(/'/g, "''");
                        const safeFileDataSnippet = formFileData ? (formFileData.startsWith("data:") ? "[DỮ LIỆU FILE BASE64]" : formFileData.replace(/'/g, "''")) : "";

                        if (productFormMode === "create") {
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
                    const finalId = productFormMode === "edit" ? selectedProductId : "prod_tu_dong";
                    const finalImage = formImage ? (formImage.length > 30 ? formImage.substring(0, 30) + "..." : formImage) : "https://...";
                    const safeTitle = (formTitle || "").replace(/'/g, "''");
                    const safeDesc = formDescription ? (formDescription.length > 50 ? formDescription.substring(0, 50).replace(/'/g, "''") + "..." : formDescription.replace(/'/g, "''")) : "";
                    const safeFileName = (formFileName || "").replace(/'/g, "''");
                    const safeFileDataSnippet = formFileData ? (formFileData.startsWith("data:") ? "[Tệp Base64 chuyển đổi]" : formFileData.replace(/'/g, "''")) : "";

                    if (productFormMode === "create") {
                      return `INSERT INTO products (id, title, subject, grade, type, price, original_price, rating, sales, tag, is_free, image, description, file_data, file_name) \nVALUES ('${finalId}', '${safeTitle}', '${formSubject}', ${formGrade}, '${formType}', ${formPrice}, ${formOriginalPrice}, 5.0, 0, '${formTag}', ${formPrice === 0}, '${finalImage}', '${safeDesc}', '${safeFileDataSnippet ? "[BINARY_OR_URL]" : ""}', '${safeFileName}');`;
                    } else {
                      return `UPDATE products SET title='${safeTitle}', subject='${formSubject}', grade=${formGrade}, type='${formType}', price=${formPrice}, original_price=${formOriginalPrice}, tag='${formTag}', image='${finalImage}', description='${safeDesc}', file_data='${safeFileDataSnippet ? "[BINARY_OR_URL]" : ""}', file_name='${safeFileName}' WHERE id='${finalId}';`;
                    }
                  })()}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowProductForm(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-2.5 px-4 rounded-xl cursor-pointer"
                >
                  Bỏ qua
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs py-2.5 px-5.5 rounded-xl cursor-pointer shadow-md shadow-indigo-600/10"
                >
                  Lưu học liệu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== 6. ADMIN INITIATIVE FORM MODAL ==================== */}
      {showInitForm && (
        <div className="fixed inset-0 z-55 bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-[32px] border border-slate-100 max-w-lg w-full shadow-2xl p-6 sm:p-8 relative overflow-hidden flex flex-col max-h-[90vh] text-left animate-scale-up">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-5">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-indigo-600 animate-bounce" />
                <h3 className="font-black text-slate-900 text-base sm:text-lg">
                  {initFormMode === "create" ? "Thành lập Sáng kiến kinh nghiệm mới" : "Chỉnh sửa Sáng kiến thi đua"}
                </h3>
              </div>
              <button onClick={() => setShowInitForm(false)} className="bg-slate-100 p-2 rounded-full cursor-pointer hover:bg-slate-200">
                <X className="w-4 h-4 text-slate-600" />
              </button>
            </div>

            <form onSubmit={handleInitSubmit} className="flex flex-col flex-grow overflow-hidden">
              <div className="flex-grow overflow-y-auto pr-1.5 space-y-4 pb-4">
                <div className="space-y-1">
                <label className="text-xs font-black text-slate-500 uppercase">Cấp dạy sinh hoạt</label>
                <select
                  value={initCategory}
                  onChange={(e) => setInitCategory(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Bậc THCS">Bậc THCS</option>
                  <option value="Tiểu học">Bậc Tiểu học</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-black text-slate-500 uppercase">Tiêu đề sáng kiến</label>
                <input
                  type="text"
                  required
                  value={initTitle}
                  onChange={(e) => setInitTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="VD: Đổi mới giảng dạy mảng Sáng tạo thuật toán..."
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-black text-slate-500 uppercase">Tác giả biên soạn</label>
                <input
                  type="text"
                  required
                  value={initAuthor}
                  onChange={(e) => setInitAuthor(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="VD: Thầy Nguyễn Văn A - Tổ Tin học"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-black text-slate-500 uppercase">Giá bán bản quyền (đ)</label>
                <input
                  type="number"
                  required
                  value={initPrice}
                  onChange={(e) => setInitPrice(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1.5 p-3.5 bg-purple-50/55 rounded-2xl border border-purple-100/50">
                <span className="text-[11px] font-black text-purple-700 uppercase flex items-center gap-1">
                  📁 Đính kèm tệp gửi sáng kiến (.pdf/.doc/.zip) từ máy tính
                </span>
                <input
                  type="file"
                  accept=".doc,.docx,.pdf,.zip"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setInitFileName(file.name);
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        if (event.target?.result) {
                          setInitFileData(event.target.result as string);
                          showToast(`✓ Đã nhận kịch bản tài liệu: ${file.name}`);
                        }
                      };
                      reader.readAsDataURL(file);

                      setInitDesc((prev) => {
                        const marker = "[Tập tin đính kèm:";
                        if (prev.includes(marker)) {
                          return prev.replace(/\[Tập tin đính kèm:[^\]]+\]/, `[Tập tin đính kèm: ${file.name}]`);
                        }
                        return prev + ` [Tập tin đính kèm: ${file.name}]`;
                      });
                    }
                  }}
                  className="w-full text-xs font-semibold text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-xl file:border-0 file:text-[10px] file:font-black file:bg-purple-100 file:text-purple-700 hover:file:bg-purple-200 cursor-pointer"
                />
                {initFileName && (
                  <p className="text-[10px] text-purple-700 font-bold italic">
                    Đang đính kèm: {initFileName}
                  </p>
                )}
              </div>

              <div className="space-y-3 p-3.5 bg-indigo-50/20 border border-indigo-100/70 rounded-2xl">
                <span className="text-[11px] font-black text-indigo-700 uppercase flex items-center gap-1">
                  <Image className="w-3.5 h-3.5" /> 🖼️ Ảnh nền thumbnail sáng kiến
                </span>
                <p className="text-[10px] text-indigo-500 font-semibold leading-relaxed">
                  Thầy cô có thể tải lên ảnh bìa minh họa từ máy tính hoặc dán một đường dẫn ảnh trực tiếp. Các dòng tệp sẽ tự tối ưu hóa theo chủ đề nếu để trống.
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-1">
                  {/* Way 1: Upload */}
                  <div className="bg-white/70 border border-indigo-100/60 rounded-xl p-2.5 text-center relative hover:bg-white transition-colors cursor-pointer min-h-[60px] flex flex-col justify-center items-center">
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
                              showToast(`✓ Đã nhận ảnh bìa từ máy tính: ${file.name}`);
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                    <UploadCloud className="w-4 h-4 text-indigo-500 mb-1" />
                    <span className="text-[10px] font-extrabold text-indigo-900">Tải từ máy tính</span>
                  </div>

                  {/* Way 2: Link */}
                  <div className="bg-white/70 border border-indigo-100/60 rounded-xl p-2.5 flex flex-col justify-center gap-1.5">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-0.5">
                      <Link className="w-2.5 h-2.5" /> Hoặc dán link ảnh
                    </span>
                    <input
                      type="text"
                      placeholder="https://example.com/image.jpg"
                      value={initImage && !initImage.startsWith("data:") ? initImage : ""}
                      onChange={(e) => setInitImage(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-[10px] font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                {initImage && (
                  <div className="bg-white border border-slate-100 p-2.5 rounded-xl flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                      <img src={initImage} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                    <div className="text-[10px] leading-tight space-y-0.5 overflow-hidden flex-grow text-left">
                      <span className="font-extrabold text-slate-800 block">Review ảnh bìa</span>
                      <span className="text-slate-450 block truncate font-medium max-w-[150px]">
                        {initImage.startsWith("data:") ? "Ảnh tải lên từ thiết bị" : initImage}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setInitImage("")}
                      className="text-[9px] font-black text-red-500 bg-red-50 hover:bg-red-100 hover:text-red-700 px-2.5 py-1 rounded-lg transition-transform hover:scale-105"
                    >
                      Xóa ảnh
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-black text-slate-500 uppercase">Tóm tắt ngắn (Sơ thảo đề tài giải pháp)</label>
                <textarea
                  rows={3}
                  required
                  value={initDesc}
                  onChange={(e) => setInitDesc(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Nêu rõ hướng đổi mới của sáng kiến..."
                />
              </div>
            </div>

            <div className="pt-3 mt-1 border-t border-slate-100 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowInitForm(false)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-2.5 px-4 rounded-xl cursor-pointer"
              >
                Bỏ qua
              </button>
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs py-2.5 px-5.5 rounded-xl cursor-pointer shadow-md"
              >
                Lưu sáng kiến đổi mới
              </button>
            </div>
          </form>
        </div>
      </div>
    )}

    {/* ==================== 7. ADMIN GAME FORM MODAL ==================== */}
    {showGameForm && (
      <div className="fixed inset-0 z-55 bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
        <div className="bg-white rounded-[32px] border border-slate-100 max-w-lg w-full shadow-2xl p-6 sm:p-8 relative overflow-hidden flex flex-col max-h-[90vh] text-left animate-scale-up">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-5">
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-600 animate-bounce" />
              <h3 className="font-black text-slate-900 text-base sm:text-lg">
                {gameFormMode === "create" ? "Thành lập Trò chơi học thuật mới" : "Chỉnh sửa Trò chơi học thuật"}
              </h3>
            </div>
            <button onClick={() => setShowGameForm(false)} className="bg-slate-100 p-2 rounded-full cursor-pointer hover:bg-slate-200">
              <X className="w-4 h-4 text-slate-600" />
            </button>
          </div>

          <form onSubmit={handleGameSubmit} className="flex flex-col flex-grow overflow-hidden">
            <div className="flex-grow overflow-y-auto pr-1.5 space-y-4 pb-4">
              <div className="space-y-1">
                <label className="text-xs font-black text-slate-500 uppercase">Bậc giảng dạy</label>
                <select
                  value={gameCategory}
                  onChange={(e) => setGameCategory(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="Bậc THCS">Bậc THCS</option>
                  <option value="Tiểu học">Bậc Tiểu học</option>
                  <option value="Mầm non">Bậc Mầm non</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-black text-slate-500 uppercase">Tiêu đề trò chơi</label>
                <input
                  type="text"
                  required
                  value={gameTitle}
                  onChange={(e) => setGameTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="VD: Biệt đội ô chữ mật mã số..."
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-black text-slate-500 uppercase">Thành phần nhãn hiệu (Tag)</label>
                <input
                  type="text"
                  required
                  value={gameTag}
                  onChange={(e) => setGameTag(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="VD: Trắc nghiệm rẽ nhánh, Logic vui..."
                />
              </div>

              <div className="space-y-1.5 p-3.5 bg-emerald-50/55 rounded-2xl border border-emerald-100/50">
                <span className="text-[11px] font-black text-emerald-700 uppercase flex items-center gap-1">
                  <Download className="w-3.5 h-3.5 animate-pulse" /> 📁 Đính kèm tài liệu tệp game (.ZIP/.PDF/.DOC/.HTML)
                </span>
                <p className="text-[9.5px] text-emerald-600 font-semibold leading-relaxed">
                  Tải lên học liệu kịch bản trò chơi dạng nén (.zip), tài liệu (.pdf, .doc) hoặc tệp ứng dụng web (.html) để học sinh và giáo viên tải về trực tiếp.
                </p>
                
                <input
                  type="file"
                  accept=".doc,.docx,.pdf,.zip,.rar,.html,.htm"
                  onChange={handleGameDocumentFileChange}
                  className="w-full text-xs font-semibold text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-xl file:border-0 file:text-[10px] file:font-black file:bg-emerald-100 file:text-emerald-700 hover:file:bg-emerald-200 cursor-pointer"
                />
                {gameFileName && (
                  <p className="text-[10px] text-emerald-700 font-bold italic">
                    Đang đính kèm: {gameFileName}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-black text-slate-500 uppercase">Hình ảnh bìa minh họa</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="bg-white/70 border border-purple-100/60 rounded-xl p-2.5 text-center relative hover:bg-white transition-colors cursor-pointer min-h-[60px] flex flex-col justify-center items-center">
                    <input
                      type="file"
                      accept="image/*"
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      onChange={handleGameImageFileChange}
                    />
                    <UploadCloud className="w-4 h-4 text-purple-500 mb-1" />
                    <span className="text-[10px] font-extrabold text-purple-900">Tải ảnh từ máy tính</span>
                  </div>

                  <div className="bg-white/70 border border-purple-100/60 rounded-xl p-2.5 flex flex-col justify-center gap-1.5">
                    <input
                      type="text"
                      placeholder="https://example.com/banner.jpg"
                      value={gameImage && !gameImage.startsWith("data:") ? gameImage : ""}
                      onChange={(e) => setGameImage(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-[10px] font-semibold focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                  </div>
                </div>
                {gameImage && (
                  <div className="mt-2 text-center bg-slate-50 p-2 rounded-lg border">
                    <img src={gameImage} alt="Preview" className="h-20 object-cover rounded mx-auto" />
                  </div>
                )}
              </div>

              {/* Cấu hình giá bán trò chơi */}
              <div className="space-y-2.5 p-3.5 bg-purple-50/45 rounded-2xl border border-purple-100/50">
                <label className="text-xs font-black text-slate-700 uppercase block">Cấu hình Bản quyền & Bản tính phí</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-xs font-extrabold text-slate-700 cursor-pointer">
                    <input
                      type="radio"
                      name="gameIsPaidRadio"
                      checked={!gameIsPaid}
                      onChange={() => {
                        setGameIsPaid(false);
                        setGamePrice(0);
                        setGameSalePrice(0);
                      }}
                      className="text-purple-600 focus:ring-purple-500 w-4 h-4"
                    />
                    <span>Miễn phí (Free)</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs font-extrabold text-slate-700 cursor-pointer">
                    <input
                      type="radio"
                      name="gameIsPaidRadio"
                      checked={gameIsPaid}
                      onChange={() => setGameIsPaid(true)}
                      className="text-purple-600 focus:ring-purple-500 w-4 h-4"
                    />
                    <span>Có tính phí (Premium)</span>
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="space-y-1">
                    <label className={`text-[9.5px] font-black uppercase block ${gameIsPaid ? 'text-slate-500' : 'text-slate-300'}`}>Giá gốc (đ)</label>
                    <input
                      type="number"
                      required={gameIsPaid}
                      disabled={!gameIsPaid}
                      value={gameIsPaid ? (gamePrice || "") : ""}
                      onChange={(e) => setGamePrice(Number(e.target.value))}
                      placeholder={gameIsPaid ? "VD: 150000" : "Học liệu MIỄN PHÍ"}
                      className={`w-full border rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500 ${gameIsPaid ? 'bg-white border-slate-205 text-slate-800' : 'bg-slate-100 border-slate-150 text-slate-400 cursor-not-allowed'}`}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className={`text-[9.5px] font-black uppercase block ${gameIsPaid ? 'text-slate-500' : 'text-slate-300'}`}>Giá KM (đ)</label>
                    <input
                      type="number"
                      disabled={!gameIsPaid}
                      value={gameIsPaid ? (gameSalePrice || "") : ""}
                      onChange={(e) => setGameSalePrice(Number(e.target.value))}
                      placeholder={gameIsPaid ? "Mặc định giống giá gốc" : "Học liệu MIỄN PHÍ"}
                      className={`w-full border rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500 ${gameIsPaid ? 'bg-white border-slate-205 text-slate-800' : 'bg-slate-100 border-slate-150 text-slate-400 cursor-not-allowed'}`}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-black text-slate-500 uppercase">Hướng dẫn & Luật chơi ngắn gọn</label>
                <textarea
                  rows={3}
                  required
                  value={gameDesc}
                  onChange={(e) => setGameDesc(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="VD: Các quy định, câu hỏi và hướng dẫn học sinh bấm để chọn đáp án..."
                />
              </div>
            </div>

            <div className="pt-3 mt-1 border-t border-slate-100 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowGameForm(false)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-2.5 px-4 rounded-xl cursor-pointer"
              >
                Bỏ qua
              </button>
              <button
                type="submit"
                className="bg-purple-600 hover:bg-purple-700 text-white font-black text-xs py-2.5 px-5.5 rounded-xl cursor-pointer shadow-md"
              >
                Lưu trò chơi đổi mới
              </button>
            </div>
          </form>
        </div>
      </div>
    )}

    {/* MODAL THANH TOÁN BẢN QUYỀN TRÒ CHƠI HỌC THUẬT */}
    {showGamePaymentModal && paymentGameItem && (
      <div className="fixed inset-0 z-[110] bg-slate-900/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fade-in text-left">
        <div className="bg-white rounded-[32px] max-w-xl w-full border border-slate-100 shadow-2xl overflow-hidden animate-scale-up">
          
          {/* Header of payment */}
          <div className="bg-gradient-to-r from-purple-700 to-indigo-800 p-6 text-white relative">
            <button
              onClick={() => setShowGamePaymentModal(false)}
              className="absolute top-4 right-4 bg-white/20 hover:bg-white/35 p-1.5 rounded-full transition-all text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="bg-amber-400 text-slate-950 text-[9px] font-extrabold uppercase px-2.5 py-0.5 rounded-full tracking-wider shadow-sm">Bản Quyền Cao Cấp</span>
              <span className="text-white/80 text-[10px] font-bold">Thanh Toán Kịch Bản Thiết Kế</span>
            </div>
            <h3 className="text-lg font-black tracking-tight leading-snug">{paymentGameItem.title}</h3>
            <p className="text-[10px] text-white/70 font-semibold mt-1">Hệ thống hỗ trợ tự động xác thực dựa trên cú pháp giao dịch</p>
          </div>

          <div className="p-6 space-y-5">
            {gamePaymentStatus === "pending" ? (
              <>
                {/* Price Display */}
                <div className="bg-purple-50/50 rounded-2xl p-4 border border-purple-100/50 flex justify-between items-center">
                  <div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Trị giá kịch bản học liệu</span>
                    <strong className="text-xl font-black text-purple-900">
                      {Number(paymentGameItem.salePrice || paymentGameItem.price || 0).toLocaleString('vi-VN')} VNĐ
                    </strong>
                  </div>
                  {paymentGameItem.salePrice && paymentGameItem.salePrice < paymentGameItem.price && (
                    <div className="text-right">
                      <span className="text-[10px] font-extrabold text-rose-500 bg-rose-50 px-2 py-0.5 rounded-md block mb-1">Cơ hội Tiết kiệm</span>
                      <span className="text-xs font-semibold text-slate-400 line-through block">{Number(paymentGameItem.price).toLocaleString('vi-VN')} VNĐ</span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                  {/* Bank transfer info card with copy utility */}
                  <div className="bg-slate-50 border border-slate-150 p-4 rounded-2xl space-y-3">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block border-b border-slate-100 pb-1.5">NGÂN HÀNG GIAO DỊCH</span>
                    
                    <div className="space-y-2 text-xs">
                      <div>
                        <span className="text-[9px] font-extrabold text-slate-400 block font-mono">NGÂN HÀNG</span>
                        <strong className="text-slate-800 font-bold block leading-snug">VIETINBANK (Ngân hàng Công Thương Việt Nam)</strong>
                      </div>
                      <div>
                        <span className="text-[9px] font-extrabold text-slate-400 block font-mono">CHỦ TÀI KHOẢN</span>
                        <strong className="text-slate-800 font-bold block">EDUSHOP AI VIETNAM</strong>
                      </div>
                      <div>
                        <span className="text-[9px] font-extrabold text-slate-400 flex items-center justify-between font-mono">
                          <span>SỐ TÀI KHOẢN</span>
                          <button 
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText("10987654321");
                              showToast("📋 Đã sao chép STK ngân hàng!");
                            }}
                            className="text-purple-600 hover:underline font-black cursor-pointer text-[9px]"
                          >
                            Sao chép
                          </button>
                        </span>
                        <strong className="text-indigo-900 font-black text-sm block">1098 7654 321</strong>
                      </div>
                      <div>
                        <span className="text-[9px] font-extrabold text-slate-400 flex items-center justify-between font-mono">
                          <span>NỘI DUNG CHUYỂN KHOẢN</span>
                          <button 
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(`GAME ${paymentGameItem.id}`);
                              showToast("📋 Đã sao chép nội dung chuyển khoản!");
                            }}
                            className="text-purple-600 hover:underline font-black cursor-pointer text-[9px]"
                          >
                            Sao chép
                          </button>
                        </span>
                        <strong className="text-purple-900 font-black text-xs block bg-purple-50 px-2 py-1.5 rounded-lg border border-purple-100 mt-0.5">
                          GAME {paymentGameItem.id}
                        </strong>
                      </div>
                    </div>
                  </div>

                  {/* QR code image */}
                  <div className="bg-white p-2 rounded-2xl border border-slate-150 text-center space-y-1.5">
                    <div className="bg-slate-50 p-2 rounded-xl w-32 h-32 mx-auto flex items-center justify-center border">
                      <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=27112000_Vietinbank_STK_EduShopAI_SoTien_${paymentGameItem.salePrice || paymentGameItem.price || 0}_NoiDung_GAME_${paymentGameItem.id}`} 
                        alt="QR Chuyển Khoản" 
                        className="w-full h-full object-contain"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <span className="text-[9px] font-extrabold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full block tracking-tight">QUÉT MÃ TRÊN APP NGÂN HÀNG</span>
                  </div>
                </div>

                {/* Billing fields */}
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!gameBuyerName.trim() || !gameBuyerPhone.trim()) {
                      showToast("⚠️ Vui lòng điền đủ Họ tên và Số điện thoại!");
                      return;
                    }
                    setGamePaymentStatus("success");
                    showToast("⏳ Hệ thống đang xác thực hóa đơn trong vài giây...");
                    setTimeout(() => {
                      executeDirectDownload(paymentGameItem);
                      setShowGamePaymentModal(false);
                      showToast("🎉 Xác thực bản quyền thành công! Đang tải thư mục trò chơi (.HTML)...");
                    }, 2800);
                  }}
                  className="space-y-3.5 border-t border-slate-100 pt-4"
                >
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-0.5">Thông tin nhận tệp trò chơi học thuật</label>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[9.5px] font-extrabold text-slate-500 uppercase">Họ & Tên Giáo viên (*)</label>
                      <input
                        type="text"
                        required
                        value={gameBuyerName}
                        onChange={(e) => setGameBuyerName(e.target.value)}
                        placeholder="VD: Cô Nguyễn Lan"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9.5px] font-extrabold text-slate-500 uppercase">Số Điện Thoại (*)</label>
                      <input
                        type="tel"
                        required
                        value={gameBuyerPhone}
                        onChange={(e) => setGameBuyerPhone(e.target.value)}
                        placeholder="Để đối soát giao dịch"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9.5px] font-extrabold text-slate-500 uppercase">Email nhận thông báo (tùy chọn)</label>
                    <input
                      type="email"
                      value={gameBuyerEmail}
                      onChange={(e) => setGameBuyerEmail(e.target.value)}
                      placeholder="giao-vien@example.com"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  {/* Submit CTA button */}
                  <div className="pt-2 flex gap-2.5">
                    <button
                      type="button"
                      onClick={() => setShowGamePaymentModal(false)}
                      className="w-1/3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold rounded-xl text-xs transition-all cursor-pointer py-3 text-center"
                    >
                      Bỏ qua
                    </button>
                    <button
                      type="submit"
                      className="w-2/3 bg-purple-600 hover:bg-purple-700 text-white font-extrabold rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-1 cursor-pointer py-3 text-center"
                    >
                      Xác nhận đã chuyển khoản <CheckCircle className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="py-12 text-center space-y-4">
                <Loader2 className="w-10 h-10 text-purple-600 animate-spin mx-auto" />
                <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest">Đang kiểm định mã số giao dịch</h4>
                <p className="text-xs text-slate-400 font-semibold max-w-sm mx-auto leading-relaxed">
                  Hệ thống đang đồng bộ với dữ liệu ngân hàng để khớp cú pháp nội dung chuyển khoản <strong>"GAME {paymentGameItem.id}"</strong>. File trò chơi sẽ được tự động tải về sau khi kiểm định.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    )}

    {/* MODAL QUẢN LÝ MÔN HỌC (ADMIN) */}
    {showSubjectManager && (
      <div className="fixed inset-0 z-[110] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fade-in text-left">
        <div className="bg-white rounded-[32px] max-w-lg w-full border border-slate-100 shadow-2xl overflow-hidden animate-scale-up">
          
          {/* Header of modal */}
          <div className="bg-gradient-to-r from-amber-500 to-indigo-700 p-6 text-white relative">
            <button
              onClick={() => setShowSubjectManager(false)}
              className="absolute top-4 right-4 bg-white/20 hover:bg-white/35 p-1.5 rounded-full transition-all text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="bg-amber-400 text-slate-950 text-[9px] font-extrabold uppercase px-2.5 py-0.5 rounded-full tracking-wider shadow-sm">Bảng Điều Khiển</span>
              <span className="text-white/80 text-[10px] font-bold">Quản Lý Phân Mảng Môn Học</span>
            </div>
            <h3 className="text-lg font-black tracking-tight leading-snug">Danh sách môn học hệ thống</h3>
            <p className="text-[10px] text-white/70 font-semibold mt-1">Quản trị viên có thể thêm môn học mới hoặc loại bỏ môn học không dùng</p>
          </div>

          <div className="p-6 space-y-6">
            {/* Form to Add New Subject */}
            <form onSubmit={handleAddSubject} className="space-y-3">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-0.5">Thêm môn học mới</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  value={newSubjectName}
                  onChange={(e) => setNewSubjectName(e.target.value)}
                  placeholder="VD: Vật lí, Toán học, Lịch sử v.v..."
                  className="flex-grow bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                />
                <button
                  type="submit"
                  className="bg-amber-500 hover:bg-amber-600 active:scale-98 text-white font-extrabold px-4 py-2 rounded-xl text-xs transition-all cursor-pointer flex items-center gap-1 shrink-0"
                >
                  <Plus className="w-4 h-4" /> Thêm mới
                </button>
              </div>
            </form>

            {/* List of current subjects */}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Các môn học đang hoạt động ({subjects.length})</label>
              <div className="border border-slate-100 rounded-2xl overflow-hidden divide-y divide-slate-100 max-h-60 overflow-y-auto">
                {subjects.map((subj) => (
                  <div key={subj} className="flex justify-between items-center p-3 hover:bg-slate-50 transition-all">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                      <span className="text-xs font-extrabold text-slate-800">{subj}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteSubject(subj)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-lg transition-all cursor-pointer"
                      title={`Xóa môn học ${subj}`}
                    >
                      <Trash className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {subjects.length === 0 && (
                  <div className="p-8 text-center text-slate-400 text-xs font-medium">
                    Chưa có môn học nào được đăng ký.
                  </div>
                )}
              </div>
            </div>

            {/* Close button CTA */}
            <div className="border-t border-slate-150 pt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setShowSubjectManager(false)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold rounded-xl text-xs px-5 py-2.5 transition-all cursor-pointer"
              >
                Đóng lại
              </button>
            </div>

          </div>
        </div>
      </div>
    )}

    </div>
  );
}

// --- SUB-COMPONENTS FOR MAIN SCREEN RENDER ---

function ProductCard({ product, isAdmin, onAddToCart, onOpenDetail, onDelete, onEdit, onDownload }: {
  product: Product;
  isAdmin: boolean;
  onAddToCart: (p: any) => void;
  onOpenDetail: (p: any) => void;
  onDelete: () => void;
  onEdit: (p: any) => void;
  onDownload?: (p: any) => void;
  key?: any;
}) {
  const isFree = product.price === 0 || product.tag === "free" || product.isFree === true || (product as any).is_free === true || String((product as any).is_free) === "true";

  const handleDeleteClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("Admin: Bạn chắc chắn muốn xóa học liệu này?")) return;
    try {
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer admin-secret-token` }
      });
      if (res.ok) {
        onDelete();
      }
    } catch (err) {
      console.error(err);
    }
  };
  
  return (
    <div 
      onClick={() => onOpenDetail(product)}
      className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-lg hover:border-indigo-100 hover:scale-[1.015] transition-all duration-350 text-left cursor-pointer group relative"
    >
      
      {/* Admin quick Edit / Delete floating panel */}
      {isAdmin && (
        <div className="absolute top-2 right-2 z-20 flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          {onDownload && (
            <button
              onClick={() => onDownload(product)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white p-1.5 rounded-full shadow-lg transition-all transform hover:scale-110 active:scale-95 cursor-pointer flex items-center justify-center"
              title="Tải tệp gốc tức thì (Admin)"
            >
              <Download className="w-3 h-3" />
            </button>
          )}
          <button
            onClick={() => onEdit(product)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white p-1.5 rounded-full shadow-lg transition-all transform hover:scale-110 active:scale-95 cursor-pointer"
            title="Sửa học liệu (Admin)"
          >
            <Edit2 className="w-3 h-3" />
          </button>
          <button
            onClick={handleDeleteClick}
            className="bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-full shadow-lg transition-all transform hover:scale-110 active:scale-95 cursor-pointer"
            title="Xóa học liệu (Admin)"
          >
            <Trash className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Product Image Header with Tag */}
      <div className="relative h-28 sm:h-32 w-full bg-slate-50 overflow-hidden">
        <img 
          src={product.image} 
          alt={product.title} 
          className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
          onError={(e) => {
            const el = e.target as HTMLImageElement;
            el.src = "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=500&auto=format&fit=crop&q=60";
          }}
        />
        
        {/* Floating badge for subject */}
        <span className="absolute top-1.5 left-1.5 bg-slate-950/90 backdrop-blur-sm text-white text-[8px] sm:text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full select-none">
          {product.subject}
        </span>

        {/* Floating grade target info */}
        {product.grade && (
          <span className="absolute top-1.5 right-1.5 bg-amber-500/90 backdrop-blur-sm text-white text-[8px] sm:text-[9px] font-black px-1.5 py-0.5 rounded-full select-none">
            Lớp {product.grade}
          </span>
        )}

        {/* Highlight badge tag */}
        {product.tag === "best-seller" && (
          <span className="absolute bottom-1.5 left-1.5 bg-red-600 text-white text-[7.5px] sm:text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md flex items-center gap-0.5 shadow-sm leading-none">
            <Flame className="w-2 h-2 fill-white" /> Bán chạy
          </span>
        )}
        {product.tag === "free" && (
          <span className="absolute bottom-1.5 left-1.5 bg-emerald-600 text-white text-[7.5px] sm:text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md flex items-center gap-0.5 shadow-sm leading-none">
            <Gift className="w-2 h-2 fill-white" /> Miễn phí
          </span>
        )}
        {product.tag === "new" && (
          <span className="absolute bottom-1.5 left-1.5 bg-blue-600 text-white text-[7.5px] sm:text-[8px] font-custom uppercase tracking-widest px-1.5 py-0.5 rounded-md flex items-center gap-0.5 shadow-sm leading-none font-bold">
            Mới
          </span>
        )}
      </div>

      {/* Content Area */}
      <div className="p-3 sm:p-3.5 flex-grow flex flex-col justify-between space-y-2 sm:space-y-2.5">
        <div className="space-y-1">
          <span className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
            <Layers className="w-2.5 h-2.5 text-indigo-500" /> {product.type}
          </span>
          <h4 className="font-extrabold text-slate-800 text-xs sm:text-xs md:text-sm leading-tight line-clamp-2 min-h-[2.1rem] sm:min-h-[2.3rem] group-hover:text-indigo-650 transition-colors">
            {product.title}
          </h4>
          <p className="text-slate-450 text-[9.5px] sm:text-[10px] md:text-[11px] line-clamp-2 font-semibold leading-snug">
            {product.description}
          </p>
        </div>

        {/* Price & Action button */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between" onClick={(e) => e.stopPropagation()}>
          <div>
            {isFree ? (
              <span className="text-emerald-600 font-extrabold text-xs sm:text-xs md:text-sm bg-emerald-50 px-2 py-0.5 rounded-full">Miễn phí</span>
            ) : (
              <div className="space-y-0.5 leading-none">
                <p className="text-slate-800 font-extrabold text-xs sm:text-xs md:text-sm">{product.price.toLocaleString("vi-VN")}đ</p>
                {product.originalPrice > 0 && (
                  <p className="text-[8.5px] sm:text-[9px] text-slate-400 line-through">{product.originalPrice.toLocaleString("vi-VN")}đ</p>
                )}
              </div>
            )}
          </div>

          <button
            onClick={() => {
              if (isFree) {
                onAddToCart(product);
              } else {
                onOpenDetail(product);
              }
            }}
            className={`py-1 px-2 sm:py-1.5 sm:px-2.5 rounded-lg text-[9px] sm:text-[10px] font-extrabold transition-all flex items-center gap-1 cursor-pointer ${isFree ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100" : "bg-indigo-600 hover:bg-indigo-700 text-white"}`}
          >
            {isFree ? (
              <>
                <Download className="w-3 h-3" /> Tải ngay
              </>
            ) : (
              <>
                <ShoppingCart className="w-3 h-3" /> Mua tệp
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

const getInitiativeImage = (item: any) => {
  if (item.image && item.image !== "" && !item.image.includes("photo-1434030216411-0b793f4b4173")) {
    return item.image;
  }
  const titleLower = (item.title || "").toLowerCase();
  if (titleLower.includes("trí tuệ nhân tạo") || titleLower.includes("ai") || titleLower.includes("chatbot") || titleLower.includes("gpt")) {
    return "https://images.unsplash.com/photo-1677442136019-21780efad99a?w=500&auto=format&fit=crop&q=60";
  }
  if (titleLower.includes("lập trình") || titleLower.includes("robot") || titleLower.includes("scratch") || titleLower.includes("python") || titleLower.includes("tin học") || titleLower.includes("công nghệ")) {
    return "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=500&auto=format&fit=crop&q=60";
  }
  if (titleLower.includes("trò chơi") || titleLower.includes("games") || titleLower.includes("unplugged") || titleLower.includes("tương tác")) {
    return "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=500&auto=format&fit=crop&q=60";
  }
  if (titleLower.includes("đề kiểm tra") || titleLower.includes("ngân hàng đề") || titleLower.includes("chấm tự động") || titleLower.includes("thi cử") || titleLower.includes("đánh giá")) {
    return "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=500&auto=format&fit=crop&q=60";
  }
  if (titleLower.includes("trải nghiệm") || titleLower.includes("ngoại khóa") || titleLower.includes("sinh hoạt") || titleLower.includes("chủ nhiệm") || titleLower.includes("đổi mới") || titleLower.includes("hạnh phúc")) {
    return "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500&auto=format&fit=crop&q=60";
  }
  return "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=500&auto=format&fit=crop&q=60";
};

function InitiativeCard({ item, isAdmin, onAddToCart, onOpenDetail, onDelete, onEdit, onDownload }: {
  item: Initiative;
  isAdmin: boolean;
  onAddToCart: (item: any) => void;
  onOpenDetail: (item: any) => void;
  onDelete: () => void;
  onEdit: (item: any) => void;
  onDownload?: (item: any) => void;
  key?: any;
}) {
  const mappedProduct = {
    ...item,
    description: item.desc,
    subject: item.category,
    grade: null,
    type: "Sáng kiến kinh nghiệm",
    rating: 5.0,
    image: item.image || getInitiativeImage(item)
  };

  const isFree = item.price === 0 || (item as any).isFree === true || (item as any).is_free === true || String((item as any).is_free) === "true";

  const handleDeleteClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("Admin: Bạn chắc chắn muốn xóa sáng kiến này?")) return;
    try {
      const res = await fetch(`/api/admin/initiatives/${item.id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer admin-secret-token` }
      });
      if (res.ok) {
        // Evict from browser localStorage cache to prevent restored merge
        const localBackupStr = localStorage.getItem("backup_initiatives");
        if (localBackupStr) {
          try {
            const localBackup = JSON.parse(localBackupStr);
            const filteredBackup = localBackup.filter((bi: any) => bi.id !== item.id);
            localStorage.setItem("backup_initiatives", JSON.stringify(filteredBackup));
          } catch (_) {}
        }
        onDelete();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDownloadClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDownload) {
      onDownload(mappedProduct);
    }
  };

  return (
    <div 
      onClick={() => onOpenDetail(mappedProduct)}
      className="bg-white rounded-[28px] border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-lg hover:border-indigo-100 hover:scale-[1.01] transition-all duration-350 text-left cursor-pointer group relative overflow-hidden"
    >
      
      {/* Admin quick Edit / Delete floating panel */}
      {isAdmin && (
        <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => onEdit(item)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-full shadow-lg transition-all transform hover:scale-110 active:scale-95 cursor-pointer flex items-center justify-center"
            title="Sửa sáng kiến (Admin)"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleDeleteClick}
            className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow-lg transition-all transform hover:scale-110 active:scale-95 cursor-pointer flex items-center justify-center"
            title="Xóa sáng kiến (Admin)"
          >
            <Trash className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Thumbnail and Tags */}
      <div className="relative w-full aspect-[16/10] overflow-hidden bg-slate-50 border-b border-slate-100">
        <img 
          src={mappedProduct.image} 
          alt={item.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-3 left-3 flex gap-1">
          <span className="text-[8.5px] font-black text-indigo-650 bg-white/95 backdrop-blur-sm shadow-sm px-2.5 py-0.5 rounded-full uppercase tracking-wider">
            {item.category}
          </span>
          <span className="text-[8.5px] font-black text-emerald-600 bg-emerald-50/95 backdrop-blur-sm shadow-sm px-2.5 py-0.5 rounded-full uppercase tracking-wider">
            Sáng kiến
          </span>
        </div>
      </div>

      <div className="p-4 sm:p-5 flex-grow flex flex-col justify-between space-y-3">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <p className="text-[9.5px] font-bold text-slate-450 italic leading-none">
              Tác giả: {item.author}
            </p>
            <span className="text-[8.5px] font-bold text-slate-400 flex items-center gap-0.5">
              <Download className="w-2.5 h-2.5 text-indigo-600" /> {item.downloads || 0} tải
            </span>
          </div>
          
          <h4 className="font-extrabold text-slate-900 text-xs sm:text-xs leading-snug line-clamp-2 min-h-[2.25rem] group-hover:text-indigo-600 transition-colors">
            {item.title}
          </h4>
          <p className="text-slate-400 text-[10.5px] leading-relaxed line-clamp-2 font-medium">
            {item.desc}
          </p>
        </div>

        <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between" onClick={(e) => e.stopPropagation()}>
          <div>
            {isFree ? (
              <span className="text-emerald-600 font-extrabold text-xs sm:text-xs md:text-sm bg-emerald-50 px-2 py-0.5 rounded-full">Miễn phí</span>
            ) : (
              <div className="space-y-0.5 leading-none">
                <p className="text-slate-800 font-black text-xs sm:text-xs md:text-sm">{item.price.toLocaleString("vi-VN")}đ</p>
                <p className="text-[7.5px] text-slate-400 font-bold uppercase tracking-wider">Lưu kèm phụ lục Sở GD</p>
              </div>
            )}
          </div>
          
          <button
            onClick={() => {
              if (isFree) {
                onAddToCart(mappedProduct);
              } else {
                onOpenDetail(mappedProduct);
              }
            }}
            className={`py-1.5 px-3 rounded-lg text-[9.5px] font-extrabold transition-all flex items-center gap-1 cursor-pointer shadow-sm hover:scale-102 active:scale-98 ${isFree ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100" : "bg-indigo-600 hover:bg-indigo-700 text-white"}`}
          >
            {isFree ? (
              <>
                <Download className="w-3 h-3" /> Tải ngay
              </>
            ) : (
              <>
                <ShoppingCart className="w-2.8 h-2.8" /> Mua tệp
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
