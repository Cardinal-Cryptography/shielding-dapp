import { ComponentProps, ComponentType, FunctionComponent } from 'react';

/**
 * Turns a component accepting one prop into a component accepting another prop.
 *
 * @param Component The component to be wrapped, which accepts the prop to be transformed.
 * @param prop The prop which the output component is going to accept and which is going to be passed
 * to the input component's prop.
 * @param as A wrapped component's prop to which the output component's prop is going to be transformed to.
 */
export default <
  OutputComponentProp extends string,
  InputComponent extends FunctionComponent<any>, // eslint-disable-line @typescript-eslint/no-explicit-any
  InputComponentProps extends ComponentProps<InputComponent>,
  InputComponentProp extends keyof InputComponentProps,
  OutputComponentProps extends Omit<InputComponentProps, InputComponentProp> &
  Partial<Record<OutputComponentProp, string>>
>(
  Component: InputComponent,
  prop: InputComponentProp,
  as: OutputComponentProp,
): ComponentType<OutputComponentProps> =>
  ({ [as]: incomingPropValue, ...props }: OutputComponentProps) =>
  // @ts-expect-error TS2322: The props are assignable all right
    <Component {...{ ...props, [prop]: incomingPropValue }} />;
