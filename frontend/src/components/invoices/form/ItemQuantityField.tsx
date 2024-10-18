import React, { useCallback } from 'react';
import { useField } from 'formik';
import NumericTextField from '../../common/NumericTextField';

interface ItemQuantityFieldProps {
    index: number;
    inputRef: React.Ref<HTMLInputElement>;
    focusElementById: (id: string) => void;
}

const ItemQuantityField: React.FC<ItemQuantityFieldProps> = React.memo(({ index, inputRef, focusElementById }) => {
    const [field, , helpers] = useField(`items[${index}].quantity`);

    const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLInputElement>) => {
        const input = event.target as HTMLInputElement;
        const { selectionStart, selectionEnd, value } = input;

        if (event.key === 'ArrowLeft') {
            if (selectionStart === 0 && selectionEnd === 0) {
                event.preventDefault();
                focusElementById(`item-${index}-description`);
            }
        } else if (event.key === 'ArrowRight') {
            if (selectionStart === value.length && selectionEnd === value.length) {
                event.preventDefault();
                focusElementById(`item-${index}-unit_price`);
            }
        } else if (event.key === 'Enter') {
            event.preventDefault();
            focusElementById(`item-${index}-unit_price`);
        } else if (event.key === 'ArrowDown') {
            event.preventDefault();
            focusElementById(`item-${index + 1}-quantity`);
        } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            if (index > 0) {
                focusElementById(`item-${index - 1}-quantity`);
            }
        }
    }, [index, focusElementById]);

    return (
        <NumericTextField
            id={`item-${index}-quantity`}
            label="Quantity"
            placeholder={`${field.value}`}
            value={field.value}
            onChange={(e) => helpers.setValue(Number(e.target.value))}
            onKeyDown={handleKeyDown}
            inputRef={inputRef}
            sx={{ width: '8%' }}
            slotProps={{ inputLabel: { shrink: true } }}
            size='small'
        />
    );
});

export default ItemQuantityField;