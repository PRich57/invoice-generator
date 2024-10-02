import React, { useState, forwardRef } from 'react';
import TextField, { TextFieldProps } from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';

interface NumericTextFieldProps extends Omit<TextFieldProps, 'onChange'> {
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
    slotProps,
    ...otherProps
  } = props;

  const [value, setValue] = useState<string>(initialValue as string || '');

  const handleInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    
    // Allow digits and one decimal point, but no negative numbers
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
      inputRef={ref}
      slotProps={{
        ...slotProps,
        input: {
          ...slotProps?.input,
          inputMode: 'decimal',
          startAdornment: startAdornment ? (
            <InputAdornment position="start">{startAdornment}</InputAdornment>
          ) : undefined,
          endAdornment: endAdornment ? (
            <InputAdornment position="end">{endAdornment}</InputAdornment>
          ) : undefined,
        },
      }}
    />
  );
});

export default NumericTextField;