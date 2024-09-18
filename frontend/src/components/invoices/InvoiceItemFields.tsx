import React from 'react';
import { TextField, Typography, Box, IconButton, Button } from '@mui/material';
import { Add as AddIcon, Remove as RemoveIcon } from '@mui/icons-material';
import { useFormikContext, FieldArray, FormikErrors, FormikTouched } from 'formik';
import { InvoiceCreate, InvoiceItemCreate, InvoiceSubItemCreate } from '../../types';

interface InvoiceItemFieldsProps {
    index: number;
    remove: (index: number) => void;
}

const InvoiceItemFields: React.FC<InvoiceItemFieldsProps> = ({ index, remove }) => {
    const { values, touched, errors, handleChange } = useFormikContext<InvoiceCreate>();
    const item = values.items[index];
    const itemErrors = errors.items?.[index] as FormikErrors<InvoiceItemCreate> | undefined;
    const itemTouched = touched.items?.[index] as FormikTouched<InvoiceItemCreate> | undefined;

    return (
        <Box sx={{ mb: 2, p: 2, border: '1px solid #ccc', borderRadius: 1 }}>
            {/* Item Fields */}
            <Box display="flex" justifyContent="space-between">
                <Typography variant="subtitle1">Item {index + 1}</Typography>
                <IconButton onClick={() => remove(index)}>
                    <RemoveIcon />
                </IconButton>
            </Box>

            <TextField
                fullWidth
                margin="normal"
                name={`items.${index}.description`}
                label="Item Description"
                value={item.description}
                onChange={handleChange}
                error={Boolean(itemTouched?.description && itemErrors?.description)}
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
                error={Boolean(itemTouched?.quantity && itemErrors?.quantity)}
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
                error={Boolean(itemTouched?.unit_price && itemErrors?.unit_price)}
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
                error={Boolean(itemTouched?.discount_percentage && itemErrors?.discount_percentage)}
                helperText={itemTouched?.discount_percentage && itemErrors?.discount_percentage}
            />

            {/* Subitems */}
            <Typography variant="subtitle1" gutterBottom sx={{ mt: 1 }}>
                Subitems
            </Typography>

            <FieldArray name={`items.${index}.subitems`}>
                {({ push: pushSubitem, remove: removeSubitem }) => (
                    <>
                        {item.subitems.map((subitem, subIndex) => {
                            const subitemErrors = itemErrors?.subitems?.[subIndex] as FormikErrors<InvoiceSubItemCreate> | undefined;
                            const subitemTouched = itemTouched?.subitems?.[subIndex] as FormikTouched<InvoiceSubItemCreate> | undefined;

                            return (
                                <Box key={subitem.id || subIndex} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                    <TextField
                                        fullWidth
                                        margin="dense"
                                        name={`items.${index}.subitems.${subIndex}.description`}
                                        label="Subitem Description"
                                        value={subitem.description}
                                        onChange={handleChange}
                                        error={Boolean(subitemTouched?.description && subitemErrors?.description)}
                                        helperText={subitemTouched?.description && subitemErrors?.description}
                                    />
                                    <IconButton onClick={() => removeSubitem(subIndex)}>
                                        <RemoveIcon />
                                    </IconButton>
                                </Box>
                            );
                        })}
                        <Button
                            startIcon={<AddIcon />}
                            onClick={() => pushSubitem({ description: '' })}
                        >
                            Add Subitem
                        </Button>
                    </>
                )}
            </FieldArray>
        </Box>
    );
};

export default InvoiceItemFields;
