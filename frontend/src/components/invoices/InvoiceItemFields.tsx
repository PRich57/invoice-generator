import React, { useEffect, useRef, useCallback } from 'react';
import { FieldArray } from 'formik';
import { Box, IconButton, Tooltip } from '@mui/material';
import { RemoveCircleOutline, DragHandle, AddCircleOutline } from '@mui/icons-material';
import { InvoiceItemCreate } from '../../types';
import SubitemFields from './SubitemFields';
import ItemDescriptionField from './ItemDescriptionField';
import ItemQuantityField from './ItemQuantityField';
import ItemUnitPriceField from './ItemUnitPriceField';
import ItemDiscountField from './ItemDiscountField';

// Import DnD Kit components
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface InvoiceItemFieldsProps {
    id: number;
    index: number;
    remove: (index: number) => void;
    totalItems: number;
}

const InvoiceItemFields: React.FC<InvoiceItemFieldsProps> = React.memo(
    ({ id, index, remove, totalItems }) => {
        // Refs for Main Item Fields
        const descriptionRef = useRef<HTMLInputElement>(null);
        const quantityRef = useRef<HTMLInputElement>(null);
        const unitPriceRef = useRef<HTMLInputElement>(null);
        const discountRef = useRef<HTMLInputElement>(null);

        // DnD Kit sortable setup
        const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

        const style = {
            transform: CSS.Transform.toString(transform),
            transition,
        };

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
            <div ref={setNodeRef} style={style} {...attributes}>
                <FieldArray name="items">
                    {({ remove: removeItem, insert, form }) => {
                        const items = form.values.items as InvoiceItemCreate[];
                        const item = items[index];
                        const prevItem = items[index - 1];

                        // Handler for Item Description field keydown events
                        const handleItemDescriptionKeyDown = (
                            event: React.KeyboardEvent<HTMLInputElement>
                        ) => {
                            if (event.key === 'Enter') {
                                event.preventDefault();
                                // Add new main item
                                insert(index + 1, {
                                    id: Date.now(),
                                    description: '',
                                    quantity: 1,
                                    unit_price: 0,
                                    discount_percentage: 0,
                                    subitems: [],
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
                                        focusElementById(
                                            `item-${index - 1}-subitem-${newSubitemIndex}-description`
                                        );
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
                        };

                        // Handler for adding a subitem
                        const handleAddSubitem = () => {
                            const newSubitem = {
                                id: Date.now(),
                                description: '',
                            };
                            const updatedSubitems = [...(item.subitems || []), newSubitem];
                            form.setFieldValue(`items[${index}].subitems`, updatedSubitems);
                            setTimeout(() => {
                                focusElementById(
                                    `item-${index}-subitem-${updatedSubitems.length - 1}-description`
                                );
                            }, 0);
                        };

                        return (
                            <Box mb={0}>
                                <Box display="flex" alignItems="center" gap={1}>
                                    {/* Drag Handle */}
                                    <IconButton {...listeners} sx={{ cursor: 'grab' }}>
                                        <DragHandle sx={{ opacity: '30%' }} />
                                    </IconButton>
                                    {/* Rest of the item fields */}
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
                                    <Box>
                                        <Tooltip title={`Remove Item ${index + 1}`} placement='right' arrow>
                                            <IconButton
                                                onClick={() => {
                                                    if (totalItems > 1) {
                                                        remove(index);
                                                    }
                                                }}
                                                aria-label={`Remove Item ${index + 1}`}
                                                disabled={totalItems <= 1}
                                                size='small'
                                            >
                                                <RemoveCircleOutline
                                                    sx={{ opacity: totalItems <= 1 ? '0%' : '50%' }}
                                                    fontSize='small'
                                                    color='error'
                                                />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title='Add Subitem' placement='right' arrow>
                                            <IconButton onClick={handleAddSubitem} size="small">
                                                <AddCircleOutline fontSize="small" sx={{ opacity: '50%' }} color='secondary' />
                                            </IconButton>
                                        </Tooltip>
                                    </Box>
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
            </div>
        );
    }
);

export default InvoiceItemFields;
