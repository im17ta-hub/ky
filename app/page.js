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
    
if (title.includes('墜落') || title.includes('転落') || title.includes('落下')) return <AlertTriangle className="w-16 h-16 print:w-12 print:h-12 text-orange-500 print:text-black" />;
    if (title.includes('感電')) return <Zap className="w-16 h-16 print:w-12 print:h-12 text-yellow-500 print:text-black" />;
    if (title.includes('火災') || title.includes('火傷') || title.includes('爆発')) return <Flame className="w-16 h-16 print:w-12 print:h-12 text-red-500 print:text-black" />;
    if (title.includes('重機') || title.includes('車両') || title.includes('交通') || title.includes('はさまれ')) return <Car className="w-16 h-16 print:w-12 print:h-12 text-blue-500 print:text-black" />;
    if (title.includes('熱中症')) return <ThermometerSun className="w-16 h-16 print:w-12 print:h-12 text-red-500 print:text-black" />;
    if (title.includes('酸欠') || title.includes('有毒') || title.includes('中毒')) return <Skull className="w-16 h-16 print:w-12 print:h-12 text-purple-500 print:text-black" />;
    if (title.includes('倒壊') || title.includes('崩壊')) return <Construction className="w-16 h-16 print:w-12 print:h-12 text-amber-600 print:text-black" />;
    return <ShieldAlert className="w-16 h-16 print:w-12 print:h-12 text-red-600 print:text-black" />;
    <div className="min-h-screen bg-slate-100 font-sans pb-12 print:bg-white print:pb-0 print:text-black">
      <style>{`
        @media print {
          @page {
            size: A4 portrait; /* 確実にA4縦を指定 */
            margin: 12mm; /* 縦長で余裕があるので余白を少し戻して見やすく */
          }
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            font-size: 11pt; /* 小さすぎない適切な文字サイズに調整 */
              <h2 className="text-xl font-bold text-slate-800 border-b-2 border-slate-800 pb-1">TBM・リスクアセスメントKY AI分析結果</h2>
              <p className="text-xs text-slate-600 text-right mt-1">出力日時: {new Date().toLocaleString('ja-JP')}</p>
            </div>

            <h2 className="text-2xl font-bold mb-6 text-slate-800 border-b-2 border-slate-200 pb-2 flex items-center gap-2 print:hidden">
              <ShieldAlert className="text-blue-600" />
              リスクアセスメントKY 抽出結果
            </h2>

            <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 mb-8 rounded-r-lg shadow-sm print:bg-white print:border-l-4 print:border-yellow-500 print:shadow-none print:p-3 print:mb-6">
              <p className="text-sm font-bold text-yellow-800 mb-1 print:text-xs print:mb-0.5">本日の安全行動目標（みんなで指差・呼称）</p>
              <p className="text-xl md:text-2xl font-black text-slate-900 tracking-wide print:text-lg">
                「 {result.safetyGoal} 」
              </p>
            </div>

            {result.hazards && result.hazards.length > 0 ? (
              <div className="space-y-6 print:space-y-4">
                {result.hazards.map((hazard, index) => {
                  const severitySym = getSymbol(hazard.severity);
                  const likelihoodSym = getSymbol(hazard.likelihood);
                  const riskLevel = hazard.severity + hazard.likelihood - 1;
                  
                  const isHighRisk = riskLevel >= 3;
                  const riskColor = riskLevel === 5 ? 'bg-red-600 text-white' : riskLevel === 4 ? 'bg-red-500 text-white' : riskLevel === 3 ? 'bg-orange-500 text-white' : 'bg-slate-200 text-slate-700';

                  const isImportant = importantHazardIndex === index;

                  return (
                    <div key={index} className={`rounded-lg border overflow-hidden shadow-sm print:shadow-none print-avoid-break print:mb-2 transition-all ${isImportant ? 'border-red-500 ring-2 ring-red-200 print:border-2 print:border-red-600' : 'border-slate-300 print:border print:border-slate-400'}`}>
                      <div className={`p-3 border-b flex justify-between items-center print:p-2 print:text-sm ${isImportant ? 'bg-red-50 border-red-200 print:bg-white print:border-red-600' : 'bg-slate-100 border-slate-300 print:bg-slate-100'}`}>
                        <div className="font-bold text-slate-800 flex items-center gap-2 print:text-black">
                          <span className={`${isImportant ? 'bg-red-600' : 'bg-blue-600'} text-white text-xs px-2 py-1 rounded-full print:bg-black print:text-white print:px-2 print:py-0.5 print:text-xs`}>No.{index + 1}</span>
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
                            <span className="hidden print:inline-flex items-center gap-1 text-red-600 font-black border-2 border-red-600 px-1.5 py-0.5 rounded-sm print:text-xs">
                              <CheckSquare className="w-3.5 h-3.5"/> 重点対策項目
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="p-4 md:p-5 flex flex-col md:flex-row gap-6 print:p-3 print:gap-4 print:flex-row print:items-stretch">
                        
                        {isImportant && (
                          <div className="flex md:flex-col items-center justify-center bg-red-50 p-4 rounded-lg border border-red-100 print:bg-white print:border-none print:p-2 print:w-20">
                             {getHazardIcon(hazard.title)}
                             <span className="text-sm font-black text-red-600 mt-2 text-center print:text-[10px] print:mt-1 print:leading-tight">
                               ココを<br className="hidden print:block md:block" />ヨシ！
                             </span>
                          </div>
                        )}

                        <div className="flex-1 flex flex-col justify-center">
                          <p className={`text-sm font-bold mb-1 print:text-xs print:mb-0.5 ${isImportant ? 'text-red-600' : 'text-slate-500'}`}>危険ポイント（〇〇なので、〇〇になる）</p>
                          <p className={`text-lg font-medium border-b-2 pb-3 mb-4 print:text-sm print:pb-1 print:mb-2 print:border-b ${isImportant ? 'text-red-900 border-red-200' : 'text-slate-800 border-slate-200'}`}>
                            {hazard.situation}
                          </p>
                          
                          <p className="text-sm font-bold text-slate-500 mb-1 flex items-center gap-1 print:text-xs print:mb-0.5">
                            <CheckCircle className={`w-4 h-4 print:w-3 print:h-3 ${isImportant ? 'text-red-600' : 'text-green-600'}`} />
                            私達はこうする！（対策）
                          </p>
                          <p className={`text-lg font-bold p-3 rounded-md border print:text-sm print:p-2 print:bg-transparent ${isImportant ? 'text-red-900 bg-red-50 border-red-200 print:border-red-600' : 'text-blue-900 bg-blue-50 border-blue-100 print:border-slate-300'}`}>
                            {hazard.countermeasure}
                          </p>
                        </div>

                        <div className={`md:w-48 rounded-lg p-3 border flex flex-col justify-center print:w-36 print:p-2 ${isImportant ? 'bg-red-50 border-red-200 print:bg-white print:border-red-600' : 'bg-slate-50 border-slate-200 print:bg-white print:border-slate-300'}`}>
                          <p className="text-center text-sm font-bold text-slate-700 mb-2 border-b border-slate-300 pb-1 print:text-xs print:mb-1 print:pb-1">リスク見積り</p>
                          
                          <div className="flex justify-between items-center mb-1 px-2 print:px-1 print:mb-0.5">
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
                              <span className={`text-xl font-black px-3 py-1 rounded print:text-sm print:px-1.5 print:py-0.5 ${riskColor}`}>
                                {riskLevel}
                              </span>
                            </div>
                            {isHighRisk && (
                              <p className="text-xs text-red-600 font-bold text-center mt-1 animate-pulse print:animate-none print:mt-0.5 print:text-[10px]">
                                ※確実に行う！
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
            
            <div className="mt-8 p-4 bg-slate-50 rounded-md text-sm text-slate-600 border border-slate-200 print:mt-4 print:bg-white print:border-none print:p-0 print:text-xs">
              <strong>※注意事項※</strong> この分析結果はAIによる補助的なツールです。必ず現場の責任者および作業員全員で実際の現場を目視で確認し、最終的な安全確認を行ってください。
            </div>
          </div>
        )}
      </main>
    </div>
  );
}