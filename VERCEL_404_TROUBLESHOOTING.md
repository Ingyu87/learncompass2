# Vercel 404 오류 해결 가이드

## 현재 상태
- ✅ 로컬 빌드 성공
- ✅ Firebase 설정 완료
- ✅ 환경 변수 설정 완료
- ❌ Vercel 배포에서 404 오류 발생

## 404 오류 원인 진단

### 1. 배포 상태 확인
Vercel 대시보드에서 확인:
- **Deployments** 탭 → 최신 배포 클릭
- **상태 확인**:
  - ✅ **Ready**: 배포 완료 (그런데 404가 나온다면 다른 문제)
  - ⏳ **Building**: 아직 빌드 중 (기다리기)
  - ❌ **Error**: 빌드 실패 (Build Logs 확인)

### 2. 빌드 로그 확인
**Deployments** → 최신 배포 → **Build Logs** 클릭

확인할 내용:
- 빌드가 성공했는지
- 환경 변수가 제대로 로드되었는지
- 타입 오류나 컴파일 오류가 있는지

### 3. 환경 변수 재확인
Vercel 대시보드 → **Settings** → **Environment Variables**

**필수 환경 변수:**
```
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
GEMINI_API_KEY
```

**주의사항:**
- 첫 번째 변수가 "EXT_PUBLIC_FIREBASE_API_KEY"로 보이면 안 됩니다
- 정확히 "**N**EXT_PUBLIC_FIREBASE_API_KEY"여야 합니다

### 4. 재배포
환경 변수를 수정했다면:
1. **Deployments** → 최신 배포 → **Redeploy** 클릭
2. 또는 새 커밋을 푸시하면 자동 재배포

### 5. 배포 URL 확인
- Vercel이 제공하는 기본 URL 사용
- 예: `learncompass-xxx.vercel.app`
- 커스텀 도메인을 사용한다면 DNS 설정 확인

### 6. 브라우저 캐시 문제
- 시크릿 모드로 접속 시도
- 또는 브라우저 캐시 삭제 후 재접속

## 일반적인 해결 방법

### 방법 1: 강제 재배포
```bash
# 빈 커밋으로 재배포 트리거
git commit --allow-empty -m "Trigger redeploy"
git push origin main
```

### 방법 2: Vercel CLI로 배포 (선택사항)
```bash
npx vercel --prod
```

### 방법 3: 프로젝트 재연결
Vercel 대시보드에서:
1. **Settings** → **General**
2. 프로젝트 삭제 후 재연결 (최후의 수단)

## 체크리스트

- [ ] Vercel 대시보드에서 배포 상태 확인
- [ ] Build Logs에서 오류 확인
- [ ] 환경 변수 모두 설정되어 있는지 확인
- [ ] 환경 변수 이름이 정확한지 확인 (NEXT_PUBLIC_...)
- [ ] 재배포 시도
- [ ] 시크릿 모드로 접속 시도
- [ ] 다른 브라우저로 접속 시도

## 추가 도움

문제가 계속되면:
1. Vercel 대시보드의 Build Logs 스크린샷
2. 환경 변수 목록 (값은 제외)
3. 접속하려는 정확한 URL

이 정보들을 함께 공유해주시면 더 정확한 진단이 가능합니다.


