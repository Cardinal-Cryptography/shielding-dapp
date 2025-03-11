import { Preview } from '@storybook/react';

import Providers from '../src/domains/common/providers/Providers';

// TODO: Add after chromatic setup
// MotionGlobalConfig.skipAnimations = isChromatic();

const preview = {
  parameters: {
    layout: 'centered',
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    viewport: {
      viewports: {
        mobile: { name: 'Mobile', styles: { width: '360px', height: '640px' }},
        desktop: { name: 'Desktop', styles: { width: '1920px', height: '1080px' }},
      },
    },
  },
  globalTypes: {
    theme: {
      description: 'Global theme for components',
      toolbar: {
        title: 'Theme',
        icon: 'mirror',
        items: ['light', 'dark'],
        dynamicTitle: true,
      },
    },
  },
  decorators: [
    Story => <Providers><Story /></Providers>,
  ],
} satisfies Preview;

export default preview;
