import React, { useState } from "react";
import { Sparkles, Layers, Loader2, Info, Check } from "lucide-react";

interface AISoanGiaoAnProps {
  onShowToast: (msg: string) => void;
}

export default function AISoanGiaoAn({ onShowToast }: AISoanGiaoAnProps) {
  const [aiSubject, setAiSubject] = useState("Tin học");
  const [customSubject, setCustomSubject] = useState("");
  const [aiGrade, setAiGrade] = useState("Lớp 6");
  const [aiTopic, setAiTopic] = useState("");
  const [aiObjectives, setAiObjectives] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiOutput, setAiOutput] = useState("");

  const handleGenerateLessonPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiTopic.trim()) {
      onShowToast("⚠️ Vui lòng nhập tên chủ đề bài học!");
      return;
    }

    setAiLoading(true);
    setAiOutput("");

    const subjectToSubmit = aiSubject === "Khác" ? customSubject || "Môn học mới" : aiSubject;

    try {
      const res = await fetch("/api/gemini/generate-lesson-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: subjectToSubmit,
          grade: aiGrade,
          topic: aiTopic,
          objectives: aiObjectives
        })
      });

      const data = await res.json();
      if (res.ok && data.output) {
        setAiOutput(data.output);
        onShowToast("✨ Đã tạo thành công giáo án tích hợp năng lực số AI!");
      } else {
        throw new Error(data.error || "Gặp lỗi dịch vụ.");
      }
    } catch (error: any) {
      console.error(error);
      setAiOutput(`### ❌ Có lỗi xảy ra trong quá trình thiết lập kết nối AI.
Đã xảy ra lỗi khi tạo giáo án. Thầy cô vui lòng kiểm tra kết nối mạng hoặc thử lại sau giây lát.`);
      onShowToast("❌ Tạo giáo án thất bại. Vui lòng thử lại!");
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-left">
      
      <div className="border-b border-slate-100 pb-4">
        <div className="inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-black shadow-sm mb-2">
          <Sparkles className="w-3.5 h-3.5 animate-pulse" /> Trí Tuệ Nhân Tạo Đồng Hành Cùng Giáo Viên
        </div>
        <h2 className="text-2xl font-black text-slate-900">Soạn Giáo Án Năng Lực Số & AI</h2>
        <p className="text-slate-500 text-xs font-medium">Lập kịch bản 4 hoạt động chuẩn của Bộ GD & ĐT Việt Nam kết hợp các bài học số thông minh trực tuyến.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Input parameters field */}
        <div className="lg:col-span-5 bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-4 text-left">
          <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5 border-b border-slate-100 pb-2">
            <Layers className="w-4 h-4 text-indigo-500" /> Cấu hình định dạng bài giáo án
          </h3>

          <form onSubmit={handleGenerateLessonPlan} className="space-y-3">
            {/* Subject selector */}
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Môn dạy học học liệu</label>
              <div className="grid grid-cols-3 gap-1.5">
                {["Tin học", "Hoạt động trải nghiệm", "Khác"].map((sub) => (
                  <button
                    key={sub}
                    type="button"
                    onClick={() => setAiSubject(sub)}
                    className={`py-2 px-1 rounded-xl text-[11px] font-bold border transition-all text-center ${aiSubject === sub ? "bg-indigo-50 border-indigo-500 text-indigo-700" : "bg-slate-50 border-slate-100 text-slate-600 hover:bg-slate-100"}`}
                  >
                    {sub}
                  </button>
                ))}
              </div>
            </div>

            {aiSubject === "Khác" && (
              <div className="space-y-1 animate-fade-in">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Tên môn học khác</label>
                <input 
                  type="text"
                  required
                  placeholder="Ví dụ: Công nghệ, Khoa học tự nhiên..."
                  value={customSubject}
                  onChange={(e) => setCustomSubject(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            )}

            {/* Grades Selection */}
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-405 uppercase tracking-wider block">Khối lớp bồi dưỡng</label>
              <div className="grid grid-cols-4 gap-1.5">
                {["Lớp 6", "Lớp 7", "Lớp 8", "Lớp 9"].map((grd) => (
                  <button
                    key={grd}
                    type="button"
                    onClick={() => setAiGrade(grd)}
                    className={`py-2 px-1 rounded-xl text-[10px] font-bold border transition-all text-center ${aiGrade === grd ? "bg-indigo-50 border-indigo-500 text-indigo-700 font-extrabold" : "bg-slate-50 border-slate-100 text-slate-600"}`}
                  >
                    {grd}
                  </button>
                ))}
              </div>
            </div>

            {/* Topic input */}
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Chủ Đề / Tên Bài Học <span className="text-red-500">*</span></label>
              <input 
                type="text"
                required
                placeholder="Ví dụ: Lập trình điều khiển Robot tránh vật cản"
                value={aiTopic}
                onChange={(e) => setAiTopic(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Objectives text */}
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Yêu Cầu Cần Đạt / Năng Lực Cần Chú Ý</label>
              <textarea 
                rows={3}
                placeholder="Ghi cụ thể các sản phẩm CNTT mong muốn học sinh thiết kế được..."
                value={aiObjectives}
                onChange={(e) => setAiObjectives(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={aiLoading}
              className="w-full py-3.5 rounded-xl font-extrabold text-xs text-white flex items-center justify-center gap-1.5 transition-all bg-gradient-to-r from-amber-500 to-orange-500 hover:opacity-95 shadow-md shadow-orange-500/10 cursor-pointer"
            >
              {aiLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Đang soạn giáo án thiết kế bài học...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 animate-pulse" /> Soạn Giáo Án Với AI Ngay
                </>
              )}
            </button>
          </form>

          <div className="p-3 bg-slate-50 rounded-2xl flex gap-2">
            <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <p className="text-[10px] text-slate-500 leading-relaxed font-semibold">
              Kịch bản được xây dựng bám sát khung công văn hướng dẫn của Bộ GD&ĐT Việt Nam kết xuất dưới dạng cấu trúc Markdown thích nghi hoàn hảo.
            </p>
          </div>
        </div>

        {/* Output outcome column (Beautiful card) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 text-slate-200 rounded-[32px] p-6 shadow-xl relative min-h-[440px] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Đầu ra Giáo Án Số Hoá</span>
              </div>
              {aiOutput && (
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(aiOutput);
                    onShowToast("📋 Đã sao chép kịch bản giáo án thành công!");
                  }}
                  className="text-[11px] font-bold text-amber-300 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  Sao chép giáo án
                </button>
              )}
            </div>

            <div className="flex-grow text-slate-300">
              {aiLoading ? (
                <div className="text-center space-y-4 py-24">
                  <Loader2 className="w-10 h-10 animate-spin text-amber-400 mx-auto" strokeWidth={3} />
                  <div>
                    <strong className="font-extrabold text-white text-xs sm:text-sm block">Đang kết nối robot soạn thảo giáo lý...</strong>
                    <p className="text-[10px] text-slate-500 mt-1">Đang lập kịch bản Khởi động, Khám phá kiến thức mới, Luyện tập và Vận dụng số.</p>
                  </div>
                </div>
              ) : aiOutput ? (
                <div className="text-left prose prose-invert max-w-none text-xs sm:text-sm leading-relaxed font-semibold whitespace-pre-wrap max-h-[410px] overflow-y-auto pr-1 scrollbar-none space-y-3">
                  {aiOutput}
                </div>
              ) : (
                <div className="text-center py-24 space-y-3">
                  <div className="bg-slate-800 p-3 rounded-full w-fit mx-auto text-slate-500">
                    <Sparkles className="w-8 h-8" />
                  </div>
                  <div>
                    <strong className="font-extrabold text-white text-xs block uppercase">Khung Bản Vỡ Lòng Sẵn Sàng</strong>
                    <p className="text-[10px] text-slate-500 max-w-xs mx-auto mt-1">Vui lòng điền tham số chủ đề bài học và nhấn "Soạn Giáo Án Với AI Ngay" để khởi chạy robot.</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <p className="text-[9px] text-slate-500 text-center pt-3 border-t border-slate-800 mt-4 leading-normal font-semibold">Tài sản giáo lý thuộc quyền sở hữu tạm thời của thầy cô. Vui lòng in ấn rà soát nghiệp vụ trước khi giảng dạy.</p>
        </div>

      </div>

    </div>
  );
}
