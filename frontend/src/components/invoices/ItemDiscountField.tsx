// src/components/invoices/ItemDiscountField.tsx

import React, { useCallback } from 'react';
import { useField } from 'formik';
import NumericTextField from '../common/NumericTextField';

interface ItemDiscountFieldProps {
    index: number;
    inputRef: React.Ref<HTMLInputElement>;
    focusElementById: (id: string) => void;
    totalItems: number;
    insert: (index: number, value: any) => void;
}

const ItemDiscountField: React.FC<ItemDiscountFieldProps> = React.memo(({ index, inputRef, focusElementById, totalItems, insert }) => {
    const [field, , helpers] = useField(`items[${index}].discount_percentage`);

    const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLInputElement>) => {
        const input = event.target as HTMLInputElement;
        const { selectionStart, selectionEnd, value } = input;

        if (event.key === 'ArrowLeft') {
            if (selectionStart === 0 && selectionEnd === 0) {
                event.preventDefault();
                focusElementById(`item-${index}-unit_price`);
            }
        } else if (event.key === 'ArrowRight') {
            if (selectionStart === value.length && selectionEnd === value.length) {
                event.preventDefault();
                // Add new item if at the end
                if (index === totalItems - 1) {
                    insert(index + 1, {
                        description: '',
                        quantity: 1,
                        unit_price: 0,
                        discount_percentage: 0,
                        subitems: []
                    });
                    setTimeout(() => {
                        focusElementById(`item-${index + 1}-description`);
                    }, 0);
                } else {
                    focusElementById(`item-${index + 1}-description`);
                }
            }
        } else if (event.key === 'Enter') {
            event.preventDefault();
            insert(index + 1, {
                description: '',
                quantity: 1,
                unit_price: 0,
                discount_percentage: 0,
                subitems: []
            });
            setTimeout(() => {
                focusElementById(`item-${index + 1}-description`);
            }, 0);
        } else if (event.key === 'ArrowDown') {
            event.preventDefault();
            focusElementById(`item-${index + 1}-discount_percentage`);
        } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            if (index > 0) {
                focusElementById(`item-${index - 1}-discount_percentage`);
            }
        }
    }, [index, totalItems, focusElementById, insert]);

    return (
        <NumericTextField
            id={`item-${index}-discount_percentage`}
            label="Discount (%)"
            placeholder={`${field.value}`}
            value={field.value}
            onChange={(e) => helpers.setValue(Number(e.target.value))}
            onKeyDown={handleKeyDown}
            inputRef={inputRef}
            sx={{ width: '10%' }}
            slotProps={{ inputLabel: { shrink: true } }}
            endAdornment="%"
            size='small'
        />
    );
});

export default ItemDiscountField;
