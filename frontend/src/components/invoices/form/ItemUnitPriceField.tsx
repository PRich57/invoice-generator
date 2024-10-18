import React, { useCallback } from 'react';
import { useField } from 'formik';
import NumericTextField from '../../common/NumericTextField';

interface ItemUnitPriceFieldProps {
    index: number;
    inputRef: React.Ref<HTMLInputElement>;
    focusElementById: (id: string) => void;
    isMobile: boolean;
}

const ItemUnitPriceField: React.FC<ItemUnitPriceFieldProps> = React.memo(({ index, inputRef, focusElementById, isMobile }) => {
    const [field, , helpers] = useField(`items[${index}].unit_price`);

    const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLInputElement>) => {
        const input = event.target as HTMLInputElement;
        const { selectionStart, selectionEnd, value } = input;

        if (event.key === 'ArrowLeft') {
            if (selectionStart === 0 && selectionEnd === 0) {
                event.preventDefault();
                focusElementById(`item-${index}-quantity`);
            }
        } else if (event.key === 'ArrowRight') {
            if (selectionStart === value.length && selectionEnd === value.length) {
                event.preventDefault();
                focusElementById(`item-${index}-discount_percentage`);
            }
        } else if (event.key === 'Enter') {
            event.preventDefault();
            focusElementById(`item-${index}-discount_percentage`);
        } else if (event.key === 'ArrowDown') {
            event.preventDefault();
            focusElementById(`item-${index + 1}-unit_price`);
        } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            if (index > 0) {
                focusElementById(`item-${index - 1}-unit_price`);
            }
        }
    }, [index, focusElementById]);

    return (
        <NumericTextField
            id={`item-${index}-unit_price`}
            label="Unit Price"
            placeholder={`${field.value}`}
            value={field.value}
            onChange={(e) => helpers.setValue(Number(e.target.value))}
            onKeyDown={handleKeyDown}
            inputRef={inputRef}
            sx={{ width: '100%' }}
            slotProps={{ inputLabel: { shrink: true } }}
            startAdornment="$"
            size="small"
        />
    );
});

export default ItemUnitPriceField;