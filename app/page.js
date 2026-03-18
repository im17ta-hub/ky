"use client";
import React, { useState, useRef } from 'react';
import { UploadCloud, AlertTriangle, CheckCircle, Info, ShieldAlert, Loader2, Image as ImageIcon, Printer, Copy, Check, CheckSquare, Square, Zap, Flame, Car, Construction, Skull, ThermometerSun } from 'lucide-react';

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
  const [importantHazardIndex, setImportantHazardIndex] = useState(null);
  const fileInputRef = useRef(null);

  const processFile = (file) => {
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('画像ファイルを選択してください。');
        return;
      }
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      setResult(null);
      setError('');
      setImportantHazardIndex(null);
    }
  };

  const handleImageUpload = (e) => {
    processFile(e.target.files[0]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const analyzeImage = async () => {
    if (!imagePreview || !image) return;
    setIsAnalyzing(true);
    setError('');
    setResult(null);
    setImportantHazardIndex(null);

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

  const getHazardIcon = (title) => {
    if (title.includes('墜落') || title.includes('転落') || title.includes('落下')) return <AlertTriangle className="w-16 h-16 text-orange-500 print:text-black" />;
    if (title.includes('感電')) return <Zap className="w-16 h-16 text-yellow-500 print:text-black" />;
    if (title.includes('火災') || title.includes('火傷') || title.includes('爆発')) return <Flame className="w-16 h-16 text-red-500 print:text-black" />;
    if (title.includes('重機') || title.includes('車両') || title.includes('交通') || title.includes('はさまれ')) return <Car className="w-16 h-16 text-blue-500 print:text-black" />;
    if (title.includes('熱中症')) return <ThermometerSun className="w-16 h-16 text-red-500 print:text-black" />;
    if (title.includes('酸欠') || title.includes('有毒') || title.includes('中毒')) return <Skull className="w-16 h-16 text-purple-500 print:text-black" />;
    if (title.includes('倒壊') || title.includes('崩壊')) return <Construction className="w-16 h-16 text-amber-600 print:text-black" />;
    return <ShieldAlert className="w-16 h-16 text-red-600 print:text-black" />;
  };

  const handlePrint = () => {
    try {
      window.focus();
      window.print();
    } catch (err) {
      console.error("印刷機能の呼び出しに失敗しました", err);
    }
    setShowPrintHint(true);
    setTimeout(() => setShowPrintHint(false), 8000);
  };

  const handleCopy = () => {
    if (!result) return;
    
    let textToCopy = `【本日の安全行動目標】\n${result.safetyGoal}\n\n`;
    textToCopy += `【KY抽出結果】\n`;
    
    result.hazards.forEach((hazard, index) => {
      const riskLevel = hazard.severity + hazard.likelihood - 1;
      textToCopy += `\nNo.${index + 1} ${hazard.title}\n`;
      textToCopy += `・危険ポイント: ${hazard.situation}\n`;
      textToCopy += `・対策 (私達はこうする!): ${hazard.countermeasure}\n`;
      textToCopy += `・リスク度: ${riskLevel} (重大性:${hazard.severity}, 可能性:${hazard.likelihood})\n`;
    });

    try {
      const textArea = document.createElement("textarea");
      textArea.value = textToCopy;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      textArea.style.top = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      document.execCommand('copy');
      textArea.remove();
      
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('コピーに失敗しました', err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 font-sans pb-12 print:bg-white print:pb-0">
      <style>{`
        @media print {
          @page {
            size: A4 landscape;
            margin: 10mm;
          }
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          /* ページ分割を防ぐ */
          .print-avoid-break {
            page-break-inside: avoid;
            break-inside: avoid;
          }
        }
      `}</style>
      
      <header className="bg-blue-800 text-white p-4 shadow-md flex items-center justify-center gap-3 print:hidden">
        <AlertTriangle className="w-8 h-8 text-yellow-400" />
        <h1 className="text-2xl md:text-3xl font-bold tracking-wider">TBM・RKY 支援サポーター</h1>
      </header>

      <main className="max-w-4xl mx-auto p-4 mt-6 print:m-0 print:p-0 print:max-w-none">
        
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6 print:hidden">
          <h2 className="text-xl font-bold mb-4 text-slate-800 flex items-center gap-2">
            <ImageIcon className="w-6 h-6 text-blue-500" />
            1. 現場の写真をアップロード
          </h2>
          
          <div 
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
              ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-slate-300 hover:bg-slate-50'}`}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImageUpload} 
              accept="image/*" 
              className="hidden" 
            />
            {imagePreview ? (
              <img src={imagePreview} alt="Preview" className="max-h-64 mx-auto rounded-md object-contain pointer-events-none" />
            ) : (
              <div className="flex flex-col items-center justify-center text-slate-500 pointer-events-none">
                <UploadCloud className={`w-16 h-16 mb-4 ${isDragging ? 'text-blue-500' : 'text-slate-400'}`} />
                <p className="text-lg font-medium">ここをタップするか、画像をドラッグ＆ドロップ</p>
                <p className="text-sm mt-2">※スマホのカメラで直接撮影も可能です</p>
              </div>
            )}
          </div>

          {imagePreview && (
            <div className="mt-6 space-y-5 text-center">
              <div className="text-left bg-slate-50 p-4 rounded-lg border border-slate-200 animate-fade-in">
                <label htmlFor="userComment" className="block text-sm font-bold text-slate-700 mb-2">
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mr-2">任意</span>
                  AIに特にチェックしてほしい点や、当日の作業内容、気になる箇所があれば入力してください
                </label>
                <textarea
                  id="userComment"
                  value={userComment}
                  onChange={(e) => setUserComment(e.target.value)}
                  placeholder="例：写真の左奥、資材が積んである部分が崩れないか気になるので念入りに見てほしい。"
                  className="w-full p-3 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow"
                  rows="3"
                ></textarea>
              </div>

              <button 
                onClick={analyzeImage} 
                disabled={isAnalyzing} 
                className="w-full md:w-auto px-8 py-4 rounded-lg font-bold text-xl text-white bg-blue-600 hover:bg-blue-700 mx-auto flex justify-center gap-2"
              >
                {isAnalyzing ? (
                  <><Loader2 className="w-6 h-6 animate-spin" />分析中...</>
                ) : (
                  <><CheckCircle className="w-6 h-6" />危険予知（KY）を実行</>
                )}
              </button>
            </div>
          )}
          {error && <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-md">{error}</div>}
        </div>

        {result && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 print:border-none print:shadow-none print:p-0">
            
            <div className="flex justify-end gap-3 mb-6 print:hidden pb-4">
              <button onClick={handleCopy} className="flex items-center gap-2 px-4 py-2 bg-slate-100 font-bold rounded-lg hover:bg-slate-200 transition-colors">
                {isCopied ? <Check className="w-5 h-5 text-green-600"/> : <Copy className="w-5 h-5"/>}
                コピー
              </button>
              <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors">
                <Printer className="w-5 h-5"/>
                印刷・PDF
              </button>
            </div>

            <div className="hidden print:block mb-4 print:mb-2">
              <h2 className="text-xl font-bold text-slate-800 border-b-2 border-slate-800 pb-1 print:text-lg">TBM・リスクアセスメントKY AI分析結果</h2>
              <p className="text-sm text-slate-600 text-right mt-1 print:text-xs">出力日時: {new Date().toLocaleString('ja-JP')}</p>
            </div>

            <h2 className="text-2xl font-bold mb-6 text-slate-800 border-b-2 border-slate-200 pb-2 flex items-center gap-2 print:hidden">
              <ShieldAlert className="text-blue-600" />
              リスクアセスメントKY 抽出結果
            </h2>

            <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 mb-8 rounded-r-lg shadow-sm print:bg-white print:border-l-4 print:border-yellow-500 print:shadow-none print:p-2 print:mb-4">
              <p className="text-sm font-bold text-yellow-800 mb-1 print:text-xs">本日の安全行動目標（みんなで指差・呼称）</p>
              <p className="text-xl md:text-2xl font-black text-slate-900 tracking-wide print:text-lg">
                「 {result.safetyGoal} 」
              </p>
            </div>

            {result.hazards && result.hazards.length > 0 ? (
              <div className="space-y-6 print:space-y-2">
                {result.hazards.map((hazard, index) => {
                  const severitySym = getSymbol(hazard.severity);
                  const likelihoodSym = getSymbol(hazard.likelihood);
                  const riskLevel = hazard.severity + hazard.likelihood - 1;
                  
                  const isHighRisk = riskLevel >= 3;
                  const riskColor = riskLevel === 5 ? 'bg-red-600 text-white' : riskLevel === 4 ? 'bg-red-500 text-white' : riskLevel === 3 ? 'bg-orange-500 text-white' : 'bg-slate-200 text-slate-700';

                  const isImportant = importantHazardIndex === index;

                  return (
                    <div key={index} className={`rounded-lg border overflow-hidden shadow-sm print:shadow-none print-avoid-break print:mb-2 transition-all ${isImportant ? 'border-red-500 ring-2 ring-red-200 print:border-2 print:border-red-600' : 'border-slate-300 print:border-slate-400'}`}>
                      <div className={`p-3 border-b flex justify-between items-center print:p-1.5 print:text-sm ${isImportant ? 'bg-red-50 border-red-200 print:bg-white print:border-red-600' : 'bg-slate-100 border-slate-300 print:bg-slate-200'}`}>
                        <div className="font-bold text-slate-800 flex items-center gap-2 print:text-black">
                          <span className={`${isImportant ? 'bg-red-600' : 'bg-blue-600'} text-white text-xs px-2 py-1 rounded-full print:bg-black print:text-white print:px-1.5 print:py-0.5`}>No.{index + 1}</span>
                          {hazard.title}
                        </div>
                        
                        <div className="flex items-center">
                          <button 
                            onClick={() => setImportantHazardIndex(isImportant ? null : index)}
                            className={`flex items-center gap-1 text-sm px-3 py-1 rounded shadow-sm border transition-colors print:hidden ${isImportant ? 'bg-red-600 text-white border-red-700 hover:bg-red-700' : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'}`}
                          >
                            {isImportant ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                            {isImportant ? '重点対策項目！' : '重点項目に設定'}
                          </button>
                          {isImportant && (
                            <span className="hidden print:inline-flex items-center gap-1 text-red-600 font-black border-2 border-red-600 px-2 py-0.5 rounded-sm print:text-sm">
                              <CheckSquare className="w-4 h-4"/> 重点対策項目
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="p-4 md:p-5 flex flex-col md:flex-row gap-6 print:p-2 print:gap-4 print:flex-row">
                        
                        {isImportant && (
                          <div className="flex md:flex-col items-center justify-center bg-red-50 p-4 rounded-lg border border-red-100 print:bg-white print:border-none print:p-0 print:w-24">
                             {getHazardIcon(hazard.title)}
                             <span className="text-sm font-black text-red-600 mt-2 text-center print:text-[11px] print:mt-1">
                               ココを<br className="hidden print:block md:block" />ヨシ！
                             </span>
                          </div>
                        )}

                        <div className="flex-1">
                          <p className={`text-sm font-bold mb-1 print:text-xs ${isImportant ? 'text-red-600' : 'text-slate-500'}`}>危険ポイントの書き方（〇〇なので、〇〇になる）</p>
                          <p className={`text-lg font-medium border-b-2 pb-3 mb-4 print:text-base print:pb-1 print:mb-2 print:border-b ${isImportant ? 'text-red-900 border-red-200' : 'text-slate-800 border-slate-200'}`}>
                            {hazard.situation}
                          </p>
                          
                          <p className="text-sm font-bold text-slate-500 mb-1 flex items-center gap-1 print:text-xs">
                            <CheckCircle className={`w-4 h-4 print:w-3 print:h-3 ${isImportant ? 'text-red-600' : 'text-green-600'}`} />
                            私達はこうする！（対策）
                          </p>
                          <p className={`text-lg font-bold p-3 rounded-md border print:text-base print:p-1.5 print:bg-transparent ${isImportant ? 'text-red-900 bg-red-50 border-red-200 print:border-red-600' : 'text-blue-900 bg-blue-50 border-blue-100 print:border-slate-300'}`}>
                            {hazard.countermeasure}
                          </p>
                        </div>

                        <div className={`md:w-48 rounded-lg p-3 border flex flex-col justify-center print:w-40 print:p-1.5 ${isImportant ? 'bg-red-50 border-red-200 print:bg-white print:border-red-600' : 'bg-slate-50 border-slate-200 print:bg-white print:border-slate-300'}`}>
                          <p className="text-center text-sm font-bold text-slate-700 mb-2 border-b border-slate-300 pb-1 print:text-xs print:mb-1">リスクの見積り・評価</p>
                          
                          <div className="flex justify-between items-center mb-1 px-2 print:px-1 print:mb-0">
                            <span className="text-sm text-slate-600 print:text-xs">重大性</span>
                            <span className="text-lg font-bold text-slate-800 print:text-sm">{severitySym}</span>
                          </div>
                          <div className="flex justify-between items-center mb-3 px-2 print:px-1 print:mb-1">
                            <span className="text-sm text-slate-600 print:text-xs">可能性</span>
                            <span className="text-lg font-bold text-slate-800 print:text-sm">{likelihoodSym}</span>
                          </div>
                          
                          <div className="mt-auto">
                            <div className="flex justify-between items-center mb-1 print:mb-0">
                              <span className="text-sm font-bold text-slate-700 print:text-xs">リスク度</span>
                              <span className={`text-xl font-black px-3 py-1 rounded print:text-base print:px-1.5 print:py-0.5 ${riskColor}`}>
                                {riskLevel}
                              </span>
                            </div>
                            {isHighRisk && (
                              <p className="text-xs text-red-600 font-bold text-center mt-1 animate-pulse print:animate-none print:mt-0">
                                ※対策を確実に行う！
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center p-8 bg-green-50 rounded-lg border border-green-200">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                <p className="text-xl font-bold text-green-800">特筆すべき危険箇所は見当たりませんでした。</p>
                <p className="text-green-700 mt-2">引き続き、基本ルールを守って安全作業をお願いします。</p>
              </div>
            )}
            
            <div className="mt-8 p-4 bg-slate-50 rounded-md text-sm text-slate-600 border border-slate-200 print:mt-4 print:bg-white print:border-none print:p-0">
              <strong>※注意事項※</strong><br />
              この分析結果はAIによる補助的なツールです。必ず現場の責任者および作業員全員で実際の現場を目視で確認し、最終的な安全確認を行ってください。
            </div>
          </div>
        )}
      </main>
    </div>
  );
}