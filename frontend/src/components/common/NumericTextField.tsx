// NumericTextField.tsx
import React, { useState, forwardRef } from 'react';
import TextField, { TextFieldProps } from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';

interface NumericTextFieldProps extends Omit<TextFieldProps, 'onChange' | 'ref'> {
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  startAdornment?: React.ReactNode;
  endAdornment?: React.ReactNode;
}

const NumericTextField = forwardRef<HTMLInputElement, NumericTextFieldProps>((props, ref) => {
  const {
    value: initialValue,
    onChange,
    onKeyDown,
    startAdornment,
    endAdornment,
    slotProps = {},
    slots = {},
    ...otherProps
  } = props;

  const [value, setValue] = useState<string>(initialValue as string || '');

  const handleInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;

    if (/^\d*\.?\d*$/.test(newValue)) {
      setValue(newValue);
      if (onChange) {
        onChange(event);
      }
    }
  };

  return (
    <TextField
      {...otherProps}
      value={value}
      onChange={handleInput}
      onKeyDown={onKeyDown}
      slotProps={{
        ...slotProps,
        input: {
          ...slotProps.input,
          ref: ref,
          inputMode: 'decimal',
        },
        ...(startAdornment && {
          adornmentStart: {
            children: startAdornment,
          },
        }),
        ...(endAdornment && {
          adornmentEnd: {
            children: endAdornment,
          },
        }),
      }}
      slots={{
        ...slots,
        ...(startAdornment && { adornmentStart: InputAdornment }),
        ...(endAdornment && { adornmentEnd: InputAdornment }),
      }}
    />
  );
});

export default NumericTextField;
