import React from 'react';
import { FastField, FieldProps } from 'formik';
import { TextField } from '@mui/material';

interface ItemDescriptionFieldProps {
    index: number;
    inputRef: React.Ref<HTMLInputElement>;
    onKeyDown: React.KeyboardEventHandler<HTMLInputElement>;
    isMobile: boolean;
}

const ItemDescriptionField: React.FC<ItemDescriptionFieldProps> = React.memo(({ index, inputRef, onKeyDown }) => {
    return (
        <FastField name={`items[${index}].description`}>
            {({ field }: FieldProps) => (
                <TextField
                    sx={{ width: '100%' }}
                    id={`item-${index}-description`}
                    {...field}
                    label="Description"
                    inputRef={inputRef}
                    onKeyDown={onKeyDown}
                    size="small"
                />
            )}
        </FastField>
    );
});

export default ItemDescriptionField;
