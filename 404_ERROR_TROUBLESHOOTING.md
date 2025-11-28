# 404: NOT_FOUND 오류 해결 가이드

## 🔍 즉시 확인 사항

### 1단계: Vercel Build Logs 확인 (가장 중요!)

1. **Vercel 대시보드** 접속
2. 프로젝트 클릭
3. **Deployments** 탭 클릭
4. 최신 배포 클릭
5. **Build Logs** 클릭

**확인할 내용:**
- ✅ 빌드가 성공했는지 (`Build Completed`)
- ❌ 빌드 실패 메시지가 있는지
- ❌ 타입 오류나 컴파일 오류가 있는지
- ❌ "No Next.js version detected" 오류가 있는지
- ❌ 환경 변수 관련 오류가 있는지

### 2단계: 프로젝트 설정 확인

**Vercel 대시보드 → Settings → General:**

1. **Framework Preset**: `Next.js` ✅
2. **Root Directory**: 비어있어야 함 (또는 `learncompass2` 선택됨) ✅
3. **Build Command**: `npm run build` ✅
4. **Output Directory**: 비어있어야 함 ✅

### 3단계: 환경 변수 확인

**Settings → Environment Variables:**

다음 7개 변수가 모두 설정되어 있는지 확인:
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `GEMINI_API_KEY`

**중요**: 각 변수가 **Production**, **Preview**, **Development** 모두에 설정되어 있는지 확인!

## 🔧 해결 방법

### 방법 1: Build Logs에서 오류 확인 후 수정

**빌드 실패가 원인인 경우:**
- Build Logs의 오류 메시지를 확인
- 타입 오류나 컴파일 오류 수정
- 로컬에서 `npm run build` 실행하여 오류 재현

### 방법 2: 강제 재배포

1. **Deployments** → 최신 배포 → **Redeploy** 클릭
2. 또는 빈 커밋 푸시:
   ```bash
   git commit --allow-empty -m "Trigger redeploy"
   git push origin main
   ```

### 방법 3: Root Directory 재확인

만약 Root Directory가 `learncompass2`로 설정되어 있다면:
- 이것은 **올바른 설정**입니다 (저장소 루트)
- 하지만 빌드가 실패했다면 다른 원인일 수 있음

### 방법 4: 프로젝트 완전 재생성

위 방법들이 작동하지 않으면:

1. **환경 변수 백업**
2. **프로젝트 삭제**
3. **새 프로젝트 생성**
   - 저장소: `Ingyu87/learncompass2`
   - Root Directory: **비워두기** (빈 값)
   - Framework Preset: `Next.js`
   - 환경 변수 다시 입력
   - Deploy

## 📋 체크리스트

- [ ] Build Logs 확인 완료
- [ ] 빌드가 성공했는지 확인
- [ ] Root Directory 설정 확인
- [ ] Framework Preset이 "Next.js"인지 확인
- [ ] 환경 변수 7개 모두 설정됨
- [ ] 환경 변수가 Production/Preview/Development 모두에 설정됨

## 🎯 다음 단계

**Build Logs를 확인한 후:**
1. 빌드가 성공했다면 → 라우팅 문제일 수 있음
2. 빌드가 실패했다면 → 오류 메시지에 따라 수정

**Build Logs 내용을 공유해주시면 더 정확한 해결책을 제시할 수 있습니다!**


