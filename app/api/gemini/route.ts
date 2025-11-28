import { NextRequest, NextResponse } from "next/server";
import { generateAIResponse } from "@/lib/gemini";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { question, subject, grade, learningObjective, knowledgeContent } = body;

    if (!question || !subject || !grade || !learningObjective) {
      return NextResponse.json(
        { error: "필수 파라미터가 누락되었습니다." },
        { status: 400 }
      );
    }

    // RAG: 지식 내용을 컨텍스트로 전달
    const response = await generateAIResponse(
      question,
      subject,
      grade,
      learningObjective,
      knowledgeContent || "" // 교사가 업로드한 지식 내용
    );

    return NextResponse.json({ response });
  } catch (error: any) {
    console.error("Gemini API 오류:", error);
    return NextResponse.json(
      { error: error.message || "AI 응답 생성 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

