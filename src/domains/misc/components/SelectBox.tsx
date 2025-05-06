import * as RadixPopover from '@radix-ui/react-popover';
import { motion } from 'framer-motion';
import { Fragment, ReactElement, ReactNode, useState } from 'react';
import styled, { ThemeProvider } from 'styled-components';

import CIcon, { IconName } from 'src/domains/misc/components/CIcon';
import { boxShadows, typography } from 'src/domains/styling/utils/tokens';
import vars from 'src/domains/styling/utils/vars';

import Button from './Button';

type Option = {
  text: ReactNode,
  icon?: IconName,
  disabled?: boolean,
  rightSideEl?: ReactNode,
} & ({
  // onClose needs to be passed to modals onClose param, so that we can close the <SelectBox> automatically
  renderModal: (triggerElement: ReactElement, onClose: () => unknown) => ReactElement,
} | {
  onClick: () => unknown,
});

type Props = {
  align: 'start' | 'end' | 'center',
  children: ((isOpen: boolean) => ReactElement) | ReactElement,
  className?: string,
  onOpenChange?: (open: boolean) => void,
  checkMarkPosition?: 'left' | 'right',
  closeOnSelect?: boolean,
  sections: {
    title?: string,
    options: Option[],
    selectedIndex?: number,
  }[],
};
const SelectBox = ({
  children,
  sections,
  className,
  onOpenChange,
  align,
  checkMarkPosition = 'left',
  closeOnSelect = true,
}: Props) => {
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);

  const onChange = (state: boolean) => {
    if (hidden) {
      setOpen(true);
    } else {
      setOpen(state);
    }
    setHidden(false);
    onOpenChange?.(state);
  };

  return (
    <ThemeProvider theme={{ containerSidePadding: vars('--spacing-xxl') }}>
      <RadixPopover.Root onOpenChange={onChange} open={open}>
        <RadixPopover.Trigger asChild>
          {typeof children === 'function' ? children(open) : children}
        </RadixPopover.Trigger>
        <RadixPopover.Portal>
          <Content
            className={className}
            onOpenAutoFocus={e => void e.preventDefault()}
            hidden={hidden}
            side="bottom"
            align={align}
            sideOffset={8}
            collisionPadding={20}
          >
            {sections.map(({ title, options, selectedIndex }, sectionIndex) => (
              <Section key={sectionIndex}>
                {title && <Title>{title}</Title>}
                {options.map((option, optionIndex) => {
                  const renderButton = 'renderModal' in option ? option.renderModal : (renderValue: ReactElement) => (
                    closeOnSelect ? (
                      <RadixPopover.Close asChild>
                        {renderValue}
                      </RadixPopover.Close>
                    ) : (
                      renderValue
                    )
                  );
                  const onClick = () => {
                    if ('renderModal' in option) {
                    /**
                     * we can't close (unmount) <SplitBox> until the modal triggered from inside it is closed,
                     * because that would unmount the modal as well - hence we first hide it and wait for the modal to close and only then close <SplitBox> too
                     */
                      setHidden(true);
                      onOpenChange?.(false);
                    } else {
                      option.onClick();
                    }
                  };

                  return (
                    <Fragment key={optionIndex}>
                      {renderButton(
                        <StyledButton
                          size="medium"
                          variant={selectedIndex !== undefined ? 'secondary' : 'subtle'}
                          onClick={onClick}
                          disabled={!!option.disabled}
                        >
                          {checkMarkPosition === 'left' && selectedIndex !== undefined &&
                            <Checkmark icon="CheckmarkRegular" $active={selectedIndex === optionIndex} />}
                          {option.icon && <CIcon icon={option.icon} />}
                          {option.text}
                          {
                            option.rightSideEl ?? (checkMarkPosition === 'right' && selectedIndex !== undefined &&
                              <Checkmark icon="CheckmarkRegular" $active={selectedIndex === optionIndex} />)
                          }
                        </StyledButton>,
                        () => void setOpen(false),
                      )}
                    </Fragment>
                  );
                })}
              </Section>
            ))
            }
          </Content>
        </RadixPopover.Portal>
      </RadixPopover.Root>
    </ThemeProvider>
  );
};

export default SelectBox;

const Content = styled(motion(RadixPopover.Content))`
  width: fit-content;
  padding-inline: ${vars('--spacing-xs')};
  padding-block: 4px;
  border-radius: ${vars('--border-radius-s')};
  background: ${vars('--color-neutral-background-1-rest')};
  ${boxShadows.shadow16};
`;

const Section = styled.div`
  display: flex;
  flex-direction: column;
  
  &:not(:first-of-type) {
    margin-top: ${vars('--spacing-s')};

    border-top: 1px solid ${vars('--color-neutral-stroke-2-rest')};
  }
`;

const Checkmark = styled(CIcon)<{ $active: boolean }>`
  opacity: ${({ $active }) => $active ? 1 : 0};
`;

const StyledButton = styled(Button)`
  padding: ${vars('--spacing-s')};
  margin: 0;
  width: 100%;
  border: none;

  color: ${vars('--color-neutral-foreground-2-rest')};

  border-radius: ${vars('--border-radius-xs')};
  outline: none;

  ${typography.web.body1Strong};

  &:hover, &:active, &:focus, &:focus-visible, &:disabled  {
    border: none;
    outline: none;
  }

  &:disabled {
    background: transparent;
  }
`;

const Title = styled.div`
  margin-top: ${vars('--spacing-s')};
  padding-block: ${vars('--spacing-s')};
  padding-inline: 8px;
  ${typography.web.caption1Strong};
  color: ${vars('--color-neutral-foreground-3-rest')};
`;
