import { faker } from '@faker-js/faker';
import type { Meta, StoryObj } from '@storybook/react';
import { userEvent, waitFor, within } from '@storybook/test';
import { ComponentProps, useEffect, useState } from 'react';
import styled from 'styled-components';

import Button from 'src/domains/misc/components/Button';
import { typography } from 'src/domains/styling/utils/tokens';

import Modal, { ModalProvider, useModal, useModalControls } from './';

faker.seed(0);

const MAX_PAGES = 10;

const LOREM_SENTENCES = Array.from({ length: MAX_PAGES }, () => faker.lorem.lines(4));
const LOREM_TITLES = Array.from({ length: MAX_PAGES }, () => faker.lorem.words({ min: 2, max: 5 }));

const meta = {
  decorators: [
    Story => (
      <ModalProvider>
        <Story />
      </ModalProvider>
    ),
  ],
} satisfies Meta<typeof Modal>;

export default meta;

type Story = StoryObj<ComponentProps<typeof Modal> & {
  pageCount: number,
}>;

export const Basic: Story = {
  parameters: {
    chromatic: { disableSnapshot: true },
  },
  render: () => <Preview pageCount={2} />,
  play: async () => {
    const canvas = within(document.body);

    const button = await canvas.findByRole('button');

    await waitFor(() => userEvent.click(button));
  },
};

export const Controllable: Story = {
  argTypes: {
    pageCount: {
      control: { type: 'range', min: 1, max: MAX_PAGES, step: 1 },
      description: 'Number of modal pages to show',
    },
  },
  parameters: {
    chromatic: { disableSnapshot: true },
  },
  args: {
    pageCount: 1,
    nonDismissible: false,
  },
  render: args => <Preview key={JSON.stringify(args)} {...args} />,
};

type ModalProps = { pageCount: number } & Partial<ComponentProps<typeof Modal>>;

const Preview = (props: ModalProps) => {
  const { open, close } = useModal();

  useEffect(() => {
    return () => void close();
  }, [close]);

  return (
    <Button onClick={() => void open(<Component {...props} />)} variant="primary">
      Open modal
    </Button>
  );
};

const Component = ({ pageCount, ...props }: ModalProps) => {
  const [page, setPage] = useState(0);

  const config = Array.from({ length: pageCount }, (_, i) => ({
    title: LOREM_TITLES[i],
    content: (
      <Content
        page={i}
        pageCount={pageCount}
        onContinue={() => void setPage(curr => curr + 1)}
      />
    ),
  }));

  return <Modal page={page} config={config} {...props} />;
};

const Content = ({
  onContinue,
  page,
  pageCount,
}: {
  onContinue?: () => void,
  page: number,
  pageCount: number,
}) => {
  const { close } = useModalControls();
  const isLastPage = page === pageCount - 1;
  return (
    <Wrapper>
      <p>{LOREM_SENTENCES[page]}</p>
      <ButtonWrapper>
        <Button variant="primary" onClick={isLastPage ? close : onContinue}>
          {isLastPage ? 'Close' : 'Continue'}
        </Button>
        <p>{page + 1}/{pageCount}</p>
      </ButtonWrapper>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  ${typography.web.body1};
`;

const ButtonWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px
`;
