// src/components/invoices/SubitemFields.tsx

import React, { useRef } from 'react';
import { FieldArray, useField } from 'formik';
import { TextField, Box, IconButton } from '@mui/material';
import { RemoveCircleOutline } from '@mui/icons-material';
import { InvoiceItemCreate } from '../../types';

interface SubitemFieldsProps {
    parentIndex: number;
    focusElementById: (id: string) => void;
}

const SubitemFields: React.FC<SubitemFieldsProps> = React.memo(({ parentIndex, focusElementById }) => {
    const [{ value: item }] = useField<InvoiceItemCreate>(`items[${parentIndex}]`);

    // Refs for Subitems
    const subitemRefs = useRef<(HTMLInputElement | null)[]>([]);

    return (
        <FieldArray name={`items[${parentIndex}].subitems`}>
            {({ form }) => {
                const subitems = item.subitems || [];

                const handleSubitemDescriptionKeyDown = (
                    event: React.KeyboardEvent,
                    subIndex: number
                ) => {
                    const subitem = subitems[subIndex];
                    if (event.key === 'Enter') {
                        event.preventDefault();
                        const newSubitems = [
                            ...subitems.slice(0, subIndex + 1),
                            { description: '' },
                            ...subitems.slice(subIndex + 1),
                        ];
                        form.setFieldValue(`items[${parentIndex}].subitems`, newSubitems);
                        setTimeout(() => {
                            focusElementById(`item-${parentIndex}-subitem-${subIndex + 1}-description`);
                        }, 0);
                    } else if (event.ctrlKey && event.code === 'Space') {
                        event.preventDefault();

                        // Remove the subitem from subitems
                        const newSubitems = subitems.filter((_, i) => i !== subIndex);

                        // Create updated parent item with new subitems
                        const updatedParentItem = {
                            ...item,
                            subitems: newSubitems
                        };

                        // Create new item from subitem
                        const newItem = {
                            description: subitem.description,
                            quantity: 1,
                            unit_price: 0,
                            discount_percentage: 0,
                            subitems: []
                        };

                        // Build new items array
                        const items = form.values.items as InvoiceItemCreate[];
                        const newItems = [
                            ...items.slice(0, parentIndex),
                            updatedParentItem,
                            newItem,
                            ...items.slice(parentIndex + 1)
                        ];

                        // Update the items array in the form
                        form.setFieldValue('items', newItems);

                        // Focus on the new item's description field
                        setTimeout(() => {
                            const newItemIndex = parentIndex + 1;
                            focusElementById(`item-${newItemIndex}-description`);
                        }, 0);
                    } else if (event.key === 'Backspace') {
                        if (subitem.description.trim() === '') {
                            event.preventDefault();
                            if (subitems.length > 1) {
                                const newSubitems = subitems.filter((_, i) => i !== subIndex);
                                form.setFieldValue(`items[${parentIndex}].subitems`, newSubitems);
                                setTimeout(() => {
                                    if (subIndex > 0) {
                                        focusElementById(`item-${parentIndex}-subitem-${subIndex - 1}-description`);
                                    } else {
                                        focusElementById(`item-${parentIndex}-discount_percentage`);
                                    }
                                }, 0);
                            } else {
                                form.setFieldValue(`items[${parentIndex}].subitems`, []);
                                setTimeout(() => {
                                    focusElementById(`item-${parentIndex}-description`);
                                }, 0);
                            }
                        }
                    } else if (event.key === 'ArrowDown') {
                        event.preventDefault();
                        if (subIndex < subitems.length - 1) {
                            focusElementById(`item-${parentIndex}-subitem-${subIndex + 1}-description`);
                        } else {
                            focusElementById(`item-${parentIndex + 1}-description`);
                        }
                    } else if (event.key === 'ArrowUp') {
                        event.preventDefault();
                        if (subIndex > 0) {
                            focusElementById(`item-${parentIndex}-subitem-${subIndex - 1}-description`);
                        } else {
                            focusElementById(`item-${parentIndex}-description`);
                        }
                    }
                };

                return (
                    <Box ml={4} mt={1}>
                        {subitems.map((subitem, subIndex) => (
                            <Box key={subIndex} display="flex" alignItems="center" gap={1} mt={1}>
                                <TextField
                                    fullWidth
                                    id={`item-${parentIndex}-subitem-${subIndex}-description`}
                                    name={`items[${parentIndex}].subitems[${subIndex}].description`}
                                    label="Subitem"
                                    value={subitem.description || ''}
                                    onChange={form.handleChange}
                                    onKeyDown={(event) => handleSubitemDescriptionKeyDown(event, subIndex)}
                                    inputRef={(el) => (subitemRefs.current[subIndex] = el)}
                                    sx={{ fontSize: '0.9rem', color: 'gray' }}
                                    aria-label={`Item ${parentIndex + 1} Subitem ${subIndex + 1} Description`}
                                    size='small'
                                />
                                <IconButton onClick={() => {
                                    const newSubitems = subitems.filter((_, i) => i !== subIndex);
                                    form.setFieldValue(`items[${parentIndex}].subitems`, newSubitems);
                                }} aria-label={`Remove Subitem ${subIndex + 1}`}>
                                    <RemoveCircleOutline />
                                </IconButton>
                            </Box>
                        ))}
                    </Box>
                );
            }}
        </FieldArray>
    );
});

export default SubitemFields;
