import React, { useMemo } from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableHead, TableRow, styled } from '@mui/material';
import { Template, InvoiceItem, Contact, InvoicePreviewProps, InvoiceItemCreate, Invoice, InvoiceCreate } from '../../types';

const PreviewContainer = styled(Box)(({ theme }) => ({
    width: '210mm',
    minHeight: '297mm',
    padding: '10mm',
    margin: 'auto',
    backgroundColor: 'white',
    boxShadow: '0 0 10px rgba(0,0,0,0.1)',
    '@media print': {
        boxShadow: 'none',
        margin: 0,
    },
}));

const StyledTableCell = styled(TableCell, {
    shouldForwardProp: (prop) => prop !== 'template',
})<{ template: Template }>(({ theme, template }) => ({
    fontFamily: template.fonts.main,
    fontSize: `${template.font_sizes.normal_text}px`,
    color: template.colors.primary,
    wordBreak: 'break-word',
    padding: '4px 8px',
}));

const ContactInfo: React.FC<{ contact?: Contact | null; label: string; template: Template }> = ({
    contact,
    label,
    template
}) => (
    <Box mb={1}>
        <Typography variant="h6" style={{
            color: template.colors.primary,
            fontFamily: template.fonts.main,
            fontSize: `${template.font_sizes.section_header}px`,
            marginBottom: '4px',
        }}>
            {label}:
        </Typography>
        {contact && (
            <Box style={{ color: template.colors.text }}>
                <Typography>{contact.name}</Typography>
                {contact.street_address && <Typography>{contact.street_address}</Typography>}
                {contact.city && <Typography>{contact.city}</Typography>}
                {(contact.state || contact.postal_code) && (
                    <Typography>
                        {contact.state} {contact.postal_code}
                    </Typography>
                )}
            </Box>
        )}
    </Box>
);

const calculateLineTotal = (item: InvoiceItem | InvoiceItemCreate): number => {
    const quantity = Number(item.quantity) || 0;
    const unitPrice = Number(item.unit_price) || 0;
    const discountPercentage = Number(item.discount_percentage) || 0;
    return quantity * unitPrice * (1 - discountPercentage / 100);
};

const calculateSubtotal = (items: (InvoiceItem | InvoiceItemCreate)[]): number => {
    return items.reduce((sum, item) => sum + calculateLineTotal(item), 0);
};

const calculateTax = (subtotal: number, taxRate: number, discountPercentage: number): number => {
    return (subtotal * (1 - (discountPercentage) / 100)) * (taxRate / 100);
};

const calculateTotal = (subtotal: number, tax: number, discountPercentage: number): number => {
    return (subtotal * (1 - (discountPercentage) / 100)) + tax;
};

const calculateDiscountAmount = (subtotal: number, discountPercentage: number): number => {
    return subtotal * (discountPercentage / 100);
};

const formatNumber = (value: number): string => {
    return value.toFixed(2);
};

const InvoicePreview: React.FC<InvoicePreviewProps> = ({ invoice, template, billToContact, sendToContact }) => {
    const calculatedValues = useMemo(() => {
        const subtotal = calculateSubtotal(invoice.items || []);
        const taxRate = Number(invoice.tax_rate) || 0;
        const discountPercentage = Number(invoice.discount_percentage) || 0;
        const tax = calculateTax(subtotal, taxRate, discountPercentage);
        const total = calculateTotal(subtotal, tax, discountPercentage);
        const discountAmount = calculateDiscountAmount(subtotal, discountPercentage);

        return { subtotal, tax, total, discountPercentage, discountAmount, taxRate };
    }, [invoice]);

    const { subtotal, tax, total, discountPercentage, discountAmount, taxRate } = calculatedValues;

    return (
        <PreviewContainer className="invoice-preview">
            <Box display="flex" justifyContent="space-between" mb={2}>
                <Box>
                    <Typography className="invoice-title" variant="h4" style={{
                        color: template.colors.primary,
                        fontFamily: template.fonts.accent,
                        fontSize: `${template.font_sizes.title}px`,
                        marginBottom: '0',
                    }}>
                        Invoice
                    </Typography>
                    <Typography className="invoice-subtitle" variant="h5" style={{
                        color: template.colors.primary,
                        fontFamily: template.fonts.main,
                        fontSize: `${template.font_sizes.invoice_number}px`,
                    }}>
                        #{invoice.invoice_number || ''}
                    </Typography>
                </Box>
                <Box>
                    <Typography style={{
                        fontFamily: template.fonts.main,
                        fontSize: `${template.font_sizes.normal_text}px`,
                        color: template.colors.text,
                    }}>
                        Date: {invoice.invoice_date}
                    </Typography>
                </Box>
            </Box>

            <Box display="flex" justifyContent="space-between" mb={2}>
                <ContactInfo contact={billToContact} label="Bill To" template={template} />
                <ContactInfo contact={sendToContact} label="Send To" template={template} />
            </Box>

            <Table size="small">
                <TableHead>
                    <TableRow style={{ backgroundColor: template.colors.accent }}>
                        <StyledTableCell template={template} width="50%">Description</StyledTableCell>
                        <StyledTableCell template={template} align="right" width="15%">Quantity</StyledTableCell>
                        <StyledTableCell template={template} align="right" width="15%">Unit Price</StyledTableCell>
                        <StyledTableCell template={template} align="right" width="20%">Total</StyledTableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {invoice.items?.map((item, index) => (
                        <React.Fragment key={index}>
                            <TableRow className="invoice-item">
                                <StyledTableCell template={template}>
                                    {item.description}
                                    {Number(item.discount_percentage) > 0 && ` (${Number(item.discount_percentage)}% Discount)`}
                                </StyledTableCell>
                                <StyledTableCell template={template} align="right">
                                    {Number(item.quantity)}
                                </StyledTableCell>
                                <StyledTableCell template={template} align="right">
                                    ${formatNumber(Number(item.unit_price))}
                                </StyledTableCell>
                                <StyledTableCell template={template} align="right">
                                    ${formatNumber(calculateLineTotal(item))}
                                </StyledTableCell>
                            </TableRow>
                            {item.subitems && item.subitems.length > 0 && (
                                <TableRow className="invoice-subitem">
                                    <StyledTableCell template={template} colSpan={4} style={{ paddingLeft: '2em' }}>
                                        <ul style={{ margin: 0, paddingLeft: '1em', color: template.colors.secondary }}>
                                            {item.subitems.map((subitem, subIndex) => (
                                                <li key={subIndex}>{subitem.description}</li>
                                            ))}
                                        </ul>
                                    </StyledTableCell>
                                </TableRow>
                            )}
                        </React.Fragment>
                    ))}
                </TableBody>
            </Table>

            <Box display="flex" justifyContent="flex-end" mt={2}>
                <Box>
                    <Typography align="right" style={{
                        color: template.colors.text,
                        fontFamily: template.fonts.main,
                        fontSize: `${template.font_sizes.normal_text}px`,
                    }}>Subtotal: ${formatNumber(subtotal)}</Typography>
                    {discountPercentage > 0 && (
                        <>
                            <Typography align="right" style={{
                                color: template.colors.text,
                                fontFamily: template.fonts.main,
                                fontSize: `${template.font_sizes.normal_text}px`,
                            }}>Discount ({discountPercentage}%): -${formatNumber(discountAmount)}</Typography>
                            <Typography align="right" style={{
                                color: template.colors.accent,
                                fontFamily: template.fonts.main,
                                fontSize: `${template.font_sizes.normal_text}px`,
                            }}>Discounted Subtotal: ${formatNumber(subtotal - discountAmount)}</Typography>
                        </>
                    )}
                    <Typography align="right" style={{
                        color: template.colors.text,
                        fontFamily: template.fonts.main,
                        fontSize: `${template.font_sizes.normal_text}px`,
                    }}>Tax ({taxRate}%): ${formatNumber(tax)}</Typography>
                    <Typography align="right" style={{
                        color: template.colors.primary,
                        fontFamily: template.fonts.accent,
                        fontSize: `${template.font_sizes.invoice_number}px`,
                        fontWeight: 'bold',
                    }}>
                        Total: ${formatNumber(total)}
                    </Typography>
                </Box>
            </Box>

            {invoice.notes && (
                <Box mt={2}>
                    <Typography variant="h6" style={{
                        color: template.colors.primary,
                        fontFamily: template.fonts.accent,
                        fontSize: `${template.font_sizes.section_header}px`,
                    }}>Notes:</Typography>
                    <Typography style={{
                        color: template.colors.text,
                        fontFamily: template.fonts.main,
                        fontSize: `${template.font_sizes.normal_text}px`,
                    }}>{invoice.notes}</Typography>
                </Box>
            )}
        </PreviewContainer>
    );
};

export default InvoicePreview;