# Vercel 배포 체크리스트

## ✅ 완료된 항목

- [x] GitHub 저장소 연결
- [x] 환경 변수 설정
  - [x] NEXT_PUBLIC_FIREBASE_API_KEY
  - [x] NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
  - [x] NEXT_PUBLIC_FIREBASE_PROJECT_ID
  - [x] NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
  - [x] NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
  - [x] NEXT_PUBLIC_FIREBASE_APP_ID
  - [x] GEMINI_API_KEY

## 다음 단계

### 1. 배포 상태 확인
- Vercel 대시보드 → Deployments 탭
- 최신 배포의 상태 확인:
  - ✅ Ready: 배포 완료
  - ⏳ Building: 빌드 중
  - ❌ Error: 오류 발생 (로그 확인 필요)

### 2. 배포 URL 확인
- 배포가 완료되면 배포된 URL 확인
- 예: `learncompass-xxx.vercel.app`
- 또는 커스텀 도메인 설정 가능

### 3. 테스트
배포된 사이트에서 다음을 확인:
- [ ] 메인 페이지 로드
- [ ] 학생 학습 탭 동작
- [ ] 교사 관리 탭 동작
- [ ] Firebase 연결 확인
- [ ] Gemini API 응답 확인

### 4. 문제 해결

#### 404 오류가 계속 발생하는 경우:
1. **빌드 로그 확인**
   - Deployments → 최신 배포 → Build Logs
   - 오류 메시지 확인

2. **환경 변수 확인**
   - 첫 번째 변수 이름이 "EXT_PUBLIC_FIREBASE_API_KEY"로 보이는데
   - "NEXT_PUBLIC_FIREBASE_API_KEY"로 정확히 설정되어 있는지 확인
   - 앞에 "N"이 빠지지 않았는지 확인

3. **재배포**
   - 환경 변수 수정 후 "Redeploy" 클릭
   - 또는 새 커밋 푸시

### 5. Firebase 보안 규칙 확인
- Firebase Console → Firestore Database → Rules
- 다음 규칙이 설정되어 있는지 확인:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /conversations/{conversationId} {
      allow read, write: if true;
    }
  }
}
```

## 배포 완료 후

배포가 성공하면:
1. 배포된 URL로 접속 테스트
2. 학생/교사 기능 모두 테스트
3. Firebase 데이터 저장 확인
4. Gemini API 응답 확인

문제가 있으면 Vercel 대시보드의 Build Logs를 확인하세요!

