# 환경 변수 설정 가이드

## 1. Firebase 설정하기

### Step 1: Firebase 프로젝트 생성
1. [Firebase Console](https://console.firebase.google.com/) 접속
2. "프로젝트 추가" 클릭
3. 프로젝트 이름 입력 (예: `learningcompass-app`)
4. Google Analytics 설정 (선택사항)
5. 프로젝트 생성 완료

### Step 2: Firestore Database 생성
1. Firebase Console에서 "Firestore Database" 클릭
2. "데이터베이스 만들기" 클릭
3. **테스트 모드로 시작** 선택 (개발 중에는 이게 편해요)
4. 위치 선택 (가장 가까운 지역, 예: `asia-northeast3`)
5. 활성화 클릭

### Step 3: 웹 앱 추가 및 설정 값 복사
1. Firebase Console 홈에서 웹 아이콘 (</>) 클릭
2. 앱 닉네임 입력 (예: `learningcompass-web`)
3. "앱 등록" 클릭
4. **설정 값 복사** (아래와 같은 형태)

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

5. `.env.local` 파일에 값 입력:
   - `NEXT_PUBLIC_FIREBASE_API_KEY` = `apiKey` 값
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` = `authDomain` 값
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID` = `projectId` 값
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` = `storageBucket` 값
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` = `messagingSenderId` 값
   - `NEXT_PUBLIC_FIREBASE_APP_ID` = `appId` 값

## 2. Gemini API 키 발급하기

### Step 1: Google AI Studio 접속
1. [Google AI Studio](https://makersuite.google.com/app/apikey) 접속
2. Google 계정으로 로그인

### Step 2: API 키 생성
1. "Create API Key" 또는 "API 키 만들기" 클릭
2. Google Cloud 프로젝트 선택 (기존 프로젝트 또는 새로 만들기)
3. API 키 생성 완료
4. **생성된 API 키 복사** (예: `AIzaSy...`)

### Step 3: `.env.local` 파일에 추가
- `GEMINI_API_KEY` = 생성한 API 키 붙여넣기

## 3. 환경 변수 파일 확인

`.env.local` 파일이 다음과 같이 채워져 있어야 합니다:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy실제키값...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123

# Gemini API
GEMINI_API_KEY=AIzaSy실제키값...
```

⚠️ **주의사항:**
- `.env.local` 파일은 절대 Git에 커밋하지 마세요! (이미 `.gitignore`에 추가되어 있습니다)
- `your_firebase_api_key` 같은 플레이스홀더를 실제 값으로 교체해야 합니다
- 값에 따옴표(`"`)를 붙이지 마세요

## 4. 테스트하기

환경 변수를 설정한 후:

```bash
npm run dev
```

브라우저에서 `http://localhost:3000` 접속하여 확인하세요!

## 문제 해결

### Firebase 연결 오류
- Firebase Console에서 Firestore가 활성화되어 있는지 확인
- 환경 변수 이름이 정확한지 확인 (`NEXT_PUBLIC_` 접두사 필수)

### Gemini API 오류
- API 키가 올바르게 설정되었는지 확인
- Google AI Studio에서 API 키가 활성화되어 있는지 확인


