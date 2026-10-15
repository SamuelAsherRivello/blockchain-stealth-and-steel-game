## 1. Capability adapter and Items visibility

- [x] C083-T001 Add `hasAssetMintingSupport()` and `hasContractSupport()` to the game’s BIS adapter, delegating to BIS with conservative `false` behavior for unavailable or older adapters; verify true, false, and unavailable cases with focused account/adapter tests.
- [x] C083-T002 Gate the main-menu Items button on `hasItemSupport()` while preserving the existing inventory refresh, loading, empty-state, and disabled behavior once the button is visible; verify supported and unsupported UI cases.

## 2. Treasure and trophy visibility

- [x] C083-T003 Gate authored treasure chest and sensor creation on `hasContractSupport()` while preserving existing interaction readiness and failure handling; verify supported and unsupported level-runtime cases and confirm visibility evaluation does not initiate wallet operations.
- [x] C083-T004 Gate trophy buttons and trophy-related completion text on `hasAssetMintingSupport()` while preserving the existing trophy enabled, disabled, uncertain, and recovery logic once visible; verify supported and unsupported level-complete UI cases.

## 3. Verification

- [x] C083-T005 Run focused tests, `npm.cmd run typecheck:bis-contract`, the production build, and `git diff --check`; verify the live game at `http://127.0.0.1:5175/stealth-steel/` with each capability enabled and disabled, confirming Items, treasure, and trophy visibility plus the absence of visibility-only wallet operations.
