# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

React 컴포넌트 생성기는 AI 프롬프트를 입력하면 즉시 React 컴포넌트를 생성하고 실시간으로 미리보기할 수 있는 UI 워크벤치입니다. Anthropic Claude 또는 Google Gemini를 선택하여 사용할 수 있습니다.

## 개발 명령어

```bash
# 의존성 설치 (Bun 사용)
bun install

# 개발 모드 실행 (API 서버 + 프론트엔드 동시 실행)
bun run dev

# API 서버만 실행 (watch mode)
bun run server

# TypeScript 컴파일 + Vite 빌드
bun run build

# ESLint 실행
bun run lint

# 빌드된 앱 미리보기
bun run preview
```

프론트엔드는 `http://localhost:5173`에서 실행되고, API 서버는 `http://localhost:3002`에서 실행됩니다.

## 아키텍처

### 구조

- **Frontend** (`src/`): React 19 + TypeScript + Vite
  - `App.tsx` - 메인 레이아웃, provider 선택/API 키 상태 관리
  - `hooks/useComponentGenerator.ts` - API 호출과 생성된 컴포넌트 목록 상태 관리 로직 분리
  - `components/LivePreview.tsx` - react-live로 생성된 JSX 코드를 브라우저에서 직접 실행

- **Backend** (`server/index.ts`): Bun 서버
  - `/api/config` GET 엔드포인트 - .env에 설정된 API 키 확인
  - `/api/generate` POST 엔드포인트 - 컴포넌트 코드 생성
  - 두 가지 AI 제공자 지원: Anthropic, Google Gemini

### 통신 흐름

1. 사용자가 프롬프트를 입력하고 생성 버튼을 클릭
2. 프론트엔드에서 `/api/generate` POST 요청 (프롬프트, API 키, provider)
3. 백엔드에서 선택된 AI 제공자의 API 호출
4. AI가 생성한 코드를 정제하여 반환
5. 프론트엔드에서 react-live를 사용하여 코드 실시간 렌더링

## 코드 생성 규칙

**System Prompt** (`server/index.ts`에 정의)에서 생성된 컴포넌트는 반드시 다음을 따릅니다:

- **JavaScript만 사용** - TypeScript 문법 금지 (타입 어노테이션 없음)
- **Import 불가** - React는 전역 스코프에서 사용 가능
- **Inline styles만** - CSS imports/modules 사용 불가
- **render() 호출 필수** - 컴포넌트 정의 후 `render(<ComponentName />);` 호출 필수
- **자체 포함** - 외부 의존성 없는 완전히 자립적인 컴포넌트
- **반응형** - 가능하면 interactive 요소 추가 (hover, click 등)

예시:
```javascript
const GradientButton = () => {
  const [hovered, setHovered] = React.useState(false);
  
  return (
    <button style={{ /* inline styles */ }} 
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}>
      Click me
    </button>
  );
};

render(<GradientButton />);
```

## API 키 처리

1. **.env 설정** (선택사항) - `ANTHROPIC_API_KEY` 또는 `GOOGLE_API_KEY`
2. **UI 입력** - 사용자가 직접 입력하면 .env 키 무시
3. **환경 변수 확인** - 서버의 `/api/config` 엔드포인트에서 .env 키 존재 여부 반환

## 주요 구현 세부사항

- **react-live 스코프**: 생성된 컴포넌트는 react-live 런타임 환경에서 실행되며, React가 전역으로 사용 가능
- **코드 정제**: `stripCodeFences()` - 마크다운 펜스 제거, `ensureRenderCall()` - render 호출 누락 시 자동 추가 (컴포넌트 이름 자동 감지)
- **CORS**: 서버에서 모든 응답에 와일드카드 CORS 헤더 포함 (개발용)

## 프로비더별 API 스펙

### Anthropic Claude
- 모델: `claude-haiku-4-5-20251001`
- Max tokens: 4096
- API 엔드포인트: `https://api.anthropic.com/v1/messages`

### Google Gemini
- 모델: `gemini-2.5-flash`
- Max tokens: 8192
- API 엔드포인트: `https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent`
