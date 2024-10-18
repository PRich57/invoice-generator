import React from 'react';
import { useField } from 'formik';
import { TextField } from '@mui/material';

interface ItemDescriptionFieldProps {
    index: number;
    inputRef: React.Ref<HTMLInputElement>;
    onKeyDown: React.KeyboardEventHandler<HTMLInputElement>;
    isMobile: boolean;
}

const ItemDescriptionField: React.FC<ItemDescriptionFieldProps> = React.memo(({ index, inputRef, onKeyDown, isMobile }) => {
    const [field] = useField(`items[${index}].description`);
    return (
        <TextField
            sx={{ width: '100%' }}
            id={`item-${index}-description`}
            {...field}
            label="Description"
            inputRef={inputRef}
            onKeyDown={onKeyDown}
            size="small"
        />
    );
});

export default ItemDescriptionField;