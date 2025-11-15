# Firebase Firestore 보안 규칙 설정

## 문제
콘솔에 `permission-denied` 오류가 발생하는 경우, Firestore 보안 규칙을 수정해야 합니다.

## 해결 방법

### 1. Firebase Console 접속
1. [Firebase Console](https://console.firebase.google.com/) 접속
2. 프로젝트 선택 (`learncompass-f176d`)
3. 왼쪽 메뉴에서 **"Firestore Database"** 클릭
4. 상단 탭에서 **"규칙"** 탭 클릭

### 2. 보안 규칙 수정

**개발 중 (테스트용):**
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

**또는 더 안전한 버전 (30일 테스트 모드):**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.time < timestamp.date(2025, 12, 31);
    }
  }
}
```

### 3. 규칙 게시
1. 규칙을 입력한 후 **"게시"** 버튼 클릭
2. 확인 메시지에서 **"게시"** 클릭

## 주의사항

⚠️ **테스트 모드 규칙은 개발 중에만 사용하세요!**
- 프로덕션 환경에서는 더 엄격한 규칙을 설정해야 합니다.
- 예: 사용자 인증 기반 규칙, 특정 필드 검증 등

## 프로덕션 규칙 예시 (나중에 사용)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /conversations/{conversationId} {
      // 읽기는 모두 허용 (교사 대시보드용)
      allow read: if true;
      
      // 쓰기는 특정 필드만 허용
      allow create: if request.resource.data.keys().hasAll([
        'student_name',
        'grade',
        'subject',
        'learning_objective',
        'question',
        'ai_response',
        'safety_status',
        'timestamp',
        'teacher_approved'
      ]);
      
      // 업데이트는 teacher_approved 필드만
      allow update: if request.resource.data.diff(resource.data).affectedKeys().hasOnly(['teacher_approved']);
    }
  }
}
```


