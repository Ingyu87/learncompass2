# Vercel 근본 해결 가이드

## 문제 원인
Vercel이 계속 Next.js를 감지하지 못하는 것은 **프로젝트 설정이 잘못되어 있거나, Production Overrides가 계속 적용되고 있기 때문**입니다.

## 근본 해결 방법: 프로젝트 재생성

### 방법 1: Vercel 프로젝트 완전 재생성 (권장)

#### 1단계: 환경 변수 백업
1. Vercel 대시보드 → 프로젝트 → **Settings** → **Environment Variables**
2. 모든 환경 변수를 메모장에 복사해두기:
   - NEXT_PUBLIC_FIREBASE_API_KEY
   - NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
   - NEXT_PUBLIC_FIREBASE_PROJECT_ID
   - NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
   - NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
   - NEXT_PUBLIC_FIREBASE_APP_ID
   - GEMINI_API_KEY

#### 2단계: 프로젝트 삭제
1. Vercel 대시보드 → 프로젝트 → **Settings** → **General**
2. 맨 아래로 스크롤
3. **"Delete Project"** 클릭
4. 확인

#### 3단계: 새 프로젝트 생성
1. Vercel 대시보드 → **"Add New..."** → **"Project"** 클릭
2. GitHub 저장소 선택: **"Ingyu87/learncompass"**
3. **"Import"** 클릭

#### 4단계: 프로젝트 설정 확인
**중요**: 다음 설정들이 자동으로 감지되어야 합니다:
- ✅ **Framework Preset**: `Next.js` (자동 감지)
- ✅ **Root Directory**: (비어있음)
- ✅ **Build Command**: `npm run build` (자동)
- ✅ **Output Directory**: (비어있음, Next.js 자동)

**만약 자동 감지가 안 되면:**
- Framework Preset을 수동으로 **"Next.js"** 선택
- Root Directory는 **비워두기**

#### 5단계: 환경 변수 설정
1. **"Environment Variables"** 섹션으로 이동
2. 백업한 환경 변수들을 모두 추가:
   - 각 변수를 **Production**, **Preview**, **Development** 모두에 설정
3. **"Deploy"** 클릭

#### 6단계: 배포 확인
1. 배포가 시작되면 **Build Logs** 확인
2. 다음 메시지들이 보여야 함:
   - `Detected Next.js version: 14.2.0`
   - `Running "npm run build"`
   - `Creating an optimized production build...`
   - `Build Completed`

---

## 방법 2: Vercel CLI로 직접 배포 (대안)

터미널에서 직접 배포하여 설정 확인:

```bash
# Vercel 로그인 (이미 완료됨)
# 프로젝트 디렉토리에서
npx vercel --prod
```

이 방법은 Vercel이 자동으로 Next.js를 감지하고 올바른 설정을 적용합니다.

---

## 방법 3: 코드 레벨 강제 설정

현재 적용된 설정:
- ✅ `package.json`에 `next`가 dependencies에 있음
- ✅ `vercel-build` 스크립트 추가됨
- ✅ `engines` 필드 추가됨

추가로 확인할 사항:
- GitHub 저장소에서 `package.json`이 루트에 있는지 확인
- `https://github.com/Ingyu87/learncompass/blob/main/package.json`

---

## 체크리스트

재생성 전 확인:
- [ ] GitHub 저장소에 `package.json`이 루트에 있는지 확인
- [ ] 환경 변수 목록 백업
- [ ] Vercel 프로젝트 삭제 준비

재생성 후 확인:
- [ ] Framework Preset이 "Next.js"로 설정됨
- [ ] Root Directory가 비어있음
- [ ] 환경 변수가 모두 설정됨
- [ ] Build Logs에서 Next.js 감지 확인
- [ ] 빌드가 성공적으로 완료됨

---

## 예상 결과

프로젝트를 재생성하면:
1. Vercel이 자동으로 Next.js를 감지
2. 올바른 빌드 설정 적용
3. Production Overrides 문제 해결
4. 404 오류 해결

---

## 다음 단계

**가장 확실한 방법은 프로젝트 재생성입니다.** 

위의 "방법 1"을 따라하시면 문제가 해결될 것입니다. 환경 변수만 백업해두시면 됩니다!

