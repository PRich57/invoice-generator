import React from 'react';
import { FieldArray, useField, useFormikContext } from 'formik';
import { TextField, Box, IconButton, Tooltip } from '@mui/material';
import { RemoveCircleOutline, DragHandle, AddCircleOutline } from '@mui/icons-material';
import { InvoiceItemCreate, InvoiceSubItemCreate, InvoiceCreate } from '../../types';

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
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SubitemFieldsProps {
    parentIndex: number;
    focusElementById: (id: string) => void;
}

const SubitemFields: React.FC<SubitemFieldsProps> = React.memo(
    ({ parentIndex, focusElementById }) => {
        const [{ value: item }] = useField<InvoiceItemCreate>(`items[${parentIndex}]`);
        const form = useFormikContext<InvoiceCreate>();

        // DnD Kit sensors
        const sensors = useSensors(
            useSensor(PointerSensor, {
                activationConstraint: {
                    distance: 5,
                },
            }),
            useSensor(KeyboardSensor, {
                coordinateGetter: sortableKeyboardCoordinates,
            })
        );

        const handleDragEnd = (event: DragEndEvent) => {
            const { active, over } = event;
            const items = form.values.items;

            if (active.id !== over?.id && over) {
                let sourceParentIndex = items.findIndex((itm) =>
                    itm.subitems?.some((sub) => sub.id === active.id)
                );
                let destinationParentIndex = items.findIndex((itm) =>
                    itm.subitems?.some((sub) => sub.id === over.id)
                );

                const sourceSubitems = items[sourceParentIndex].subitems || [];
                const destinationSubitems = items[destinationParentIndex].subitems || [];

                const activeIndex = sourceSubitems.findIndex((subitem) => subitem.id === active.id);
                const overIndex = destinationSubitems.findIndex((subitem) => subitem.id === over.id);

                if (sourceParentIndex === destinationParentIndex) {
                    // Reordering within the same subitem list
                    if (activeIndex !== overIndex) {
                        const newSubitems = arrayMove(sourceSubitems, activeIndex, overIndex);
                        form.setFieldValue(`items[${sourceParentIndex}].subitems`, newSubitems);
                    }
                } else {
                    // Moving between different subitem lists
                    const [movedSubitem] = sourceSubitems.splice(activeIndex, 1);
                    destinationSubitems.splice(overIndex + 1, 0, movedSubitem);

                    form.setFieldValue(`items[${sourceParentIndex}].subitems`, sourceSubitems);
                    form.setFieldValue(`items[${destinationParentIndex}].subitems`, destinationSubitems);
                }
            }
        };

        return (
            <FieldArray name={`items[${parentIndex}].subitems`}>
                {({ form }) => {
                    const subitems = item.subitems || [];

                    // Handler to add a new subitem
                    const handleAddSubitem = () => {
                        const newSubitem: InvoiceSubItemCreate = {
                            id: Date.now(),
                            description: '',
                        };
                        const newSubitems = [...subitems, newSubitem];
                        form.setFieldValue(`items[${parentIndex}].subitems`, newSubitems);
                        setTimeout(() => {
                            focusElementById(
                                `item-${parentIndex}-subitem-${newSubitems.length - 1}-description`
                            );
                        }, 0);
                    };

                    return (
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={handleDragEnd}
                        >
                            <SortableContext
                                items={subitems.map(
                                    (subitem, index) => subitem.id ?? `subitem-${parentIndex}-${index}`
                                )}
                                strategy={verticalListSortingStrategy}
                            >
                                <Box ml={4} mt={1}>
                                    {subitems.map((subitem, subIndex) => (
                                        <SortableSubitemField
                                            key={subitem.id ?? `subitem-${parentIndex}-${subIndex}`}
                                            subitem={subitem}
                                            parentIndex={parentIndex}
                                            subIndex={subIndex}
                                            form={form}
                                            focusElementById={focusElementById}
                                        />
                                    ))}
                                </Box>
                            </SortableContext>
                        </DndContext>
                    );
                }}
            </FieldArray>
        );
    }
);

interface SortableSubitemFieldProps {
    subitem: InvoiceSubItemCreate;
    parentIndex: number;
    subIndex: number;
    form: any;
    focusElementById: (id: string) => void;
}

const SortableSubitemField: React.FC<SortableSubitemFieldProps> = ({
    subitem,
    parentIndex,
    subIndex,
    form,
    focusElementById,
}) => {
    // DnD Kit sortable setup
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
        id: subitem.id ?? `subitem-${parentIndex}-${subIndex}`,
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const handleSubitemDescriptionKeyDown = (event: React.KeyboardEvent) => {
        const subitems = form.values.items[parentIndex].subitems || [];
        if (event.key === 'Enter') {
            event.preventDefault();
            const newSubitem: InvoiceSubItemCreate = {
                id: Date.now(),
                description: '',
            };
            const newSubitems = [
                ...subitems.slice(0, subIndex + 1),
                newSubitem,
                ...subitems.slice(subIndex + 1),
            ];
            form.setFieldValue(`items[${parentIndex}].subitems`, newSubitems);
            setTimeout(() => {
                focusElementById(`item-${parentIndex}-subitem-${subIndex + 1}-description`);
            }, 0);
        } else if (event.ctrlKey && event.code === 'Space') {
            event.preventDefault();

            // Remove the subitem from subitems
            const newSubitems = subitems.filter((_: any, i: number) => i !== subIndex);

            // Create updated parent item with new subitems
            const updatedParentItem = {
                ...form.values.items[parentIndex],
                subitems: newSubitems,
            };

            // Create new item from subitem
            const newItem: InvoiceItemCreate = {
                id: Date.now(),
                description: subitem.description,
                quantity: 1,
                unit_price: 0,
                discount_percentage: 0,
                subitems: [],
            };

            // Build new items array
            const items = form.values.items as InvoiceItemCreate[];
            const newItems = [
                ...items.slice(0, parentIndex),
                updatedParentItem,
                newItem,
                ...items.slice(parentIndex + 1),
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
                    const newSubitems = subitems.filter((_: any, i: number) => i !== subIndex);
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
        <Box
            display="flex"
            alignItems="center"
            gap={1}
            mt={1}
            ref={setNodeRef}
            style={style}
            {...attributes}
        >
            {/* Drag Handle */}
            <IconButton {...listeners} sx={{ cursor: 'grab' }}>
                <DragHandle sx={{ opacity: '30%' }} />
            </IconButton>
            <TextField
                fullWidth
                id={`item-${parentIndex}-subitem-${subIndex}-description`}
                name={`items[${parentIndex}].subitems[${subIndex}].description`}
                label="Subitem"
                value={subitem.description || ''}
                onChange={form.handleChange}
                onKeyDown={handleSubitemDescriptionKeyDown}
                sx={{ fontSize: '0.9rem', color: 'gray' }}
                aria-label={`Item ${parentIndex + 1} Subitem ${subIndex + 1} Description`}
                size="small"
            />
            <Tooltip title={`Remove Subitem ${subIndex + 1}`} placement='right' arrow>
                <IconButton
                    onClick={() => {
                        const subitems = form.values.items[parentIndex].subitems || [];
                        const newSubitems = subitems.filter((_: any, i: number) => i !== subIndex);
                        form.setFieldValue(`items[${parentIndex}].subitems`, newSubitems);
                    }}
                    aria-label={`Remove Subitem ${subIndex + 1}`}
                >
                    <RemoveCircleOutline fontSize='small' sx={{ opacity: '50%' }} color={'error'} />
                </IconButton>
            </Tooltip>
        </Box>
    );
};

export default SubitemFields;
