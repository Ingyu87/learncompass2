# 프로젝트 재생성 단계별 가이드

## 🔴 문제 원인
- Production Overrides에서 Framework가 "Other"로 고정됨
- 수정 불가능
- 이것이 404 오류의 근본 원인

## ✅ 해결: 프로젝트 재생성

---

## 1단계: 환경 변수 백업

### Vercel 대시보드에서:
1. **Settings** 탭 클릭
2. **Environment Variables** 클릭
3. 다음 7개 변수의 **Key**와 **Value**를 메모장에 복사:

```
1. NEXT_PUBLIC_FIREBASE_API_KEY
   값: your_firebase_api_key_here (Firebase Console에서 복사)

2. NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
   값: your-project.firebaseapp.com (Firebase Console에서 확인)

3. NEXT_PUBLIC_FIREBASE_PROJECT_ID
   값: your-project-id (Firebase Console에서 확인)

4. NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
   값: your-project.firebasestorage.app (Firebase Console에서 확인)

5. NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
   값: your_messaging_sender_id (Firebase Console에서 확인)

6. NEXT_PUBLIC_FIREBASE_APP_ID
   값: your_app_id (Firebase Console에서 확인)

7. GEMINI_API_KEY
   값: your_gemini_api_key_here (Google AI Studio에서 생성)
```

**중요**: 각 변수의 정확한 Key와 Value를 복사하세요!

---

## 2단계: 프로젝트 삭제

1. **Settings** 탭 클릭
2. **General** 클릭
3. 페이지 맨 아래로 스크롤
4. **"Delete Project"** 버튼 찾기
5. 클릭 후 확인

---

## 3단계: 새 프로젝트 생성

1. Vercel 대시보드 **메인 페이지**로 이동
2. **"Add New..."** 버튼 클릭 (보통 우측 상단)
3. **"Project"** 선택
4. GitHub 저장소 목록에서 **"Ingyu87/learncompass2"** 찾기
5. **"Import"** 버튼 클릭

---

## 4단계: 프로젝트 설정 확인 (매우 중요!)

프로젝트 생성 페이지에서 다음을 확인:

### Framework Preset
- ✅ **"Next.js"**로 자동 감지되어야 함
- ❌ 만약 "Other"로 되어 있다면 → 드롭다운에서 **"Next.js"** 선택

### Root Directory
- ✅ **비워두기** (빈 값, 아무것도 입력하지 않기)
- ❌ `./` 또는 다른 값 입력하지 않기

### Build and Output Settings
- Build Command: `npm run build` (자동 설정됨)
- Output Directory: **비워두기** (자동)
- Install Command: `npm install` (자동 설정됨)

---

## 5단계: 환경 변수 다시 입력

1. **"Environment Variables"** 섹션으로 스크롤
2. 백업한 7개 변수를 하나씩 추가:

   **각 변수마다:**
   - **Key** 필드에 변수 이름 입력
   - **Value** 필드에 값 입력
   - **Production**, **Preview**, **Development** 모두 체크
   - **"Add"** 버튼 클릭

3. 7개 변수 모두 추가 완료 후 확인

---

## 6단계: 배포

1. 모든 설정 확인
2. **"Deploy"** 버튼 클릭
3. 배포 진행 상황 확인

---

## ✅ 배포 성공 확인

배포가 완료되면:

1. **Deployments** 탭 클릭
2. 최신 배포 클릭
3. **Build Logs** 확인:
   - ✅ "Detected Next.js version: 14.2.0" 메시지
   - ✅ "Running npm run build" 메시지
   - ✅ "Build Completed" 메시지
   - ✅ 빌드 시간이 1-2분 (4초가 아님!)

4. 사이트 접속하여 404 오류가 해결되었는지 확인

---

## 📋 체크리스트

재생성 전:
- [ ] 환경 변수 7개 모두 메모장에 백업
- [ ] 프로젝트 삭제 준비 완료

재생성 중:
- [ ] Framework Preset이 "Next.js"로 설정됨
- [ ] Root Directory가 비어있음
- [ ] 환경 변수 7개 모두 추가됨

재생성 후:
- [ ] Build Logs에서 "Detected Next.js version" 확인
- [ ] 빌드 시간이 1-2분으로 증가
- [ ] 사이트가 정상 작동
- [ ] 404 오류 해결

---

## 🎯 예상 결과

프로젝트를 재생성하면:
- ✅ Production Overrides 문제 완전 해결
- ✅ Next.js가 올바르게 감지됨
- ✅ 빌드가 정상적으로 실행됨
- ✅ 404 오류 해결
- ✅ LearnCompass 앱이 정상 작동

---

**이것이 가장 확실한 해결 방법입니다! 단계별로 따라하시면 됩니다.**

