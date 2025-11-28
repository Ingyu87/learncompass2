# Vercel 설정 가이드 - 단계별 안내

## 1단계: Vercel 대시보드 접속

1. 브라우저에서 [https://vercel.com](https://vercel.com) 접속
2. 로그인 (GitHub 계정으로 로그인했을 것입니다)

## 2단계: 프로젝트 선택

1. 대시보드에서 **"learncompass"** 또는 **"learncompass-app"** 프로젝트 클릭
2. 프로젝트 페이지로 이동

## 3단계: Settings (설정) 메뉴 찾기

프로젝트 페이지 상단에 메뉴가 있습니다:
- **Overview** (개요)
- **Deployments** (배포)
- **Analytics** (분석)
- **Settings** (설정) ← **여기를 클릭하세요!**

## 4단계: General (일반) 설정 확인

Settings 페이지에서:
- 왼쪽 사이드바에 여러 메뉴가 있습니다
- 맨 위에 **"General"** (일반) 메뉴가 있습니다 ← **여기를 클릭하세요!**

## 5단계: Framework Preset 확인 및 수정

General 페이지에서 아래로 스크롤하면:

### "Build & Development Settings" 섹션을 찾으세요

여기서 확인할 항목:

1. **Framework Preset**
   - 현재 값 확인
   - 드롭다운을 클릭
   - **"Next.js"** 선택 (없으면 "Other" 선택 후 수동 설정)

2. **Build Command**
   - `npm run build` 로 되어 있는지 확인
   - 없으면 입력: `npm run build`

3. **Output Directory**
   - **비어있어야 합니다** (Next.js는 자동으로 처리)
   - 값이 있으면 삭제

4. **Install Command**
   - `npm install` 로 되어 있는지 확인

5. **Root Directory**
   - **비어있어야 합니다** 또는 `.` 만 있어야 함

## 6단계: 저장

모든 설정을 확인/수정한 후:
- 페이지 하단의 **"Save"** 버튼 클릭

## 7단계: 재배포

1. 상단 메뉴에서 **"Deployments"** 클릭
2. 최신 배포를 찾아서
3. 오른쪽에 **"..."** (점 3개) 메뉴 클릭
4. **"Redeploy"** 선택

또는 간단하게:
- 새 커밋을 푸시하면 자동으로 재배포됩니다 (이미 완료됨)

## 8단계: Build Logs 확인

1. **Deployments** 탭에서
2. 최신 배포를 클릭
3. **"Build Logs"** 탭 클릭
4. 다음 메시지들이 보이는지 확인:
   - `Running "npm run build"`
   - `Creating an optimized production build...`
   - `Compiled successfully`
   - `Build Completed` (몇 분 후)

## 문제 해결

### Framework Preset이 보이지 않는 경우:
- Settings → General 페이지에서
- "Build & Development Settings" 섹션이 보이지 않으면
- 프로젝트를 삭제하고 다시 import 해야 할 수 있습니다

### 여전히 404 오류가 발생하는 경우:
- Build Logs를 스크린샷으로 찍어서 공유해주세요
- 또는 Build Logs의 전체 내용을 복사해서 공유해주세요


