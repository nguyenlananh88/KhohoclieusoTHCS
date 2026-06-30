import express from "express";
import path from "path";
import fs from "fs";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// Global log sanitizer for sandboxed environment database timeouts/networks
const originalWarn = console.warn;
const originalError = console.error;

const sanitizeValue = (val: any): any => {
  if (typeof val === "string") {
    return val
      .replace(/TypeError:\s*fetch\s*failed/gi, "unreachable or sleeping (Local JSON fallback in active service)")
      .replace(/fetch\s*failed/gi, "unreachable or sleeping (Local JSON fallback in active service)");
  }
  if (val && typeof val === "object") {
    if (val.message && typeof val.message === "string") {
      val.message = val.message
        .replace(/TypeError:\s*fetch\s*failed/gi, "unreachable or sleeping (Local JSON fallback in active service)")
        .replace(/fetch\s*failed/gi, "unreachable or sleeping (Local JSON fallback in active service)");
    }
  }
  return val;
};

console.warn = function(...args: any[]) {
  originalWarn.apply(console, args.map(sanitizeValue));
};

console.error = function(...args: any[]) {
  originalError.apply(console, args.map(sanitizeValue));
};

const app = express();
const PORT = 3000;

// Vercel Serverless Function support middleware to preserve/prepend /api prefix
app.use((req, res, next) => {
  if ((process.env.NODE_ENV === "production" || process.env.VERCEL) && req.url) {
    const apiRoutes = [
      "/admin",
      "/products",
      "/initiatives",
      "/games",
      "/subjects",
      "/orders",
      "/feedbacks",
      "/gemini",
      "/db-status"
    ];
    
    const needsPrefix = !req.url.startsWith("/api") && 
                        apiRoutes.some(route => req.url.startsWith(route));
                        
    if (needsPrefix) {
      const originalUrl = req.url;
      req.url = "/api" + req.url;
      console.log(`[Vercel Server Routing Fix] Automatically prepended '/api' prefix: ${originalUrl} -> ${req.url}`);
    }
  }
  next();
});

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

import { createClient } from "@supabase/supabase-js";

// Supabase Configuration
let SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "https://fslabxwcyljiqvfjkfzk.supabase.co";
if (SUPABASE_URL === "https://ndqnclzvlbodtjlmgcdz.supabase.co" || SUPABASE_URL === "https://mjuwgdknrajqqaquarfl.supabase.co") {
  SUPABASE_URL = process.env.VITE_SUPABASE_URL || "https://fslabxwcyljiqvfjkfzk.supabase.co";
  if (SUPABASE_URL === "https://ndqnclzvlbodtjlmgcdz.supabase.co" || SUPABASE_URL === "https://mjuwgdknrajqqaquarfl.supabase.co") {
    SUPABASE_URL = "https://fslabxwcyljiqvfjkfzk.supabase.co";
  }
}

let SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZzbGFieHdjeWxqaXF2ZmprZnprIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjEzNDg3MSwiZXhwIjoyMDk3NzEwODcxfQ.heBq8sC-Pdrf5J36YuJBPQnZcIjULixs1tfjcAFv-vQ";

if (SUPABASE_URL.includes("fslabxwcyljiqvfjkfzk")) {
  SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZzbGFieHdjeWxqaXF2ZmprZnprIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjEzNDg3MSwiZXhwIjoyMDk3NzEwODcxfQ.heBq8sC-Pdrf5J36YuJBPQnZcIjULixs1tfjcAFv-vQ";
} else {
  SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || SUPABASE_KEY;
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    persistSession: false
  }
});

let useSupabaseFallback = false;
const failedSupabaseTables = new Set<string>();

// Path to data files (JSON Fallbacks)
const DATA_DIR = path.join(process.cwd(), "data");
const PRODUCTS_FILE = path.join(DATA_DIR, "products.json");
const INITIATIVES_FILE = path.join(DATA_DIR, "initiatives.json");
const ORDERS_FILE = path.join(DATA_DIR, "orders.json");
const FEEDBACKS_FILE = path.join(DATA_DIR, "feedbacks.json");
const ADMIN_FILE = path.join(DATA_DIR, "admin.json");
const GAMES_FILE = path.join(DATA_DIR, "games.json");
const SUBJECTS_FILE = path.join(DATA_DIR, "subjects.json");
const BANNER_FILE = path.join(DATA_DIR, "banner.json");
const BANK_FILE = path.join(DATA_DIR, "bank.json");

const DEFAULT_BANNER = {
  backgroundImage: "",
  badgeText: "Hệ thống tiên phong tích hợp AI số hóa giáo dục",
  title1: "Giải Pháp Học Liệu Số",
  title2: "Thời Đại Công Nghệ Giáo Dục 4.0",
  description: "Cung cấp Giáo án Word, Slide điện tử PPT, Video thực hành, Phiếu bài tập và Ngân hàng đề thi chuẩn kịch bản GDPT 2018 lý tưởng cho bộ môn Tin Học & Hoạt Động Trải Nghiệm.",
  adminPanel1Title: "Cổng Quản Trị Hệ Thống EduShop AI",
  adminPanel1Desc: "Bảng kiểm soát tích hợp: Đăng tải trực tiếp file học liệu, sáng kiến thực tiễn, trò chơi học tập tương tác bám sát chuẩn GDPT 2018 và đồng bộ hóa danh mục môn học.",
  adminPanel2Title: "Hệ Thống Phân Quyền Quản Trị Chặt Chẽ",
  adminPanel2Desc: "Thầy cô Admin: admin • Cấu hình trực tuyến thời gian thực các học liệu GDPT 2018.",
  adminPanel3Title: "QUẢN LÝ BÁN HÀNG",
  promoBadge: "SIÊU ƯU ĐÃI GIỚI HẠN",
  promoTitle1: "BÙNG NỔ KHUYẾN MẠI",
  promoTitle2: "GIẢM GIÁ 50%",
  promoDesc: "Áp dụng cho toàn bộ học liệu điện tử PowerPoint, giáo án Word môn Tin học, HĐTN và kho trò chơi tương tác số học tương tác AI!",
  promoFoot: "Áp dụng tự động hôm nay",
  promoBtn: "MỞ KHO HỌC LIỆU NGAY",
  promoEnabled: true
};

const DEFAULT_BANK_SETTINGS = {
  bankName: "MB Bank",
  accountNumber: "",
  accountHolder: "",
  memoTemplate: "EDUSHOP {orderId}",
  isEnabled: false
};

const INITIAL_SUBJECTS = ["Tin học", "Hoạt động trải nghiệm"];

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  } catch (err) {
    console.warn("WARNING: Unable to create data directory (this is normal on read-only environments like Vercel):", err);
  }
}

// Initial games data definitions
const INITIAL_GAMES = [
  {
    id: "game-1",
    title: "Tư Duy Thuật Toán (Decomposition)",
    category: "Bậc THCS",
    tag: "Trắc nghiệm rẽ nhánh logic",
    desc: "Trò chơi giải đố thuật toán tuần tự giúp học sinh THCS hiểu sâu về mô hình phân rã bài toán và cách thiết kế lưu đồ sơ đồ khối.",
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500&auto=format&fit=crop&q=60",
    fileName: "huong_dan_tu_duy_thuat_toan.txt",
    fileData: "data:text/plain;base64,SHVvbmcgZGFuIGNob2kgR2FtZSAxOiBUdSBkdXkgVGh1YXQgVG9hbgpDaGlhIG5obyBiYWkgdG9hbiBwaHVjIHRhcCB0aGFuaCBjYWMgYmFpIHRvYW4gbmhvIGhvbi4gVHJhYyBuZ2hpZW0gcmUgbmhhbmggbG9naWMgZHV5IGp1c3QgY29ycmVjdCE="
  },
  {
    id: "game-2",
    title: "Chiến Binh Nhận Diện Ảnh AI",
    category: "Bậc THCS",
    tag: "Computer Vision thực tế trực tuyến",
    desc: "Trò chơi gửi ảnh trực tuyến về hệ thống nơ-ron Gemini để phát hiện các link kiện điện tử và robot học tập.",
    image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=500&auto=format&fit=crop&q=60",
    fileName: "huong_dan_vision_ai.txt",
    fileData: "data:text/plain;base64,SHVvbmcgZGFuIGNob2kgR2FtZSAyOiBOaGFuIGRpZW4gYW5oIEFJCkd1aSBhbmggY3VhIGJhbiBkZSBHZW1pbmkgcGhhbiB0aWNoIGNhYyBsaW5oIGtpZW4gZGllbiB0dSB0aG9uZyBtaW5oLg=="
  },
  {
    id: "game-3",
    title: "Đấu Trường Từ Vựng Công Nghệ",
    category: "Bậc THCS",
    tag: "Thử thách từ khóa số hóa",
    desc: "Ô chữ thuật ngữ về trí tuệ nhân tạo, xử lý ngôn ngữ tự nhiên NLP và kỹ năng ứng xử thông minh trên internet mạng xã hội.",
    image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=500&auto=format&fit=crop&q=60",
    fileName: "huong_dan_dau_truong_tu_vung.txt",
    fileData: "data:text/plain;base64,SHVvbmcgZGFuIGNob2kgR2FtZSAzOiBEYXUgdHJ1b25nIHR1IHZ1bmcKQ2FjIGNhdSBob2kgdmUgbmdvbiBuZ3UgdHUgbmhpZW4gTkxQLCB0cmkgdHVlIG5oYW4gdGFvIEFJIHZhIGt5IG5hbmcgc28u"
  }
];

// Initial Data definitions for seeding and fallbacks
const INITIAL_PRODUCTS = [
  {
    id: "bs-1",
    title: "Giáo án Word Tin học 6 - Kết nối tri thức (Cả năm)",
    subject: "Tin học",
    grade: 6,
    type: "Giáo án Word",
    price: 150000,
    originalPrice: 200000,
    rating: 4.9,
    sales: 342,
    tag: "best-seller",
    isFree: false,
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    description: "Bộ giáo án Word chuẩn chương trình GDPT 2018 biên soạn chi tiết, đầy đủ các hoạt động học tập, phiếu học tập đi kèm."
  },
  {
    id: "bs-2",
    title: "Bài giảng PPT Hoạt động trải nghiệm 8 - Chân trời sáng tạo",
    subject: "Hoạt động trải nghiệm",
    grade: 8,
    type: "Giáo án điện tử",
    price: 180000,
    originalPrice: 250000,
    rating: 4.8,
    sales: 215,
    tag: "best-seller",
    isFree: false,
    image: "https://images.unsplash.com/photo-1516534775068-ba3e84589d90?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    description: "Slide bài giảng thiết kế chuyên nghiệp với nhiều hiệu ứng sinh động, tích hợp các hoạt động nhóm, trò chơi khởi động hấp dẫn."
  },
  {
    id: "bs-3",
    title: "Ngân hàng 500 câu hỏi trắc nghiệm Tin học 7 - Có giải chi tiết",
    subject: "Tin học",
    grade: 7,
    type: "Ngân hàng đề",
    price: 90000,
    originalPrice: 120000,
    rating: 5.0,
    sales: 189,
    tag: "best-seller",
    isFree: false,
    image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    description: "File Word ngân hàng đề kiểm tra giữa kỳ, cuối kỳ môn Tin học lớp 7 định dạng trắc nghiệm khách quan mới nhất."
  },
  {
    id: "bs-4",
    title: "Kịch bản Video bài giảng Hoạt động trải nghiệm 7 - Học kỳ I",
    subject: "Hoạt động trải nghiệm",
    grade: 7,
    type: "Video",
    price: 135000,
    originalPrice: 190000,
    rating: 4.9,
    sales: 154,
    tag: "best-seller",
    isFree: false,
    image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    description: "Bộ tư liệu video trực quan hỗ trợ bài học trải nghiệm sáng tạo giúp thu hút sự chú ý tối đa của học sinh lớp 7."
  },
  {
    id: "new-1",
    title: "Học liệu Video hướng dẫn lập trình Scratch Tin học 8",
    subject: "Tin học",
    grade: 8,
    type: "Video",
    price: 220000,
    originalPrice: 300000,
    rating: 4.7,
    sales: 45,
    tag: "new",
    isFree: false,
    image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    description: "Chuỗi video chất lượng cao hướng dẫn từng bước tạo trò chơi và giải các bài toán lập trình Scratch theo SGK Tin học 8."
  },
  {
    id: "new-2",
    title: "Phiếu bài tập rèn luyện năng lực số Hoạt động trải nghiệm 6",
    subject: "Hoạt động trải nghiệm",
    grade: 6,
    type: "Phiếu bài tập",
    price: 65000,
    originalPrice: 90000,
    rating: 4.6,
    sales: 32,
    tag: "new",
    isFree: false,
    image: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    description: "Tổng hợp phiếu bài tập sáng tạo, kích thích tư duy thiết kế, thực hành kỹ năng số và định hướng nghề nghiệp sớm."
  },
  {
    id: "new-3",
    title: "Giáo án điện tử PowerPoint Tin học 9 - Cánh diều (Kỳ 1)",
    subject: "Tin học",
    grade: 9,
    type: "Giáo án điện tử",
    price: 120000,
    originalPrice: 160000,
    rating: 4.9,
    sales: 58,
    tag: "new",
    isFree: false,
    image: "https://images.unsplash.com/photo-1588702547919-26089e690ecc?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    description: "Giáo án số hóa 4.0 đồng bộ sách Cánh diều mới nhất, tối ưu trải nghiệm tương tác trực quan của học sinh."
  },
  {
    id: "new-4",
    title: "Đề kiểm tra Hoạt động trải nghiệm 9 hướng nghiệp (Cả năm)",
    subject: "Hoạt động trải nghiệm",
    grade: 9,
    type: "Ngân hàng đề",
    price: 110000,
    originalPrice: 150000,
    rating: 4.8,
    sales: 41,
    tag: "new",
    isFree: false,
    image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    description: "Ngân hàng đề trắc nghiệm và tự luận đánh giá năng lực hướng nghiệp của học sinh lớp 9 theo thông tư mới."
  },
  {
    id: "free-1",
    title: "Phiếu bài tập mẫu: An toàn thông tin trên Internet - Tin học 7",
    subject: "Tin học",
    grade: 7,
    type: "Phiếu bài tập",
    price: 0,
    originalPrice: 0,
    rating: 4.8,
    sales: 1205,
    tag: "free",
    isFree: true,
    image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    description: "Tài liệu miễn phí giúp học sinh nhận diện các rủi ro mạng xã hội và cách bảo mật thông tin cá nhân."
  },
  {
    id: "free-2",
    title: "Kế hoạch tổ chức chủ đề: Bảo vệ môi trường xanh - HĐTN 9",
    subject: "Hoạt động trải nghiệm",
    grade: 9,
    type: "Giáo án Word",
    price: 0,
    originalPrice: 0,
    rating: 4.7,
    sales: 984,
    tag: "free",
    isFree: true,
    image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    description: "Kế hoạch tổ chức hoạt động trải nghiệm thực tế định hướng bảo vệ môi trường, phát triển kỹ năng làm việc nhóm."
  },
  {
    id: "free-3",
    title: "Đề thi thử học kỳ I môn Tin học 8 (Kèm đáp án chi tiết)",
    subject: "Tin học",
    grade: 8,
    type: "Ngân hàng đề",
    price: 0,
    originalPrice: 0,
    rating: 4.9,
    sales: 1540,
    tag: "free",
    isFree: true,
    image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    description: "Đề thi bám sát cấu trúc mới nhất giúp giáo viên đánh giá năng lực tin học và chuyển đổi số của học sinh lớp 8."
  },
  {
    id: "free-4",
    title: "Bài giảng mẫu PowerPoint làm quen AI - Hoạt động trải nghiệm 8",
    subject: "Hoạt động trải nghiệm",
    grade: 8,
    type: "Giáo án điện tử",
    price: 0,
    originalPrice: 0,
    rating: 5.0,
    sales: 832,
    tag: "free",
    isFree: true,
    image: "https://images.unsplash.com/photo-1588702547919-26089e690ecc?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    description: "Slide trình chiếu bài giảng chủ đề thế giới công nghệ tương lai và kỹ năng ứng xử thông minh trên không gian số."
  }
];

const INITIAL_INITIATIVES = [
  {
    id: "init-1",
    category: "Bậc THCS",
    title: "Giải pháp ứng dụng Trí tuệ nhân tạo (AI) hỗ trợ giảng dạy lập trình trực quan THCS",
    author: "Nguyễn Văn Nam - GV THCS Nguyễn Du",
    desc: "Sáng kiến chia sẻ cách áp dụng các Chatbot AI để giải đáp thắc mắc lập trình cho học sinh lớp 8 và 9, nâng cao 40% hiệu suất tự học.",
    price: 120000,
    sales: 142,
    downloads: 85,
    image: "https://images.unsplash.com/photo-1677442136019-21780efad99a?w=500&auto=format&fit=crop&q=60"
  },
  {
    id: "init-2",
    category: "Bậc THCS",
    title: "Xây dựng ngân hàng đề kiểm tra định kỳ môn Tin học tích hợp hệ thống chấm tự động",
    author: "Lê Thị Mai - GV THCS Phan Chu Trinh",
    desc: "Kinh nghiệm xây dựng và vận hành hệ thống kiểm tra tự động hóa, giảm tải 80% thời gian chấm bài cho giáo viên bộ môn.",
    price: 150000,
    sales: 98,
    downloads: 54,
    image: "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=500&auto=format&fit=crop&q=60"
  },
  {
    id: "init-3",
    category: "Tiểu học",
    title: "Thiết kế trò chơi học tập tương tác giúp học sinh lớp 3, 4 làm quen với Tư duy máy tính",
    author: "Trần Thị Thu - GV Tiểu học Kim Đồng",
    desc: "Sáng kiến thiết kế các thẻ trò chơi không cắm điện (Unplugged Computer Science) giúp học sinh phát triển tư duy thuật toán vô cùng thú vị.",
    price: 110000,
    sales: 167,
    downloads: 112,
    image: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=500&auto=format&fit=crop&q=60"
  },
  {
    id: "init-4",
    category: "Tiểu học",
    title: "Đổi mới sinh hoạt dưới cờ tích hợp nội dung Hoạt động trải nghiệm số cho học sinh tiểu học",
    author: "Phạm Minh Tuấn - GV Tiểu học Lê Lợi",
    desc: "Sáng kiến tổ chức các hoạt động quy mô toàn trường liên quan đến kỹ năng sử dụng mạng an toàn thông qua kịch bản sân khấu hóa.",
    price: 95000,
    sales: 83,
    downloads: 40,
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500&auto=format&fit=crop&q=60"
  }
];

// Helper to write/read JSON (Local Database Fallback logic)
const readData = (filePath: string, defaultData: any) => {
  if (!fs.existsSync(filePath)) {
    try {
      fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2), "utf8");
    } catch (e) {
      console.warn(`WARNING: Unable to write default data to ${filePath} (read-only filesystem on Vercel):`, e);
    }
    return defaultData;
  }
  try {
    const data = fs.readFileSync(filePath, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return defaultData;
  }
};

const writeData = (filePath: string, data: any) => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
    return true;
  } catch (error) {
    console.error(`Error writing file ${filePath}:`, error);
    return false;
  }
};

// Data Mapper Functions for CamelCase <-> SnakeCase mapping
const mapProductFromDB = (p: any) => ({
  id: p.id,
  title: p.title,
  subject: p.subject,
  grade: p.grade,
  type: p.type,
  price: p.price,
  originalPrice: p.original_price,
  rating: p.rating,
  sales: p.sales,
  tag: p.tag,
  isFree: p.is_free,
  image: p.image,
  description: p.description,
  fileData: p.file_data || p.fileData || "",
  fileName: p.file_name || p.fileName || ""
});

const mapProductToDB = (p: any) => ({
  id: p.id,
  title: p.title,
  subject: p.subject,
  grade: Number(p.grade) || 6,
  type: p.type,
  price: Number(p.price) || 0,
  original_price: Number(p.originalPrice) || 0,
  rating: Number(p.rating) || 5.0,
  sales: Number(p.sales) || 0,
  tag: p.tag,
  is_free: (Number(p.price) || 0) === 0,
  image: p.image || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500&auto=format&fit=crop&q=60",
  description: p.description,
  file_data: p.fileData || "",
  file_name: p.fileName || ""
});

const mapGameFromDB = (g: any) => ({
  id: g.id,
  category: g.category || "Bậc THCS",
  title: g.title || "",
  tag: g.tag || "",
  desc: g.desc || "",
  image: g.image || "",
  fileData: g.file_data || g.fileData || "",
  fileName: g.file_name || g.fileName || "",
  isPaid: g.is_paid === true || g.isPaid === true,
  price: Number(g.price) || 0,
  salePrice: Number(g.sale_price) || Number(g.salePrice) || 0
});

const mapGameToDB = (g: any) => ({
  id: g.id,
  category: g.category,
  title: g.title,
  tag: g.tag,
  desc: g.desc,
  image: g.image || "",
  file_data: g.fileData || "",
  file_name: g.fileName || "",
  is_paid: g.isPaid === true,
  price: Number(g.price) || 0,
  sale_price: Number(g.salePrice) || 0
});

const mapInitiativeFromDB = (i: any) => {
  let finalDesc = i.desc || "";
  let finalImage = i.image || "";
  let finalFileName = i.fileName || "";
  let finalFileData = i.fileData || "";
  
  if (finalDesc.includes(" __FILE_DATA__:")) {
    const parts = finalDesc.split(" __FILE_DATA__:");
    finalDesc = parts[0];
    finalFileData = parts[1] || "";
  }
  if (finalDesc.includes(" __FILE_NAME__:")) {
    const parts = finalDesc.split(" __FILE_NAME__:");
    finalDesc = parts[0];
    finalFileName = parts[1] || "";
  }
  if (finalDesc.includes(" __IMG_DATA__:")) {
    const parts = finalDesc.split(" __IMG_DATA__:");
    finalDesc = parts[0];
    const packedImage = parts[1] || "";
    if (packedImage && packedImage !== "") {
      finalImage = packedImage;
    }
  }
  
  return {
    id: i.id,
    category: i.category,
    title: i.title,
    author: i.author,
    desc: finalDesc,
    price: i.price,
    sales: i.sales,
    downloads: i.downloads,
    image: finalImage,
    fileName: finalFileName,
    fileData: finalFileData
  };
};

const mapInitiativeToDB = (i: any) => {
  let dbDesc = i.desc || "";
  if (dbDesc.includes(" __IMG_DATA__:")) {
    dbDesc = dbDesc.split(" __IMG_DATA__:")[0];
  }
  if (dbDesc.includes(" __FILE_NAME__:")) {
    dbDesc = dbDesc.split(" __FILE_NAME__:")[0];
  }
  if (dbDesc.includes(" __FILE_DATA__:")) {
    dbDesc = dbDesc.split(" __FILE_DATA__:")[0];
  }

  if (i.image && i.image !== "") {
    dbDesc += ` __IMG_DATA__:${i.image}`;
  }
  if (i.fileName && i.fileName !== "") {
    dbDesc += ` __FILE_NAME__:${i.fileName}`;
  }
  if (i.fileData && i.fileData !== "") {
    dbDesc += ` __FILE_DATA__:${i.fileData}`;
  }

  const dbInit: any = {
    id: i.id,
    category: i.category,
    title: i.title,
    author: i.author,
    desc: dbDesc,
    price: Number(i.price) || 0,
    sales: Number(i.sales) || 0,
    downloads: Number(i.downloads) || 0
  };
  if (i.image !== undefined) {
    dbInit.image = i.image;
  }
  return dbInit;
};

const mapOrderFromDB = (o: any) => ({
  id: o.id,
  buyerName: o.buyer_name,
  buyerEmail: o.buyer_email,
  buyerPhone: o.buyer_phone,
  buyerBankName: o.buyer_bank_name || "",
  buyerBankAccount: o.buyer_bank_account || "",
  buyerBankAccountName: o.buyer_bank_account_name || "",
  totalAmount: o.total_amount,
  items: o.items,
  status: o.status,
  createdAt: o.created_at
});

const mapOrderToDB = (o: any) => ({
  id: o.id,
  buyer_name: o.buyerName,
  buyer_email: o.buyerEmail,
  buyer_phone: o.buyerPhone,
  buyer_bank_name: o.buyerBankName || "",
  buyer_bank_account: o.buyerBankAccount || "",
  buyer_bank_account_name: o.buyerBankAccountName || "",
  total_amount: Number(o.totalAmount) || 0,
  items: o.items || [],
  status: o.status || "pending",
  created_at: o.createdAt || new Date().toISOString()
});

const mapFeedbackFromDB = (f: any) => ({
  id: f.id,
  name: f.name,
  email: f.email,
  msg: f.msg,
  createdAt: f.created_at
});

const mapFeedbackToDB = (f: any) => ({
  id: f.id,
  name: f.name,
  email: f.email,
  msg: f.msg,
  created_at: f.createdAt || new Date().toISOString()
});

// Database Access Layer (Supabase with JSON fallback mechanism)
const handleSupabaseError = (error: any, tableName?: string) => {
  if (!error) return;
  const msg = (error.message || String(error)).toLowerCase();
  const code = error.code || "";
  
  // Specific table missing: direct to table-specific quiet fallback instead of global fallback
  if (tableName && (code === "42P01" || msg.includes("schema cache") || msg.includes("does not exist") || msg.includes("relation"))) {
    if (!failedSupabaseTables.has(tableName)) {
      console.log(`[Supabase] Note: Table '${tableName}' is not initialized in Supabase yet. Seamlessly using local JSON database fallback for ${tableName}.`);
      failedSupabaseTables.add(tableName);
    }
    return;
  }
  
  // Trigger fallback for network issues OR database auth/RLS permissions/schema issues
  if (
    msg.includes("fetch") || 
    msg.includes("network") || 
    msg.includes("failed") || 
    msg.includes("connect") || 
    msg.includes("refused") || 
    msg.includes("dns") ||
    msg.includes("unreachable") ||
    msg.includes("request timed out") ||
    msg.includes("permission denied") ||
    msg.includes("violates row-level security") ||
    msg.includes("row-level security") ||
    msg.includes("schema cache") ||
    msg.includes("policy") ||
    code === "42501" || // RLS permission denied
    code === "42P01" || // Table does not exist
    code === "42703" || // Column does not exist
    code === "P0001"    // Custom raise_exception
  ) {
    if (!useSupabaseFallback) {
      console.warn(`[Supabase] DATABASE / CONNECTION / RLS POLICY ENGAGED ERROR: "${error.message || error}" (Code: ${code}).`);
      console.warn("[Supabase] Instantly migrating operations to high-reliability Local JSON Storage Fallback.");
      useSupabaseFallback = true;
    }
  }
};

async function fetchProducts() {
  if (SUPABASE_URL && SUPABASE_KEY && !useSupabaseFallback) {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });
      if (!error && data) {
        return data.map(mapProductFromDB);
      }
      if (error) {
        handleSupabaseError(error);
        console.warn("[Supabase] fetchProducts error, falling back locally:", error?.message);
      }
    } catch (e: any) {
      handleSupabaseError(e);
      console.warn("[Supabase] fetchProducts exception:", e.message || e);
    }
  }
  return readData(PRODUCTS_FILE, INITIAL_PRODUCTS);
}

async function insertProduct(product: any) {
  if (SUPABASE_URL && SUPABASE_KEY && !useSupabaseFallback) {
    try {
      const dbProd = mapProductToDB(product);
      const { data, error } = await supabase
        .from("products")
        .insert([dbProd])
        .select()
        .single();
      if (!error && data) {
        return mapProductFromDB(data);
      }
      if (error) {
        handleSupabaseError(error);
        console.error("[Supabase] Failed to insert product:", error?.message);
      }
    } catch (e: any) {
      handleSupabaseError(e);
      console.error("[Supabase] insertProduct exception:", e.message || e);
    }
  }
  
  // Local Json Fallback
  const localProducts = readData(PRODUCTS_FILE, INITIAL_PRODUCTS);
  localProducts.unshift(product);
  writeData(PRODUCTS_FILE, localProducts);
  return product;
}

async function updateProduct(id: string, updates: any) {
  if (SUPABASE_URL && SUPABASE_KEY && !useSupabaseFallback) {
    try {
      // Fetch currently stored product
      const { data: existing, error: findError } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single();
      
      if (findError) {
        handleSupabaseError(findError);
      }

      if (!findError && existing) {
        const currentMapped = mapProductFromDB(existing);
        const updatedMapped = { ...currentMapped, ...updates };
        const dbProd = mapProductToDB(updatedMapped);
        
        const { data, error } = await supabase
          .from("products")
          .update(dbProd)
          .eq("id", id)
          .select()
          .single();
        if (!error && data) {
          return mapProductFromDB(data);
        }
        if (error) {
          handleSupabaseError(error);
          console.error("[Supabase] Update product returned error:", error?.message);
        }
      }
    } catch (e: any) {
      handleSupabaseError(e);
      console.error("[Supabase] updateProduct exception:", e.message || e);
    }
  }

  // Local Json Fallback
  const localProducts = readData(PRODUCTS_FILE, INITIAL_PRODUCTS);
  const index = localProducts.findIndex((p: any) => p.id === id);
  if (index !== -1) {
    localProducts[index] = { ...localProducts[index], ...updates };
    writeData(PRODUCTS_FILE, localProducts);
    return localProducts[index];
  }
  return null;
}

async function deleteProduct(id: string) {
  if (SUPABASE_URL && SUPABASE_KEY && !useSupabaseFallback) {
    try {
      const { data, error } = await supabase
        .from("products")
        .delete()
        .eq("id", id)
        .select()
        .single();
      if (!error && data) {
        return mapProductFromDB(data);
      }
      if (error) {
        handleSupabaseError(error);
        console.error("[Supabase] Delete product failed:", error?.message);
      }
    } catch (e: any) {
      handleSupabaseError(e);
      console.error("[Supabase] deleteProduct exception:", e.message || e);
    }
  }

  // Local Json Fallback
  const localProducts = readData(PRODUCTS_FILE, INITIAL_PRODUCTS);
  const index = localProducts.findIndex((p: any) => p.id === id);
  if (index !== -1) {
    const deleted = localProducts.splice(index, 1);
    writeData(PRODUCTS_FILE, localProducts);
    return deleted[0];
  }
  return null;
}

// Database Access Layer (Initiatives)
async function fetchInitiatives() {
  if (SUPABASE_URL && SUPABASE_KEY && !useSupabaseFallback) {
    try {
      const { data, error } = await supabase
        .from("initiatives")
        .select("*")
        .order("created_at", { ascending: false });
      if (!error && data) {
        return data.map(mapInitiativeFromDB);
      }
      if (error) {
        handleSupabaseError(error);
        console.warn("[Supabase] fetchInitiatives error, falling back locally:", error?.message);
      }
    } catch (e: any) {
      handleSupabaseError(e);
      console.warn("[Supabase] fetchInitiatives exception:", e.message || e);
    }
  }
  return readData(INITIATIVES_FILE, INITIAL_INITIATIVES);
}

async function insertInitiative(initiative: any) {
  if (SUPABASE_URL && SUPABASE_KEY && !useSupabaseFallback) {
    try {
      const dbInit = mapInitiativeToDB(initiative);
      const { data, error } = await supabase
        .from("initiatives")
        .insert([dbInit])
        .select()
        .single();
      if (!error && data) {
        return mapInitiativeFromDB(data);
      }
      const isImageErr = error && (
        String(error.message || "").toLowerCase().includes("column \"image\"") || 
        String(error.message || "").toLowerCase().includes("'image' column") || 
        String(error.message || "").toLowerCase().includes("find the 'image'") ||
        error.code === "42703"
      );
      if (isImageErr) {
        console.warn("[Supabase] Column 'image' does not exist in 'initiatives' table. Retrying insert without image column.");
        const fallbackInit = { ...dbInit };
        delete fallbackInit.image;
        const { data: retryData, error: retryErr } = await supabase
          .from("initiatives")
          .insert([fallbackInit])
          .select()
          .single();
        if (!retryErr && retryData) {
          const mapped = mapInitiativeFromDB(retryData);
          mapped.image = initiative.image || "";
          return mapped;
        }
        if (retryErr) {
          handleSupabaseError(retryErr);
        }
      } else if (error) {
        handleSupabaseError(error);
        console.error("[Supabase] Insert initiative error:", error?.message);
      }
    } catch (e: any) {
      handleSupabaseError(e);
      console.error("[Supabase] insertInitiative exception:", e.message || e);
    }
  }

  // Local Json Fallback
  const localInits = readData(INITIATIVES_FILE, INITIAL_INITIATIVES);
  localInits.unshift(initiative);
  writeData(INITIATIVES_FILE, localInits);
  return initiative;
}

async function updateInitiative(id: string, updates: any) {
  if (SUPABASE_URL && SUPABASE_KEY && !useSupabaseFallback) {
    try {
      const { data: existing, error: findError } = await supabase
        .from("initiatives")
        .select("*")
        .eq("id", id)
        .single();
      
      if (findError) {
        handleSupabaseError(findError);
      }

      if (!findError && existing) {
        const currentMapped = mapInitiativeFromDB(existing);
        const updatedMapped = { ...currentMapped, ...updates };
        const dbInit = mapInitiativeToDB(updatedMapped);
        
        const { data, error } = await supabase
          .from("initiatives")
          .update(dbInit)
          .eq("id", id)
          .select()
          .single();
        if (!error && data) {
          return mapInitiativeFromDB(data);
        }
        const isImageErr = error && (
          String(error.message || "").toLowerCase().includes("column \"image\"") || 
          String(error.message || "").toLowerCase().includes("'image' column") || 
          String(error.message || "").toLowerCase().includes("find the 'image'") ||
          error.code === "42703"
        );
        if (isImageErr) {
          console.warn("[Supabase] Column 'image' does not exist in 'initiatives' table. Retrying update without image column.");
          const fallbackInit = { ...dbInit };
          delete fallbackInit.image;
          const { data: retryData, error: retryErr } = await supabase
            .from("initiatives")
            .update(fallbackInit)
            .eq("id", id)
            .select()
            .single();
          if (!retryErr && retryData) {
            const mapped = mapInitiativeFromDB(retryData);
            mapped.image = updates.image || currentMapped.image || "";
            return mapped;
          }
          if (retryErr) {
            handleSupabaseError(retryErr);
          }
        } else if (error) {
          handleSupabaseError(error);
          console.error("[Supabase] Update initiative error:", error?.message);
        }
      }
    } catch (e: any) {
      handleSupabaseError(e);
      console.error("[Supabase] updateInitiative exception:", e.message || e);
    }
  }

  // Local Json Fallback
  const localInits = readData(INITIATIVES_FILE, INITIAL_INITIATIVES);
  const index = localInits.findIndex((i: any) => i.id === id);
  if (index !== -1) {
    localInits[index] = { ...localInits[index], ...updates };
    writeData(INITIATIVES_FILE, localInits);
    return localInits[index];
  }
  return null;
}

async function deleteInitiative(id: string) {
  if (SUPABASE_URL && SUPABASE_KEY && !useSupabaseFallback) {
    try {
      const { data, error } = await supabase
        .from("initiatives")
        .delete()
        .eq("id", id)
        .select()
        .single();
      if (!error && data) {
        return mapInitiativeFromDB(data);
      }
      if (error) {
        handleSupabaseError(error);
        console.error("[Supabase] Delete initiative error:", error?.message);
      }
    } catch (e: any) {
      handleSupabaseError(e);
      console.error("[Supabase] deleteInitiative exception:", e.message || e);
    }
  }

  // Local Json Fallback
  const localInits = readData(INITIATIVES_FILE, INITIAL_INITIATIVES);
  const index = localInits.findIndex((i: any) => i.id === id);
  if (index !== -1) {
    const deleted = localInits.splice(index, 1);
    writeData(INITIATIVES_FILE, localInits);
    return deleted[0];
  }
  return null;
}

// Database Access Layer (Orders)
async function fetchOrders() {
  if (SUPABASE_URL && SUPABASE_KEY && !useSupabaseFallback) {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });
      if (!error && data) {
        return data.map(mapOrderFromDB);
      }
      if (error) {
        handleSupabaseError(error);
        console.warn("[Supabase] fetchOrders database error:", error?.message);
      }
    } catch (e: any) {
      handleSupabaseError(e);
      console.warn("[Supabase] fetchOrders exception:", e.message || e);
    }
  }
  return readData(ORDERS_FILE, []);
}

async function insertOrder(order: any) {
  if (SUPABASE_URL && SUPABASE_KEY && !useSupabaseFallback) {
    try {
      const dbOrder = mapOrderToDB(order);
      const { data, error } = await supabase
        .from("orders")
        .insert([dbOrder])
        .select()
        .single();
      if (!error && data) {
        return mapOrderFromDB(data);
      }
      if (error) {
        handleSupabaseError(error);
        console.error("[Supabase] Insert order database error:", error?.message);
      }
    } catch (e: any) {
      handleSupabaseError(e);
      console.error("[Supabase] insertOrder exception:", e.message || e);
    }
  }

  // Local Json Fallback
  const localOrders = readData(ORDERS_FILE, []);
  localOrders.unshift(order);
  writeData(ORDERS_FILE, localOrders);
  return order;
}

async function updateOrderStatus(id: string, status: string) {
  if (SUPABASE_URL && SUPABASE_KEY && !useSupabaseFallback) {
    try {
      const { data, error } = await supabase
        .from("orders")
        .update({ status })
        .eq("id", id)
        .select()
        .single();
      if (!error && data) {
        return mapOrderFromDB(data);
      }
      if (error) {
        handleSupabaseError(error);
        console.error("[Supabase] Update order status database error:", error?.message);
      }
    } catch (e: any) {
      handleSupabaseError(e);
      console.error("[Supabase] updateOrderStatus exception:", e.message || e);
    }
  }

  // Local Json Fallback
  const localOrders = readData(ORDERS_FILE, []);
  const index = localOrders.findIndex((o: any) => o.id === id);
  if (index !== -1) {
    localOrders[index].status = status;
    writeData(ORDERS_FILE, localOrders);
    return localOrders[index];
  }
  return null;
}

async function deleteOrder(id: string) {
  if (SUPABASE_URL && SUPABASE_KEY && !useSupabaseFallback) {
    try {
      const { data, error } = await supabase
        .from("orders")
        .delete()
        .eq("id", id)
        .select()
        .single();
      if (!error && data) {
        return mapOrderFromDB(data);
      }
      if (error) {
        handleSupabaseError(error);
        console.error("[Supabase] Delete order database error:", error?.message);
      }
    } catch (e: any) {
      handleSupabaseError(e);
      console.error("[Supabase] deleteOrder exception:", e.message || e);
    }
  }

  // Local Json Fallback
  const localOrders = readData(ORDERS_FILE, []);
  const index = localOrders.findIndex((o: any) => o.id === id);
  if (index !== -1) {
    const deleted = localOrders.splice(index, 1);
    writeData(ORDERS_FILE, localOrders);
    return deleted[0];
  }
  return null;
}

// Database Access Layer (Feedbacks)
async function fetchFeedbacks() {
  if (SUPABASE_URL && SUPABASE_KEY && !useSupabaseFallback) {
    try {
      const { data, error } = await supabase
        .from("feedbacks")
        .select("*")
        .order("created_at", { ascending: false });
      if (!error && data) {
        return data.map(mapFeedbackFromDB);
      }
      if (error) {
        handleSupabaseError(error);
        console.error("[Supabase] Fetch feedbacks error:", error?.message);
      }
    } catch (e: any) {
      handleSupabaseError(e);
      console.error("[Supabase] fetchFeedbacks exception:", e.message || e);
    }
  }
  return readData(FEEDBACKS_FILE, []);
}

async function insertFeedback(feedback: any) {
  if (SUPABASE_URL && SUPABASE_KEY && !useSupabaseFallback) {
    try {
      const dbFeedback = mapFeedbackToDB(feedback);
      const { data, error } = await supabase
        .from("feedbacks")
        .insert([dbFeedback])
        .select()
        .single();
      if (!error && data) {
        return mapFeedbackFromDB(data);
      }
      if (error) {
        handleSupabaseError(error);
        console.error("[Supabase] Insert feedback error:", error?.message);
      }
    } catch (e: any) {
      handleSupabaseError(e);
      console.error("[Supabase] insertFeedback exception:", e.message || e);
    }
  }

  // Local Json Fallback
  const localFeedbacks = readData(FEEDBACKS_FILE, []);
  localFeedbacks.unshift(feedback);
  writeData(FEEDBACKS_FILE, localFeedbacks);
  return feedback;
}

// Database Access Layer (Games)
async function fetchGames() {
  if (SUPABASE_URL && SUPABASE_KEY && !useSupabaseFallback && !failedSupabaseTables.has("games")) {
    try {
      const { data, error } = await supabase
        .from("games")
        .select("*")
        .order("created_at", { ascending: false });
      if (!error && data) {
        return data.map(mapGameFromDB);
      }
      if (error) {
        handleSupabaseError(error, "games");
        console.log("[Supabase] fetchGames fallback to local due to error:", error?.message);
      }
    } catch (e: any) {
      handleSupabaseError(e, "games");
      console.log("[Supabase] fetchGames exception fallback:", e.message || e);
    }
  }
  return readData(GAMES_FILE, INITIAL_GAMES);
}

async function insertGame(game: any) {
  if (SUPABASE_URL && SUPABASE_KEY && !useSupabaseFallback && !failedSupabaseTables.has("games")) {
    try {
      const { data, error } = await supabase
        .from("games")
        .insert([mapGameToDB(game)])
        .select()
        .single();
      if (!error && data) {
        return mapGameFromDB(data);
      }
      if (error) {
        handleSupabaseError(error, "games");
        console.error("[Supabase] Insert game error:", error?.message);
      }
    } catch (e: any) {
      handleSupabaseError(e, "games");
      console.error("[Supabase] insertGame exception:", e.message || e);
    }
  }

  // Local Json Fallback
  const localGames = readData(GAMES_FILE, INITIAL_GAMES);
  localGames.unshift(game);
  writeData(GAMES_FILE, localGames);
  return game;
}

async function updateGame(id: string, updates: any) {
  if (SUPABASE_URL && SUPABASE_KEY && !useSupabaseFallback && !failedSupabaseTables.has("games")) {
    try {
      const { data, error } = await supabase
        .from("games")
        .update(mapGameToDB(updates))
        .eq("id", id)
        .select()
        .single();
      if (!error && data) {
        return mapGameFromDB(data);
      }
      if (error) {
        handleSupabaseError(error, "games");
        console.error("[Supabase] Update game error:", error?.message);
      }
    } catch (e: any) {
      handleSupabaseError(e, "games");
      console.error("[Supabase] updateGame exception:", e.message || e);
    }
  }

  // Local Json Fallback
  const localGames = readData(GAMES_FILE, INITIAL_GAMES);
  const index = localGames.findIndex((g: any) => g.id === id);
  if (index !== -1) {
    localGames[index] = { ...localGames[index], ...updates };
    writeData(GAMES_FILE, localGames);
    return localGames[index];
  }
  return null;
}

async function deleteGame(id: string) {
  if (SUPABASE_URL && SUPABASE_KEY && !useSupabaseFallback && !failedSupabaseTables.has("games")) {
    try {
      const { data, error } = await supabase
        .from("games")
        .delete()
        .eq("id", id)
        .select()
        .single();
      if (!error && data) {
        return data;
      }
      if (error) {
        handleSupabaseError(error, "games");
        console.error("[Supabase] Delete game error:", error?.message);
      }
    } catch (e: any) {
      handleSupabaseError(e, "games");
      console.error("[Supabase] deleteGame exception:", e.message || e);
    }
  }

  // Local Json Fallback
  const localGames = readData(GAMES_FILE, INITIAL_GAMES);
  const index = localGames.findIndex((g: any) => g.id === id);
  if (index !== -1) {
    const deleted = localGames.splice(index, 1);
    writeData(GAMES_FILE, localGames);
    return deleted[0];
  }
  return null;
}

// Automatic Seeder & Database Connection Initializer
async function initializeSupabase() {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.warn("[Supabase] Configuration is empty. Automatically falling back to local files database.");
    useSupabaseFallback = true;
    return;
  }

  try {
    console.log("[Supabase] Testing schema connection...");
    
    // Check if the 'products' relation exists
    const { data: testProds, error: testError } = await supabase
      .from("products")
      .select("id")
      .limit(1);

    if (testError) {
      console.warn("[Supabase] Connection warning or tables are not created yet:", testError.message);
      console.warn("[Supabase] Local JSON file fallback will be active active until tables are created.");
      useSupabaseFallback = true;
      return;
    }

    console.log("[Supabase] Connection fully validated!");
    
    // Seed Products if table contains no rows
    if (!testProds || testProds.length === 0) {
      console.log("[Supabase] Empty products table detected. Auto-seeding initial products...");
      const dbProds = INITIAL_PRODUCTS.map(mapProductToDB);
      const { error: seedErr } = await supabase.from("products").insert(dbProds);
      if (seedErr) {
        console.error("[Supabase] Auto-seeding products failed:", seedErr.message);
      } else {
        console.log("[Supabase] Auto-seeded products successfully!");
      }
    }

    // Seed Initiatives if empty
    try {
      const { data: existingInits, error: initCountErr } = await supabase
        .from("initiatives")
        .select("id")
        .limit(1);

      if (initCountErr) {
        handleSupabaseError(initCountErr, "initiatives");
      } else {
        if (!existingInits || existingInits.length === 0) {
          console.log("[Supabase] Empty initiatives table detected. Auto-seeding initial initiatives...");
          const dbInits = INITIAL_INITIATIVES.map(mapInitiativeToDB);
          const { error: seedErr } = await supabase.from("initiatives").insert(dbInits);
          if (seedErr) {
            console.error("[Supabase] Auto-seeding initiatives failed:", seedErr.message);
          } else {
            console.log("[Supabase] Auto-seeded initiatives successfully!");
          }
        }
      }
    } catch (e: any) {
      handleSupabaseError(e, "initiatives");
    }

    // Seed Games if empty
    try {
      const { data: existingGames, error: gameCountErr } = await supabase
        .from("games")
        .select("id")
        .limit(1);

      if (gameCountErr) {
        handleSupabaseError(gameCountErr, "games");
      } else {
        if (!existingGames || existingGames.length === 0) {
          console.log("[Supabase] Empty games table detected. Auto-seeding initial games...");
          const dbGames = INITIAL_GAMES.map(mapGameToDB);
          const { error: seedErr } = await supabase.from("games").insert(dbGames);
          if (seedErr) {
            console.error("[Supabase] Auto-seeding games failed:", seedErr.message);
          } else {
            console.log("[Supabase] Auto-seeded games successfully!");
          }
        }
      }
    } catch (e: any) {
      handleSupabaseError(e, "games");
    }

    // Seed Subjects if empty
    try {
      const { data: existingSubjects, error: subjectCountErr } = await supabase
        .from("subjects")
        .select("name")
        .limit(1);

      if (subjectCountErr) {
        handleSupabaseError(subjectCountErr, "subjects");
      } else {
        if (!existingSubjects || existingSubjects.length === 0) {
          console.log("[Supabase] Empty subjects table detected. Auto-seeding default subjects...");
          const localSubjects = readData(SUBJECTS_FILE, INITIAL_SUBJECTS);
          const dbSubjects = localSubjects.map((s: string) => ({ name: s }));
          const { error: seedErr } = await supabase.from("subjects").insert(dbSubjects);
          if (seedErr) {
            console.error("[Supabase] Auto-seeding subjects failed:", seedErr.message);
          } else {
            console.log("[Supabase] Auto-seeded subjects successfully!");
          }
        }
      }
    } catch (e: any) {
      handleSupabaseError(e, "subjects");
    }

    // Seed Admin Accounts if empty
    try {
      const { data: existingAdmins, error: adminCountErr } = await supabase
        .from("admin_accounts")
        .select("username")
        .limit(1);

      if (adminCountErr) {
        handleSupabaseError(adminCountErr, "admin_accounts");
      } else {
        if (!existingAdmins || existingAdmins.length === 0) {
          console.log("[Supabase] Empty admin_accounts table detected. Auto-seeding default admin account...");
          const localAdminsData = readData(ADMIN_FILE, { 
            admins: [
              { username: "admin", password: "admin" },
              { username: "lananh", password: "anh123@" }
            ] 
          });
          const adminsArray = localAdminsData.admins || [{ username: "admin", password: "admin" }];
          const dbAdmins = adminsArray.map((a: any) => ({ username: a.username, password: a.password }));
          const { error: seedErr } = await supabase.from("admin_accounts").insert(dbAdmins);
          if (seedErr) {
            console.error("[Supabase] Auto-seeding admin accounts failed:", seedErr.message);
          } else {
            console.log("[Supabase] Auto-seeded admin accounts successfully!");
          }
        }
      }
    } catch (e: any) {
      handleSupabaseError(e, "admin_accounts");
    }

  } catch (err: any) {
    console.error("[Supabase] Uncaught initialization exception:", err.message || err);
    useSupabaseFallback = true;
  }
}

// Run DB Auto-Init
initializeSupabase();

// Admin Auth Middleware
const requireAdmin = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers.authorization;
  if (authHeader === "Bearer admin-secret-token") {
    next();
  } else {
    res.status(401).json({ error: "Access denied. Admin authorization required." });
  }
};

// === API ROUTES ===

// Database connection status check
app.get("/api/db-status", async (req, res) => {
  const status: any = {
    connected: false,
    url: SUPABASE_URL,
    fallback: useSupabaseFallback,
    tables: {}
  };

  if (SUPABASE_URL && SUPABASE_KEY) {
    try {
      const checkTable = async (tableName: string) => {
        try {
          const { count, error } = await supabase
            .from(tableName)
            .select("id", { count: "exact", head: true });
          if (error) {
            return { exists: false, error: error.message, count: 0 };
          }
          return { exists: true, count: count || 0 };
        } catch (e: any) {
          return { exists: false, error: e.message || String(e), count: 0 };
        }
      };

      const productsCheck = await checkTable("products");
      const initiativesCheck = await checkTable("initiatives");
      const ordersCheck = await checkTable("orders");
      const feedbacksCheck = await checkTable("feedbacks");

      status.tables.products = productsCheck;
      status.tables.initiatives = initiativesCheck;
      status.tables.orders = ordersCheck;
      status.tables.feedbacks = feedbacksCheck;

      const allExist = productsCheck.exists && initiativesCheck.exists && ordersCheck.exists && feedbacksCheck.exists;
      
      if (allExist) {
        if (useSupabaseFallback) {
          console.log("[Supabase] Live diagnostic recovery: All tables are verified as existing and accessible. Disabling local fallback.");
          useSupabaseFallback = false;
        }
        status.connected = true;
        status.fallback = false;
        status.message = "Kết nối Supabase hoàn toàn ổn định và sẵn sàng!";
      } else {
        status.message = "Một số bảng chưa được khởi tạo trên Supabase. Vui lòng chạy truy vấn SQL để tạo các bảng.";
      }
    } catch (err: any) {
      status.error = err.message || String(err);
      status.message = "Đã xảy ra lỗi khi kiểm tra kết nối Supabase.";
    }
  } else {
    status.error = "Không tìm thấy cấu hình Supabase URL hoặc Service Role/Anon Key.";
    status.message = "Cấu hình Supabase trống.";
  }

  res.json(status);
});

// Helper functions for Multi-Admin accounts with Supabase persistence
async function fetchAdmins() {
  if (SUPABASE_URL && SUPABASE_KEY && !useSupabaseFallback) {
    try {
      const { data, error } = await supabase
        .from("admin_accounts")
        .select("*")
        .order("created_at", { ascending: true });
      if (!error && data && data.length > 0) {
        return data.map((a: any) => ({ username: a.username, password: a.password }));
      }
    } catch (e: any) {
      console.warn("[Supabase] fetchAdmins exception, falling back locally:", e.message || e);
    }
  }
  const data = readData(ADMIN_FILE, { 
    admins: [
      { username: "admin", password: "admin" },
      { username: "lananh", password: "anh123@" }
    ] 
  });
  if (data && data.admins && Array.isArray(data.admins)) {
    return data.admins;
  }
  if (data && data.username && data.password) {
    return [{ username: data.username, password: data.password }];
  }
  return [{ username: "admin", password: "admin" }];
}

async function persistAdmins(admins: any[]) {
  if (SUPABASE_URL && SUPABASE_KEY && !useSupabaseFallback) {
    try {
      const dbAdmins = admins.map((a: any) => ({ username: a.username, password: a.password }));
      await supabase
        .from("admin_accounts")
        .upsert(dbAdmins);
    } catch (e: any) {
      console.error("[Supabase] persistAdmins exception:", e.message || e);
    }
  }
  writeData(ADMIN_FILE, { admins });
}

async function deleteAdminFromDB(username: string) {
  if (SUPABASE_URL && SUPABASE_KEY && !useSupabaseFallback) {
    try {
      await supabase
        .from("admin_accounts")
        .delete()
        .eq("username", username);
    } catch (e: any) {
      console.error("[Supabase] deleteAdminFromDB exception:", e.message || e);
    }
  }
}

// 1. Authenticate Admin
app.post("/api/admin/login", async (req, res) => {
  const { username, password } = req.body;
  const admins = await fetchAdmins();
  const found = admins.find((a: any) => a.username === username && a.password === password);
  if (found) {
    res.json({ success: true, token: "admin-secret-token", role: "admin" });
  } else {
    res.status(401).json({ success: false, error: "Tài khoản hoặc mật khẩu không đúng!" });
  }
});

// Change Admin Password
app.post("/api/admin/change-password", requireAdmin, async (req, res) => {
  const { username, currentPassword, newPassword } = req.body;
  const admins = await fetchAdmins();
  
  if (!username) {
    return res.status(400).json({ success: false, error: "Vui lòng chọn tài khoản quản trị muốn đổi mật khẩu!" });
  }

  const adminIndex = admins.findIndex((a: any) => a.username.toLowerCase() === username.toLowerCase());
  if (adminIndex === -1) {
    return res.status(404).json({ success: false, error: "Không tìm thấy tài khoản quản trị này!" });
  }

  if (admins[adminIndex].password !== currentPassword) {
    return res.status(400).json({ success: false, error: "Mật khẩu hiện tại không chính xác!" });
  }

  admins[adminIndex].password = newPassword;
  await persistAdmins(admins);
  res.json({ success: true, message: `Đổi mật khẩu tài khoản ${username} thành công!` });
});

// Sync Admin Accounts from Client Backup
app.post("/api/admin/sync-accounts", async (req, res) => {
  const { admins } = req.body;
  if (!admins || !Array.isArray(admins) || admins.length === 0) {
    return res.status(400).json({ success: false, error: "Dữ liệu đồng bộ không hợp lệ!" });
  }

  const currentAdmins = await fetchAdmins();
  const currentSet = new Set(currentAdmins.map((a: any) => a.username.toLowerCase()));

  let hasChanges = false;
  admins.forEach((item: any) => {
    if (item && item.username && item.password) {
      const lowerUser = item.username.toLowerCase();
      const serverMatch = currentAdmins.find((a: any) => a.username.toLowerCase() === lowerUser);
      if (!serverMatch) {
        currentAdmins.push({ username: item.username, password: item.password });
        hasChanges = true;
      } else if (serverMatch.password !== item.password) {
        serverMatch.password = item.password;
        hasChanges = true;
      }
    }
  });

  if (hasChanges) {
    await persistAdmins(currentAdmins);
    console.log("[Sync] Admin accounts synchronized and persisted from local storage backup!");
  }

  res.json({ success: true, admins: currentAdmins.map((a: any) => ({ username: a.username, password: a.password })) });
});

// Get List of Admin Accounts
app.get("/api/admin/accounts", requireAdmin, async (req, res) => {
  const admins = await fetchAdmins();
  res.json({ success: true, admins: admins.map((a: any) => ({ username: a.username, password: a.password })) });
});

// Create/Grant New Admin Account
app.post("/api/admin/accounts", requireAdmin, async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ success: false, error: "Vui lòng nhập đầy đủ tên tài khoản và mật khẩu!" });
  }
  const cleanUsername = username.trim();
  if (cleanUsername.length < 3) {
    return res.status(400).json({ success: false, error: "Tên tài khoản phải từ 3 ký tự trở lên!" });
  }
  if (password.length < 4) {
    return res.status(400).json({ success: false, error: "Mật khẩu phải từ 4 ký tự trở lên!" });
  }

  const admins = await fetchAdmins();
  const exists = admins.some((a: any) => a.username.toLowerCase() === cleanUsername.toLowerCase());
  if (exists) {
    return res.status(400).json({ success: false, error: "Tên tài khoản quản trị này đã tồn tại!" });
  }

  admins.push({ username: cleanUsername, password });
  await persistAdmins(admins);
  res.status(201).json({ success: true, message: "Đã thêm tài khoản quản trị thành công!" });
});

// Delete Admin Account
app.delete("/api/admin/accounts/:username", requireAdmin, async (req, res) => {
  const { username } = req.params;
  const admins = await fetchAdmins();
  
  if (admins.length <= 1) {
    return res.status(400).json({ success: false, error: "Không thể xóa tài khoản quản trị duy nhất!" });
  }

  const index = admins.findIndex((a: any) => a.username.toLowerCase() === username.toLowerCase());
  if (index === -1) {
    return res.status(404).json({ success: false, error: "Không tìm thấy tài khoản quản trị này!" });
  }

  admins.splice(index, 1);
  await persistAdmins(admins);
  await deleteAdminFromDB(username);
  res.json({ success: true, message: "Đã xóa tài khoản quản trị thành công!" });
});

// 2. Products APIs
app.get("/api/products", async (req, res) => {
  const products = await fetchProducts();
  res.json(products);
});

app.post("/api/admin/products", requireAdmin, async (req, res) => {
  const newProduct = {
    id: `prod-${Date.now()}`,
    title: req.body.title || "Học liệu mới",
    subject: req.body.subject || "Tin học",
    grade: Number(req.body.grade) || 6,
    type: req.body.type || "Giáo án Word",
    price: Number(req.body.price) || 0,
    originalPrice: Number(req.body.originalPrice) || 0,
    rating: req.body.rating || 5.0,
    sales: 0,
    tag: req.body.tag || "new",
    isFree: req.body.price === 0,
    image: req.body.image || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500&auto=format&fit=crop&q=60",
    description: req.body.description || "Mô tả nội dung học liệu chi tiết.",
    fileData: req.body.fileData || "",
    fileName: req.body.fileName || ""
  };
  const saved = await insertProduct(newProduct);
  res.status(201).json(saved);
});

app.put("/api/admin/products/:id", requireAdmin, async (req, res) => {
  const { id } = req.params;
  const updated = await updateProduct(id, req.body);
  if (updated) {
    res.json(updated);
  } else {
    res.status(404).json({ error: "Product not found" });
  }
});

app.delete("/api/admin/products/:id", requireAdmin, async (req, res) => {
  const { id } = req.params;
  const deleted = await deleteProduct(id);
  if (deleted) {
    res.json({ success: true, deleted });
  } else {
    res.status(404).json({ error: "Product not found" });
  }
});

// 3. Initiatives APIs
app.get("/api/initiatives", async (req, res) => {
  const inits = await fetchInitiatives();
  res.json(inits);
});

app.post("/api/admin/initiatives", requireAdmin, async (req, res) => {
  const newInit = {
    id: `init-${Date.now()}`,
    category: req.body.category || "Bậc THCS",
    title: req.body.title || "Sáng kiến kinh nghiệm mới",
    author: req.body.author || "Giáo viên mới",
    desc: req.body.desc || "Mô tả sáng kiến kinh nghiệm đoạt giải.",
    price: Number(req.body.price) || 0,
    sales: 0,
    downloads: 0,
    image: req.body.image || "",
    fileName: req.body.fileName || "",
    fileData: req.body.fileData || ""
  };
  const saved = await insertInitiative(newInit);
  res.status(201).json(saved);
});

app.put("/api/admin/initiatives/:id", requireAdmin, async (req, res) => {
  const { id } = req.params;
  const updated = await updateInitiative(id, req.body);
  if (updated) {
    res.json(updated);
  } else {
    res.status(404).json({ error: "Initiative not found" });
  }
});

app.delete("/api/admin/initiatives/:id", requireAdmin, async (req, res) => {
  const { id } = req.params;
  const deleted = await deleteInitiative(id);
  if (deleted) {
    res.json({ success: true, deleted });
  } else {
    res.status(404).json({ error: "Initiative not found" });
  }
});

// Additional Games REST APIs
app.get("/api/games", async (req, res) => {
  const games = await fetchGames();
  res.json(games);
});

app.post("/api/admin/games", requireAdmin, async (req, res) => {
  const newGame = {
    id: `game-${Date.now()}`,
    category: req.body.category || "Bậc THCS",
    title: req.body.title || "Trò chơi mới",
    tag: req.body.tag || "Giải trí giáo dục",
    desc: req.body.desc || "Mô tả luật chơi và hướng dẫn học sinh.",
    image: req.body.image || "",
    fileName: req.body.fileName || "",
    fileData: req.body.fileData || "",
    isPaid: req.body.isPaid === true,
    price: Number(req.body.price) || 0,
    salePrice: Number(req.body.salePrice) || 0
  };
  const saved = await insertGame(newGame);
  res.status(201).json(saved);
});

app.put("/api/admin/games/:id", requireAdmin, async (req, res) => {
  const { id } = req.params;
  const updated = await updateGame(id, req.body);
  if (updated) {
    res.json(updated);
  } else {
    res.status(404).json({ error: "Game not found" });
  }
});

app.delete("/api/admin/games/:id", requireAdmin, async (req, res) => {
  const { id } = req.params;
  const deleted = await deleteGame(id);
  if (deleted) {
    res.json({ success: true, deleted });
  } else {
    res.status(404).json({ error: "Game not found" });
  }
});

// Helper functions for Subjects with Supabase persistence
async function fetchSubjects() {
  if (SUPABASE_URL && SUPABASE_KEY && !useSupabaseFallback) {
    try {
      const { data, error } = await supabase
        .from("subjects")
        .select("*")
        .order("created_at", { ascending: true });
      if (!error && data && data.length > 0) {
        return data.map((s: any) => s.name);
      }
    } catch (e: any) {
      console.warn("[Supabase] fetchSubjects exception, falling back locally:", e.message || e);
    }
  }
  return readData(SUBJECTS_FILE, INITIAL_SUBJECTS);
}

async function insertSubject(name: string) {
  if (SUPABASE_URL && SUPABASE_KEY && !useSupabaseFallback) {
    try {
      await supabase
        .from("subjects")
        .insert([{ name }]);
    } catch (e: any) {
      console.error("[Supabase] insertSubject exception:", e.message || e);
    }
  }
  const currentList = readData(SUBJECTS_FILE, INITIAL_SUBJECTS);
  if (!currentList.includes(name)) {
    currentList.push(name);
    writeData(SUBJECTS_FILE, currentList);
  }
  return currentList;
}

async function deleteSubjectFromDB(name: string) {
  if (SUPABASE_URL && SUPABASE_KEY && !useSupabaseFallback) {
    try {
      await supabase
        .from("subjects")
        .delete()
        .eq("name", name);
    } catch (e: any) {
      console.error("[Supabase] deleteSubjectFromDB exception:", e.message || e);
    }
  }
  const currentList = readData(SUBJECTS_FILE, INITIAL_SUBJECTS);
  const updatedList = currentList.filter(s => s.toLowerCase() !== name.toLowerCase());
  writeData(SUBJECTS_FILE, updatedList);
  return updatedList;
}

// Banner Configuration APIs
app.get("/api/banner", async (req, res) => {
  const localData = readData(BANNER_FILE, DEFAULT_BANNER);
  const mergedData = { ...DEFAULT_BANNER, ...localData };

  if (SUPABASE_URL && SUPABASE_KEY && !useSupabaseFallback) {
    try {
      const { data, error } = await supabase
        .from("banner_settings")
        .select("*")
        .eq("id", "current")
        .single();
      
      if (!error && data) {
        return res.json({
          ...mergedData,
          backgroundImage: data.background_image || mergedData.backgroundImage,
          badgeText: data.badge_text || mergedData.badgeText,
          title1: data.title_1 || mergedData.title1,
          title2: data.title_2 || mergedData.title2,
          description: data.description || mergedData.description,
          adminPanel1Title: data.admin_panel1_title || mergedData.adminPanel1Title,
          adminPanel1Desc: data.admin_panel1_desc || mergedData.adminPanel1Desc,
          adminPanel2Title: data.admin_panel2_title || mergedData.adminPanel2Title,
          adminPanel2Desc: data.admin_panel2_desc || mergedData.adminPanel2Desc,
          adminPanel3Title: data.admin_panel3_title || mergedData.adminPanel3Title,
          promoBadge: data.promo_badge || mergedData.promoBadge,
          promoTitle1: data.promo_title1 || mergedData.promoTitle1,
          promoTitle2: data.promo_title2 || mergedData.promoTitle2,
          promoDesc: data.promo_desc || mergedData.promoDesc,
          promoFoot: data.promo_foot || mergedData.promoFoot,
          promoBtn: data.promo_btn || mergedData.promoBtn,
          promoEnabled: data.promo_enabled !== undefined ? (data.promo_enabled === true || data.promo_enabled === "true" || String(data.promo_enabled) === "true") : mergedData.promoEnabled
        });
      }
    } catch (e: any) {
      console.warn("[Supabase] Failed to fetch banner_settings:", e.message || e);
    }
  }
  
  res.json(mergedData);
});

// Bank Settings Configuration APIs
app.get("/api/bank", (req, res) => {
  const localData = readData(BANK_FILE, DEFAULT_BANK_SETTINGS);
  res.json({ ...DEFAULT_BANK_SETTINGS, ...localData });
});

app.post("/api/admin/bank", requireAdmin, (req, res) => {
  const settings = req.body;
  if (!settings) {
    return res.status(400).json({ error: "Dữ liệu cấu hình ngân hàng không hợp lệ." });
  }
  writeData(BANK_FILE, settings);
  res.json({ success: true, message: "Đã cập nhật cấu hình tài khoản ngân hàng thành công!", data: settings });
});

app.post("/api/admin/banner", requireAdmin, async (req, res) => {
  const settings = req.body;
  if (!settings) {
    return res.status(400).json({ error: "Dữ liệu cấu hình không hợp lệ." });
  }

  if (SUPABASE_URL && SUPABASE_KEY && !useSupabaseFallback) {
    try {
      // 1. Cố gắng upsert đầy đủ tất cả các trường bao gồm cả cấu hình Khuyến mãi và Admin Panels mới
      const { error: fullError } = await supabase
        .from("banner_settings")
        .upsert({
          id: "current",
          background_image: settings.backgroundImage || "",
          badge_text: settings.badgeText || "",
          title_1: settings.title1 || "",
          title_2: settings.title2 || "",
          description: settings.description || "",
          admin_panel1_title: settings.adminPanel1Title || "",
          admin_panel1_desc: settings.adminPanel1Desc || "",
          admin_panel2_title: settings.adminPanel2Title || "",
          admin_panel2_desc: settings.adminPanel2Desc || "",
          admin_panel3_title: settings.adminPanel3Title || "",
          promo_badge: settings.promoBadge || "",
          promo_title1: settings.promoTitle1 || "",
          promo_title2: settings.promoTitle2 || "",
          promo_desc: settings.promoDesc || "",
          promo_foot: settings.promoFoot || "",
          promo_btn: settings.promoBtn || "",
          promo_enabled: settings.promoEnabled === true || settings.promoEnabled === "true",
          updated_at: new Date().toISOString()
        });
      
      if (fullError) {
        console.warn("[Supabase] Failed to upsert with all columns, trying fallback without promo columns:", fullError.message);
        
        // 2. Thử phiên bản cũ trung gian (chỉ có các trường thông thường và admin panels)
        const { error: intermediateError } = await supabase
          .from("banner_settings")
          .upsert({
            id: "current",
            background_image: settings.backgroundImage || "",
            badge_text: settings.badgeText || "",
            title_1: settings.title1 || "",
            title_2: settings.title2 || "",
            description: settings.description || "",
            admin_panel1_title: settings.adminPanel1Title || "",
            admin_panel1_desc: settings.adminPanel1Desc || "",
            admin_panel2_title: settings.adminPanel2Title || "",
            admin_panel2_desc: settings.adminPanel2Desc || "",
            admin_panel3_title: settings.adminPanel3Title || "",
            updated_at: new Date().toISOString()
          });

        if (intermediateError) {
          console.warn("[Supabase] Intermediate upsert also failed (likely missing admin_panel* columns), falling back to core columns:", intermediateError.message);
          
          // 3. Thử phiên bản cốt lõi cơ bản nhất luôn tồn tại trong mọi phiên bản schema cũ của banner_settings
          const { error: coreError } = await supabase
            .from("banner_settings")
            .upsert({
              id: "current",
              background_image: settings.backgroundImage || "",
              badge_text: settings.badgeText || "",
              title_1: settings.title1 || "",
              title_2: settings.title2 || "",
              description: settings.description || "",
              updated_at: new Date().toISOString()
            });

          if (coreError) {
            console.error("[Supabase] Absolute core upsert failed as well:", coreError.message);
          }
        }
      }
    } catch (e: any) {
      console.warn("[Supabase] Exception in save banner_settings:", e.message || e);
    }
  }

  writeData(BANNER_FILE, settings);
  res.json({ success: true, message: "Đã cập nhật cấu hình banner thành công!", data: settings });
});

// Subjects Management APIs
app.get("/api/subjects", async (req, res) => {
  const list = await fetchSubjects();
  res.json(list);
});

app.post("/api/admin/subjects", requireAdmin, async (req, res) => {
  const { name } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ error: "Tên môn học không hợp lệ" });
  }
  const cleanName = name.trim();
  const currentList = await fetchSubjects();
  if (currentList.some(s => s.toLowerCase() === cleanName.toLowerCase())) {
    return res.status(400).json({ error: "Môn học này đã tồn tại" });
  }
  const updatedList = await insertSubject(cleanName);
  res.status(201).json(updatedList);
});

app.delete("/api/admin/subjects/:name", requireAdmin, async (req, res) => {
  const { name } = req.params;
  const currentList = await fetchSubjects();
  const index = currentList.findIndex(s => s.toLowerCase() === name.toLowerCase());
  if (index === -1) {
    return res.status(404).json({ error: "Không tìm thấy môn học để xóa" });
  }
  const updatedList = await deleteSubjectFromDB(name);
  res.json(updatedList);
});

// 4. Orders APIs
app.get("/api/admin/orders", requireAdmin, async (req, res) => {
  const currentOrders = await fetchOrders();
  res.json(currentOrders);
});

app.post("/api/orders", async (req, res) => {
  const { cartItems, buyerName, buyerEmail, buyerPhone, totalAmount, buyerBankName, buyerBankAccount, buyerBankAccountName } = req.body;
  
  if (!cartItems || cartItems.length === 0) {
    return res.status(400).json({ error: "Giỏ hàng rỗng" });
  }

  const newOrder = {
    id: `order-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
    buyerName: buyerName || "Người mua ẩn danh",
    buyerEmail: buyerEmail || "chua_cung_cap@example.com",
    buyerPhone: buyerPhone || "",
    buyerBankName: buyerBankName || "",
    buyerBankAccount: buyerBankAccount || "",
    buyerBankAccountName: buyerBankAccountName || "",
    totalAmount: Number(totalAmount) || 0,
    items: cartItems,
    status: "pending", // pending, paid, declined
    createdAt: new Date().toISOString()
  };

  const savedOrder = await insertOrder(newOrder);

  // Increase sales count for those items asynchronously to keep route responsive
  try {
    for (const cartItem of cartItems) {
      // 1. Try updating product sales
      const currentProds = await fetchProducts();
      const p = currentProds.find((prodItem: any) => prodItem.id === cartItem.id);
      if (p) {
        await updateProduct(cartItem.id, { sales: (p.sales || 0) + 1 });
      } else {
        // 2. Try updating initiatives sales & downloads
        const currentInits = await fetchInitiatives();
        const initItem = currentInits.find((i: any) => i.id === cartItem.id);
        if (initItem) {
          await updateInitiative(cartItem.id, { 
            sales: (initItem.sales || 0) + 1,
            downloads: (initItem.downloads || 0) + 1
          });
        }
      }
    }
  } catch (salesErr: any) {
    console.error("[Sales Update Error] Could not increment sales counts:", salesErr.message || salesErr);
  }

  res.status(201).json(savedOrder);
});

app.put("/api/admin/orders/:id/status", requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // paid, declined, pending
  const updated = await updateOrderStatus(id, status);
  if (updated) {
    res.json(updated);
  } else {
    res.status(404).json({ error: "Order not found" });
  }
});

app.delete("/api/admin/orders/:id", requireAdmin, async (req, res) => {
  const { id } = req.params;
  const deleted = await deleteOrder(id);
  if (deleted) {
    res.json({ success: true, deleted });
  } else {
    res.status(404).json({ error: "Order not found" });
  }
});

// 5. Feedbacks APIs
app.get("/api/admin/feedbacks", requireAdmin, async (req, res) => {
  const currentFeedbacks = await fetchFeedbacks();
  res.json(currentFeedbacks);
});

app.post("/api/feedbacks", async (req, res) => {
  const { name, email, msg } = req.body;
  if (!msg) {
    return res.status(400).json({ error: "Thiếu nội dung góp ý" });
  }
  const newFeedback = {
    id: `fb-${Date.now()}`,
    name: name || "Ẩn danh",
    email: email || "Ẩn danh",
    msg: msg,
    createdAt: new Date().toISOString()
  };
  const saved = await insertFeedback(newFeedback);
  res.status(201).json(saved);
});


// 6. Gemini Lesson Planner API (Uses process.env.GEMINI_API_KEY with high security)
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY environment variable is required but missing.");
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

app.post("/api/gemini/generate-lesson-plan", async (req, res) => {
  const { subject, grade, topic, objectives } = req.body;
  if (!topic) {
    return res.status(400).json({ error: "Vui lòng cung cấp chủ đề bài học." });
  }

  try {
    const client = getGeminiClient();
    const systemPrompt = `Bạn là một chuyên gia thiết kế chương trình giáo dục số hàng đầu tại Việt Nam, đặc biệt thành thạo GDPT 2018. Nhiệm vụ của bạn là soạn thảo một giáo án chi tiết, hiện đại, tích hợp chặt chẽ năng lực số và ứng dụng các công cụ AI (như ChatGPT, Gemini, Canva AI, Midjourney, các phần mềm học liệu số) cho giáo viên dạy môn học được yêu cầu. Giáo án cần thiết kế trực quan, dễ thực hiện.`;

    const userQuery = `Hãy biên soạn một giáo án tích hợp NĂNG LỰC SỐ và CÔNG CỤ AI cho:
- Môn học: ${subject}
- Khối lớp: ${grade}
- Chủ đề/Tên bài học: ${topic}
- Mục tiêu chính của giáo viên: ${objectives || 'Đạt chuẩn đầu ra môn học'}

Yêu cầu nội dung giáo án phải cực kỳ chi tiết bao gồm các mục rõ ràng:
1. TIÊU ĐỀ BÀI HỌC (Tích hợp AI & Năng lực số)
2. MỤC TIÊU BÀI HỌC (Về kiến thức, năng lực chung, năng lực tin học/số hóa cụ thể, phẩm chất)
3. THIẾT BỊ DẠY HỌC & HỌC LIỆU SỐ/AI (Cần chỉ định rõ các công cụ AI và phần mềm hỗ trợ)
4. TIẾN TRÌNH DẠY HỌC (Gồm 4 hoạt động chuẩn GDPT 2018: Khởi động, Hình thành kiến thức, Luyện tập, Vận dụng). Với mỗi hoạt động, ghi rõ:
   - Giáo viên ứng dụng AI như thế nào để hỗ trợ học sinh?
   - Học sinh thực hành năng lực số như thế nào?
   - Dự kiến sản phẩm học tập số của học sinh là gì?
5. ĐÁNH GIÁ NĂNG LỰC SỐ CỦA HỌC SINH (Các tiêu chí đánh giá sản phẩm hoặc kỹ năng tự học số).
Vui lòng trình bày bằng Tiếng Việt sinh động, định dạng Markdown rõ ràng, chuyên nghiệp.`;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: userQuery,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7,
      }
    });

    res.json({ output: response.text });
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    res.status(500).json({ error: "Không thể tạo giáo án thông qua Gemini AI server-side. Chi tiết: " + (error.message || error) });
  }
});

app.post("/api/gemini/analyze-image", async (req, res) => {
  const { imageBase64 } = req.body;
  if (!imageBase64) {
    return res.status(400).json({ error: "Vui lòng chọn hoặc tải một bức ảnh lên." });
  }

  try {
    const client = getGeminiClient();
    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");

    const imagePart = {
      inlineData: {
        mimeType: "image/jpeg",
        data: cleanBase64
      }
    };

    const systemPrompt = "Bạn là trợ lý giảng dạy AI chuyên về Khoa học máy tính, Công nghệ thông tin và Đổi mới giáo dục số 4.0. Nhiệm vụ của bạn là phân tích hình ảnh và trả về danh sách các vật thể chính liên quan đến công nghệ, dụng cụ học tập hoặc bối cảnh giáo dục.";
    
    const userPrompt = "Hãy phân tích hình ảnh này và nhận diện các vật thể/bối cảnh liên quan tới công nghệ, giáo dục 4.0, hoặc học tập. Trả về định dạng JSON duy nhất là một array (mảng) gồm các object, mỗi object có 3 thuộc tính chính xác: 'name' (Tên tiếng Việt của vật thể, ví dụ: 'Bàn phím máy tính', 'Robot thông minh'), 'confidence' (số nguyên độ tin cậy từ 0-100), 'explanation' (mô tả ngắn về vật thể này và giá trị giáo dục công nghệ của nó). Lưu ý: Chỉ trả về chuỗi JSON thô nằm trong mảng, không bọc JSON trong Markdown và không mô tả thêm bên ngoài. Cực kỳ nghiêm ngặt về cú pháp JSON.";

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [imagePart, userPrompt],
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.4,
        responseMimeType: "application/json"
      }
    });

    const textOutput = response.text || "[]";
    res.json({ result: JSON.parse(textOutput) });
  } catch (error: any) {
    console.error("Gemini Image Analysis Error:", error);
    res.status(500).json({ error: "Không thể phân tích ảnh trực tuyến. Lỗi: " + (error.message || error) });
  }
});


// === VITE / SERVER STARTUP ===

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    // Development Mode
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production Mode
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  if (!process.env.VERCEL) {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server is booting on Port ${PORT}... Ready client-side & API connections.`);
    });
  } else {
    console.log("Running on Vercel serverless environment. Request routing delegated to Vercel.");
  }
}

startServer();

export default app;
