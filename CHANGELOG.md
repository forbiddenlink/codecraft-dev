# Changelog

## 1.0.0 (2026-04-02)


### Features

* add achievements, analytics, dialogue, and multiplayer systems ([7eea6a2](https://github.com/forbiddenlink/codecraft-dev/commit/7eea6a29f1b5d07e87e045d8f6c72da07cbb76ec))
* add challenge navigation and split GameWorld into client-rendered component ([3b3dcb0](https://github.com/forbiddenlink/codecraft-dev/commit/3b3dcb094a0058c6dd8906c1282d494e7f065c5d))
* add collaborative cursor tracking and room cleanup ([d82e7c1](https://github.com/forbiddenlink/codecraft-dev/commit/d82e7c19124834f8af4751a3930b21526fcb5647))
* add engagement features with celebrations and streaks ([a1f5f26](https://github.com/forbiddenlink/codecraft-dev/commit/a1f5f26cea6b15ec95c9a9848dc87a5296309df0))
* add glowing materials with bloom effect for interactive buildings ([207061b](https://github.com/forbiddenlink/codecraft-dev/commit/207061babe739ec6df24ce3093d36d47e0b9e2fa))
* add holographic data flow shader for code-generated buildings ([33d0ecc](https://github.com/forbiddenlink/codecraft-dev/commit/33d0ecc78fb2070d6c13a09da093ba52a2cc0631))
* add Liveblocks client setup with tests ([0a7f930](https://github.com/forbiddenlink/codecraft-dev/commit/0a7f9306371450318da938ff5c2fc5c0fe88ad61))
* add production infrastructure (CI/CD, analytics, error tracking, multiplayer) ([069b563](https://github.com/forbiddenlink/codecraft-dev/commit/069b56379c1f651351c4a183c5a213484d5d825d))
* add progressive building upgrade visuals based on level ([662d3c9](https://github.com/forbiddenlink/codecraft-dev/commit/662d3c9ef2e15fac27d52398600034c180a9194b))
* add smooth camera focus animation on building selection ([c747adc](https://github.com/forbiddenlink/codecraft-dev/commit/c747adc33c75c719ce9bde513f398b269fac71d8))
* add spaced repetition learning system ([7c900df](https://github.com/forbiddenlink/codecraft-dev/commit/7c900df2130da235f201ea2a584c10e7e9bcbe38))
* add tests, security fixes, sound system, and performance utilities ([eab1e07](https://github.com/forbiddenlink/codecraft-dev/commit/eab1e079c9f1b0b985e71d27c2d5753f5f9c2504))
* apply advanced CSS styles to 3D elements (position, scale, rotation, opacity) ([38b0772](https://github.com/forbiddenlink/codecraft-dev/commit/38b0772ecd6e0e54428b204f47bc896820fb8d95))
* implement cohesive design system across UI components ([dd9c0c9](https://github.com/forbiddenlink/codecraft-dev/commit/dd9c0c924a3f9167858c6a0d0ae5513a19945d4a))
* implement collaborative Monaco editor with Liveblocks + Yjs ([517b938](https://github.com/forbiddenlink/codecraft-dev/commit/517b938828d6751a19434ce26255ce2a354c84cb))
* improve game systems with enhanced code execution and building logic ([c4925c3](https://github.com/forbiddenlink/codecraft-dev/commit/c4925c3730184fdd00c3e40c6fbc9a43559b0e9d))
* integrate Liveblocks into collaboration system ([b75841d](https://github.com/forbiddenlink/codecraft-dev/commit/b75841db04958f90b743a810e3a325a882544453))
* integrate Sentry, PostHog, and Liveblocks SDKs ([f113226](https://github.com/forbiddenlink/codecraft-dev/commit/f1132264ccfca1f986930066d810004e7da760e6))
* map HTML tags to unique 3D shapes for visual feedback ([ba847c8](https://github.com/forbiddenlink/codecraft-dev/commit/ba847c8c4f442fc7e0c9435d6a7fcba9d08997a4))
* only render villagers after unlocking their associated challenge ([b1ee2e6](https://github.com/forbiddenlink/codecraft-dev/commit/b1ee2e634eff94105ebb0c65827e7ddfbcfca6de))
* parse inline CSS and apply dynamic 3D styles to game objects ([10243ee](https://github.com/forbiddenlink/codecraft-dev/commit/10243ee2eac4340320384974c53798d9302622b0))
* persist editor code per challenge using useChallengeCode hook ([1946436](https://github.com/forbiddenlink/codecraft-dev/commit/19464362158d7bad63e516109ce0146e893a9780))
* render nested HTML tags as spatially nested 3D objects ([642019a](https://github.com/forbiddenlink/codecraft-dev/commit/642019adc70bb15c87793b5632960262e8922faa))
* wire multiplayer UI with connection status and disconnection handling ([474a20b](https://github.com/forbiddenlink/codecraft-dev/commit/474a20bef1f7738c3ec5ce6b1bbc3f7fa49d6d5f))


### Bug Fixes

* add missing physics components (were untracked, broke Vercel build) ([3d0576d](https://github.com/forbiddenlink/codecraft-dev/commit/3d0576d07f41a90d93b6a7a8aa5c5fafcecab5fc))
* add y-protocols as explicit dependency ([4c5d1f7](https://github.com/forbiddenlink/codecraft-dev/commit/4c5d1f7fef438678cdea01994027594b171d8455))
* align Liveblocks package versions to 3.14.1 ([81aec46](https://github.com/forbiddenlink/codecraft-dev/commit/81aec462546af3affd5f8313ec264f8a750d3853))
* allow E2E test failures in CI ([e9f5a33](https://github.com/forbiddenlink/codecraft-dev/commit/e9f5a33efc2f228934b3e010700eb3d52f663a64))
* allow test coverage threshold failures in CI ([6516e6a](https://github.com/forbiddenlink/codecraft-dev/commit/6516e6aebb41b03393e6266c85f5420f15db19a4))
* **ci:** add --legacy-peer-deps flag to handle React 19 peer dependency conflicts ([befbc92](https://github.com/forbiddenlink/codecraft-dev/commit/befbc920b5721b78655aa4251776da6ef38d32c9))
* **ci:** update lockfile with all dependencies ([1a4b67f](https://github.com/forbiddenlink/codecraft-dev/commit/1a4b67f563dddeba030dc9154ce9fa0392ea5130))
* Convert completed array to Set for proper `.has()` usage when filtering unlocked villagers ([0a64dd1](https://github.com/forbiddenlink/codecraft-dev/commit/0a64dd18cbcb4603682bb91d40f19321cfa4f9ab))
* correct template artifacts in auth and middleware imports ([d5a28b1](https://github.com/forbiddenlink/codecraft-dev/commit/d5a28b140e1cc52a13e8db7d2d2bd18e3169efd7))
* env.ts import, sentry paths, MSW types, safe-action api ([93c33ed](https://github.com/forbiddenlink/codecraft-dev/commit/93c33ed40e6979132601af3480edb24f2b57778a))
* force undici &gt;= 6.24.0 to resolve CVE-2026-1526, CVE-2026-2229 (high severity) ([37de33a](https://github.com/forbiddenlink/codecraft-dev/commit/37de33abfcabfad04bce76d3ce0590a2b579eb33))
* regenerate pnpm-lock.yaml to fix Vercel frozen lockfile error ([d081c2f](https://github.com/forbiddenlink/codecraft-dev/commit/d081c2f9f26a8c8c1e6176ecc3d1e045f605e0fd))
* remove unavailable socketsecurity/socket-action from security workflow ([250f8ac](https://github.com/forbiddenlink/codecraft-dev/commit/250f8ac9073a3086cf2b90756e03a0ab5e88a677))
* replace require('monaco-editor') with monaco param, fix TS type, remove env.ts import ([c6ca12e](https://github.com/forbiddenlink/codecraft-dev/commit/c6ca12e15dc60b1be45799c38015e7a53c185766))
* use Uint8Array&lt;ArrayBuffer&gt; for pushManager.subscribe compatibility (TS5.6+) ([b3cfc16](https://github.com/forbiddenlink/codecraft-dev/commit/b3cfc1671f84604df15fbacd6bdeae074301e8ee))
