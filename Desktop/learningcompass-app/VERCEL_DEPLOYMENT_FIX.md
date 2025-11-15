# Vercel 404 오류 해결 가이드

## 문제 진단

로그에서 확인된 문제:
- ✅ 환경 변수: 모두 올바르게 설정됨
- ❌ 루트 경로(`/`)에서 404 오류 발생
- ❌ `/404.html`이 11번 발생 (Vercel 기본 404 페이지)

## 원인 분석

이것은 Next.js 앱이 제대로 빌드되지 않았거나, 빌드는 성공했지만 라우팅이 제대로 작동하지 않는 것을 의미합니다.

## 해결 방법

### 1. Vercel 대시보드에서 Build Logs 확인

**중요**: Deployments → 최신 배포 → **Build Logs** 클릭

확인할 내용:
- 빌드가 성공했는지
- "Build Completed" 메시지가 있는지
- 타입 오류나 컴파일 오류가 있는지
- 환경 변수가 제대로 로드되었는지

### 2. 강제 재배포

방법 1: Vercel 대시보드에서
- Deployments → 최신 배포 → **Redeploy** 클릭

방법 2: 새 커밋 푸시 (방금 완료됨)
- `vercel.json` 제거로 Next.js 기본 설정 사용

### 3. Vercel 프로젝트 설정 확인

Vercel 대시보드 → **Settings** → **General**:

1. **Framework Preset**: `Next.js`로 설정되어 있는지 확인
2. **Root Directory**: 비어있거나 `.`로 설정
3. **Build Command**: `npm run build` (기본값)
4. **Output Directory**: 비어있음 (Next.js가 자동 처리)
5. **Install Command**: `npm install` (기본값)

### 4. 환경 변수 재확인

모든 환경 변수가 **Production**, **Preview**, **Development** 모두에 설정되어 있는지 확인:

```
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
GEMINI_API_KEY
```

### 5. 빌드 로그에서 확인할 오류

다음 오류가 있는지 확인:
- `Module not found`
- `Type error`
- `Build failed`
- `Environment variable not found`
- `Firebase initialization error`

## 추가 해결 방법

### 방법 1: 프로젝트 재연결 (최후의 수단)

1. Vercel 대시보드 → **Settings** → **General**
2. 프로젝트 삭제 (주의: 환경 변수는 백업)
3. GitHub 저장소를 다시 import
4. 환경 변수 다시 설정
5. 배포

### 방법 2: Vercel CLI로 배포 (선택사항)

```bash
npx vercel --prod
```

## 체크리스트

- [ ] Build Logs 확인 (가장 중요!)
- [ ] 빌드가 성공했는지 확인
- [ ] 환경 변수가 모든 환경에 설정되어 있는지 확인
- [ ] Framework Preset이 Next.js로 설정되어 있는지 확인
- [ ] 재배포 시도
- [ ] 몇 분 후 다시 접속 시도

## 다음 단계

1. **Build Logs를 확인**하고 오류 메시지를 공유해주세요
2. 재배포가 완료되면 (몇 분 소요) 다시 접속 시도
3. 여전히 404가 발생하면 Build Logs의 전체 내용을 공유해주세요

