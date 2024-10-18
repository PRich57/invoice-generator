import React, { useEffect, useRef, useCallback } from 'react';
import {
    Box,
    Button,
    Collapse,
    IconButton,
    Stack,
    Tooltip,
    Typography,
} from '@mui/material';
import {
    RemoveCircleOutline,
    DragHandle,
    AddCircleOutline,
    ExpandLess,
    ExpandMore,
} from '@mui/icons-material';
import { InvoiceItemCreate } from '../../../types';
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
    insert: (index: number, value: any) => void;
    totalItems: number;
    isMobile: boolean;
    item: InvoiceItemCreate;
    items: InvoiceItemCreate[];
    setFieldValue: (field: string, value: any) => void;
}

const InvoiceItemFields: React.FC<InvoiceItemFieldsProps> = React.memo(
    ({ id, index, remove, insert, totalItems, isMobile, item, items, setFieldValue }) => {
        // Refs for Main Item Fields
        const descriptionRef = useRef<HTMLInputElement>(null);
        const quantityRef = useRef<HTMLInputElement>(null);
        const unitPriceRef = useRef<HTMLInputElement>(null);
        const discountRef = useRef<HTMLInputElement>(null);

        // DnD Kit sortable setup
        const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
        const [expanded, setExpanded] = React.useState(!isMobile);

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

        const handleToggleExpand = () => {
            setExpanded(!expanded);
        };

        const prevItem = items[index - 1];

        // Handler for Item Description field keydown events
        const handleItemDescriptionKeyDown = useCallback(
            (event: React.KeyboardEvent<HTMLInputElement>) => {
                if (event.key === 'Enter') {
                    event.preventDefault();
                    // Add new main item
                    insert(index + 1, {
                        id: Date.now() + Math.random(),
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
                        remove(index);
                        const newSubitems = [...(prevItem.subitems || []), item];
                        setFieldValue(`items[${index - 1}].subitems`, newSubitems);
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
            },
            [index, insert, item, remove, totalItems, focusElementById, prevItem, setFieldValue]
        );

        // Handler for adding a subitem
        const handleAddSubitem = useCallback(() => {
            const newSubitem = {
                id: Date.now() + Math.random(),
                description: '',
            };
            const updatedSubitems = [...(item.subitems || []), newSubitem];
            setFieldValue(`items[${index}].subitems`, updatedSubitems);
            setTimeout(() => {
                focusElementById(
                    `item-${index}-subitem-${updatedSubitems.length - 1}-description`
                );
            }, 0);
        }, [index, item.subitems, setFieldValue, focusElementById]);

        const label = totalItems <= 1 ? `Cannot delete the only item` : `Remove Item ${index + 1}`;

        return (
            <div ref={setNodeRef} style={style} {...attributes}>
                <Box
                    mb={2}
                    border={1}
                    borderColor="divider"
                    borderRadius={2}
                    p={2}
                    sx={{ backgroundColor: expanded ? 'inherit' : 'background.paper' }}
                >
                    <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                        mb={1}
                    >
                        <Box display="flex" alignItems="center">
                            <IconButton {...listeners} sx={{ cursor: 'grab', mr: 1 }}>
                                <DragHandle sx={{ opacity: '30%' }} />
                            </IconButton>
                            <Typography variant="subtitle1">
                                {item.description.trim() === ''
                                    ? `Item ${index + 1}`
                                    : item.description.length > 20
                                    ? `${item.description.slice(0, 20)}...`
                                    : item.description}
                            </Typography>
                        </Box>
                        <Box>
                            <IconButton onClick={handleToggleExpand} size="small">
                                {expanded ? <ExpandLess /> : <ExpandMore />}
                            </IconButton>
                            <Tooltip title={label} placement="right" arrow>
                                <span>
                                    <IconButton
                                        onClick={() => {
                                            if (totalItems > 1) {
                                                remove(index);
                                            }
                                        }}
                                        aria-label={label}
                                        disabled={totalItems <= 1}
                                        size="small"
                                    >
                                        <RemoveCircleOutline
                                            sx={{ opacity: totalItems <= 1 ? '20%' : '70%' }}
                                            fontSize="small"
                                            color="error"
                                        />
                                    </IconButton>
                                </span>
                            </Tooltip>
                        </Box>
                    </Stack>
                    <Collapse in={expanded}>
                        <Stack spacing={2}>
                            <Stack
                                direction={isMobile ? 'column' : 'row'}
                                spacing={2}
                                alignItems="flex-start"
                            >
                                <Box width={isMobile ? '100%' : '60%'}>
                                    <ItemDescriptionField
                                        index={index}
                                        inputRef={descriptionRef}
                                        onKeyDown={handleItemDescriptionKeyDown}
                                        isMobile={isMobile}
                                    />
                                </Box>
                                <Box width={isMobile ? '100%' : '10%'}>
                                    <ItemQuantityField
                                        index={index}
                                        inputRef={quantityRef}
                                        focusElementById={focusElementById}
                                        isMobile={isMobile}
                                    />
                                </Box>
                                <Box width={isMobile ? '100%' : '15%'}>
                                    <ItemUnitPriceField
                                        index={index}
                                        inputRef={unitPriceRef}
                                        focusElementById={focusElementById}
                                        isMobile={isMobile}
                                    />
                                </Box>
                                <Box width={isMobile ? '100%' : '15%'}>
                                    <ItemDiscountField
                                        index={index}
                                        inputRef={discountRef}
                                        focusElementById={focusElementById}
                                        totalItems={totalItems}
                                        insert={insert}
                                        isMobile={isMobile}
                                    />
                                </Box>
                            </Stack>
                            {item.subitems && item.subitems.length > 0 && (
                                <SubitemFields
                                    parentIndex={index}
                                    focusElementById={focusElementById}
                                    isMobile={isMobile}
                                    subitems={item.subitems}
                                    setFieldValue={setFieldValue}
                                />
                            )}
                            <Box display="flex" justifyContent="flex-end">
                                <Button
                                    startIcon={<AddCircleOutline />}
                                    onClick={handleAddSubitem}
                                    variant="text"
                                    color="secondary"
                                    size="small"
                                >
                                    Add Subitem
                                </Button>
                            </Box>
                        </Stack>
                    </Collapse>
                </Box>
            </div>
        );
    }
);

export default React.memo(InvoiceItemFields, (prevProps, nextProps) => {
    return (
        prevProps.id === nextProps.id &&
        prevProps.index === nextProps.index &&
        prevProps.totalItems === nextProps.totalItems &&
        prevProps.isMobile === nextProps.isMobile &&
        prevProps.item === nextProps.item
    );
});
