import { PostHogConfig } from 'posthog-js';
import { PostHogProvider as PostHodProviderInitial } from 'posthog-js/react';
import { ReactNode } from 'react';

type Props = {
  children: ReactNode,
};

const WALLET_REGEX = /0x[a-fA-F0-9]{40}/g;

// eslint-disable-next-line @stylistic/comma-dangle
const sanitizeAddresses = <T,>(input: T): T => {
  if (typeof input === 'string') {
    return input.replace(WALLET_REGEX, '<<sanitized address>>') as T;
  }

  if (Array.isArray(input)) {
    return input.map(sanitizeAddresses) as T;
  }

  if (typeof input === 'object' && input !== null) {
    return Object.fromEntries(
      Object.entries(input).map(([key, value]) => [key, sanitizeAddresses(value)])
    ) as T;
  }

  return input;
};

const PostHogProvider = ({ children }: Props) => {
  const posthogOptions: Partial<PostHogConfig> = {
    api_host: import.meta.env.PUBLIC_VAR_POSTHOG_HOST,
    persistence: 'memory',
    before_send: event => {
      if (!event) return null;

      return {
        ...event,
        properties: sanitizeAddresses(event.properties),
      };
    },
  };

  return (
    <PostHodProviderInitial apiKey={import.meta.env.PUBLIC_VAR_POSTHOG_KEY} options={posthogOptions}>
      {children}
    </PostHodProviderInitial>
  );
};

export default PostHogProvider;
