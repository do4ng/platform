import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
	'https://sqlyyrbnygivtlqxumub.supabase.co',
	'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlhdCI6MTYzOTEzOTEzNiwiZXhwIjoxOTU0NzE1MTM2fQ.7FhCRi4IiODZivrBnTKfhRVYEjkLBpZ0ubhcCj1nVyI'
);

export default supabase;
