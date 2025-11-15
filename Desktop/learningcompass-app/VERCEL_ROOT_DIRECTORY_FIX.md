# Vercel Root Directory 설정 가이드

## 오류 원인
"No Next.js version detected" 오류는 Vercel이 `package.json` 파일을 찾지 못해서 발생합니다.

## 해결 방법

### Vercel 대시보드에서 Root Directory 확인

1. **Vercel 대시보드** 접속
2. **프로젝트** 클릭
3. **Settings** → **General** 클릭
4. **Root Directory** 설정 확인

### Root Directory 설정

**올바른 설정:**
- Root Directory가 **비어있어야 합니다** (빈 값)
- 또는 **`.`** (점 하나만)

**잘못된 설정:**
- `/app`
- `/src`
- 다른 경로

### 확인 방법

1. GitHub 저장소에서 `package.json` 파일의 위치 확인
   - 현재 위치: 프로젝트 루트 (`/`)
   - 즉, `https://github.com/Ingyu87/learncompass/blob/main/package.json`

2. Vercel의 Root Directory가 이 위치와 일치하는지 확인

### 수정 방법

1. **Settings** → **General** 페이지로 이동
2. **Root Directory** 필드 찾기
3. 값이 있으면 **삭제** (비워두기)
4. **Save** 클릭
5. **재배포** (Deployments → 최신 배포 → Redeploy)

## 추가 확인 사항

### package.json 위치 확인
프로젝트 루트에 `package.json`이 있어야 합니다:
```
learningcompass-app/
├── package.json  ← 여기 있어야 함
├── next.config.js
├── app/
└── ...
```

### GitHub 저장소 구조 확인
GitHub에서 확인:
- `https://github.com/Ingyu87/learncompass`
- `package.json` 파일이 루트에 있는지 확인

## 다음 단계

1. Vercel Settings → General에서 **Root Directory** 확인
2. 비어있지 않으면 **삭제** (비워두기)
3. **Save** 클릭
4. **재배포**


