"use client";

import { useMemo } from "react";

interface WordCloudProps {
  words: Array<{ text: string; value: number }>;
  title: string;
  maxWords?: number;
}

export default function WordCloud({ words, title, maxWords = 50 }: WordCloudProps) {
  const processedWords = useMemo(() => {
    // 빈도수에 따라 정렬하고 최대 개수만큼만 선택
    const sorted = [...words]
      .sort((a, b) => b.value - a.value)
      .slice(0, maxWords);

    if (sorted.length === 0) {
      return [];
    }

    // 최대값과 최소값 찾기
    const maxValue = sorted[0].value;
    const minValue = sorted[sorted.length - 1].value;
    const range = maxValue - minValue || 1;

    // 폰트 크기 계산 (14px ~ 32px)
    return sorted.map((word) => ({
      ...word,
      fontSize: 14 + ((word.value - minValue) / range) * 18,
    }));
  }, [words, maxWords]);

  if (processedWords.length === 0) {
    return (
      <div className="bg-white rounded-xl card-shadow p-6 min-h-[200px] flex items-center justify-center">
        <p className="text-gray-500">데이터가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl card-shadow p-6">
      <h3 className="text-lg font-bold text-gray-800 mb-4">{title}</h3>
      <div className="flex flex-wrap gap-2 items-center" style={{ transform: 'none' }}>
        {processedWords.map((word, idx) => (
          <span
            key={`${word.text}-${idx}`}
            className="inline-block px-3 py-1.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 hover:border-blue-300 transition-all cursor-pointer"
            style={{
              fontSize: `${word.fontSize}px`,
              fontWeight: word.value > 3 ? "bold" : "normal",
              transform: 'none',
              rotate: '0deg',
              position: 'relative',
            }}
            title={`${word.text}: ${word.value}회`}
          >
            {word.text} <span className="text-xs opacity-75">({word.value})</span>
          </span>
        ))}
      </div>
    </div>
  );
}

// 텍스트에서 단어 추출 및 빈도 계산 유틸리티
export function extractWords(text: string, minLength: number = 2): Map<string, number> {
  const wordMap = new Map<string, number>();
  
  // 한국어 불용어 목록
  const stopWords = new Set([
    "은", "는", "이", "가", "을", "를", "의", "에", "에서", "와", "과", "도", "로", "으로",
    "그", "이", "저", "것", "수", "등", "및", "또한", "또", "그리고", "하지만", "그런데",
    "그러나", "그래서", "따라서", "그러므로", "또는", "혹은", "만약", "만약에", "만일",
    "때문에", "위해", "위하여", "통해", "통하여", "대해", "대하여", "관해", "관하여",
    "있", "없", "하", "되", "되다", "하다", "이다", "있다", "없다", "되다", "하다",
    "되", "하", "있", "없", "것", "수", "등", "및", "또한", "또", "그리고",
  ]);

  // 한글, 영문, 숫자만 추출
  const words = text
    .replace(/[^\w\s가-힣]/g, " ") // 특수문자 제거
    .toLowerCase()
    .split(/\s+/)
    .filter((word) => word.length >= minLength && !stopWords.has(word));

  words.forEach((word) => {
    wordMap.set(word, (wordMap.get(word) || 0) + 1);
  });

  return wordMap;
}

