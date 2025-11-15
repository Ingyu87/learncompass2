# 배움나침반 LearnCompass

안전하고 즐거운 AI 학습 플랫폼

## 기술 스택

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Firebase Firestore
- **AI**: Google Gemini API
- **Deployment**: Vercel

## 시작하기

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env.local` 파일을 생성하고 다음 변수들을 설정하세요:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Gemini API
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
```

### 3. Firebase 설정

1. [Firebase Console](https://console.firebase.google.com/)에서 프로젝트 생성
2. Firestore Database 생성 (테스트 모드로 시작 가능)
3. 웹 앱 추가 후 설정 값 복사

### 4. Gemini API 키 발급

1. [Google AI Studio](https://makersuite.google.com/app/apikey)에서 API 키 생성
2. `.env.local`에 추가

### 5. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

## 배포

### Vercel 배포

1. GitHub에 프로젝트 푸시
2. [Vercel](https://vercel.com)에 로그인
3. 새 프로젝트 import
4. 환경 변수 설정 (Vercel 대시보드에서)
5. Deploy!

## 주요 기능

- ✅ 학생 학습 설정 (이름, 학년, 과목, 목표)
- ✅ AI 채팅 인터페이스 (Gemini API)
- ✅ 안전 필터링 시스템
- ✅ 교사 대시보드 (대화 모니터링 및 승인)
- ✅ 데이터 내보내기 (CSV)
- ✅ 실시간 데이터 동기화 (Firebase)

## 프로젝트 구조

```
learningcompass-app/
├── app/
│   ├── api/
│   │   └── gemini/
│   │       └── route.ts      # Gemini API 라우트
│   ├── globals.css           # 전역 스타일
│   ├── layout.tsx            # 루트 레이아웃
│   └── page.tsx              # 메인 페이지
├── components/
│   ├── Header.tsx            # 헤더 컴포넌트
│   ├── LearningSetup.tsx     # 학습 설정 컴포넌트
│   ├── ChatInterface.tsx     # 채팅 인터페이스
│   └── TeacherDashboard.tsx  # 교사 대시보드
├── hooks/
│   └── useFirebase.ts        # Firebase 훅
├── lib/
│   ├── firebase.ts           # Firebase 초기화
│   └── gemini.ts              # Gemini API 클라이언트
└── vercel.json               # Vercel 설정
```

## 라이선스

MIT

