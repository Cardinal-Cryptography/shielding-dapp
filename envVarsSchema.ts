import * as z from 'zod';

const url = z.string().url();

export default z.object({
  PUBLIC_VAR_REOWN_PROJECT_ID: z.string(),
  PUBLIC_VAR_OG_IMAGE_URL: url.optional(),
});
