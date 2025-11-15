# Vercel 환경 변수 설정 가이드

## 필요한 환경 변수 목록

Vercel 대시보드 → 프로젝트 → **Settings** → **Environment Variables**에서 다음 변수들을 추가하세요:

### Firebase 설정 (7개)

1. **NEXT_PUBLIC_FIREBASE_API_KEY**
   - 값: `your_firebase_api_key_here` (Firebase Console에서 복사)

2. **NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN**
   - 값: `your-project.firebaseapp.com` (Firebase Console에서 확인)

3. **NEXT_PUBLIC_FIREBASE_PROJECT_ID**
   - 값: `your-project-id` (Firebase Console에서 확인)

4. **NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET**
   - 값: `your-project.firebasestorage.app` (Firebase Console에서 확인)

5. **NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID**
   - 값: `your_messaging_sender_id` (Firebase Console에서 확인)

6. **NEXT_PUBLIC_FIREBASE_APP_ID**
   - 값: `your_app_id` (Firebase Console에서 확인)

### Gemini API 설정 (1개)

7. **GEMINI_API_KEY**
   - 값: `your_gemini_api_key_here` (Google AI Studio에서 생성)

---

## 설정 방법

### 1. 각 환경 변수 추가

1. **"+ Add More"** 버튼 클릭
2. **Key** 필드에 변수 이름 입력 (예: `NEXT_PUBLIC_FIREBASE_API_KEY`)
3. **Value** 필드에 값 입력
4. **Environment** 선택:
   - ✅ **Production** (필수)
   - ✅ **Preview** (권장)
   - ✅ **Development** (권장)
5. **Save** 클릭

### 2. 모든 변수 반복

위의 7개 변수를 모두 추가하세요.

---

## 중요 사항

### Environment 선택
각 변수를 추가할 때 **Production, Preview, Development 모두 선택**하는 것을 권장합니다.

### 변수 이름 확인
- `NEXT_PUBLIC_`로 시작하는 변수는 클라이언트에서 접근 가능합니다.
- `GEMINI_API_KEY`는 서버 사이드에서만 사용됩니다.

### 보안
- 환경 변수는 공개되지 않습니다.
- GitHub에 커밋하지 마세요 (`.env.local`은 `.gitignore`에 포함되어 있음).

---

## 설정 후

1. 모든 변수를 추가한 후
2. **Deployments** → 최신 배포 → **Redeploy** 클릭
3. 또는 새 커밋을 푸시하면 자동으로 재배포됩니다.

---

## 확인 방법

배포 후 Build Logs에서:
- 환경 변수가 제대로 로드되었는지 확인
- Firebase 초기화 오류가 없는지 확인
- Gemini API 호출이 성공하는지 확인


