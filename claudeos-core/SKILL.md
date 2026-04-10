---
name: claudeos-core
description: 프로젝트 소스 코드를 분석하여 .claude/rules/와 표준 문서를 자동 생성합니다. 새 프로젝트 온보딩이나 기존 프로젝트에 Claude Code 규칙을 세팅할 때 사용합니다. 사용법: /claudeos-core [init|clean|health]
---

# ClaudeOS-Core — 프로젝트별 Claude Code 규칙 자동 생성

소스 코드를 실제로 읽어서 3-Pass 파이프라인(분석 → 병합 → 문서 생성)으로 `.claude/rules/`와 표준 문서를 자동 생성하는 스킬.

## 전제 조건

- Node.js 18+
- 프로젝트 루트에서 실행 (package.json, pubspec.yaml, requirements.txt 등이 있는 위치)
- Claude CLI 인증 완료 상태

## 사용법

### 1. 초기 생성 (`init` 또는 인자 없음)

프로젝트에 ClaudeOS-Core를 처음 적용할 때:

```
/claudeos-core
/claudeos-core init
```

**실행 단계:**

1. 기존 CLAUDE.md가 있으면 `CLAUDE.md.bak`으로 백업
2. `npx claudeos-core init --lang ko` 실행 (5~18분 소요)
3. 완료 후 불필요 디렉토리 정리 (guide/, skills/, mcp-guide/, database/)
4. 기존 CLAUDE.md 고유 내용 (커스텀 명령어, 파이프라인 등)을 새 CLAUDE.md에 병합
5. 삭제된 디렉토리 참조를 rules 및 CLAUDE.md에서 제거
6. 불필요 plan 파일 제거 (skills-master, guides-master)

**자동 정리 대상:**
- `claudeos-core/guide/` — 온보딩 가이드 (솔로/소규모 팀에 불필요)
- `claudeos-core/skills/` — CRUD 스캐폴딩 (기존 커스텀 스킬이 더 강력)
- `claudeos-core/mcp-guide/` — MCP 통합 문서
- `claudeos-core/database/` — DB 스키마 개요
- `claudeos-core/plan/30.frontend-skills-master.md` — skills plan
- `claudeos-core/plan/40.guides-master.md` — guides plan
- `.claude/rules/50.sync/03.skills-sync.md` — skills sync rule

### 2. 검증 (`health`)

생성된 문서가 코드와 동기화 상태인지 확인:

```
/claudeos-core health
```

**실행:**
```bash
cd <project-root> && npx claudeos-core health
```

### 3. 정리 (`clean`)

ClaudeOS-Core 생성물을 전부 제거하고 원상복구:

```
/claudeos-core clean
```

**실행 단계:**
1. 사용자에게 확인 요청 (되돌릴 수 없음)
2. `claudeos-core/` 디렉토리 전체 삭제
3. `.claude/rules/` 디렉토리 전체 삭제
4. `CLAUDE.md.bak`이 있으면 `CLAUDE.md`로 복원

## 핵심 동작 원칙

### 유지할 것
| 카테고리 | 역할 |
|----------|------|
| `.claude/rules/` (11개) | 코드 편집 시 자동 로드되는 규칙, `paths:` 프론트매터로 선택적 로딩 |
| `claudeos-core/standard/` (15개) | 상세 표준 문서, rules에서 Reference로 참조 |
| `claudeos-core/plan/` (3개) | standard/rules 동기화 추적 |
| `CLAUDE.md` | 기존 고유 내용 보존 + 생성 내용 병합 |

### 삭제할 것
guide/, skills/, mcp-guide/, database/ 및 관련 plan/sync 파일

### CLAUDE.md 병합 규칙
- 생성된 CLAUDE.md가 기존보다 상세하므로 생성본을 기반으로 사용
- 기존 CLAUDE.md에만 있던 고유 내용(Python 스크립트, 커스텀 명령어 등)을 새 파일에 추가
- 삭제된 디렉토리(skills 등) 참조 라인 제거

### Resume 지원
- 실행 중 API 에러로 실패하면 재실행 시 resume 프롬프트 표시
- "이어서 진행"(옵션 1)을 선택하면 완료된 Pass를 건너뛰고 이어서 실행
- `--force` 플래그로 처음부터 재시작 가능

## 지원 스택

| 카테고리 | 프레임워크 |
|----------|-----------|
| Backend | Java/Spring Boot, Kotlin, Node.js (Express, NestJS, Fastify), Python (Django, FastAPI) |
| Frontend | Next.js, Vue/Nuxt, Angular, React |
| Database | PostgreSQL, MySQL, Oracle, MongoDB, SQLite |
| ORM | MyBatis, JPA, Prisma, TypeORM, SQLAlchemy |

## 소요 시간 참고

| 프로젝트 규모 | 도메인 수 | Pass 1 예상 |
|---------------|----------|-------------|
| Small | 1~4 | ~5분 |
| Medium | 5~8 | ~8분 |
| Large | 9~16 | ~12분 |
| X-Large | 17+ | ~18분+ |

Pass 2(병합) + Pass 3(문서 생성) 추가 소요. 총 시간은 Pass 1의 1.5~2배.
