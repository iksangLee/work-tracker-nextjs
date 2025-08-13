# CLAUDE.md

이 파일은 Claude Code(claude.ai/code)가 이 리포지토리에서 작업할 때 참고할 가이드라인을 제공합니다.

## 프로젝트 개요

Next.js 15로 구축된 출퇴근 시간 추적 Progressive Web App(PWA)입니다. 일일 근무 시간과 출석을 관리하며, 오프라인 기능과 한국어 인터페이스로 모바일 사용에 최적화되어 있습니다.

## 개발 명령어

```bash
# Turbopack을 사용한 개발 서버 시작
npm run dev

# 프로덕션 빌드
npm run build

# 프로덕션 서버 시작
npm start

# ESLint 실행
npm run lint
```

## 아키텍처

### 기술 스택
- **프레임워크**: Next.js 15 with App Router
- **UI**: TailwindCSS 4 with 커스텀 그라디언트 컴포넌트
- **상태 관리**: TanStack Query (React Query) for 서버 상태
- **PWA**: next-pwa with 포괄적인 서비스 워커 캐싱
- **저장소**: localStorage for 근무 기록 영속화
- **아이콘**: Lucide React

### 핵심 기능
- 자동 시간 계산과 함께하는 출퇴근 기능
- 주간 근무 시간 추적 및 통계
- PWA 캐싱 전략을 통한 완전한 오프라인 지원
- 모바일 디바이스에 최적화된 반응형 디자인
- ARIA 라벨과 키보드 내비게이션을 포함한 접근성 기능

### 디렉토리 구조
```
src/
├── app/                 # Next.js App Router 페이지
│   ├── layout.tsx      # PWA 및 Query 프로바이더가 포함된 루트 레이아웃
│   ├── page.tsx        # 홈 페이지 (출퇴근)
│   ├── records/        # 근무 기록 관리
│   ├── stats/          # 주간 통계
│   └── offline/        # 오프라인 폴백 페이지
├── components/
│   ├── layout/         # AppLayout, TabNavigation
│   ├── pages/          # 페이지별 컴포넌트
│   ├── providers/      # PWAProvider, QueryProvider
│   └── ui/             # 재사용 가능한 UI 컴포넌트
├── hooks/
│   └── useWorkRecord.ts # 메인 비즈니스 로직 훅
├── types/
│   └── work-record.ts  # TypeScript 타입 정의
└── utils/
    ├── storage.ts      # localStorage 래퍼
    └── pwa.ts          # PWA 설치 유틸리티
```

### 데이터 관리
- **저장소**: 모든 근무 기록은 비동기 래퍼를 사용하여 localStorage에 저장
- **상태**: TanStack Query가 데이터 패칭과 캐싱 관리
- **타입**: WorkRecord 인터페이스가 출퇴근 시간, 총 근무 시간 정의
- **비즈니스 로직**: useWorkRecord 훅이 모든 CRUD 연산과 계산 처리

### PWA 설정
앱은 광범위한 캐싱 전략과 함께 next-pwa 사용:
- **정적 자산**: 폰트, 이미지, Next.js 정적 파일의 1년 캐시
- **API 라우트**: 네트워크 우선 전략으로 1주일 캐시
- **외부 리소스**: Unsplash 이미지와 Google Fonts 캐시
- **오프라인 지원**: 폴백 기능이 포함된 커스텀 오프라인 페이지

### UI 패턴
- **BlurCard**: 백드롭 블러 효과가 있는 글래스모피즘 스타일 카드
- **GradientButton**: 주요 액션을 위한 커스텀 그라디언트 버튼
- **모바일 우선**: 터치 친화적 인터랙션을 포함한 반응형 디자인
- **접근성**: 포괄적인 ARIA 라벨, 스킵 링크, 키보드 내비게이션

### 로컬라이제이션
- **언어**: 한국어(ko-KR) 인터페이스와 한국어 시간 형식
- **날짜/시간**: 일관된 형식을 위한 한국어 로케일 사용
- **메타데이터**: 앱 스토어 최적화를 위한 한국어 설명

## 개발 가이드라인

### 새 기능 추가
1. 새로운 데이터 구조를 위해 `src/types/`에 TypeScript 인터페이스 생성
2. 새로운 비즈니스 로직을 위해 `useWorkRecord` 훅 확장
3. `src/components/ui/`에 재사용 가능한 UI 컴포넌트 생성
4. 접근성과 모바일 최적화를 위한 기존 패턴 따르기

### PWA 업데이트
- 서비스 워커 설정은 `next.config.ts`에 있음
- 새로운 외부 리소스 추가 시 캐싱 전략 업데이트
- 변경 후 오프라인 기능 테스트

### 테스트 명령어
특정 테스트 프레임워크는 설정되지 않음. 수동 테스트는 다음에 집중:
- PWA 설치 및 오프라인 기능
- 크로스 디바이스 반응형 동작
- 세션 간 데이터 영속성

### 코드 스타일
- TypeScript strict 모드 활성화
- Next.js 규칙이 포함된 ESLint 설정
- 글래스모피즘 효과를 위한 커스텀 유틸리티가 있는 Tailwind CSS
- 사용자 대상 텍스트는 한국어 문자열 사용