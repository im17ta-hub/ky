"use client";

import { useState } from "react";

export default function KYApp() {
  const [image, setImage] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<string>("");
  const [loading, setLoading] = useState(false);

  // ファイルが選択された時の処理
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (!file) return;

    // 【重要】画像ファイル（image/から始まるタイプ）以外を拒否する
    if (!file.type.startsWith("image/")) {
      alert("画像ファイル（jpg, png, webpなど）を選択してください。PDFや動画はアップロードできません。");
      e.target.value = ""; // 選択をリセット
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Gemini APIを呼び出して分析する処理
  const analyzeImage = async () => {
    if (!image) return;
    setLoading(true);
    setAnalysis("AIが画像を分析中... しばらくお待ちください。");

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: image.split(",")[1] }), // Base64データのみ送信
      });

      const data = await response.json();
      setAnalysis(data.result || "分析結果を取得できませんでした。");
    } catch (error) {
      setAnalysis("エラーが発生しました。通信環境を確認してください。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto", padding: "20px", fontFamily: "sans-serif" }}>
      <h1 style={{ fontSize: "20px", marginBottom: "20px", textAlign: "center" }}>
        👷‍♂️ TBM・RKY 支援サポーター
      </h1>

      <div style={{ border: "2px dashed #ccc", padding: "20px", textAlign: "center", borderRadius: "10px" }}>
        <p>現場の写真をアップロードしてください</p>
        <input 
          type="file" 
          accept="image/*"  // ブラウザの選択画面で画像を優先
          onChange={handleFileChange} 
          style={{ marginBottom: "10px" }}
        />
        
        {image && (
          <div style={{ marginTop: "20px" }}>
            <img src={image} alt="Preview" style={{ width: "100%", borderRadius: "5px" }} />
            <button 
              onClick={analyzeImage} 
              disabled={loading}
              style={{
                marginTop: "15px",
                padding: "12px 24px",
                backgroundColor: loading ? "#ccc" : "#0070f3",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
                width: "100%",
                fontSize: "16px"
              }}
            >
              {loading ? "分析中..." : "AIで危険予知（KY）を行う"}
            </button>
          </div>
        )}
      </div>

      {analysis && (
        <div style={{ marginTop: "30px", padding: "15px", backgroundColor: "#f0f7ff", borderRadius: "10px", border: "1px solid #0070f3" }}>
          <h2 style={{ fontSize: "18px", marginTop: 0 }}>📋 AI分析結果</h2>
          <div style={{ whiteSpace: "pre-wrap", lineHeight: "1.6" }}>{analysis}</div>
        </div>
      )}
    </div>
  );
}