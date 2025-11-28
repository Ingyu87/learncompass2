# Vercel 새 프로젝트 설정 가이드

## ✅ 완료된 작업
- ✅ 모든 코드를 새 GitHub 저장소 `learncompass2`에 푸시 완료
- ✅ 저장소 URL: `https://github.com/Ingyu87/learncompass2`

## 📋 Vercel 새 프로젝트 설정 단계

### 1단계: Vercel 대시보드 접속
1. [Vercel 대시보드](https://vercel.com/dashboard) 접속
2. 로그인 확인

### 2단계: 새 프로젝트 생성
1. **"Add New..."** 버튼 클릭
2. **"Project"** 선택
3. GitHub 저장소 목록에서 **"Ingyu87/learncompass2"** 선택
4. **"Import"** 클릭

### 3단계: 프로젝트 설정 (중요!)

#### Framework Preset
- ✅ **"Next.js"**로 자동 감지되어야 함
- 만약 "Other"로 되어 있다면 → **"Next.js"**로 변경

#### Root Directory
- ✅ **비워두기** (빈 값)
- ❌ `./` 또는 다른 값 입력하지 않기
- 필드가 비어있어야 Vercel이 자동으로 루트에서 `package.json` 찾음

#### Build and Output Settings
- **Build Command**: `npm run build` (자동 설정됨)
- **Output Directory**: 비워두기 (자동)
- **Install Command**: `npm install` (자동 설정됨)

### 4단계: 환경 변수 설정

다음 환경 변수들을 추가하세요:

#### Firebase 설정
```
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

#### Gemini API 설정
```
GEMINI_API_KEY=your_gemini_api_key_here
```

**환경 변수 추가 방법:**
1. "Environment Variables" 섹션에서
2. 각 변수의 **Key**와 **Value** 입력
3. **"Add"** 클릭
4. 모든 변수 추가 후 **"Save"** 클릭

### 5단계: 배포
1. 모든 설정 확인 후
2. **"Deploy"** 버튼 클릭
3. 배포 진행 상황 확인

## ✅ 배포 성공 확인

배포가 성공하면 Build Logs에서 다음을 확인할 수 있습니다:

```
✓ Detected Next.js version: 14.2.0
✓ Running "npm run build"
✓ Creating an optimized production build...
✓ Build Completed
```

## 🔍 문제 해결

### "No Next.js version detected" 오류가 발생하면:
1. **Root Directory**가 비어있는지 확인
2. **Framework Preset**이 "Next.js"인지 확인
3. GitHub 저장소에서 `package.json`이 루트에 있는지 확인:
   - `https://github.com/Ingyu87/learncompass2/blob/main/package.json`

### 404 오류가 발생하면:
1. Build Logs 확인
2. 환경 변수가 모두 설정되었는지 확인
3. Firebase 설정이 올바른지 확인

## 📝 체크리스트

배포 전 확인:
- [ ] Framework Preset: **"Next.js"**
- [ ] Root Directory: **비어있음** (빈 값)
- [ ] 환경 변수 7개 모두 추가됨
- [ ] GitHub 저장소: `Ingyu87/learncompass2`

배포 후 확인:
- [ ] Build Logs에서 "Detected Next.js version" 메시지 확인
- [ ] 빌드 성공
- [ ] 사이트 접속 가능
- [ ] 로그인 기능 작동 확인

---

## 🎉 완료!

모든 설정이 완료되면 LearnCompass 앱이 정상적으로 작동합니다!

