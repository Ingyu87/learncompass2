import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { essay, grade, subject, learningObjective } = body;

    if (!essay || !grade || !subject || !learningObjective) {
      return NextResponse.json(
        { error: "필수 파라미터가 누락되었습니다." },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: "Gemini API 키가 설정되지 않았습니다." },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    
    const prompt = `당신은 초등학교 ${grade} 학생의 학습 내용을 분석하여 마인드맵을 생성하는 전문가입니다.

과목: ${subject}
학습 목표: ${learningObjective}

학생이 작성한 글:
${essay}

위 글을 분석하여 마인드맵 구조를 JSON 형식으로 생성해주세요.

마인드맵 구조:
- root: 중심 주제 (학습 목표와 관련된 핵심 개념)
- children: 주요 하위 주제들 (3-5개)
- 각 하위 주제의 children: 세부 내용들 (각 2-4개)

응답 형식 (JSON만 반환):
{
  "root": {
    "name": "중심 주제명",
    "children": [
      {
        "name": "주요 주제 1",
        "children": [
          {"name": "세부 내용 1"},
          {"name": "세부 내용 2"}
        ]
      },
      {
        "name": "주요 주제 2",
        "children": [
          {"name": "세부 내용 1"},
          {"name": "세부 내용 2"}
        ]
      }
    ]
  }
}

중요:
- JSON 형식만 반환하세요 (설명 없이)
- 학생이 작성한 글의 핵심 내용을 반영하세요
- 학습 목표와 관련된 내용을 중심으로 구성하세요
- 초등학생 수준에 맞게 간단하고 명확하게 작성하세요`;

    // 사용 가능한 모델 시도
    const models = ["gemini-2.5-flash", "gemini-1.5-flash", "gemini-pro"];
    
    let mindmapData;
    let response;
    
    for (const modelName of models) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(prompt);
        response = await result.response;
        break;
      } catch (error: any) {
        if (error?.message?.includes("not found") || error?.message?.includes("404")) {
          console.log(`모델 ${modelName}을 사용할 수 없습니다. 다음 모델을 시도합니다.`);
          continue;
        }
        throw error;
      }
    }
    
    if (!response) {
      throw new Error("사용 가능한 Gemini 모델을 찾을 수 없습니다.");
    }

    try {
      const text = response.text();
      // JSON 추출
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        mindmapData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("JSON 형식을 찾을 수 없습니다.");
      }
    } catch (error) {
      console.error("JSON 파싱 오류:", error);
      // Fallback: 기본 마인드맵 구조
      mindmapData = {
        root: {
          name: learningObjective,
          children: [
            {
              name: "핵심 개념",
              children: [
                { name: "학생이 이해한 내용" },
              ],
            },
          ],
        },
      };
    }

    return NextResponse.json({ mindmap: mindmapData });
  } catch (error: any) {
    console.error("마인드맵 생성 오류:", error);
    return NextResponse.json(
      { error: error.message || "마인드맵 생성 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

