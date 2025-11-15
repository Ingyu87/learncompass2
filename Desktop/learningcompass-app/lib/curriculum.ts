// 2022개정교육과정 성취기준 데이터 타입 및 유틸리티

export interface CurriculumStandard {
  교과: string;
  학년: string;
  영역: string;
  성취기준: string;
  "성취기준 해설": string | null;
  단원: string | null;
}

// 학년을 단일 학년 형식으로 변환 (예: "1~2학년" -> "1학년", "2학년")
export function normalizeGrade(gradeRange: string): string[] {
  if (gradeRange.includes("~")) {
    const [start, end] = gradeRange.split("~");
    const startNum = parseInt(start);
    const endNum = parseInt(end.replace("학년", ""));
    const grades: string[] = [];
    for (let i = startNum; i <= endNum; i++) {
      grades.push(`${i}학년`);
    }
    return grades;
  }
  return [gradeRange];
}

// 단일 학년이 범위에 포함되는지 확인
export function isGradeInRange(grade: string, gradeRange: string): boolean {
  const normalized = normalizeGrade(gradeRange);
  return normalized.includes(grade);
}

// 성취기준 데이터 로드
let curriculumData: CurriculumStandard[] | null = null;

export async function loadCurriculumData(): Promise<CurriculumStandard[]> {
  if (curriculumData) {
    return curriculumData;
  }

  try {
    const response = await fetch("/data/curriculum-standards.json");
    if (!response.ok) {
      throw new Error("성취기준 데이터를 불러올 수 없습니다.");
    }
    const data = await response.json();
    curriculumData = data as CurriculumStandard[];
    return curriculumData;
  } catch (error) {
    console.error("성취기준 데이터 로드 오류:", error);
    return [];
  }
}

// 학년별 교과 목록 가져오기
export async function getSubjectsByGrade(grade: string): Promise<string[]> {
  const data = await loadCurriculumData();
  const subjects = new Set<string>();
  
  data.forEach((item) => {
    if (isGradeInRange(grade, item.학년)) {
      subjects.add(item.교과);
    }
  });
  
  return Array.from(subjects).sort();
}

// 교과별 영역 목록 가져오기
export async function getAreasBySubjectAndGrade(
  subject: string,
  grade: string
): Promise<string[]> {
  const data = await loadCurriculumData();
  const areas = new Set<string>();
  
  data.forEach((item) => {
    if (item.교과 === subject && isGradeInRange(grade, item.학년)) {
      areas.add(item.영역);
    }
  });
  
  return Array.from(areas).sort();
}

// 성취기준 목록 가져오기
export async function getStandardsBySubjectGradeAndArea(
  subject: string,
  grade: string,
  area?: string
): Promise<CurriculumStandard[]> {
  const data = await loadCurriculumData();
  
  return data.filter((item) => {
    const matchesSubject = item.교과 === subject;
    const matchesGrade = isGradeInRange(grade, item.학년);
    const matchesArea = !area || item.영역 === area;
    
    return matchesSubject && matchesGrade && matchesArea;
  });
}

// 성취기준 텍스트만 가져오기
export async function getStandardTexts(
  subject: string,
  grade: string,
  area?: string
): Promise<string[]> {
  const standards = await getStandardsBySubjectGradeAndArea(subject, grade, area);
  return standards.map((s) => s.성취기준);
}

// 성취기준 검색
export async function searchStandards(
  keyword: string,
  subject?: string,
  grade?: string
): Promise<CurriculumStandard[]> {
  const data = await loadCurriculumData();
  
  return data.filter((item) => {
    const matchesKeyword =
      item.성취기준.includes(keyword) ||
      (item["성취기준 해설"] && item["성취기준 해설"].includes(keyword));
    const matchesSubject = !subject || item.교과 === subject;
    const matchesGrade = !grade || isGradeInRange(grade, item.학년);
    
    return matchesKeyword && matchesSubject && matchesGrade;
  });
}

