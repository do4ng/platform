## Set Database

[supabase](https://supabase.com)를 사용합니다.

Supabase 프로젝트를 생성한 뒤,  
`src/lib/db.dev.ts`를 생성합니다.

```ts
import { createClient } from '@supabase/supabase-js';

const supabase = createClient('{YOUR-PROJECT-URL}', '{YOUR-DATABASE-PRIVATE-KEY}');

export default supabase;
```

다음, `src/lib/db.ts`를 생성합니다.

```ts
import { createClient } from '@supabase/supabase-js';

const supabase = createClient('{YOUR-PROJECT-URL}', '{YOUR-DATABASE-PUBLIC-KEY}');

export default supabase;
```
