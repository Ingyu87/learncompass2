# Root Directory "./" 문제 해결

## 문제
- Root Directory가 `./`로 설정되어 있고 수정 불가
- 이것이 "No Next.js version detected" 오류의 원인

## 원인 분석

### 가능한 원인들:
1. **GitHub 저장소 구조 문제**: `package.json`이 서브디렉토리에 있을 수 있음
2. **Vercel 프로젝트 설정 문제**: 프로젝트 생성 시 잘못된 Root Directory 설정
3. **GitHub 저장소 루트와 프로젝트 루트 불일치**

## 해결 방법

### 방법 1: GitHub 저장소 구조 확인 (가장 중요)

1. **GitHub에서 확인**:
   - `https://github.com/Ingyu87/learncompass`
   - `package.json` 파일이 **저장소 루트**에 있는지 확인
   - 만약 서브디렉토리에 있다면, 그것이 문제입니다

2. **현재 구조 확인**:
   ```
   learncompass/
   ├── package.json  ← 여기 있어야 함 (루트)
   ├── next.config.js
   ├── app/
   └── ...
   ```

3. **만약 package.json이 서브디렉토리에 있다면**:
   - 예: `learncompass/learningcompass-app/package.json`
   - 이 경우 Root Directory를 `learningcompass-app`으로 설정해야 함
   - 하지만 현재는 `./`로 되어 있어서 문제

### 방법 2: Vercel 프로젝트 재생성 (권장)

Root Directory가 수정 불가능하다면, 프로젝트를 재생성하는 것이 가장 확실합니다:

1. **환경 변수 백업**
   - Settings → Environment Variables에서 모든 값 복사

2. **프로젝트 삭제**
   - Settings → General → 맨 아래 "Delete Project"

3. **새 프로젝트 생성**
   - "Add New..." → "Project"
   - GitHub 저장소: "Ingyu87/learncompass"
   - **중요**: Root Directory를 **비워두기** (빈 값)
   - Framework Preset이 "Next.js"로 자동 감지되는지 확인
   - 환경 변수 다시 입력
   - "Deploy"

### 방법 3: GitHub 저장소 구조 수정

만약 `package.json`이 서브디렉토리에 있다면:

1. **로컬에서 확인**:
   ```bash
   # 현재 디렉토리 구조 확인
   ls -la
   # package.json 위치 확인
   ```

2. **GitHub에 푸시된 구조 확인**:
   - GitHub 저장소에서 파일 구조 확인
   - `package.json`이 어디에 있는지 확인

3. **필요시 파일 이동**:
   - 만약 서브디렉토리에 있다면, 루트로 이동
   - Git 커밋 및 푸시

---

## 확인 체크리스트

- [ ] GitHub 저장소에서 `package.json` 위치 확인
- [ ] `package.json`이 저장소 루트에 있는지 확인
- [ ] Vercel 프로젝트 재생성 고려
- [ ] Root Directory를 비워두고 프로젝트 재생성

---

## 예상 결과

프로젝트를 재생성하고 Root Directory를 비우면:
1. Vercel이 자동으로 프로젝트 루트에서 `package.json` 찾음
2. Next.js 자동 감지
3. 빌드 성공


