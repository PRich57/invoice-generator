import React, { useCallback } from 'react';
import { FastField, FieldProps } from 'formik';
import NumericTextField from '../../common/NumericTextField';

interface ItemDiscountFieldProps {
    index: number;
    inputRef: React.Ref<HTMLInputElement>;
    focusElementById: (id: string) => void;
    totalItems: number;
    insert: (index: number, value: any) => void;
    isMobile: boolean;
}

const ItemDiscountField: React.FC<ItemDiscountFieldProps> = React.memo(
    ({ index, inputRef, focusElementById, totalItems, insert }) => {
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
                        // Add new item if at the end
                        if (index === totalItems - 1) {
                            insert(index + 1, {
                                description: '',
                                quantity: 1,
                                unit_price: 0,
                                discount_percentage: 0,
                                subitems: [],
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
                        subitems: [],
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
            },
            [index, totalItems, focusElementById, insert]
        );

        return (
            <FastField name={`items[${index}].discount_percentage`}>
                {({ field, form }: FieldProps) => (
                    <NumericTextField
                        id={`item-${index}-discount_percentage`}
                        label="Discount (%)"
                        placeholder={`${field.value}.00%`}
                        value={field.value}
                        onChange={(e) => form.setFieldValue(field.name, Number(e.target.value))}
                        onKeyDown={handleKeyDown}
                        inputRef={inputRef}
                        sx={{ width: '100%' }}
                        slotProps={{ inputLabel: { shrink: true } }}
                        endAdornment="%"
                        size="small"
                    />
                )}
            </FastField>
        );
    }
);

export default ItemDiscountField;
