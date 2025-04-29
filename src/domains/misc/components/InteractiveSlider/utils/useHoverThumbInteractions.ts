import { motion } from 'framer-motion';
import { ComponentProps, MouseEventHandler, useState } from 'react';
import { isNullish } from 'utility-types';

type EventsListeners = Pick<ComponentProps<typeof motion.div>, 'onHoverStart' | 'onHoverEnd'> & {
  onMouseDown: MouseEventHandler<HTMLDivElement>,
  onMouseMove: MouseEventHandler<HTMLDivElement>,
  onMouseOut: MouseEventHandler<HTMLDivElement>,
};

export default () => {
  const [isHovering, setIsHovering] = useState(false);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [wasClickedSinceLastMovement, setWasClickedSinceLastMovement] = useState(false);
  const [hoverSnappedAtIndex, setHoverSnappedAtIndex] = useState<number | null>(null);
  const isHoverSnappedAtIndex = !isNullish(hoverSnappedAtIndex);

  const eventsListeners = {
    onMouseDown: () => {
      setIsMouseDown(true);

      // not using the "onMouseUp" because we need it to react also to mouse up outside of this element
      document.addEventListener('mouseup', () => {
        setIsMouseDown(false);
        setWasClickedSinceLastMovement(true);
      }, { once: true });
    },
    onMouseMove: () => {
      setWasClickedSinceLastMovement(false);
    },
    onMouseOut: () => void setHoverSnappedAtIndex(null),
    onHoverStart: () => void setIsHovering(true),
    onHoverEnd: () => void setIsHovering(false),
  } satisfies EventsListeners;
  const onAxisLabelClick = () => void setWasClickedSinceLastMovement(true);

  /*
    Show the hovering thumb when the pointer is hovering, but not when it's mouse-down at the same time,
    because then the tangible thumb starts following the pointer, so we'd end up with 2 pointers in the same place.
    One special case is right after the track is clicked, which causes the tangible thumb to move towards the clicked
    point - the hover thumb does not reappear, because it's redundant, as the tangible thumb is moving toward the
    point of click (that is until the pointer is not moved again, which indicates that user gets back to
    the "regular" hovering mode).
   */
  const isHoverThumbVisible = (isHovering || isHoverSnappedAtIndex) && !isMouseDown && !wasClickedSinceLastMovement;

  return {
    isHoverThumbVisible,
    eventsListeners,
    onAxisLabelClick,
    hoverSnappedAtIndex,
    setHoverSnappedAtIndex,
  };
};
