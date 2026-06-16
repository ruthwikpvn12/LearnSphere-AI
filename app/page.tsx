"use client";

import { useState, useRef, useEffect } from "react";

type Page = "features" | "chat" | "dashboard";

export default function Home() {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<
    { role: "user" | "assistant"; content: string }[]
  >([]);
  const [summary, setSummary] = useState("");
  const [quiz, setQuiz] = useState("");
  const [loading, setLoading] = useState(false);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [quizLoading, setQuizLoading] = useState(false);
  const [page, setPage] = useState<Page>("features");

  const [pdfText, setPdfText] = useState("");
  const [fileName, setFileName] = useState("");
  const [pages, setPages] = useState(0);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [dragOver, setDragOver] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom whenever messages change or loading state changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const processFile = async (file: File) => {
    if (!file) return;
    setUploadLoading(true);
    setUploadError("");
    setPdfText("");
    setFileName("");
    setPages(0);

    const formData = new FormData();
    formData.append("pdf", file);

    try {
      const res = await fetch("/api/extract-pdf", { method: "POST", body: formData });
      const data = await res.json();
      if (data.success) {
        setPdfText(data.text);
        setFileName(data.fileName);
        setPages(data.pages);
      } else {
        setUploadError(data.error || "Failed to extract PDF content.");
      }
    } catch (err) {
      setUploadError("Network error while uploading. Please try again.");
    } finally {
      setUploadLoading(false);
    }
  };

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) await processFile(file);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) await processFile(file);
  };

  const askAI = async () => {
    if (!question.trim()) return;
    const userMsg = question;
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setQuestion("");
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg, pdfText }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { role: "assistant", content: data.answer }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Something went wrong. Please try again." }]);
    }
    setLoading(false);
  };

  const generateSummary = async () => {
    if (!pdfText) { setSummary("⚠️ Please upload a PDF first before generating a summary."); return; }
    setSummaryLoading(true);
    try {
      const res = await fetch("/api/summary", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: pdfText }) });
      const data = await res.json();
      if (data.success) setSummary(data.summary);
      else setSummary("Error: " + data.error);
    } catch { setSummary("Failed to generate summary."); }
    setSummaryLoading(false);
  };

  const generateQuiz = async () => {
    if (!pdfText) { setQuiz("⚠️ Please upload a PDF first before generating a quiz."); return; }
    setQuizLoading(true);
    try {
      const res = await fetch("/api/quiz", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: pdfText }) });
      const data = await res.json();
      if (data.success) setQuiz(data.quiz);
      else setQuiz("Error: " + data.error);
    } catch { setQuiz("Failed to generate quiz."); }
    setQuizLoading(false);
  };

  const navItems: { label: string; key: Page }[] = [
    { label: "Features", key: "features" },
    { label: "AI Chat", key: "chat" },
    { label: "Dashboard", key: "dashboard" },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Inter', system-ui, sans-serif; background-color: #080B14; color: #E2E8F0; min-height: 100vh; }

        .bg-grid { position: fixed; inset: 0; z-index: 0; background-image: radial-gradient(circle, #1E2D45 1px, transparent 1px); background-size: 28px 28px; opacity: 0.55; pointer-events: none; }
        .orb { position: fixed; border-radius: 50%; filter: blur(120px); pointer-events: none; z-index: 0; }
        .orb-1 { width: 520px; height: 520px; top: -180px; left: -140px; background: rgba(99,102,241,0.09); }
        .orb-2 { width: 420px; height: 420px; bottom: -120px; right: -100px; background: rgba(34,211,238,0.06); }

        /* ── PAGE LAYOUT ── */
        .page-wrap { position: relative; z-index: 1; max-width: 1080px; margin: 0 auto; padding: 0 24px 80px; }

        /* Chat page gets a full-height layout */
        .page-wrap.chat-page { display: flex; flex-direction: column; height: 100vh; padding-bottom: 0; }
        .page-wrap.chat-page .nav-outer { flex-shrink: 0; }

        /* ── NAV ── */
        .nav-outer { position: sticky; top: 0; z-index: 50; padding: 16px 0; }
        .nav-inner { display: flex; align-items: center; justify-content: space-between; background: rgba(8,11,20,0.85); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); border: 1px solid #1E2D45; border-radius: 14px; padding: 10px 20px; }
        .nav-logo { display: flex; align-items: center; gap: 10px; text-decoration: none; }
        .nav-logo-mark { width: 30px; height: 30px; border-radius: 8px; background: linear-gradient(135deg, #6366F1 0%, #22D3EE 100%); display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700; color: #fff; flex-shrink: 0; }
        .nav-logo-name { font-size: 15px; font-weight: 600; color: #F1F5F9; letter-spacing: -0.3px; }
        .nav-logo-badge { font-size: 10px; font-weight: 600; padding: 2px 7px; border-radius: 20px; background: rgba(99,102,241,0.15); border: 1px solid rgba(99,102,241,0.3); color: #818CF8; }
        .nav-links { display: flex; gap: 4px; }
        .nav-btn { background: none; border: none; cursor: pointer; font-family: inherit; font-size: 13.5px; font-weight: 500; padding: 7px 16px; border-radius: 9px; color: #64748B; transition: all 0.15s ease; }
        .nav-btn:hover { color: #CBD5E1; background: rgba(255,255,255,0.04); }
        .nav-btn.active { color: #E2E8F0; background: rgba(255,255,255,0.07); border: 1px solid #1E2D45; }
        .nav-status { display: flex; align-items: center; gap: 7px; font-size: 12px; color: #475569; }
        .status-dot { width: 7px; height: 7px; border-radius: 50%; background: #10B981; box-shadow: 0 0 0 2px rgba(16,185,129,0.2); animation: pulse 2.5s ease-in-out infinite; }
        .pdf-dot { width: 7px; height: 7px; border-radius: 50%; background: #6366F1; box-shadow: 0 0 0 2px rgba(99,102,241,0.2); }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }

        /* ── HERO ── */
        .hero { text-align: center; padding: 72px 0 56px; }
        .hero-title { font-size: clamp(38px, 5.5vw, 60px); font-weight: 600; letter-spacing: -1.5px; line-height: 1.08; color: #F8FAFC; margin-bottom: 20px; }
        .hero-title .accent { background: linear-gradient(90deg, #6366F1 0%, #22D3EE 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .hero-sub { font-size: 16px; color: #475569; max-width: 460px; margin: 0 auto; line-height: 1.65; font-weight: 400; }
        .section-label { font-size: 11px; font-weight: 600; letter-spacing: 1.2px; text-transform: uppercase; color: #334155; margin-bottom: 20px; }

        /* ── PDF UPLOAD ── */
        .upload-section { margin-bottom: 28px; }
        .upload-zone { position: relative; border: 2px dashed #1E2D45; border-radius: 18px; background: #0A0E1A; padding: 40px 32px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px; cursor: pointer; transition: all 0.2s ease; text-align: center; min-height: 180px; }
        .upload-zone:hover { border-color: #4338CA; background: #0D1120; }
        .upload-zone.drag-over { border-color: #6366F1; background: rgba(99,102,241,0.05); transform: scale(1.005); }
        .upload-zone.has-file { border-color: rgba(16,185,129,0.4); border-style: solid; background: rgba(16,185,129,0.03); cursor: default; }
        .upload-zone.has-file:hover { border-color: rgba(16,185,129,0.5); background: rgba(16,185,129,0.05); }
        .upload-zone.uploading { border-color: rgba(99,102,241,0.4); border-style: solid; pointer-events: none; }
        .upload-icon-wrap { width: 56px; height: 56px; border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 24px; background: rgba(99,102,241,0.1); border: 1px solid rgba(99,102,241,0.2); transition: background 0.2s ease; }
        .upload-zone.has-file .upload-icon-wrap { background: rgba(16,185,129,0.1); border-color: rgba(16,185,129,0.25); }
        .upload-zone.uploading .upload-icon-wrap { background: rgba(99,102,241,0.1); border-color: rgba(99,102,241,0.25); }
        .upload-title { font-size: 15px; font-weight: 600; color: #E2E8F0; letter-spacing: -0.2px; }
        .upload-sub { font-size: 13px; color: #334155; line-height: 1.5; }
        .upload-btn { padding: 9px 22px; border-radius: 10px; background: linear-gradient(135deg, #6366F1 0%, #4F46E5 100%); border: none; cursor: pointer; font-family: inherit; font-size: 13px; font-weight: 600; color: #fff; letter-spacing: -0.1px; transition: opacity 0.15s, transform 0.15s; pointer-events: all; }
        .upload-btn:hover { opacity: 0.88; }
        .upload-btn:active { transform: scale(0.97); }
        .file-info-row { display: flex; align-items: center; gap: 10px; width: 100%; max-width: 400px; }
        .file-info-icon { width: 38px; height: 38px; border-radius: 9px; background: rgba(16,185,129,0.12); border: 1px solid rgba(16,185,129,0.25); display: flex; align-items: center; justify-content: center; font-size: 16px; flex-shrink: 0; }
        .file-info-text { flex: 1; text-align: left; min-width: 0; }
        .file-info-name { font-size: 13.5px; font-weight: 600; color: #E2E8F0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .file-info-meta { font-size: 12px; color: #475569; margin-top: 2px; }
        .file-remove-btn { background: none; border: none; cursor: pointer; color: #334155; font-size: 16px; padding: 4px; border-radius: 6px; transition: color 0.15s, background 0.15s; flex-shrink: 0; }
        .file-remove-btn:hover { color: #F87171; background: rgba(248,113,113,0.1); }
        .upload-stats { display: flex; gap: 12px; margin-top: 2px; }
        .upload-stat { display: flex; align-items: center; gap: 6px; padding: 6px 12px; background: #0F1629; border: 1px solid #1E2D45; border-radius: 8px; font-size: 12px; color: #475569; }
        .upload-stat-value { color: #CBD5E1; font-weight: 600; }
        .upload-spinner { width: 20px; height: 20px; border: 2px solid rgba(99,102,241,0.2); border-top-color: #6366F1; border-radius: 50%; animation: spin 0.7s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .upload-error { display: flex; align-items: flex-start; gap: 10px; padding: 12px 16px; background: rgba(239,68,68,0.06); border: 1px solid rgba(239,68,68,0.2); border-radius: 10px; margin-top: 10px; font-size: 13px; color: #FCA5A5; line-height: 1.5; }

        /* ── NO-PDF WARNING ── */
        .no-pdf-warning { display: flex; align-items: center; gap: 10px; padding: 12px 16px; background: rgba(251,191,36,0.06); border: 1px solid rgba(251,191,36,0.2); border-radius: 10px; margin-bottom: 16px; font-size: 13px; color: #FCD34D; }
        .no-pdf-warning button { background: none; border: none; cursor: pointer; font-family: inherit; font-size: 13px; font-weight: 600; color: #6366F1; padding: 0; margin-left: auto; transition: opacity 0.15s; }
        .no-pdf-warning button:hover { opacity: 0.75; }

        /* ── FEATURE CARDS ── */
        .features-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin-bottom: 14px; }
        .feature-card { background: #0F1629; border: 1px solid #1E2D45; border-radius: 16px; padding: 28px 24px; display: flex; flex-direction: column; gap: 14px; transition: border-color 0.2s ease, transform 0.2s ease; cursor: default; }
        .feature-card:hover { border-color: #2D3F5E; transform: translateY(-2px); }
        .feature-icon { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 18px; flex-shrink: 0; }
        .icon-indigo { background: rgba(99,102,241,0.12); }
        .icon-emerald { background: rgba(16,185,129,0.1); }
        .icon-violet { background: rgba(167,139,250,0.1); }
        .feature-title { font-size: 15px; font-weight: 600; color: #E2E8F0; letter-spacing: -0.2px; }
        .feature-desc { font-size: 13.5px; color: #475569; line-height: 1.6; flex: 1; }
        .feature-cta { background: none; border: none; cursor: pointer; font-family: inherit; font-size: 13px; font-weight: 500; color: #6366F1; padding: 0; display: flex; align-items: center; gap: 5px; transition: gap 0.15s ease, opacity 0.15s ease; }
        .feature-cta:hover { opacity: 0.75; gap: 8px; }

        /* ── HOW IT WORKS ── */
        .how-card { background: #0F1629; border: 1px solid #1E2D45; border-radius: 16px; padding: 32px 36px; }
        .how-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0; margin-top: 28px; position: relative; }
        .how-grid::before { content: ''; position: absolute; top: 18px; left: calc(16.66% + 12px); right: calc(16.66% + 12px); height: 1px; background: linear-gradient(90deg, #1E2D45 0%, #2D3F5E 50%, #1E2D45 100%); }
        .how-step { display: flex; flex-direction: column; gap: 10px; padding: 0 4px; }
        .how-number { width: 36px; height: 36px; border-radius: 50%; background: #0F1629; border: 1px solid #2D3F5E; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 600; color: #6366F1; position: relative; z-index: 1; }
        .how-step-title { font-size: 14px; font-weight: 600; color: #CBD5E1; letter-spacing: -0.2px; }
        .how-step-desc { font-size: 13px; color: #475569; line-height: 1.55; }

        /* ══ CHAT — full redesign ══ */
        .chat-outer {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-height: 0;
          padding-bottom: 24px;
        }

        .no-pdf-banner {
          display: flex; align-items: center; gap: 10px;
          padding: 11px 16px;
          background: rgba(251,191,36,0.06);
          border: 1px solid rgba(251,191,36,0.2);
          border-radius: 10px;
          margin-bottom: 12px;
          font-size: 13px; color: #FCD34D;
          flex-shrink: 0;
        }
        .no-pdf-banner button { background: none; border: none; cursor: pointer; font-family: inherit; font-size: 13px; font-weight: 600; color: #6366F1; padding: 0; margin-left: auto; }

        .chat-shell {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-height: 0;
          background: #0F1629;
          border: 1px solid #1E2D45;
          border-radius: 18px;
          overflow: hidden;
        }

        /* header */
        .chat-header {
          display: flex; align-items: center; gap: 12px;
          padding: 14px 20px;
          border-bottom: 1px solid #1A2540;
          flex-shrink: 0;
          background: #0F1629;
        }
        .chat-avatar {
          width: 36px; height: 36px; border-radius: 50%;
          background: linear-gradient(135deg, #6366F1 0%, #22D3EE 100%);
          display: flex; align-items: center; justify-content: center;
          font-size: 15px; flex-shrink: 0;
        }
        .chat-name { font-size: 14px; font-weight: 600; color: #E2E8F0; letter-spacing: -0.2px; }
        .chat-sub { font-size: 12px; color: #475569; display: flex; align-items: center; gap: 5px; margin-top: 1px; }
        .online-dot { width: 6px; height: 6px; border-radius: 50%; background: #10B981; box-shadow: 0 0 0 2px rgba(16,185,129,0.2); animation: pulse 2.5s ease-in-out infinite; }

        /* scrollable messages area */
        .chat-messages {
          flex: 1;
          overflow-y: auto;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          scroll-behavior: smooth;
        }
        .chat-messages::-webkit-scrollbar { width: 4px; }
        .chat-messages::-webkit-scrollbar-thumb { background: #1E2D45; border-radius: 4px; }

        /* empty state */
        .chat-empty-state {
          flex: 1;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          gap: 12px; text-align: center;
          padding: 40px 0;
          color: #334155;
        }
        .chat-empty-icon {
          width: 52px; height: 52px; border-radius: 14px;
          background: #1A2540; border: 1px solid #1E2D45;
          display: flex; align-items: center; justify-content: center;
          font-size: 22px;
        }
        .chat-empty-title { font-size: 14px; font-weight: 600; color: #475569; }
        .chat-empty-sub { font-size: 13px; color: #334155; max-width: 280px; line-height: 1.5; }

        /* message rows */
        .msg-row {
          display: flex;
          align-items: flex-end;
          gap: 8px;
        }
        .msg-row.user { flex-direction: row-reverse; }
        .msg-row.assistant { flex-direction: row; }

        /* small avatars inside messages */
        .msg-avatar {
          width: 28px; height: 28px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 12px; flex-shrink: 0;
          align-self: flex-end;
        }
        .msg-avatar.ai { background: linear-gradient(135deg, #6366F1 0%, #22D3EE 100%); }
        .msg-avatar.you { background: #1E3A5F; font-size: 11px; font-weight: 700; color: #93C5FD; }

        /* bubble */
        .msg-bubble {
          max-width: 72%;
          padding: 11px 15px;
          border-radius: 18px;
          font-size: 14px;
          line-height: 1.65;
          white-space: pre-wrap;
          word-break: break-word;
        }
        .msg-row.user .msg-bubble {
          background: linear-gradient(135deg, #6366F1 0%, #4F46E5 100%);
          color: #fff;
          border-bottom-right-radius: 4px;
        }
        .msg-row.assistant .msg-bubble {
          background: #1A2540;
          color: #CBD5E1;
          border: 1px solid #1E2D45;
          border-bottom-left-radius: 4px;
        }

        /* timestamp label */
        .msg-time {
          font-size: 10.5px;
          color: #334155;
          padding: 0 4px;
          flex-shrink: 0;
          align-self: flex-end;
          margin-bottom: 2px;
        }

        /* typing indicator bubble */
        .typing-bubble {
          background: #1A2540;
          border: 1px solid #1E2D45;
          border-radius: 18px;
          border-bottom-left-radius: 4px;
          padding: 14px 18px;
          display: flex; align-items: center; gap: 5px;
        }
        .typing-dot { width: 7px; height: 7px; border-radius: 50%; background: #6366F1; animation: bounce 1.2s ease-in-out infinite; }
        .typing-dot:nth-child(2) { animation-delay: 0.15s; }
        .typing-dot:nth-child(3) { animation-delay: 0.3s; }
        @keyframes bounce { 0%, 80%, 100% { transform: translateY(0); opacity: 0.4; } 40% { transform: translateY(-6px); opacity: 1; } }

        /* footer / input bar */
        .chat-input-bar {
          display: flex; align-items: flex-end; gap: 10px;
          padding: 14px 16px;
          border-top: 1px solid #1A2540;
          background: #0F1629;
          flex-shrink: 0;
        }
        .chat-textarea {
          flex: 1;
          background: #080B14;
          border: 1px solid #1E2D45;
          border-radius: 14px;
          padding: 11px 16px;
          font-family: inherit; font-size: 14px; color: #E2E8F0;
          resize: none; outline: none;
          transition: border-color 0.15s; line-height: 1.55;
          max-height: 120px;
        }
        .chat-textarea::placeholder { color: #2D3F5E; }
        .chat-textarea:focus { border-color: #4338CA; }
        .chat-send-btn {
          width: 42px; height: 42px;
          border-radius: 12px;
          background: linear-gradient(135deg, #6366F1 0%, #4F46E5 100%);
          border: none; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          transition: opacity 0.15s, transform 0.15s;
          align-self: flex-end;
        }
        .chat-send-btn:hover { opacity: 0.88; }
        .chat-send-btn:active { transform: scale(0.95); }
        .chat-send-btn:disabled { opacity: 0.35; cursor: not-allowed; }
        .send-icon { width: 18px; height: 18px; fill: none; stroke: #fff; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }

        /* ── DASHBOARD ── */
        .dash-actions { display: flex; gap: 10px; margin-bottom: 20px; }
        .dash-btn { display: flex; align-items: center; gap: 8px; padding: 10px 22px; border-radius: 10px; border: 1px solid; font-family: inherit; font-size: 13.5px; font-weight: 600; cursor: pointer; transition: all 0.15s ease; }
        .dash-btn:active { transform: scale(0.97); }
        .dash-btn:disabled { opacity: 0.35; cursor: not-allowed; }
        .btn-emerald { background: rgba(16,185,129,0.08); border-color: rgba(16,185,129,0.25); color: #34D399; }
        .btn-emerald:hover:not(:disabled) { background: rgba(16,185,129,0.14); }
        .btn-violet { background: rgba(167,139,250,0.08); border-color: rgba(167,139,250,0.25); color: #A78BFA; }
        .btn-violet:hover:not(:disabled) { background: rgba(167,139,250,0.14); }
        .dash-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .dash-panel { background: #0F1629; border: 1px solid #1E2D45; border-radius: 16px; overflow: hidden; }
        .dash-panel-head { display: flex; align-items: center; gap: 12px; padding: 16px 22px; border-bottom: 1px solid #1A2540; }
        .dash-panel-icon { width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 14px; }
        .pi-emerald { background: rgba(16,185,129,0.1); }
        .pi-violet { background: rgba(167,139,250,0.1); }
        .dash-panel-title { font-size: 14px; font-weight: 600; color: #E2E8F0; letter-spacing: -0.2px; }
        .dash-panel-sub { font-size: 12px; color: #334155; margin-top: 1px; }
        .ready-badge { margin-left: auto; font-size: 11px; font-weight: 600; padding: 3px 9px; border-radius: 20px; }
        .badge-emerald { background: rgba(16,185,129,0.1); color: #34D399; border: 1px solid rgba(16,185,129,0.2); }
        .badge-violet { background: rgba(167,139,250,0.1); color: #A78BFA; border: 1px solid rgba(167,139,250,0.2); }
        .dash-panel-body { padding: 22px; min-height: 200px; max-height: 440px; overflow-y: auto; }
        .dash-panel-body::-webkit-scrollbar { width: 4px; }
        .dash-panel-body::-webkit-scrollbar-thumb { background: #1E2D45; border-radius: 4px; }
        .dash-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 140px; gap: 8px; text-align: center; }
        .dash-empty-icon { font-size: 24px; opacity: 0.2; }
        .dash-empty p { font-size: 13px; color: #334155; }
        .dash-content { font-size: 13.5px; color: #94A3B8; line-height: 1.7; white-space: pre-wrap; }
        .spinner-row { display: flex; align-items: center; gap: 8px; font-size: 13px; color: #334155; }
        .spinner-dot { width: 6px; height: 6px; border-radius: 50%; animation: pulse 1.5s ease-in-out infinite; }
        .dot-emerald { background: #34D399; }
        .dot-violet { background: #A78BFA; }
        .divider { height: 1px; background: linear-gradient(90deg, transparent, #1E2D45 30%, #1E2D45 70%, transparent); margin: 12px 0; }
      `}</style>

      <div className="bg-grid" aria-hidden="true" />
      <div className="orb orb-1" aria-hidden="true" />
      <div className="orb orb-2" aria-hidden="true" />

      <input ref={fileInputRef} type="file" accept=".pdf" style={{ display: "none" }} onChange={handlePdfUpload} />

      <div className={`page-wrap${page === "chat" ? " chat-page" : ""}`}>

        {/* ── Navbar ── */}
        <nav className="nav-outer">
          <div className="nav-inner">
            <div className="nav-logo">
              <div className="nav-logo-mark">LS</div>
              <span className="nav-logo-name">LearnSphere</span>
              <span className="nav-logo-badge">AI</span>
            </div>
            <div className="nav-links">
              {navItems.map(({ label, key }) => (
                <button key={key} onClick={() => setPage(key)} className={`nav-btn${page === key ? " active" : ""}`}>
                  {label}
                </button>
              ))}
            </div>
            <div className="nav-status">
              {pdfText ? (<><span className="pdf-dot" />PDF Ready</>) : (<><span className="status-dot" />AI Online</>)}
            </div>
          </div>
        </nav>

        {/* ── Hero (hidden on chat page) ── */}
        {page !== "chat" && (
          <div className="hero">
            <h1 className="hero-title">Study smarter with<br /><span className="accent">AI at your side</span></h1>
            <p className="hero-sub">Summarize lectures, generate practice quizzes, and get instant answers — all from one place.</p>
          </div>
        )}

        {/* ══ FEATURES ══ */}
        {page === "features" && (
          <>
            <div className="upload-section">
              <p className="section-label">Start here — upload your PDF</p>
              <div
                className={`upload-zone${dragOver ? " drag-over" : ""}${fileName ? " has-file" : ""}${uploadLoading ? " uploading" : ""}`}
                onClick={() => !fileName && !uploadLoading && fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); if (!fileName) setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
              >
                {uploadLoading && (<><div className="upload-icon-wrap"><div className="upload-spinner" /></div><div className="upload-title">Extracting text…</div><div className="upload-sub">Reading your PDF, this takes a moment</div></>)}
                {!uploadLoading && fileName && (
                  <>
                    <div className="upload-icon-wrap">✅</div>
                    <div className="file-info-row">
                      <div className="file-info-icon">📄</div>
                      <div className="file-info-text">
                        <div className="file-info-name">{fileName}</div>
                        <div className="file-info-meta">{pages} {pages === 1 ? "page" : "pages"} · {(pdfText.length / 1000).toFixed(1)}k characters extracted</div>
                      </div>
                      <button className="file-remove-btn" title="Remove PDF" onClick={(e) => { e.stopPropagation(); setPdfText(""); setFileName(""); setPages(0); setUploadError(""); if (fileInputRef.current) fileInputRef.current.value = ""; }}>✕</button>
                    </div>
                    <div className="upload-stats">
                      <div className="upload-stat">📄 <span className="upload-stat-value">{pages}</span> pages</div>
                      <div className="upload-stat">🔤 <span className="upload-stat-value">{pdfText.length.toLocaleString()}</span> chars</div>
                      <div className="upload-stat">🟢 <span className="upload-stat-value">Ready for AI</span></div>
                    </div>
                  </>
                )}
                {!uploadLoading && !fileName && (
                  <>
                    <div className="upload-icon-wrap">📂</div>
                    <div><div className="upload-title">Drop your PDF here</div><div className="upload-sub" style={{ marginTop: 6 }}>Drag & drop or click to browse — text-based PDFs only</div></div>
                    <button className="upload-btn" onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}>Choose PDF</button>
                  </>
                )}
              </div>
              {uploadError && <div className="upload-error">⚠️ {uploadError}</div>}
            </div>

            <p className="section-label">What you can do</p>
            <div className="features-grid">
              {[
                { icon: "🤖", iconClass: "icon-indigo", title: "AI Chat", desc: "Ask anything about your study material. Get precise, context-aware answers in seconds.", cta: "Open chat", target: "chat" as Page },
                { icon: "📝", iconClass: "icon-emerald", title: "Auto Summary", desc: "Turn dense material into clear, structured summaries you can actually study from.", cta: "Go to Dashboard", target: "dashboard" as Page },
                { icon: "🎯", iconClass: "icon-violet", title: "Quiz Generator", desc: "Generate practice questions from your content and test yourself before exams.", cta: "Go to Dashboard", target: "dashboard" as Page },
              ].map((f) => (
                <div key={f.title} className="feature-card">
                  <div className={`feature-icon ${f.iconClass}`}>{f.icon}</div>
                  <div><div className="feature-title">{f.title}</div></div>
                  <div className="feature-desc">{f.desc}</div>
                  <button className="feature-cta" onClick={() => setPage(f.target)}>{f.cta} <span>→</span></button>
                </div>
              ))}
            </div>

            <div className="divider" />
            <div className="how-card" style={{ marginTop: 14 }}>
              <p className="section-label" style={{ marginBottom: 0 }}>How it works</p>
              <div className="how-grid">
                {[
                  { n: "01", title: "Upload your PDF", desc: "Drop any text-based PDF — lecture notes, textbooks, papers." },
                  { n: "02", title: "Pick an action", desc: "Generate a summary, quiz, or ask a specific question." },
                  { n: "03", title: "Learn faster", desc: "AI-powered insights tailored to exactly your content." },
                ].map((s) => (
                  <div key={s.n} className="how-step">
                    <div className="how-number">{s.n}</div>
                    <div className="how-step-title">{s.title}</div>
                    <div className="how-step-desc">{s.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ══ CHAT ══ */}
        {page === "chat" && (
          <div className="chat-outer">
            {!pdfText && (
              <div className="no-pdf-banner">
                <span>⚠️</span>
                <span>No PDF uploaded yet. Upload one on the Features page for context-aware answers.</span>
                <button onClick={() => setPage("features")}>Upload PDF →</button>
              </div>
            )}

            <div className="chat-shell">
              {/* Header */}
              <div className="chat-header">
                <div className="chat-avatar">🤖</div>
                <div>
                  <div className="chat-name">LearnSphere AI</div>
                  <div className="chat-sub">
                    <span className="online-dot" />
                    {pdfText ? `PDF loaded · ${(pdfText.length / 1000).toFixed(1)}k chars` : "Ready to help"}
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="chat-messages">
                {messages.length === 0 && !loading && (
                  <div className="chat-empty-state">
                    <div className="chat-empty-icon">💬</div>
                    <div className="chat-empty-title">
                      {pdfText ? "Ask anything about your PDF" : "No PDF loaded yet"}
                    </div>
                    <div className="chat-empty-sub">
                      {pdfText
                        ? "Your questions will be answered based on the uploaded document."
                        : "Upload a PDF on the Features page, then come back to chat."}
                    </div>
                  </div>
                )}

                {messages.map((msg, i) => (
                  <div key={i} className={`msg-row ${msg.role === "user" ? "user" : "assistant"}`}>
                    <div className={`msg-avatar ${msg.role === "user" ? "you" : "ai"}`}>
                      {msg.role === "user" ? "You" : "🤖"}
                    </div>
                    <div className="msg-bubble">{msg.content}</div>
                  </div>
                ))}

                {/* Typing indicator */}
                {loading && (
                  <div className="msg-row assistant">
                    <div className="msg-avatar ai">🤖</div>
                    <div className="typing-bubble">
                      <div className="typing-dot" />
                      <div className="typing-dot" />
                      <div className="typing-dot" />
                    </div>
                  </div>
                )}

                {/* Scroll anchor */}
                <div ref={messagesEndRef} />
              </div>

              {/* Input bar */}
              <div className="chat-input-bar">
                <textarea
                  className="chat-textarea"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); askAI(); } }}
                  placeholder={pdfText ? "Ask about your PDF… (Enter to send, Shift+Enter for new line)" : "Upload a PDF first…"}
                  rows={1}
                />
                <button className="chat-send-btn" onClick={askAI} disabled={loading || !question.trim()}>
                  <svg className="send-icon" viewBox="0 0 24 24">
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ══ DASHBOARD ══ */}
        {page === "dashboard" && (
          <>
            {!pdfText && (
              <div className="no-pdf-warning" style={{ marginBottom: 20 }}>
                <span>⚠️</span>
                <span>No PDF uploaded. Upload one first to generate a summary or quiz.</span>
                <button onClick={() => setPage("features")}>Upload PDF →</button>
              </div>
            )}
            <div className="dash-actions">
              <button className="dash-btn btn-emerald" onClick={generateSummary} disabled={summaryLoading}>
                📝 {summaryLoading ? "Generating…" : "Generate Summary"}
              </button>
              <button className="dash-btn btn-violet" onClick={generateQuiz} disabled={quizLoading}>
                🎯 {quizLoading ? "Generating…" : "Generate Quiz"}
              </button>
            </div>
            <div className="dash-grid">
              <div className="dash-panel">
                <div className="dash-panel-head">
                  <div className="dash-panel-icon pi-emerald">📚</div>
                  <div><div className="dash-panel-title">Summary</div><div className="dash-panel-sub">AI-generated overview</div></div>
                  {summary && <span className="ready-badge badge-emerald">Ready</span>}
                </div>
                <div className="dash-panel-body">
                  {summaryLoading && <div className="spinner-row"><span className="spinner-dot dot-emerald" />Generating summary…</div>}
                  {summary && !summaryLoading && <div className="dash-content">{summary}</div>}
                  {!summary && !summaryLoading && <div className="dash-empty"><div className="dash-empty-icon">📝</div><p>Click &ldquo;Generate Summary&rdquo; above to get started</p></div>}
                </div>
              </div>
              <div className="dash-panel">
                <div className="dash-panel-head">
                  <div className="dash-panel-icon pi-violet">🎯</div>
                  <div><div className="dash-panel-title">Quiz</div><div className="dash-panel-sub">Practice questions</div></div>
                  {quiz && <span className="ready-badge badge-violet">Ready</span>}
                </div>
                <div className="dash-panel-body">
                  {quizLoading && <div className="spinner-row"><span className="spinner-dot dot-violet" />Generating quiz…</div>}
                  {quiz && !quizLoading && <div className="dash-content">{quiz}</div>}
                  {!quiz && !quizLoading && <div className="dash-empty"><div className="dash-empty-icon">🎯</div><p>Click &ldquo;Generate Quiz&rdquo; above to get started</p></div>}
                </div>
              </div>
            </div>
          </>
        )}

      </div>
    </>
  );
}