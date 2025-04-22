import { PostHogConfig } from 'posthog-js';
import { PostHogProvider as PostHodProviderInitial } from 'posthog-js/react';
import { ReactNode } from 'react';

import { useWallet } from 'src/domains/chains/components/WalletProvider';

type Props = {
  children: ReactNode,
};

const PostHogProvider = ({ children }: Props) => {
  const { address } = useWallet();

  const posthogOptions: Partial<PostHogConfig> = {
    api_host: import.meta.env.PUBLIC_VAR_POSTHOG_HOST,
    persistence: 'memory',
    bootstrap: {
      distinctID: address ?? 'anonymous',
    },
    disable_session_recording: !address,
  };

  return (
    <PostHodProviderInitial apiKey={import.meta.env.PUBLIC_VAR_POSTHOG_KEY} options={posthogOptions}>
      {children}
    </PostHodProviderInitial>
  );
};

export default PostHogProvider;
