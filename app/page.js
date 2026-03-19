"use client";

import { useState } from "react";

export default function KYApp() {
  const [image, setImage] = useState(null);
  const [analysis, setAnalysis] = useState("");
  const [loading, setLoading] = useState(false);

  // ファイル選択時の処理（JSなので型指定は不要です）
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("画像ファイルを選択してください。");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setImage(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // AI分析の実行
  const analyzeImage = async () => {
    if (!image) return;
    setLoading(true);
    setAnalysis("AIが分析中です...");

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: image.split(",")[1] }),
      });

      const data = await response.json();
      setAnalysis(data.result || "分析に失敗しました。");
    } catch (error) {
      setAnalysis("エラーが発生しました。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "600px", margin: "20px auto", padding: "20px", fontFamily: "sans-serif" }}>
      <h1 style={{ fontSize: "20px", textAlign: "center" }}>👷‍♂️ TBM・RKY 支援サポーター</h1>
      
      <div style={{ border: "2px dashed #ccc", padding: "20px", textAlign: "center", borderRadius: "10px" }}>
        <input type="file" accept="image/*" onChange={handleFileChange} style={{ marginBottom: "10px" }} />
        
        {image && (
          <div style={{ marginTop: "20px" }}>
            <img src={image} alt="Preview" style={{ width: "100%", borderRadius: "5px" }} />
            <button 
              onClick={analyzeImage} 
              disabled={loading}
              style={{
                marginTop: "15px", width: "100%", padding: "12px",
                backgroundColor: loading ? "#ccc" : "#0070f3", color: "white",
                border: "none", borderRadius: "5px", cursor: "pointer"
              }}
            >
              {loading ? "分析中..." : "AIで危険予知（KY）を行う"}
            </button>
          </div>
        )}
      </div>

      {analysis && (
        <div style={{ marginTop: "30px", padding: "15px", backgroundColor: "#f0f7ff", borderRadius: "10px", border: "1px solid #0070f3" }}>
          <h2 style={{ fontSize: "18px" }}>📋 分析結果</h2>
          <div style={{ whiteSpace: "pre-wrap" }}>{analysis}</div>
        </div>
      )}
    </div>
  );
}