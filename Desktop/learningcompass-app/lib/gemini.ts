import { GoogleGenerativeAI } from "@google/generative-ai";

export async function generateAIResponse(
  question: string,
  subject: string,
  grade: string,
  learningObjective: string,
  knowledgeContent?: string
): Promise<string> {
  try {
    const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    
    if (!apiKey) {
      throw new Error("Gemini API 키가 설정되지 않았습니다.");
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    
    // RAG: 지식 내용이 있으면 프롬프트에 포함
    const knowledgeContext = knowledgeContent 
      ? `\n\n**참고 지식 내용 (반드시 이 내용을 기반으로 답변하세요):**\n${knowledgeContent}\n`
      : "";
    
    const prompt = `당신은 초등학교 ${grade} 학생을 위한 친절한 AI 학습 도우미입니다.
과목: ${subject}
학습 목표: ${learningObjective}${knowledgeContext}

학생의 질문: ${question}

위 정보를 바탕으로 학생의 질문에 대해 교육적이고 이해하기 쉬운 답변을 해주세요.

**중요 지침:**
1. ${knowledgeContent ? "반드시 위의 '참고 지식 내용'을 기반으로 답변하세요. 지식 내용에 없는 정보는 추가하지 마세요." : ""}
2. 학생이 비속어나 부적절한 언어를 사용했다면, 친절하게 "바른 말을 사용해주세요. 학습에 집중해볼까요?"라고 안내하세요.
3. 질문이 학습 목표나 현재 학습 내용과 관련이 없다면, "이 질문은 지금 배우고 있는 내용과 관련이 없어요. 학습 목표에 맞는 질문을 해주세요."라고 안내하세요.
4. 학습 목표와 관련된 질문이라면, 초등학생 수준에 맞는 쉬운 언어로 2-3문장으로 간결하게 답변하세요.
5. 항상 긍정적이고 격려하는 톤을 유지하세요.
6. 답변은 학습 목표와 직접적으로 관련된 내용으로 제한하세요.`;

    // 사용 가능한 모델 시도 (우선순위: 2.5-flash -> 1.5-flash -> pro)
    const models = ["gemini-2.5-flash", "gemini-1.5-flash", "gemini-pro"];
    
    for (const modelName of models) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
      } catch (error: any) {
        // 모델을 찾을 수 없으면 다음 모델 시도
        if (error?.message?.includes("not found") || error?.message?.includes("404")) {
          console.log(`모델 ${modelName}을 사용할 수 없습니다. 다음 모델을 시도합니다.`);
          continue;
        }
        // 다른 에러면 재throw
        throw error;
      }
    }
    
    throw new Error("사용 가능한 Gemini 모델을 찾을 수 없습니다.");
  } catch (error: any) {
    console.error("Gemini API 오류:", error);
    
    // 더 자세한 에러 메시지
    if (error?.message) {
      throw new Error(`Gemini API 오류: ${error.message}`);
    }
    
    // Fallback 응답
    throw new Error("AI 응답 생성 중 오류가 발생했습니다. API 키와 네트워크 연결을 확인해주세요.");
  }
}

