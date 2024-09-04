import React from 'react';
import { TextField, Typography, Box, IconButton, Button } from '@mui/material';
import { Add as AddIcon, Remove as RemoveIcon } from '@mui/icons-material';
import { useFormikContext, FieldArray, FormikErrors, FormikTouched } from 'formik';
import { InvoiceCreate, InvoiceItem, InvoiceSubItem } from '../../types';

interface InvoiceItemFieldsProps {
    index: number;
}

export const InvoiceItemFields: React.FC<InvoiceItemFieldsProps> = ({ index }) => {
    const { values, touched, errors, handleChange } = useFormikContext<InvoiceCreate>();
    const item = values.items[index];
    const itemErrors = errors.items?.[index] as FormikErrors<InvoiceItem> | undefined;
    const itemTouched = touched.items?.[index] as FormikTouched<InvoiceItem> | undefined;

    return (
        <Box sx={{ mb: 2, p: 2, border: '1px solid #ccc', borderRadius: 1 }}>
            <TextField
                fullWidth
                margin="normal"
                name={`items.${index}.description`}
                label="Item Description"
                value={item.description}
                onChange={handleChange}
                error={itemTouched?.description && Boolean(itemErrors?.description)}
                helperText={itemTouched?.description && itemErrors?.description}
            />

            <TextField
                fullWidth
                margin="normal"
                name={`items.${index}.quantity`}
                label="Quantity"
                type="number"
                value={item.quantity}
                onChange={handleChange}
                error={itemTouched?.quantity && Boolean(itemErrors?.quantity)}
                helperText={itemTouched?.quantity && itemErrors?.quantity}
            />

            <TextField
                fullWidth
                margin="normal"
                name={`items.${index}.unit_price`}
                label="Unit Price"
                type="number"
                value={item.unit_price}
                onChange={handleChange}
                error={itemTouched?.unit_price && Boolean(itemErrors?.unit_price)}
                helperText={itemTouched?.unit_price && itemErrors?.unit_price}
            />

            <TextField
                fullWidth
                margin="normal"
                name={`items.${index}.discount_percentage`}
                label="Discount Percentage"
                type="number"
                value={item.discount_percentage}
                onChange={handleChange}
                error={itemTouched?.discount_percentage && Boolean(itemErrors?.discount_percentage)}
                helperText={itemTouched?.discount_percentage && itemErrors?.discount_percentage}
            />

            <Typography variant="subtitle1" gutterBottom sx={{ mt: 1 }}>
                Subitems
            </Typography>

            <FieldArray name={`items.${index}.subitems`}>
                {({ push: pushSubitem, remove: removeSubitem }) => (
                    <>
                        {item.subitems.map((subitem, subIndex) => (
                            <Box key={subIndex} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <TextField
                                    fullWidth
                                    margin="dense"
                                    name={`items.${index}.subitems.${subIndex}.description`}
                                    label="Subitem Description"
                                    value={subitem.description}
                                    onChange={handleChange}
                                    error={itemTouched?.subitems?.[subIndex]?.description && Boolean((itemErrors?.subitems?.[subIndex] as FormikErrors<InvoiceSubItem> | undefined)?.description)}
                                    helperText={itemTouched?.subitems?.[subIndex]?.description && (itemErrors?.subitems?.[subIndex] as FormikErrors<InvoiceSubItem> | undefined)?.description}
                                />
                                <IconButton onClick={() => removeSubitem(subIndex)}>
                                    <RemoveIcon />
                                </IconButton>
                            </Box>
                        ))}
                        <Button
                            startIcon={<AddIcon />}
                            onClick={() => pushSubitem({ id: 0, description: '' })}
                        >
                            Add Subitem
                        </Button>
                    </>
                )}
            </FieldArray>
        </Box>
    );
};