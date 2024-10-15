// src/components/invoices/InvoiceItemFields.tsx

import React, { useEffect, useRef, useCallback } from 'react';
import { FieldArray } from 'formik';
import { Box, IconButton } from '@mui/material';
import { RemoveCircleOutline } from '@mui/icons-material';
import { InvoiceItemCreate } from '../../types';
import SubitemFields from './SubitemFields';
import ItemDescriptionField from './ItemDescriptionField';
import ItemQuantityField from './ItemQuantityField';
import ItemUnitPriceField from './ItemUnitPriceField';
import ItemDiscountField from './ItemDiscountField';

interface InvoiceItemFieldsProps {
    index: number;
    remove: (index: number) => void;
    totalItems: number;
}

const InvoiceItemFields: React.FC<InvoiceItemFieldsProps> = React.memo(({ index, remove, totalItems }) => {
    // Refs for Main Item Fields
    const descriptionRef = useRef<HTMLInputElement>(null);
    const quantityRef = useRef<HTMLInputElement>(null);
    const unitPriceRef = useRef<HTMLInputElement>(null);
    const discountRef = useRef<HTMLInputElement>(null);

    // Effect to focus on a new main item when added
    useEffect(() => {
        if (descriptionRef.current && descriptionRef.current.value === '') {
            descriptionRef.current.focus();
        }
    }, []);

    // Helper function to focus an element by ID
    const focusElementById = useCallback((id: string) => {
        const element = document.getElementById(id);
        element?.focus();
    }, []);

    return (
        <FieldArray name="items">
            {({ remove: removeItem, insert, form }) => {
                const items = form.values.items as InvoiceItemCreate[];
                const item = items[index];
                const prevItem = items[index - 1];

                // Handler for Item Description field keydown events
                const handleItemDescriptionKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
                    if (event.key === 'Enter') {
                        event.preventDefault();
                        // Add new main item
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
                    } else if (event.ctrlKey && event.code === 'Space') {
                        event.preventDefault();
                        if (index > 0) {
                            // Remove current item and add as subitem to previous item
                            removeItem(index);
                            const newSubitems = [...(prevItem.subitems || []), item];
                            form.setFieldValue(`items[${index - 1}].subitems`, newSubitems);
                            setTimeout(() => {
                                const newSubitemIndex = newSubitems.length - 1;
                                focusElementById(`item-${index - 1}-subitem-${newSubitemIndex}-description`);
                            }, 0);
                        }
                    } else if (event.key === 'Backspace') {
                        if (item.description === '') {
                            event.preventDefault();
                            if (totalItems > 1) {
                                remove(index);
                                setTimeout(() => {
                                    if (index > 0) {
                                        focusElementById(`item-${index - 1}-description`);
                                    } else {
                                        focusElementById(`item-${index}-description`);
                                    }
                                }, 0);
                            }
                        }
                    } else if (event.key === 'ArrowDown') {
                        event.preventDefault();
                        if (item.subitems && item.subitems.length > 0) {
                            focusElementById(`item-${index}-subitem-0-description`);
                        } else {
                            focusElementById(`item-${index + 1}-description`);
                        }
                    } else if (event.key === 'ArrowUp') {
                        event.preventDefault();
                        if (index > 0) {
                            focusElementById(`item-${index - 1}-description`);
                        }
                    } else if (event.key === 'ArrowRight') {
                        if (descriptionRef.current) {
                            const input = descriptionRef.current;
                            const { selectionStart, value = '' } = input;
                            if (selectionStart !== null && selectionStart === value.length) {
                                event.preventDefault();
                                focusElementById(`item-${index}-quantity`);
                            }
                        }
                    }
                    // Removed custom handling for Tab and Shift+Tab to restore default behavior
                };

                return (
                    <Box mb={2}>
                        <Box display="flex" alignItems="center" gap={1}>
                            <ItemDescriptionField
                                index={index}
                                inputRef={descriptionRef}
                                onKeyDown={handleItemDescriptionKeyDown}
                            />
                            <ItemQuantityField
                                index={index}
                                inputRef={quantityRef}
                                focusElementById={focusElementById}
                            />
                            <ItemUnitPriceField
                                index={index}
                                inputRef={unitPriceRef}
                                focusElementById={focusElementById}
                            />
                            <ItemDiscountField
                                index={index}
                                inputRef={discountRef}
                                focusElementById={focusElementById}
                                totalItems={totalItems}
                                insert={insert}
                            />
                            <IconButton onClick={() => remove(index)} aria-label={`Remove Item ${index + 1}`}>
                                <RemoveCircleOutline />
                            </IconButton>
                        </Box>
                        {item.subitems && item.subitems.length > 0 && (
                            <SubitemFields
                                parentIndex={index}
                                focusElementById={focusElementById}
                            />
                        )}
                    </Box>
                );
            }}
        </FieldArray>
    );
});

export default InvoiceItemFields;
