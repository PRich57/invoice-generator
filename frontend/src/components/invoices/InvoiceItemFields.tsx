// src/components/invoices/InvoiceItemFields.tsx

import React, { useEffect, useRef } from 'react';
import { useFormikContext, FieldArray } from 'formik';
import { TextField, Box, IconButton, Button } from '@mui/material';
import { RemoveCircleOutline } from '@mui/icons-material';
import {
    InvoiceCreate,
    InvoiceItemCreate,
    InvoiceSubItemCreate
} from '../../types';
import NumericTextField from '../common/NumericTextField';

interface InvoiceItemFieldsProps {
    index: number;
    remove: (index: number) => void;
}

const InvoiceItemFields: React.FC<InvoiceItemFieldsProps> = ({ index, remove }) => {
    const { values, setFieldValue } = useFormikContext<InvoiceCreate>();
    const item = values.items[index];

    // Refs for Main Item Fields
    const descriptionRef = useRef<HTMLInputElement>(null);
    const quantityRef = useRef<HTMLInputElement>(null);
    const unitPriceRef = useRef<HTMLInputElement>(null);
    const discountRef = useRef<HTMLInputElement>(null);

    // Refs for Subitems
    const subitemRefs = useRef<(HTMLInputElement | null)[]>([]);

    // Effect to focus on a new main item when added
    useEffect(() => {
        if (item.description === '' && descriptionRef.current) {
            descriptionRef.current.focus();
        }
    }, [item.description]);

    // Helper function to focus an element by ID
    const focusElementById = (id: string | undefined) => {
        if (id) {
            const element = document.getElementById(id);
            element?.focus();
        }
    };

    // Handler for Item Description field keydown events
    const handleItemDescriptionKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            // Add new main item
            setFieldValue('items', [
                ...values.items.slice(0, index + 1),
                {
                    description: '',
                    quantity: 1,
                    unit_price: 0,
                    discount_percentage: 0,
                    subitems: []
                },
                ...values.items.slice(index + 1)
            ]);
        } else if (event.key === 'Tab' && !event.shiftKey) {
            event.preventDefault();
            if (index > 0) {
                // Remove current item from main items array
                const newItems = [...values.items];
                const [currentItem] = newItems.splice(index, 1);

                // Add current item as a subitem to the previous item
                const prevItem = newItems[index - 1];
                prevItem.subitems = prevItem.subitems || [];
                prevItem.subitems.push(currentItem);

                // Update the form values
                setFieldValue('items', newItems);

                // Focus on the new subitem's Description field
                setTimeout(() => {
                    const newSubitemIndex = prevItem.subitems.length - 1;
                    const subitemRefId = `item-${index - 1}-subitem-${newSubitemIndex}-description`;
                    focusElementById(subitemRefId);
                }, 0);
            }
        } else if (event.key === 'Backspace') {
            if (item.description === '') { // If Description is empty
                event.preventDefault();
                if (values.items.length > 1) { // Ensure more than one item exists
                    remove(index);
                    // Focus the Description field of the previous item or next item if first
                    if (index > 0) {
                        const prevItemRef = `item-${index - 1}-description`;
                        focusElementById(prevItemRef);
                    } else {
                        const nextItemRef = `item-${index}-description`; // After removal, the next item shifts to current index
                        focusElementById(nextItemRef);
                    }
                }
            }
        } else if (event.key === 'ArrowDown') {
            event.preventDefault();
            if (item.subitems.length > 0) {
                // Focus on the first subitem's Description field
                const firstSubitemRef = `item-${index}-subitem-0-description`;
                focusElementById(firstSubitemRef);
            } else {
                // Focus on the next item's Description field
                const nextItemIndex = index + 1;
                const nextItemRef = `item-${nextItemIndex}-description`;
                focusElementById(nextItemRef);
            }
        } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            if (index > 0) {
                // Focus on the previous item's Description field
                const prevItemRef = `item-${index - 1}-description`;
                focusElementById(prevItemRef);
            }
            // If it's the first item, do nothing or you can loop to the last item
        } else if (event.key === 'ArrowRight') {
            // Use the ref to access the input element directly
            if (descriptionRef.current) {
                const input = descriptionRef.current;
                const { selectionStart, value = '' } = input; // Ensure value is a string
                if (selectionStart !== null && selectionStart === value.length) {
                    // Cursor is at the end, move focus to Quantity field
                    event.preventDefault();
                    const quantityFieldId = `item-${index}-quantity`;
                    focusElementById(quantityFieldId);
                }
                // Else, allow normal cursor movement
            }
        }
    };

    // Handler for Quantity field keydown events
    const handleQuantityKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        const input = event.target as HTMLInputElement;
        const { selectionStart, selectionEnd, value } = input;

        if (event.key === 'ArrowLeft') {
            if (selectionStart === 0 && selectionEnd === 0) {
                event.preventDefault();
                console.log("DESCRIPTION_REF:", descriptionRef);

                descriptionRef.current?.focus();
            }
        } else if (event.key === 'ArrowRight') {
            if (selectionStart === value.length && selectionEnd === value.length) {
                event.preventDefault();
                console.log("UNIT_PRICE_REF:", unitPriceRef);
                unitPriceRef.current?.focus();
            }
        } else if (event.key === 'Enter') {
            event.preventDefault();
            unitPriceRef.current?.focus();
        } else if (event.key === 'ArrowDown') {
            event.preventDefault();
            const nextItemIndex = index + 1;
            if (nextItemIndex < values.items.length) {
                const nextQuantityRef = `item-${nextItemIndex}-quantity`;
                focusElementById(nextQuantityRef);
            }
        } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            const prevItemIndex = index - 1;
            if (prevItemIndex >= 0) {
                const prevQuantityRef = `item-${prevItemIndex}-quantity`;
                focusElementById(prevQuantityRef);
            }
        }
    };

    const handleUnitPriceKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        const input = event.target as HTMLInputElement;
        const { selectionStart, selectionEnd, value } = input;

        if (event.key === 'ArrowLeft') {
            if (selectionStart === 0 && selectionEnd === 0) {
                event.preventDefault();
                console.log("QUANTITY_REF:", quantityRef);

                quantityRef.current?.focus();
            }
        } else if (event.key === 'ArrowRight') {
            if (selectionStart === value.length && selectionEnd === value.length) {
                event.preventDefault();
                console.log("DISCOUNT_REF:", discountRef);

                discountRef.current?.focus();
            }
        } else if (event.key === 'Enter') {
            event.preventDefault();
            discountRef.current?.focus();
        } else if (event.key === 'ArrowDown') {
            event.preventDefault();
            const nextItemIndex = index + 1;
            if (nextItemIndex < values.items.length) {
                const nextUnitPriceRef = `item-${nextItemIndex}-unit_price`;
                focusElementById(nextUnitPriceRef);
            }
        } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            const prevItemIndex = index - 1;
            if (prevItemIndex >= 0) {
                const prevUnitPriceRef = `item-${prevItemIndex}-unit_price`;
                focusElementById(prevUnitPriceRef);
            }
        }
    };

    // Handler for Discount field keydown events
    const handleDiscountKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        const input = event.target as HTMLInputElement;
        const { selectionStart, selectionEnd, value } = input;

        if (event.key === 'ArrowLeft') {
            if (selectionStart === 0 && selectionEnd === 0) {
                event.preventDefault();
                unitPriceRef.current?.focus();
            }
        } else if (event.key === 'ArrowRight') {
            if (selectionStart === value.length && selectionEnd === value.length) {
                event.preventDefault();
                // Focus on next item's description or add new item
                const nextItemIndex = index + 1;
                if (nextItemIndex < values.items.length) {
                    focusElementById(`item-${nextItemIndex}-description`);
                } else {
                    // Add new item
                    setFieldValue('items', [
                        ...values.items,
                        {
                            description: '',
                            quantity: 1,
                            unit_price: 0,
                            discount_percentage: 0,
                            subitems: []
                        }
                    ]);
                    setTimeout(() => {
                        focusElementById(`item-${nextItemIndex}-description`);
                    }, 0);
                }
            }
        } else if (event.key === 'Enter') {
            event.preventDefault();
            // Add new main item
            setFieldValue('items', [
                ...values.items.slice(0, index + 1),
                {
                    description: '',
                    quantity: 1,
                    unit_price: 0,
                    discount_percentage: 0,
                    subitems: []
                },
                ...values.items.slice(index + 1)
            ]);
            // Focus on the new item's Description field after state update
            setTimeout(() => {
                const newItemIndex = index + 1;
                const newItemDescriptionRef = `item-${newItemIndex}-description`;
                focusElementById(newItemDescriptionRef);
            }, 0);
        } else if (event.key === 'ArrowDown') {
            event.preventDefault();
            const nextItemIndex = index + 1;
            if (nextItemIndex < values.items.length) {
                const nextDiscountRef = `item-${nextItemIndex}-discount_percentage`;
                focusElementById(nextDiscountRef);
            }
        } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            const prevItemIndex = index - 1;
            if (prevItemIndex >= 0) {
                const prevDiscountRef = `item-${prevItemIndex}-discount_percentage`;
                focusElementById(prevDiscountRef);
            }
        }
    };

    // Handler for Subitem Description field keydown events
    const handleSubitemDescriptionKeyDown = (
        event: React.KeyboardEvent<HTMLInputElement>,
        subIndex: number
    ) => {
        // Define 'subitem' using 'subIndex'
        const subitem = item.subitems[subIndex];

        if (event.key === 'Enter') {
            event.preventDefault();
            // Add new subitem after the current one
            const newSubitems: InvoiceSubItemCreate[] = [
                ...item.subitems.slice(0, subIndex + 1),
                { description: '' },
                ...item.subitems.slice(subIndex + 1)
            ];
            setFieldValue(`items[${index}].subitems`, newSubitems);
            // Focus on the new subitem's Description field after state update
            setTimeout(() => {
                if (subitemRefs.current[subIndex + 1]) {
                    subitemRefs.current[subIndex + 1]?.focus();
                }
            }, 0);
        } else if (event.key === 'Tab' && event.shiftKey) {
            event.preventDefault();
            // Convert subitem to main item, regardless of whether it's empty or not
            const newSubitems = item.subitems.filter((_, i: number) => i !== subIndex);
            const newItem: InvoiceItemCreate = {
                description: subitem.description, // This will be empty for empty subitems
                quantity: 1,
                unit_price: 0,
                discount_percentage: 0,
                subitems: []
            };
            const newItems = [
                ...values.items.slice(0, index), // Items before current item
                {
                    ...item,
                    subitems: newSubitems
                }, // Updated current item with subitem removed
                newItem, // New main item (empty or with content)
                ...values.items.slice(index + 1) // Items after current item
            ];
            setFieldValue('items', newItems);
            // Focus on the new item's Description field after state update
            setTimeout(() => {
                const newItemIndex = index + 1;
                const newItemDescriptionRef = `item-${newItemIndex}-description`;
                focusElementById(newItemDescriptionRef);
            }, 0);
        } else if (event.key === 'Backspace') {
            if (subitem.description.trim() === '') { // Check if subitem description is empty
                event.preventDefault();
                if (item.subitems.length > 1) {
                    // Remove the current subitem
                    const newSubitems = item.subitems.filter((_, i: number) => i !== subIndex);
                    setFieldValue(`items[${index}].subitems`, newSubitems);
                    // Focus on the previous subitem's Description field
                    if (subIndex > 0 && subitemRefs.current[subIndex - 1]) {
                        subitemRefs.current[subIndex - 1]?.focus();
                    } else {
                        // If first subitem, focus on main item's Discount field
                        discountRef.current?.focus();
                    }
                } else {
                    // If only one subitem, outdent to main item
                    setFieldValue(`items[${index}].subitems`, []);
                    const mainDescriptionRef = `item-${index}-description`;
                    focusElementById(mainDescriptionRef);
                }
            }
        } else if (event.key === 'ArrowDown') {
            event.preventDefault();
            if (subIndex < item.subitems.length - 1) {
                // Focus on the next subitem's Description field
                const nextSubitemRef = `item-${index}-subitem-${subIndex + 1}-description`;
                focusElementById(nextSubitemRef);
            } else {
                // Focus on the next item's Description field
                const nextItemIndex = index + 1;
                const nextItemRef = `item-${nextItemIndex}-description`;
                focusElementById(nextItemRef);
            }
        } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            if (subIndex > 0) {
                // Focus on the previous subitem's Description field
                const prevSubitemRef = `item-${index}-subitem-${subIndex - 1}-description`;
                focusElementById(prevSubitemRef);
            } else {
                // Focus on the parent item's Description field
                const parentDescriptionRef = `item-${index}-description`;
                focusElementById(parentDescriptionRef);
            }
        }
    };

    return (
        <Box mb={2}>
            <Box display="flex" alignItems="center" gap={1}>
                <TextField
                    // fullWidth
                    sx={{ width: '70%' }}
                    id={`item-${index}-description`}
                    name={`items[${index}].description`}
                    label="Description"
                    value={item.description || ''} // Ensure value is always a string
                    onChange={(e) => setFieldValue(`items[${index}].description`, e.target.value)}
                    onKeyDown={handleItemDescriptionKeyDown}
                    inputRef={descriptionRef}
                    aria-label={`Item ${index + 1} Description`}
                    size='small'
                />
                <NumericTextField
                    id={`item-${index}-quantity`} // Ensure this matches the focus target
                    name={`items[${index}].quantity`}
                    label="Quantity"
                    placeholder={`${item.quantity}`}
                    onChange={(e) => setFieldValue(`items[${index}].quantity`, Number(e.target.value))}
                    onKeyDown={handleQuantityKeyDown}
                    inputRef={quantityRef} // Keep this ref if needed elsewhere
                    sx={{ width: '8%' }}
                    aria-label={`Item ${index + 1} Quantity`}
                    slotProps={{ inputLabel: { shrink: true } }}
                    size='small'
                />
                <NumericTextField
                    id={`item-${index}-unit_price`}
                    name={`items[${index}].unit_price`}
                    label="Unit Price"
                    placeholder={`${item.unit_price}`}
                    onChange={(e) => setFieldValue(`items[${index}].unit_price`, Number(e.target.value))}
                    onKeyDown={handleUnitPriceKeyDown}
                    inputRef={unitPriceRef}
                    sx={{ width: '12%' }}
                    aria-label={`Item ${index + 1} Unit Price`}
                    slotProps={{ inputLabel: { shrink: true } }}
                    startAdornment="$"
                    size='small'
                />
                <NumericTextField
                    id={`item-${index}-discount_percentage`}
                    name={`items[${index}].discount_percentage`}
                    label="Discount (%)"
                    placeholder={`${item.discount_percentage}`}
                    onChange={(e) => setFieldValue(`items[${index}].discount_percentage`, Number(e.target.value))}
                    onKeyDown={handleDiscountKeyDown}
                    inputRef={discountRef}
                    sx={{ width: '10%' }}
                    aria-label={`Item ${index + 1} Discount Percentage`}
                    slotProps={{ inputLabel: { shrink: true } }}
                    endAdornment="%"
                    size='small'
                />
                <IconButton onClick={() => remove(index)} aria-label={`Remove Item ${index + 1}`}>
                    <RemoveCircleOutline />
                </IconButton>
            </Box>
            {/* Subitems */}
            {item.subitems && item.subitems.length > 0 && (
                <FieldArray name={`items[${index}].subitems`}>
                    {({ remove: removeSubitem, push: pushSubitem }) => (
                        <Box ml={4} mt={1}>
                            {item.subitems.map((subitem: InvoiceSubItemCreate, subIndex: number) => (
                                <Box key={subIndex} display="flex" alignItems="center" gap={1} mt={1}>
                                    <TextField
                                        fullWidth
                                        id={`item-${index}-subitem-${subIndex}-description`}
                                        name={`items[${index}].subitems[${subIndex}].description`}
                                        label="Subitem"
                                        value={subitem.description || ''} // Ensure value is always a string
                                        onChange={(e) =>
                                            setFieldValue(
                                                `items[${index}].subitems[${subIndex}].description`,
                                                e.target.value
                                            )
                                        }
                                        onKeyDown={(event: React.KeyboardEvent<HTMLInputElement>) => handleSubitemDescriptionKeyDown(event, subIndex)}
                                        inputRef={(el) => (subitemRefs.current[subIndex] = el)}
                                        // Style for subitems
                                        sx={{ fontSize: '0.9rem', color: 'gray' }}
                                        aria-label={`Item ${index + 1} Subitem ${subIndex + 1} Description`}
                                        size='small'
                                    />
                                    <IconButton onClick={() => removeSubitem(subIndex)} aria-label={`Remove Subitem ${subIndex + 1}`}>
                                        <RemoveCircleOutline />
                                    </IconButton>
                                </Box>
                            ))}
                            {/* <Button
                                onClick={() => pushSubitem({ description: '' })}
                                size="small"
                                sx={{ ml: 2, mt: 1 }}
                            >
                                Add Subitem
                            </Button> */}
                        </Box>
                    )}
                </FieldArray>
            )}
        </Box>
    );
};

export default InvoiceItemFields;
