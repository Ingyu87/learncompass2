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

    // 폰트 크기 계산 (12px ~ 48px)
    return sorted.map((word) => ({
      ...word,
      fontSize: 12 + ((word.value - minValue) / range) * 36,
      opacity: 0.6 + ((word.value - minValue) / range) * 0.4,
    }));
  }, [words, maxWords]);

  if (processedWords.length === 0) {
    return (
      <div className="bg-white rounded-xl card-shadow p-6 h-96 flex items-center justify-center">
        <p className="text-gray-500">데이터가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl card-shadow p-6">
      <h3 className="text-lg font-bold text-gray-800 mb-4">{title}</h3>
      <div className="relative h-80 overflow-hidden">
        <div className="word-cloud-container">
          {processedWords.map((word, idx) => {
            // 랜덤 위치 (하지만 시드가 있어서 같은 단어는 같은 위치)
            const angle = (idx * 137.5) % 360; // 황금각 사용
            const radius = 30 + (idx % 3) * 20;
            const x = 50 + Math.cos((angle * Math.PI) / 180) * radius;
            const y = 50 + Math.sin((angle * Math.PI) / 180) * radius;

            return (
              <span
                key={`${word.text}-${idx}`}
                className="word-cloud-item"
                style={{
                  fontSize: `${word.fontSize}px`,
                  opacity: word.opacity,
                  left: `${x}%`,
                  top: `${y}%`,
                  transform: `translate(-50%, -50%) rotate(${angle}deg)`,
                  fontWeight: word.value > 5 ? "bold" : "normal",
                }}
              >
                {word.text}
              </span>
            );
          })}
        </div>
      </div>
      <style jsx>{`
        .word-cloud-container {
          position: relative;
          width: 100%;
          height: 100%;
        }
        .word-cloud-item {
          position: absolute;
          color: #3b82f6;
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
        }
        .word-cloud-item:hover {
          color: #1d4ed8;
          transform: translate(-50%, -50%) scale(1.2) !important;
          z-index: 10;
        }
      `}</style>
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

