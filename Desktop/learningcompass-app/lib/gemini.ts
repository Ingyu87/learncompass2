import { GoogleGenerativeAI } from "@google/generative-ai";

export async function generateAIResponse(
  question: string,
  subject: string,
  grade: string,
  learningObjective: string
): Promise<string> {
  try {
    const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    
    if (!apiKey) {
      throw new Error("Gemini API 키가 설정되지 않았습니다.");
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `당신은 초등학교 ${grade} 학생을 위한 친절한 AI 학습 도우미입니다.
과목: ${subject}
학습 목표: ${learningObjective}

학생의 질문: ${question}

위 정보를 바탕으로 학생의 질문에 대해 교육적이고 이해하기 쉬운 답변을 해주세요.
- 초등학생 수준에 맞는 쉬운 언어를 사용하세요
- 긍정적이고 격려하는 톤으로 답변하세요
- 학습 목표와 관련된 내용을 중심으로 답변하세요
- 답변은 2-3문장 정도로 간결하게 작성하세요`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Gemini API 오류:", error);
    // Fallback 응답
    return "죄송해요, 지금 답변을 생성하는데 문제가 생겼어요. 다시 시도해주세요!";
  }
}

