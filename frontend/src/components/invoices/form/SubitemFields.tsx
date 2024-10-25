import React from 'react';
import { Box, IconButton, TextField } from '@mui/material';
import { RemoveCircleOutline, DragHandle } from '@mui/icons-material';
import { InvoiceSubItemCreate, InvoiceItemCreate, InvoiceCreate } from '../../../types';
import MobileResponsiveTooltip from '../../common/MobileResponsiveTooltip';

// Import DnD Kit components
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { FastField, FieldProps, useFormikContext } from 'formik';

interface SubitemFieldsProps {
    parentIndex: number;
    focusElementById: (id: string) => void;
    isMobile: boolean;
    subitems: InvoiceSubItemCreate[];
    setFieldValue: (field: string, value: any) => void;
}

const SubitemFields: React.FC<SubitemFieldsProps> = React.memo(
    ({ parentIndex, focusElementById, isMobile, subitems, setFieldValue }) => {
        const sensors = useSensors(
            useSensor(PointerSensor, {
                activationConstraint: {
                    distance: 5,
                },
            }),
            useSensor(KeyboardSensor)
        );

        const handleDragEnd = (event: DragEndEvent) => {
            const { active, over } = event;

            if (active.id !== over?.id && over) {
                const oldIndex = subitems.findIndex((subitem) => subitem.id === active.id);
                const newIndex = subitems.findIndex((subitem) => subitem.id === over.id);

                if (oldIndex !== -1 && newIndex !== -1) {
                    const newSubitems = arrayMove(subitems, oldIndex, newIndex);
                    setFieldValue(`items[${parentIndex}].subitems`, newSubitems);
                }
            }
        };

        return (
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <SortableContext
                    items={subitems.map((subitem) => subitem.id ?? `subitem-${parentIndex}`)}
                    strategy={verticalListSortingStrategy}
                >
                    <Box ml={4} mt={1}>
                        {subitems.map((subitem, subIndex) => (
                            <SortableSubitemField
                                key={subitem.id ?? `subitem-${parentIndex}-${subIndex}`}
                                subitem={subitem}
                                parentIndex={parentIndex}
                                subIndex={subIndex}
                                focusElementById={focusElementById}
                                isMobile={isMobile}
                                subitems={subitems}
                                setFieldValue={setFieldValue}
                            />
                        ))}
                    </Box>
                </SortableContext>
            </DndContext>
        );
    }
);

interface SortableSubitemFieldProps {
    subitem: InvoiceSubItemCreate;
    parentIndex: number;
    subIndex: number;
    focusElementById: (id: string) => void;
    isMobile: boolean;
    subitems: InvoiceSubItemCreate[];
    setFieldValue: (field: string, value: any) => void;
}

const SortableSubitemField: React.FC<SortableSubitemFieldProps> = ({
    subitem,
    parentIndex,
    subIndex,
    focusElementById,
    isMobile,
    subitems,
    setFieldValue,
}) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
        id: subitem.id ?? `subitem-${parentIndex}-${subIndex}`,
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const { values } = useFormikContext<InvoiceCreate>();

    const handleSubitemDescriptionKeyDown = (event: React.KeyboardEvent) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            const newSubitem: InvoiceSubItemCreate = {
                id: Math.floor(Date.now() + Math.random()),
                description: '',
            };
            const newSubitems = [
                ...subitems.slice(0, subIndex + 1),
                newSubitem,
                ...subitems.slice(subIndex + 1),
            ];
            setFieldValue(`items[${parentIndex}].subitems`, newSubitems);
            setTimeout(() => {
                focusElementById(`item-${parentIndex}-subitem-${subIndex + 1}-description`);
            }, 0);
        } else if (event.ctrlKey && event.code === 'Space') {
            event.preventDefault();

            // Remove the subitem from subitems
            const newSubitems = subitems.filter((_, i) => i !== subIndex);

            // Create a new item from the subitem
            const newItem: InvoiceItemCreate = {
                id: Math.floor(Date.now() + Math.random()),
                description: subitem.description,
                quantity: 1,
                unit_price: 0,
                discount_percentage: 0,
                subitems: [],
            };

            // Get the current items array
            const items = values.items;

            // Create a new items array
            const newItems = [...items];

            // Update the subitems of the parent item
            newItems[parentIndex] = {
                ...newItems[parentIndex],
                subitems: newSubitems,
            };

            // Insert the new item after the parent item
            newItems.splice(parentIndex + 1, 0, newItem);

            // Set the new items array
            setFieldValue('items', newItems);

            setTimeout(() => {
                const newItemIndex = parentIndex + 1;
                focusElementById(`item-${newItemIndex}-description`);
            }, 0);
        } else if (event.key === 'Backspace') {
            if (subitem.description.trim() === '') {
                event.preventDefault();
                if (subitems.length > 1) {
                    const newSubitems = subitems.filter((_, i) => i !== subIndex);
                    setFieldValue(`items[${parentIndex}].subitems`, newSubitems);
                    setTimeout(() => {
                        if (subIndex > 0) {
                            focusElementById(`item-${parentIndex}-subitem-${subIndex - 1}-description`);
                        } else {
                            focusElementById(`item-${parentIndex}-discount_percentage`);
                        }
                    }, 0);
                } else {
                    setFieldValue(`items[${parentIndex}].subitems`, []);
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
        <Box
            display="flex"
            alignItems="center"
            gap={0}
            mt={1}
            ref={setNodeRef}
            style={style}
            {...attributes}
        >
            <IconButton {...listeners} sx={{ cursor: 'grab' }}>
                <DragHandle sx={{ opacity: '30%' }} />
            </IconButton>
            <FastField name={`items[${parentIndex}].subitems[${subIndex}].description`}>
                {({ field }: FieldProps) => (
                    <TextField
                        fullWidth
                        id={`item-${parentIndex}-subitem-${subIndex}-description`}
                        {...field}
                        label="Subitem"
                        onKeyDown={handleSubitemDescriptionKeyDown}
                        sx={{ fontSize: '0.9rem', color: 'gray' }}
                        aria-label={`Item ${parentIndex + 1} Subitem ${subIndex + 1} Description`}
                        size="small"
                    />
                )}
            </FastField>
            <MobileResponsiveTooltip title={`Remove Subitem ${subIndex + 1}`} placement="right" arrow>
                <IconButton
                    onClick={() => {
                        const newSubitems = subitems.filter((_, i) => i !== subIndex);
                        setFieldValue(`items[${parentIndex}].subitems`, newSubitems);
                    }}
                    aria-label={`Remove Subitem ${subIndex + 1}`}
                    size="small"
                >
                    <RemoveCircleOutline fontSize="small" sx={{ opacity: '70%' }} color="error" />
                </IconButton>
            </MobileResponsiveTooltip>
        </Box>
    );
};

export default SubitemFields;
