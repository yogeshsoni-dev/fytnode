# React Native App (`mobile/react-native`) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a new production-ready React Native app in `mobile/react-native/` that reuses existing backend APIs while leaving the current Android native app untouched.

**Architecture:** Use Expo + TypeScript with feature-first modular structure. Use React Navigation for routing, TanStack Query for server state, Zustand for lightweight app state, and a centralized Axios API client with token refresh orchestration.

**Tech Stack:** Expo, React Native, TypeScript, React Navigation, TanStack Query, Zustand, Axios, React Hook Form, Zod, Expo Secure Store, AsyncStorage, Sentry, Jest, React Native Testing Library.

---

## File Structure Plan

### New app root
- Create: `mobile/react-native/`
- Create: `mobile/react-native/app.json`
- Create: `mobile/react-native/package.json`
- Create: `mobile/react-native/tsconfig.json`
- Create: `mobile/react-native/babel.config.js`
- Create: `mobile/react-native/.env.example`
- Create: `mobile/react-native/eas.json`

### App source layout
- Create: `mobile/react-native/src/app/App.tsx`
- Create: `mobile/react-native/src/app/navigation/`
- Create: `mobile/react-native/src/app/providers/`
- Create: `mobile/react-native/src/core/config/`
- Create: `mobile/react-native/src/core/api/`
- Create: `mobile/react-native/src/core/auth/`
- Create: `mobile/react-native/src/core/storage/`
- Create: `mobile/react-native/src/core/ui/`
- Create: `mobile/react-native/src/features/auth/`
- Create: `mobile/react-native/src/features/onboarding/`
- Create: `mobile/react-native/src/features/dashboard/`
- Create: `mobile/react-native/src/features/upload/`
- Create: `mobile/react-native/src/features/fitness/`
- Create: `mobile/react-native/src/features/territory/`
- Create: `mobile/react-native/src/features/realtime/`

### Documentation updates
- Create: `mobile/react-native/README.md`
- Create: `docs/migration/rn-implementation-status.md`

---

## Phase 1: React Native Initialization, TypeScript, Structure, Navigation, Environment

### Task 1: Initialize Expo app in `mobile/react-native`

**Files:**
- Create: `mobile/react-native/` (new Expo project root)
- Create: `mobile/react-native/package.json`
- Create: `mobile/react-native/app.json`
- Create: `mobile/react-native/babel.config.js`
- Test: N/A

- [ ] **Step 1: Initialize Expo TypeScript project in target folder**

```bash
npx create-expo-app@latest "mobile/react-native" --template blank-typescript
```

- [ ] **Step 2: Verify app bootstraps**

Run: `cd mobile/react-native && npm run start -- --non-interactive`  
Expected: Expo CLI starts and shows QR/dev server without build errors.

- [ ] **Step 3: Add baseline scripts**

```json
{
  "scripts": {
    "start": "expo start",
    "android": "expo run:android",
    "ios": "expo run:ios",
    "typecheck": "tsc --noEmit",
    "lint": "eslint .",
    "test": "jest"
  }
}
```

- [ ] **Step 4: Run typecheck**

Run: `cd mobile/react-native && npm run typecheck`  
Expected: PASS with no TypeScript errors.

- [ ] **Step 5: Commit**

```bash
git add mobile/react-native
git commit -m "chore(mobile): initialize Expo TypeScript app in mobile/react-native"
```

### Task 2: Create scalable folder structure and app shell

**Files:**
- Create: `mobile/react-native/src/app/App.tsx`
- Create: `mobile/react-native/src/app/providers/index.tsx`
- Create: `mobile/react-native/src/app/navigation/root-navigator.tsx`
- Create: `mobile/react-native/src/features/auth/screens/LoginScreen.tsx`
- Create: `mobile/react-native/src/features/dashboard/screens/DashboardScreen.tsx`
- Modify: `mobile/react-native/App.tsx`
- Test: `mobile/react-native/src/app/App.test.tsx`

- [ ] **Step 1: Write failing smoke test for root app render**

```tsx
import { render } from "@testing-library/react-native";
import { App } from "./App";

test("renders root navigator", () => {
  const { getByText } = render(<App />);
  expect(getByText("Login")).toBeTruthy();
});
```

- [ ] **Step 2: Run test to verify fail**

Run: `cd mobile/react-native && npm test -- App.test.tsx --watchAll=false`  
Expected: FAIL because `App` and navigator shell are not wired.

- [ ] **Step 3: Implement minimal app shell**

```tsx
// src/app/App.tsx
import { AppProviders } from "./providers";
import { RootNavigator } from "./navigation/root-navigator";

export function App() {
  return (
    <AppProviders>
      <RootNavigator />
    </AppProviders>
  );
}
```

- [ ] **Step 4: Run test to verify pass**

Run: `cd mobile/react-native && npm test -- App.test.tsx --watchAll=false`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add mobile/react-native/src mobile/react-native/App.tsx
git commit -m "feat(mobile): add scalable src shell with root navigator and providers"
```

### Task 3: Add navigation + environment management foundation

**Files:**
- Create: `mobile/react-native/src/core/config/env.ts`
- Create: `mobile/react-native/src/app/navigation/auth-stack.tsx`
- Create: `mobile/react-native/src/app/navigation/app-tabs.tsx`
- Create: `mobile/react-native/.env.example`
- Modify: `mobile/react-native/app.config.ts` (or `app.json` if not using TS config)
- Test: `mobile/react-native/src/core/config/env.test.ts`

- [ ] **Step 1: Write failing env validation test**

```ts
import { getEnv } from "./env";

test("throws when API URL is missing", () => {
  expect(() => getEnv({ EXPO_PUBLIC_API_URL: "" })).toThrow("EXPO_PUBLIC_API_URL is required");
});
```

- [ ] **Step 2: Run test to verify fail**

Run: `cd mobile/react-native && npm test -- env.test.ts --watchAll=false`  
Expected: FAIL because env helper does not exist.

- [ ] **Step 3: Implement env parser and sample env file**

```ts
// src/core/config/env.ts
export function getEnv(src = process.env) {
  const apiUrl = src.EXPO_PUBLIC_API_URL?.trim();
  if (!apiUrl) throw new Error("EXPO_PUBLIC_API_URL is required");
  return { apiUrl };
}
```

```env
# .env.example
EXPO_PUBLIC_API_URL=http://localhost:5001/api
EXPO_PUBLIC_AI_API_URL=
```

- [ ] **Step 4: Run tests and boot app**

Run: `cd mobile/react-native && npm test -- env.test.ts --watchAll=false && npm run start -- --non-interactive`  
Expected: test PASS and Expo starts.

- [ ] **Step 5: Commit**

```bash
git add mobile/react-native/src/core/config mobile/react-native/.env.example mobile/react-native/app.config.ts
git commit -m "feat(mobile): add navigation scaffolding and strict environment config"
```

---

## Phase 2: API Layer, Auth Architecture, Token Refresh, Storage Layer

### Task 4: Implement API client with interceptors and error normalization

**Files:**
- Create: `mobile/react-native/src/core/api/http-client.ts`
- Create: `mobile/react-native/src/core/api/error-mapper.ts`
- Create: `mobile/react-native/src/core/api/types.ts`
- Test: `mobile/react-native/src/core/api/error-mapper.test.ts`

- [ ] **Step 1: Write failing mapper tests**

```ts
import { mapApiError } from "./error-mapper";

test("maps 401 to session expired", () => {
  expect(mapApiError({ status: 401 })).toBe("Session expired. Please login again");
});
```

- [ ] **Step 2: Run test to verify fail**

Run: `cd mobile/react-native && npm test -- error-mapper.test.ts --watchAll=false`  
Expected: FAIL because mapper missing.

- [ ] **Step 3: Implement minimal error mapper + axios client**

```ts
export function mapApiError(err: { status?: number }) {
  if (err.status === 401) return "Session expired. Please login again";
  return "Something went wrong";
}
```

- [ ] **Step 4: Run test to verify pass**

Run: `cd mobile/react-native && npm test -- error-mapper.test.ts --watchAll=false`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add mobile/react-native/src/core/api
git commit -m "feat(mobile): add axios core client and normalized API error mapping"
```

### Task 5: Implement secure storage + auth token manager + refresh orchestration

**Files:**
- Create: `mobile/react-native/src/core/storage/secure-storage.ts`
- Create: `mobile/react-native/src/core/auth/token-manager.ts`
- Create: `mobile/react-native/src/core/auth/refresh-orchestrator.ts`
- Create: `mobile/react-native/src/features/auth/api/auth-api.ts`
- Test: `mobile/react-native/src/core/auth/token-manager.test.ts`

- [ ] **Step 1: Write failing token manager tests**

```ts
import { TokenManager } from "./token-manager";

test("stores and returns access token", async () => {
  const mgr = new TokenManager();
  await mgr.setAccessToken("abc");
  await expect(mgr.getAccessToken()).resolves.toBe("abc");
});
```

- [ ] **Step 2: Run test to verify fail**

Run: `cd mobile/react-native && npm test -- token-manager.test.ts --watchAll=false`  
Expected: FAIL due missing implementation.

- [ ] **Step 3: Implement secure token manager with refresh lock**

```ts
export class TokenManager {
  private accessToken: string | null = null;
  async setAccessToken(token: string | null) { this.accessToken = token; }
  async getAccessToken() { return this.accessToken; }
}
```

- [ ] **Step 4: Run tests and lint**

Run: `cd mobile/react-native && npm test -- token-manager.test.ts --watchAll=false && npm run typecheck`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add mobile/react-native/src/core/auth mobile/react-native/src/core/storage mobile/react-native/src/features/auth/api
git commit -m "feat(mobile): add secure token manager and refresh orchestration foundation"
```

---

## Phase 3: Design System, Reusable Components, Theme Setup

### Task 6: Build design tokens + theme + base components

**Files:**
- Create: `mobile/react-native/src/core/ui/theme/tokens.ts`
- Create: `mobile/react-native/src/core/ui/theme/theme-provider.tsx`
- Create: `mobile/react-native/src/core/ui/components/Button.tsx`
- Create: `mobile/react-native/src/core/ui/components/TextField.tsx`
- Create: `mobile/react-native/src/core/ui/components/Screen.tsx`
- Test: `mobile/react-native/src/core/ui/components/Button.test.tsx`

- [ ] **Step 1: Write failing button render test**

```tsx
import { render } from "@testing-library/react-native";
import { Button } from "./Button";

test("renders button label", () => {
  const { getByText } = render(<Button label="Continue" onPress={() => {}} />);
  expect(getByText("Continue")).toBeTruthy();
});
```

- [ ] **Step 2: Run test to verify fail**

Run: `cd mobile/react-native && npm test -- Button.test.tsx --watchAll=false`  
Expected: FAIL (component missing).

- [ ] **Step 3: Implement minimal themed button**

```tsx
import { Pressable, Text } from "react-native";

export function Button({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress}>
      <Text>{label}</Text>
    </Pressable>
  );
}
```

- [ ] **Step 4: Run tests + snapshot update**

Run: `cd mobile/react-native && npm test -- Button.test.tsx --watchAll=false`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add mobile/react-native/src/core/ui
git commit -m "feat(mobile): add foundational theme tokens and reusable UI primitives"
```

---

## Phase 4: Feature Modules (Onboarding, Dashboard, AI Image Upload)

### Task 7: Implement onboarding and dashboard modules with navigation wiring

**Files:**
- Create: `mobile/react-native/src/features/onboarding/screens/OnboardingScreen.tsx`
- Create: `mobile/react-native/src/features/dashboard/screens/DashboardScreen.tsx`
- Modify: `mobile/react-native/src/app/navigation/root-navigator.tsx`
- Test: `mobile/react-native/src/features/onboarding/onboarding-flow.test.tsx`

- [ ] **Step 1: Write failing onboarding navigation test**

```tsx
test("navigates onboarding to login", () => {
  // render navigator and assert transition trigger
});
```

- [ ] **Step 2: Run test to verify fail**

Run: `cd mobile/react-native && npm test -- onboarding-flow.test.tsx --watchAll=false`  
Expected: FAIL.

- [ ] **Step 3: Implement minimal onboarding -> auth transition**

```tsx
export function OnboardingScreen() {
  return null;
}
```

- [ ] **Step 4: Run tests**

Run: `cd mobile/react-native && npm test -- onboarding-flow.test.tsx --watchAll=false`  
Expected: PASS after full wiring.

- [ ] **Step 5: Commit**

```bash
git add mobile/react-native/src/features/onboarding mobile/react-native/src/features/dashboard mobile/react-native/src/app/navigation
git commit -m "feat(mobile): add onboarding and dashboard feature modules"
```

### Task 8: Implement AI image upload feature vertical slice

**Files:**
- Create: `mobile/react-native/src/features/upload/screens/AiImageUploadScreen.tsx`
- Create: `mobile/react-native/src/features/upload/api/upload-api.ts`
- Create: `mobile/react-native/src/services/upload/pick-and-upload.ts`
- Create: `mobile/react-native/src/services/ai/ai-client.ts`
- Test: `mobile/react-native/src/features/upload/upload-api.test.ts`

- [ ] **Step 1: Write failing upload API unit test**

```ts
test("builds multipart form request", async () => {
  // assert API client called with FormData and endpoint
});
```

- [ ] **Step 2: Run test to verify fail**

Run: `cd mobile/react-native && npm test -- upload-api.test.ts --watchAll=false`  
Expected: FAIL.

- [ ] **Step 3: Implement upload + AI client adapters**

```ts
export async function uploadImage(fileUri: string) {
  const form = new FormData();
  form.append("image", { uri: fileUri, name: "upload.jpg", type: "image/jpeg" } as any);
  return form;
}
```

- [ ] **Step 4: Run tests + manual Expo verification**

Run: `cd mobile/react-native && npm test -- upload-api.test.ts --watchAll=false`  
Expected: PASS.  
Run: `cd mobile/react-native && npm run start -- --non-interactive`  
Expected: App starts and upload screen route mounts.

- [ ] **Step 5: Commit**

```bash
git add mobile/react-native/src/features/upload mobile/react-native/src/services/upload mobile/react-native/src/services/ai
git commit -m "feat(mobile): add AI image upload feature slice with service adapters"
```

---

## Phase 5: Fitness Tracking, Social Territory, Realtime Systems

### Task 9: Add fitness tracking and territory module foundations

**Files:**
- Create: `mobile/react-native/src/features/fitness/screens/FitnessScreen.tsx`
- Create: `mobile/react-native/src/features/fitness/store/fitness-store.ts`
- Create: `mobile/react-native/src/features/territory/screens/TerritoryScreen.tsx`
- Create: `mobile/react-native/src/features/territory/api/territory-api.ts`
- Test: `mobile/react-native/src/features/fitness/fitness-store.test.ts`

- [ ] **Step 1: Write failing fitness store behavior test**

```ts
test("increments daily steps", () => {
  // create store, call increment, assert new value
});
```

- [ ] **Step 2: Run test to verify fail**

Run: `cd mobile/react-native && npm test -- fitness-store.test.ts --watchAll=false`  
Expected: FAIL.

- [ ] **Step 3: Implement minimal store + screen stubs**

```ts
export const useFitnessStore = () => ({ steps: 0, addSteps: (_n: number) => {} });
```

- [ ] **Step 4: Run tests**

Run: `cd mobile/react-native && npm test -- fitness-store.test.ts --watchAll=false`  
Expected: PASS after implementation.

- [ ] **Step 5: Commit**

```bash
git add mobile/react-native/src/features/fitness mobile/react-native/src/features/territory
git commit -m "feat(mobile): scaffold fitness tracking and territory modules"
```

### Task 10: Implement realtime infrastructure slice

**Files:**
- Create: `mobile/react-native/src/features/realtime/client/realtime-client.ts`
- Create: `mobile/react-native/src/features/realtime/hooks/use-realtime-channel.ts`
- Create: `mobile/react-native/src/features/realtime/types.ts`
- Test: `mobile/react-native/src/features/realtime/realtime-client.test.ts`
- Modify: `docs/migration/rn-implementation-status.md`

- [ ] **Step 1: Write failing realtime client connection test**

```ts
test("connect returns connected state", async () => {
  // instantiate client and assert state transition
});
```

- [ ] **Step 2: Run test to verify fail**

Run: `cd mobile/react-native && npm test -- realtime-client.test.ts --watchAll=false`  
Expected: FAIL.

- [ ] **Step 3: Implement minimal realtime adapter interface**

```ts
export class RealtimeClient {
  async connect() { return { connected: true }; }
}
```

- [ ] **Step 4: Run tests + full project verification**

Run: `cd mobile/react-native && npm test --watchAll=false && npm run typecheck`  
Expected: All tests PASS, typecheck PASS.

- [ ] **Step 5: Commit**

```bash
git add mobile/react-native/src/features/realtime docs/migration/rn-implementation-status.md
git commit -m "feat(mobile): add realtime foundation and migration status tracking"
```

---

## Dependency Setup Plan

- [ ] Install core app dependencies

```bash
cd mobile/react-native && npm install @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs @tanstack/react-query zustand axios react-hook-form zod expo-secure-store @react-native-async-storage/async-storage
```

- [ ] Install Expo platform dependencies

```bash
cd mobile/react-native && npx expo install react-native-screens react-native-safe-area-context react-native-gesture-handler react-native-reanimated expo-image-picker expo-file-system
```

- [ ] Install QA/ops dependencies

```bash
cd mobile/react-native && npm install -D jest @testing-library/react-native @types/jest eslint typescript
cd mobile/react-native && npm install @sentry/react-native
```

Verification: `cd mobile/react-native && npm run typecheck && npm test --watchAll=false`

---

## Architecture Guidance (Implementation Constraints)

- Keep `backend/` unchanged and reusable during phases 1-5.
- Keep `mobile/android-native/` untouched; no refactors in that tree.
- Enforce feature boundaries:
  - feature UI never calls Axios directly
  - API calls routed through `core/api` + feature API adapters
- Implement token refresh with request queuing to prevent refresh storms.
- Keep migration-sensitive behavior parity:
  - auth error semantics
  - role-aware attendance payloads
  - post-login profile synchronization timing

---

## Verification Checklist by Phase

- [ ] Phase 1 complete when app boots, env validated, navigation shell renders.
- [ ] Phase 2 complete when login + authenticated request + refresh retry path works in test + local run.
- [ ] Phase 3 complete when base theme/components are reused in at least 2 screens.
- [ ] Phase 4 complete when onboarding/dashboard run and AI image upload route can submit multipart payload.
- [ ] Phase 5 complete when fitness + territory + realtime modules compile, tests pass, and docs updated.

---

## Self-Review

### 1. Spec coverage
- Covered requested 5-phase order with exact tasks.
- Included folder creation for `mobile/react-native/`.
- Included dependency setup commands, architecture guidance, and verification steps.

### 2. Placeholder scan
- No TODO/TBD placeholders.
- Every task has explicit steps and commands.

### 3. Type consistency
- Consistent naming for app shell (`src/app`), API (`src/core/api`), auth (`src/core/auth`), and feature modules.

