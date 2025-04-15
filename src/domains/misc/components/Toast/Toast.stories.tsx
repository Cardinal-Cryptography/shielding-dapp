import { faker } from '@faker-js/faker';
import { useMountEffect } from '@react-hookz/web';
import { action } from '@storybook/addon-actions';
import { Meta, StoryObj } from '@storybook/react';
import { userEvent, waitFor, within } from '@storybook/test';
import { ComponentProps } from 'react';
import styled from 'styled-components';

import { allModes } from '../../../../../.storybook/modes';

import Toast from './Toast';
import ToastsProvider, { useToast } from './ToastsProvider';
import { STATUS_ICONS_DATA } from './consts';

const meta = {
  component: Toast,
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/Hxk6JqTHnWwLaxsxvEZPtN/Common-Design-System?type=design&node-id=8557-227520',
    },
  },
} satisfies Meta<typeof Toast>;

export default meta;

faker.seed(0);

const STATUSES = Object.keys(STATUS_ICONS_DATA);

export const Configurable: StoryObj<ComponentProps<typeof Toast> & {
  containerWidth: number,
  headerActionLabel: string,
  bodyActionsLabels: string,
  paused: boolean,
  autoDismiss: boolean,
}> = {
  parameters: {
    chromatic: { disableSnapshot: true },
  },
  args: {
    title: faker.lorem.sentence(2),
    status: 'success',
    subtitle: faker.lorem.sentence(4),
    body: faker.lorem.sentence(8),
    creationTimestamp: Date.now(),
    onDismiss: action('dismissed'),
    headerActionLabel: 'Action',
    bodyActionsLabels: 'Cancel,Dismiss',
    autoDismiss: true,
    ttlMs: 5000,
    paused: false,
  },
  argTypes: {
    status: {
      control: 'select',
      options: STATUSES,
    },
    autoDismiss: {
      name: 'Auto dismiss',
      control: { type: 'boolean' },
    },
    ttlMs: {
      control: { type: 'number', min: 1, step: 1 },
      if: { arg: 'autoDismiss' },
    },
    creationTimestamp: {
      control: 'date',
    },
    containerWidth: {
      name: 'Container width',
      control: {
        type: 'range',
        min: 50,
        max: 1000,
        step: 5,
      },
    },
    onDismiss: { table: { disable: true }},
    headerActionLabel: {
      name: 'Header action',
    },
    bodyActionsLabels: {
      name: 'A comma-separated list of body actions',
    },
    paused: {
      name: 'Is progressbar paused',
      control: 'boolean',
    },
    headerAction: { table: { disable: true }},
    bodyActions: { table: { disable: true }},
  },
  render: ({ containerWidth, headerActionLabel, bodyActionsLabels, ...args }) => {
    const headerAction = headerActionLabel ? {
      label: headerActionLabel,
      onClick: action(`header action "${headerActionLabel}" clicked`),
    } : undefined;

    const bodyActions = (bodyActionsLabels || '').split(',').filter(Boolean).map(label => ({
      label,
      onClick: action(`body action "${label}" clicked`),
    }));

    return (
      <div style={{ width: containerWidth }}>
        <Toast key={args.ttlMs} {...args} headerAction={headerAction} bodyActions={bodyActions} />
      </div>
    );
  },
};

export const Variants: StoryObj<Record<string, never>> = {
  parameters: {
    chromatic: {
      modes: {
        light: allModes.light,
        dark: allModes.dark,
      },
    },
  },
  render: () => {
    faker.seed(0);

    const toastsData = [{
      status: 'success',
      title: 'Long title but no action, cause it wouldn\'t look good',
      onDismiss: action('dismissed'),
    }, {
      status: 'success',
      title: 'Minimal',
    }, {
      title: 'Short title',
      status: 'warning',
      body: '...but with action',
      headerAction: {
        label: 'Action',
        onClick: action('header action clicked'),
      },
      onDismiss: action('dismissed'),
    }, {
      title: 'Test toast 🎉',
      status: 'information',
      subtitle: faker.lorem.sentence(3),
      body: faker.lorem.sentence(8),
    }, {
      title: 'With progress bar',
      status: 'error',
      bodyActions: [{
        label: 'Cancel',
        onClick: action('body action clicked'),
      },{
        label: 'Dismiss',
        onClick: action('body action clicked'),
      }],
      ttlMs: 1000,
      paused: true,
    }, {
      title: 'All features',
      status: 'error',
      subtitle: faker.lorem.sentence(3),
      body: faker.lorem.sentence(8),
      onDismiss: action('dismissed'),
      headerAction: {
        label: 'Action',
        onClick: action('header action clicked'),
      },
      bodyActions: [{
        label: 'Cancel',
        onClick: action('body action clicked'),
      },{
        label: 'Dismiss',
        onClick: action('body action clicked'),
      }],

    }] satisfies Partial<ComponentProps<typeof Toast>>[];

    return (
      <ComponentGrid style={{ gridTemplateColumns: `repeat(${Math.round(Math.sqrt(toastsData.length))}, 292px)` }}>
        {toastsData.map((toastData, i) => (
          <Toast
            key={i}
            creationTimestamp={faker.date.past({ refDate: '2023-10-04T00:00:00.000Z' }).getTime()}
            {...toastData}
          />
        ))}
      </ComponentGrid>
    );
  },
};

const ComponentGrid = styled.div`
  display: grid;
  align-items: start;
  gap: 40px;
  width: 100%;
`;

export const Stacked: StoryObj<Record<string, never>> = {
  parameters: {
    controls: { exclude: /.*/ },
  },
  render: args => {
    return (
      <ToastsProvider {...args} ttlMs={0}>
        <Toaster interactive={false} />
      </ToastsProvider>
    );
  },
};

export const SpreadOut: StoryObj<Record<string, never>> = {
  parameters: {
    controls: { exclude: /.*/ },
  },
  render: args => {
    return (
      <ToastsProvider {...args} ttlMs={0}>
        <Toaster interactive={false} />
      </ToastsProvider>
    );
  },
  play: async () => {
    const canvas = within(document.body);

    const [toast] = await canvas.findAllByTitle(/toast/i);

    await waitFor(() => userEvent.hover(toast));
  },
};

export const AnimationMechanics: StoryObj<
  Pick<ComponentProps<typeof ToastsProvider>, 'ttlMs'> &
  { autoDismiss: boolean }
> = {
  args: {
    autoDismiss: true,
    ttlMs: 5000,
  },
  argTypes: {
    ttlMs: {
      control: { type: 'number', min: 1, step: 1 },
      if: { arg: 'autoDismiss' },
    },
    autoDismiss: {
      name: 'Auto dismiss',
      control: { type: 'boolean' },
    },
  },
  parameters: {
    chromatic: { disableSnapshot: true },
    controls: { include: ['ttlMs', 'Auto dismiss'] },
  },
  render: args => (
    <ToastsProvider {...args}>
      <Toaster />
    </ToastsProvider>
  ),
};

const Toaster = ({ interactive = true }: { interactive?: boolean }) => {
  const { showToast } = useToast();

  const addToast = () => {
    showToast({
      title: faker.lorem.sentence(({ min: 2, max: 4 })),
      status: faker.helpers.arrayElement(STATUSES),
      body: faker.lorem.sentence({ min: 1, max: 12 }),
    });
  };

  useMountEffect(() => {
    faker.seed(0);

    addToast();
    addToast();
    addToast();
    addToast();
    addToast();
  });

  return interactive ? <button onClick={addToast}>Add toast</button> : null;
};
