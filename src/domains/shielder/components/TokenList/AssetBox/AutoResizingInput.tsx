import { ComponentProps, forwardRef, useLayoutEffect, useRef } from 'react';
import { mergeRefs } from 'react-merge-refs';
import { styled } from 'styled-components';

type Props = ComponentProps<'input'>;

/**
 * Adapts input's width to its content. The width is set through the "style" attribute.
 * The component renders an additional, invisible element along the <input>, from which it
 * measures the width that the <input> should have. The class names and styles of <input>
 * are passed to that element, but keep in mind that some CSS selectors (like `input`) might
 * not work as intended. Also, keep in mind that there is another element in the DOM when relying
 * on the <input>'s siblings.
 */
const AutoResizingInput = forwardRef<HTMLInputElement, Props>((props, passedRef) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const sizeReferenceRef = useRef<HTMLSpanElement>(null);
  const { value, placeholder } = props;

  useLayoutEffect(() => {
    if (!inputRef.current || !sizeReferenceRef.current) return;

    inputRef.current.style.width = `${sizeReferenceRef.current.getBoundingClientRect().width}px`;
  }, [value, placeholder]);

  const sizeReferenceElement = (
    <span
      ref={sizeReferenceRef}
      className={props.className}
      style={{ ...props.style, ...ghostStyles }}
    >
      {/* eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing */}
      {props.value || props.placeholder}
    </span>
  );

  return (
    <>
      <Input {...props} ref={mergeRefs([inputRef, passedRef])} />
      {sizeReferenceElement}
    </>
  );
});

export default AutoResizingInput;

const ghostStyles = {
  position: 'absolute',
  boxSizing: 'content-box',
  visibility: 'hidden',
  height: 0,
  overflow: 'clip',
  pointerEvents: 'none',
} as const;

const Input = styled.input`
  transition: opacity 250ms ease-in-out;

  font-feature-settings: 'ss01';
  
  &:disabled {
    opacity: 0.5;
  }
`;
