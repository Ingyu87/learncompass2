import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { loadCurriculumData, getStandardsBySubjectGradeAndArea } from "@/lib/curriculum";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, grade, subject } = body;

    if (!content || !grade || !subject) {
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

    // 성취기준 데이터 로드
    const standards = await getStandardsBySubjectGradeAndArea(subject, grade);
    
    if (standards.length === 0) {
      return NextResponse.json(
        { error: "해당 학년/과목에 대한 성취기준을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // 성취기준 목록을 문자열로 변환
    const standardsText = standards
      .map((s, idx) => `${idx + 1}. [${s.영역}] ${s.성취기준}`)
      .join("\n");

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // 1단계: 성취기준 분석
    const analysisPrompt = `당신은 초등학교 교육과정 전문가입니다.

학년: ${grade}
과목: ${subject}

다음은 해당 학년/과목의 성취기준 목록입니다:
${standardsText}

다음 학습 내용을 분석하여 가장 적합한 성취기준을 찾아주세요:

${content}

응답 형식 (JSON):
{
  "achievement_standard": "가장 적합한 성취기준 코드 (예: [4사02-02])",
  "achievement_standard_text": "성취기준 전체 텍스트",
  "area": "영역명",
  "explanation": "왜 이 성취기준이 적합한지 간단한 설명"
}`;

    const analysisResult = await model.generateContent(analysisPrompt);
    const analysisResponse = await analysisResult.response;
    let analysisData;
    
    try {
      // JSON 추출
      const text = analysisResponse.text();
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysisData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("JSON 형식을 찾을 수 없습니다.");
      }
    } catch (error) {
      console.error("JSON 파싱 오류:", error);
      // 기본값 사용
      analysisData = {
        achievement_standard: standards[0].성취기준,
        achievement_standard_text: standards[0].성취기준,
        area: standards[0].영역,
        explanation: "자동 분석 결과",
      };
    }

    // 2단계: 평가 루브릭 생성
    const rubricPrompt = `당신은 초등학교 평가 전문가입니다.

학년: ${grade}
과목: ${subject}
성취기준: ${analysisData.achievement_standard_text}

위 성취기준에 맞는 평가 루브릭을 상/중/하 3단계로 작성해주세요.
각 단계는 구체적이고 측정 가능한 기준으로 작성해야 합니다.

응답 형식 (JSON):
{
  "rubric": {
    "high": "상 수준: 구체적인 평가 기준",
    "medium": "중 수준: 구체적인 평가 기준",
    "low": "하 수준: 구체적인 평가 기준"
  }
}`;

    const rubricResult = await model.generateContent(rubricPrompt);
    const rubricResponse = await rubricResult.response;
    let rubricData;
    
    try {
      const text = rubricResponse.text();
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        rubricData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("JSON 형식을 찾을 수 없습니다.");
      }
    } catch (error) {
      console.error("루브릭 JSON 파싱 오류:", error);
      // 기본 루브릭
      rubricData = {
        rubric: {
          high: "상 수준: 성취기준을 완전히 이해하고 적용할 수 있음",
          medium: "중 수준: 성취기준을 부분적으로 이해하고 적용할 수 있음",
          low: "하 수준: 성취기준을 이해하는 데 어려움이 있음",
        },
      };
    }

    return NextResponse.json({
      achievement_standard: analysisData.achievement_standard,
      achievement_standard_text: analysisData.achievement_standard_text,
      area: analysisData.area,
      explanation: analysisData.explanation,
      rubric: rubricData.rubric,
    });
  } catch (error: any) {
    console.error("지식 분석 오류:", error);
    return NextResponse.json(
      { error: error.message || "지식 분석 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

