import React, { useCallback } from 'react';
import { FastField, FieldProps } from 'formik';
import NumericTextField from '../../common/NumericTextField';

interface ItemQuantityFieldProps {
    index: number;
    inputRef: React.Ref<HTMLInputElement>;
    focusElementById: (id: string) => void;
    isMobile: boolean;
}

const ItemQuantityField: React.FC<ItemQuantityFieldProps> = React.memo(({ index, inputRef, focusElementById }) => {
    const handleKeyDown = useCallback(
        (event: React.KeyboardEvent<HTMLInputElement>) => {
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
                    focusElementById(`item-${index}-discount_percentage`);
                }
            } else if (event.key === 'Enter') {
                event.preventDefault();
                focusElementById(`item-${index}-discount_percentage`);
            } else if (event.key === 'ArrowDown') {
                event.preventDefault();
                focusElementById(`item-${index + 1}-quantity`);
            } else if (event.key === 'ArrowUp') {
                event.preventDefault();
                if (index > 0) {
                    focusElementById(`item-${index - 1}-quantity`);
                }
            }
        },
        [index, focusElementById]
    );

    return (
        <FastField name={`items[${index}].quantity`}>
            {({ field, form }: FieldProps) => (
                <NumericTextField
                    id={`item-${index}-quantity`}
                    label="Quantity"
                    placeholder="1.00"
                    value={field.value === 1 ? '' : field.value}
                    onChange={(e) => {
                        const newValue = e.target.value === '' ? 1 : Number(e.target.value);
                        form.setFieldValue(field.name, newValue);
                    }}
                    onKeyDown={handleKeyDown}
                    inputRef={inputRef}
                    sx={{ width: '100%' }}
                    slotProps={{ inputLabel: { shrink: true } }}
                    size="small"
                />
            )}
        </FastField>
    );
});

export default ItemQuantityField;