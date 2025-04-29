import { useState } from 'react';

export default <V>(inputValue: V, valuesConsideredEmpty: V[]) => {
  const [isEditing, setIsEditing] = useState(false);

  return {
    inputValue: !isEditing && valuesConsideredEmpty.includes(inputValue) ? '' : inputValue,
    inputProps: {
      onKeyDown: () => void setIsEditing(true),
      onBlur: () => void setIsEditing(false),
    },
  };
};
