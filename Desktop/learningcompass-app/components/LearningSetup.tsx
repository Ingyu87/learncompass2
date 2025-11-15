"use client";

interface LearningConfig {
  studentNumber: string;
  grade: string;
  subject: string;
  learningObjective: string;
}

interface LearningSetupProps {
  config: LearningConfig;
  onConfigChange: (config: LearningConfig) => void;
  uniqueObjectives?: string[];
}

export default function LearningSetup({
  config,
  onConfigChange,
  uniqueObjectives = [],
}: LearningSetupProps) {
  const handleChange = (field: keyof LearningConfig, value: string) => {
    onConfigChange({
      ...config,
      [field]: value,
    });
  };

  const isFormComplete =
    config.studentNumber &&
    config.grade &&
    config.subject &&
    config.learningObjective;

  return (
    <>
      <div className="bg-white rounded-xl card-shadow p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
          <span className="mr-2">📚</span> 학습 설정
        </h2>
        <form id="learning-setup" className="space-y-4">
          <div>
            <label
              htmlFor="student-number"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              학생 번호
            </label>
            <input
              type="number"
              id="student-number"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="학생 번호를 입력하세요 (예: 1, 2, 3...)"
              min="1"
              max="999"
              value={config.studentNumber}
              onChange={(e) => handleChange("studentNumber", e.target.value)}
            />
          </div>
          <div>
            <label
              htmlFor="grade-select"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              학년
            </label>
            <select
              id="grade-select"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              value={config.grade}
              onChange={(e) => handleChange("grade", e.target.value)}
            >
              <option value="">학년 선택</option>
              <option value="1학년">1학년</option>
              <option value="2학년">2학년</option>
              <option value="3학년">3학년</option>
              <option value="4학년">4학년</option>
              <option value="5학년">5학년</option>
              <option value="6학년">6학년</option>
            </select>
          </div>
          <div>
            <label
              htmlFor="subject-select"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              과목
            </label>
            <select
              id="subject-select"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              value={config.subject}
              onChange={(e) => handleChange("subject", e.target.value)}
            >
              <option value="">과목 선택</option>
              <option value="국어">국어</option>
              <option value="수학">수학</option>
              <option value="과학">과학</option>
              <option value="사회">사회</option>
              <option value="영어">영어</option>
              <option value="미술">미술</option>
              <option value="음악">음악</option>
              <option value="체육">체육</option>
            </select>
          </div>
          <div>
            <label
              htmlFor="learning-objective-select"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              학습 목표 선택
            </label>
            <select
              id="learning-objective-select"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              value={config.learningObjective}
              onChange={(e) => handleChange("learningObjective", e.target.value)}
            >
              <option value="">학습 목표를 선택하세요</option>
              {uniqueObjectives.map((objective) => (
                <option key={objective} value={objective}>
                  {objective}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              선생님이 설정한 학습 목표 중에서 선택하세요
            </p>
          </div>
        </form>
      </div>
      <div className="bg-green-50 border border-green-200 rounded-xl p-4">
        <h3 className="font-semibold text-green-800 mb-2 flex items-center">
          <span className="mr-2">🛡️</span> 안전 수칙
        </h3>
        <ul className="text-sm text-green-700 space-y-1">
          <li>• 학생 번호만 입력하고 이름은 입력하지 마세요</li>
          <li>• 학습 목표에 맞는 질문만 해주세요</li>
          <li>• 부적절한 내용은 자동으로 차단됩니다</li>
          <li>• 선생님이 모든 대화를 확인할 수 있어요</li>
        </ul>
      </div>
    </>
  );
}
