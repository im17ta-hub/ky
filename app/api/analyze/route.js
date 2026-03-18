import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { base64Data, userComment, mimeType } = await request.json();
    
    // サーバーの環境変数からAPIキーを安全に読み込む
    const apiKey = process.env.GEMINI_API_KEY; 
    
    if (!apiKey) {
      return NextResponse.json({ error: "APIキーが設定されていません。" }, { status: 500 });
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const userCommentPrompt = userComment.trim() 
      ? `\n\n【ユーザーからの特記事項・注視してほしい点】\n${userComment}\n※上記のユーザーからの特記事項を特に強く意識して、優先的に分析を行ってください。` 
      : "";

    const systemPrompt = `
      あなたは建設現場の安全管理を熟知したプロの現場監督です。
      提供された画像を分析し、指定された「TBM・リスクアセスメントKY活動表」の形式に厳密に従ってリスクアセスメントを実施してください。
      
      【厳守するルール】
      1. 危険ポイント（状況）は、必ず「〇〇なので、〇〇になる」という形式で記述すること。（例：足場に手すりがないので、墜落する）
      2. 重大性（重篤度）と可能性（度合）をそれぞれ1〜3の数値で評価すること。
         - 重大性: 1(○:軽微/不休災害), 2(△:重大/休業災害), 3(×:極めて重大/死亡・障害)
         - 可能性: 1(○:殆んど起こらない/5年に1回), 2(△:たまに起こる/年に1回), 3(×:かなり起こる/6ヶ月に1回)
      3. 対策は、「私達はこうする！」という項目に合うよう、具体的な行動を「〇〇する。」の形式で記述すること。
      4. 分析結果を踏まえ、全体で唱和するための「本日の安全行動目標（みんなで指差・呼称）」を1つ作成すること。
      5. 存在しない危険を捏造しないこと（ハルシネーションの防止）。
      6. 必ず指定されたJSONスキーマに従って出力すること。${userCommentPrompt}
    `;

    const payload = {
      contents: [
        { role: "user", parts: [{ text: systemPrompt }, { inlineData: { mimeType: mimeType, data: base64Data } }] }
      ],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            hazards: {
              type: "ARRAY",
              items: {
                type: "OBJECT",
                properties: {
                  title: { type: "STRING" },
                  situation: { type: "STRING" },
                  severity: { type: "INTEGER" },
                  likelihood: { type: "INTEGER" },
                  countermeasure: { type: "STRING" }
                },
                required: ["title", "situation", "severity", "likelihood", "countermeasure"]
              }
            },
            safetyGoal: { type: "STRING" }
          },
          required: ["hazards", "safetyGoal"]
        }
      }
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) throw new Error("API通信エラー");
    
    const data = await response.json();
    const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    return NextResponse.json({ result: JSON.parse(resultText) });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "分析に失敗しました。" }, { status: 500 });
  }
}