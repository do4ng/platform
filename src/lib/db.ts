import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
	'https://pvyvzfpfyqwdbjbxegzw.supabase.co',
	'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlhdCI6MTYzMjcxNTM1NSwiZXhwIjoxOTQ4MjkxMzU1fQ.Pdb-d7UmSDY5f3a1xtTUrivmx8nEhpsfXtA-6sw470Q'
);

export default supabase;
