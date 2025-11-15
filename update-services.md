# Service Güncellemeleri

Tüm servislerde şu değişiklikleri yap:

## Import değişikliği:
```typescript
// ESKİ:
import { BACKEND_URL_WITH_WEBSITE_ID } from '../constants/base';
// veya
import { BACKEND_URL_WITH_WEBSITE_IDV2 } from '../constants/base';

// YENİ:
import { BACKEND_URL } from '../constants/base';
```

## useApi çağrısı değişikliği:

### V1 kullananlar için:
```typescript
// ESKİ:
const { get, post } = useApi({ baseUrl: BACKEND_URL_WITH_WEBSITE_ID });

// YENİ:
const { get, post } = useApi({ baseUrl: BACKEND_URL, useWebsiteId: true });
```

### V2 kullananlar için:
```typescript
// ESKİ:
const { get, post } = useApi({ baseUrl: BACKEND_URL_WITH_WEBSITE_IDV2 });

// YENİ:
const { get, post } = useApi({ baseUrl: BACKEND_URL, useWebsiteId: true, websiteVersion: 'v2' });
```

## Güncellenecek dosyalar:
- [x] auth.service.ts (YENİ YAPILDI - v2)
- [ ] vote.service.ts (v1)
- [ ] user.service.ts (v2)
- [ ] ticket.service.ts (v1)
- [ ] statistics.service.ts (v2)
- [ ] staff-form.service.ts (v1)
- [ ] server.service.ts (v1)
- [ ] report.service.ts (v1)
- [ ] redeem.service.ts (v1)
- [ ] punishment.service.ts (v1)
- [ ] product.service.ts (v1)
- [ ] posts.service.ts (v1)
- [ ] payment.service.ts
- [ ] marketplace.service.ts
- [ ] legal.service.ts
- [ ] helpcenter.service.ts
- [ ] forum.service.ts
- [ ] chest.service.ts
- [ ] category.service.ts
