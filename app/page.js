"use client";
import React, { useState, useRef } from 'react';
import { UploadCloud, AlertTriangle, CheckCircle, Info, ShieldAlert, Loader2, Image as ImageIcon, Printer, Copy, Check } from 'lucide-react';

export default function App() {
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [userComment, setUserComment] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [showPrintHint, setShowPrintHint] = useState(false);
  const fileInputRef = useRef(null);

  const processFile = (file) => {
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('画像ファイルを選択してください。');
        return;
      }
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
      setResult(null); setError('');
    }
  };

  const analyzeImage = async () => {
    if (!imagePreview || !image) return;
    setIsAnalyzing(true); setError(''); setResult(null);

    try {
      const base64Data = imagePreview.split(',')[1];
      
      // 自作した安全なバックエンドAPIにデータを送信
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          base64Data, 
          userComment,
          mimeType: image.type
        })
      });

      if (!response.ok) throw new Error("サーバーエラーが発生しました。");
      
      const data = await response.json();
      const parsedData = data.result;
      
      parsedData.hazards.sort((a, b) => {
        const riskA = (a.severity || 1) + (a.likelihood || 1) - 1;
        const riskB = (b.severity || 1) + (b.likelihood || 1) - 1;
        return riskB - riskA;
      });
      setResult(parsedData);

    } catch (err) {
      console.error(err);
      setError("AIの分析中にエラーが発生しました。");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getSymbol = (val) => val === 3 ? '×' : val === 2 ? '△' : '○';

  const handlePrint = () => {
    try { window.print(); } catch(e){}
    setShowPrintHint(true);
    setTimeout(() => setShowPrintHint(false), 8000);
  };

  const handleCopy = () => {
    if (!result) return;
    let textToCopy = `【本日の安全行動目標】\n${result.safetyGoal}\n\n【KY抽出結果】\n`;
    result.hazards.forEach((hazard, index) => {
      const riskLevel = hazard.severity + hazard.likelihood - 1;
      textToCopy += `\nNo.${index + 1} ${hazard.title}\n・危険ポイント: ${hazard.situation}\n・対策: ${hazard.countermeasure}\n・リスク度: ${riskLevel}\n`;
    });
    navigator.clipboard.writeText(textToCopy).then(() => {
      setIsCopied(true); setTimeout(() => setIsCopied(false), 2000);
    }).catch(e => {
        const t = document.createElement("textarea"); t.value = textToCopy;
        document.body.appendChild(t); t.select(); document.execCommand('copy'); t.remove();
        setIsCopied(true); setTimeout(() => setIsCopied(false), 2000);
    });
  };

  return (
    <div className="min-h-screen bg-slate-100 font-sans pb-12 print:bg-white print:pb-0">
      <header className="bg-blue-800 text-white p-4 shadow-md flex items-center justify-center gap-3 print:hidden">
        <AlertTriangle className="w-8 h-8 text-yellow-400" />
        <h1 className="text-2xl md:text-3xl font-bold tracking-wider">TBM・RKY 支援サポーター</h1>
      </header>

      <main className="max-w-4xl mx-auto p-4 mt-6 print:m-0 print:p-0 print:max-w-none">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6 print:hidden">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><ImageIcon className="w-6 h-6 text-blue-500" />1. 現場の写真をアップロード</h2>
          <div 
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-slate-300 hover:bg-slate-50'}`}
            onClick={() => fileInputRef.current?.click()} onDragOver={(e)=>{e.preventDefault(); setIsDragging(true);}} onDragLeave={(e)=>{e.preventDefault(); setIsDragging(false);}} onDrop={(e)=>{e.preventDefault(); setIsDragging(false); processFile(e.dataTransfer.files[0]);}}
          >
            <input type="file" ref={fileInputRef} onChange={(e) => processFile(e.target.files[0])} accept="image/*" className="hidden" />
            {imagePreview ? <img src={imagePreview} alt="Preview" className="max-h-64 mx-auto rounded-md object-contain" /> : <div className="text-slate-500"><UploadCloud className="w-16 h-16 mx-auto mb-4" /><p>タップして写真を選択</p></div>}
          </div>

          {imagePreview && (
            <div className="mt-6 space-y-5 text-center">
              <div className="text-left bg-slate-50 p-4 rounded-lg border">
                <label className="block text-sm font-bold text-slate-700 mb-2">AIへの特記事項 (任意)</label>
                <textarea value={userComment} onChange={(e) => setUserComment(e.target.value)} className="w-full p-3 border rounded-md" rows="2" placeholder="気になる箇所を入力"></textarea>
              </div>
              <button onClick={analyzeImage} disabled={isAnalyzing} className="w-full md:w-auto px-8 py-4 rounded-lg font-bold text-xl text-white bg-blue-600 hover:bg-blue-700 mx-auto flex justify-center gap-2">
                {isAnalyzing ? <><Loader2 className="w-6 h-6 animate-spin" />分析中...</> : <><CheckCircle className="w-6 h-6" />危険予知（KY）を実行</>}
              </button>
            </div>
          )}
          {error && <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-md">{error}</div>}
        </div>

        {result && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 print:border-none print:shadow-none print:p-0">
            <div className="flex justify-end gap-3 mb-6 print:hidden pb-4">
              <button onClick={handleCopy} className="flex items-center gap-2 px-4 py-2 bg-slate-100 font-bold rounded-lg">{isCopied ? <Check className="w-5 h-5 text-green-600"/> : <Copy className="w-5 h-5"/>}コピー</button>
              <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-bold rounded-lg"><Printer className="w-5 h-5"/>印刷・PDF</button>
            </div>

            <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 mb-8 rounded-r-lg print:bg-white print:border-l-4">
              <p className="text-sm font-bold text-yellow-800">本日の安全行動目標</p>
              <p className="text-xl font-black">「 {result.safetyGoal} 」</p>
            </div>

            <div className="space-y-6 print:space-y-4">
              {result.hazards.map((hazard, index) => {
                const riskLevel = hazard.severity + hazard.likelihood - 1;
                const riskColor = riskLevel >= 4 ? 'bg-red-600 text-white' : riskLevel === 3 ? 'bg-orange-500 text-white' : 'bg-slate-200 text-slate-700';

                return (
                  <div key={index} className="rounded-lg border border-slate-300 overflow-hidden shadow-sm print:shadow-none print:break-inside-avoid">
                    <div className="bg-slate-100 p-3 font-bold border-b print:bg-slate-200">No.{index + 1} {hazard.title}</div>
                    <div className="p-4 flex flex-col md:flex-row gap-4">
                      <div className="flex-1">
                        <p className="text-sm font-bold text-slate-500">危険ポイント (〇〇なので、〇〇になる)</p>
                        <p className="text-lg font-medium border-b pb-3 mb-3">{hazard.situation}</p>
                        <p className="text-sm font-bold text-slate-500">対策 (私達はこうする！)</p>
                        <p className="text-lg font-bold text-blue-900 bg-blue-50 p-3 rounded-md">{hazard.countermeasure}</p>
                      </div>
                      <div className="md:w-48 bg-slate-50 rounded-lg p-3 border text-center">
                        <p className="text-sm font-bold mb-2 border-b pb-1">リスク評価</p>
                        <div className="flex justify-between px-2 mb-1"><span>重大性</span><span className="font-bold">{getSymbol(hazard.severity)}</span></div>
                        <div className="flex justify-between px-2 mb-3"><span>可能性</span><span className="font-bold">{getSymbol(hazard.likelihood)}</span></div>
                        <div className="flex justify-between items-center mt-auto">
                          <span className="font-bold">リスク度</span><span className={`text-xl font-black px-3 py-1 rounded ${riskColor}`}>{riskLevel}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}