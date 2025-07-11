# Project Structure Proposals

## App Type & Focus
**App Type**: Security-focused Electron app specializing in end-to-end encryption, file/folder management, encryption and decryption operations.

## Electron App Structure
**Proposal**: Use **"Process-Separated Structure"** (Hybrid Vite-Electron)

```
my-electron-app/
├── src/           # Renderer Process (React)
├── electron/      # Main Process (Electron)
├── public/        # Static Assets
└── dist/          # Build Output
```

**Rationale**:
- ✅ Clear separation between frontend and Electron code
- ✅ Easy to maintain and scale
- ✅ Security-friendly (isolated processes)
- ✅ Developer-friendly (familiar React structure)

---

## Frontend Structure (src/)
**Proposal**: Use **"Feature-Scoped Layer Structure"** with self-contained features

```
src/
├── components/            # UI Layer
│   ├── ui/               # Base UI components (Button, Input)
│   ├── common/           # Composed components (ActionButton, FormButton)
│   ├── layout/           # Layout components (Header, Sidebar)
│   └── features/         # Feature-specific components
├── features/             # 🆕 Self-contained feature modules
│   ├── encryption/       # Encryption & decryption features
│   │   ├── components/   # Feature components
│   │   ├── hooks/        # Feature-specific hooks
│   │   ├── utils/        # Feature-specific utilities
│   │   ├── constants/    # Feature-specific constants
│   │   ├── contexts/     # Feature-specific contexts
│   │   ├── services/     # Feature services
│   │   ├── stores/       # Feature state management
│   │   ├── types/        # Feature types
│   │   └── index.ts      # Feature exports
│   ├── fileManager/      # File & folder management
│   ├── auth/             # Authentication & security
│   └── settings/         # App settings & preferences
├── shared/               # 🆕 Cross-feature shared code
│   ├── components/       # Shared UI components
│   ├── hooks/            # Shared hooks (useApi, useLocalStorage)
│   ├── utils/            # Shared utilities (dateUtils, formatters)
│   ├── constants/        # Global constants (API endpoints, themes)
│   ├── contexts/         # Global contexts (Theme, Notification)
│   ├── services/         # Shared services (apiClient, notification)
│   ├── stores/           # Global state management
│   └── types/            # Global types
├── stores/               # 🆕 Global state management (Zustand)
├── pages/                # Page components
└── assets/               # Images, fonts, etc.
```

**Rationale for Feature-Scoped**:
- ✅ Self-contained features with dedicated utils/hooks/constants
- ✅ Clear encapsulation for security features
- ✅ Easy to maintain and scale for complex applications
- ✅ Shared code only for truly cross-feature utilities

---

## Component Hierarchy Rules
**Proposal**: Component hierarchy based on abstraction levels

| Level | Mục đích | Ví dụ | Đặt ở đâu |
|-------|----------|-------|-----------|
| **Base** | Primitive, không logic | `Button`, `Input`, `Icon` | `components/ui/` |
| **Composed** | Kết hợp base + logic chung | `ActionButton`, `FormButton` | `components/common/` |
| **Layout** | Layout components | `Header`, `Sidebar`, `TitleBar` | `components/layout/` |
| **Feature** | Chỉ dùng trong 1 feature | `EncryptButton`, `FileCard` | `features/{feature}/components/` |

**Naming Convention**:
- **ui/**: Tên ngắn gọn (`Button`, `Input`)
- **common/**: Tên mô tả chức năng (`ActionButton`, `FormButton`)
- **layout/**: Tên layout (`Header`, `Sidebar`)
- **features/**: Tên có context feature (`EncryptionPanel`, `FileExplorer`)

**Import Pattern**:
```typescript
import { Button } from '@/components/ui/Button';                    // Base
import { ActionButton } from '@/components/common/ActionButton';    // Composed
import { EncryptButton } from '@/features/encryption/components';   // Feature-specific
import { useEncryption } from '@/features/encryption/hooks';        // Feature hooks
import { ENCRYPTION_CONSTANTS } from '@/features/encryption/constants'; // Feature constants
```

---

## Context Provider Organization
**Proposal**: Consolidate contexts into single files for simplicity

```
src/
├── features/
│   └── {feature}/
│       └── contexts/         # Feature-specific contexts
│           └── FeatureContext.tsx  # Context + Provider + Hook trong 1 file
├── shared/
│   ├── contexts/             # Global contexts
│   │   ├── ThemeContext.tsx        # Context + Provider + Hook
│   │   └── NotificationContext.tsx # Context + Provider + Hook
│   └── providers/            # Provider compositions
│       ├── AppProviders.tsx
│       └── FeatureProviders.tsx
```

**Context File Structure** (All-in-one):
```typescript
// features/auth/contexts/AuthContext.tsx
// 1. Context definition
// 2. Provider component
// 3. Custom hook
// 4. Export all
```

**Context Rules**:
- **Feature contexts**: `features/{feature}/contexts/FeatureContext.tsx`
- **Global contexts**: `shared/contexts/ContextName.tsx`
- **Provider composition**: `shared/providers/` (combine multiple providers)
- **All-in-one file**: Context + Provider + Hook trong cùng 1 file

---

## Global State Management
**Proposal**: Use **Zustand** for security-focused app

**Rationale for Zustand**:
- ✅ **Lightweight** - không bloat app
- ✅ **Memory management** tốt cho sensitive data
- ✅ **Easy to clear** sensitive state khi logout
- ✅ **TypeScript** support tốt
- ✅ **Security-friendly** - dễ implement auto-cleanup

**State Organization**:
```
stores/
├── securityStore.ts       # Master security state & encryption keys
├── encryptionStore.ts     # Encryption operations & progress
├── fileStore.ts           # File & folder management
├── auditStore.ts          # Security audit log
└── index.ts               # Store composition
```

**Security Best Practices**:
- ✅ Auto-clear sensitive data after timeout
- ✅ Selective persistence (chỉ non-sensitive data)
- ✅ Audit trail cho security operations
- ✅ Memory cleanup strategies

---

## Feature Structure Example
**Each feature would have the following structure**:
```
features/encryption/
├── components/           # UI components
├── hooks/               # useEncryption, useFileEncryption
├── utils/               # encryptionHelpers, cryptoUtils
├── constants/           # ENCRYPTION_ALGORITHMS, ERROR_MESSAGES
├── contexts/            # EncryptionContext, EncryptionProvider
├── services/            # encryptionService, keyManagement
├── stores/              # encryptionStore (feature-specific)
├── types/               # EncryptionOptions, CryptoKey types
└── index.ts             # Export all encryption stuff
```

---

## Electron Security Setup
**Proposal**: Use secure configuration

```javascript
// electron/main.js
webPreferences: {
  nodeIntegration: false,        // ✅ Security
  contextIsolation: true,        // ✅ Security
  enableRemoteModule: false,     // ✅ Security
  preload: path.join(__dirname, 'preload.js'), // ✅ Safe communication
}
```

---

## Development Tools
**Proposed Stack**:
- ✅ **Vite** for fast development
- ✅ **TypeScript** for type safety
- ✅ **Electron Builder** for packaging
- ✅ **Concurrently** for dev workflow
- ✅ **Zustand** for state management

---

## Security Considerations
- ✅ **Memory management** for sensitive data (encryption keys)
- ✅ **Auto-cleanup** of sensitive state
- ✅ **Audit logging** for security operations
- ✅ **Selective persistence** (avoid persisting sensitive data)
- ✅ **Context isolation** in Electron
- ✅ **Feature encapsulation** for security modules

---

## Discussion Points
- This structure is suitable for security-focused apps with complex encryption features
- Self-contained features help isolate security logic
- Zustand helps manage sensitive data safely
- Clear separation between UI, business logic, and security operations
- Can scale additional features without affecting existing code
- Consider team preferences and existing expertise
- Evaluate learning curve for new patterns

---

**Date**: 2025-07-09
**Status**: 📋 For Team Discussion
**Last Updated**: Added global state management, context organization, and security considerations
