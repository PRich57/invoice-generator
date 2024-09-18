import React, { Fragment } from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableHead, TableRow, styled } from '@mui/material';
import { Template, InvoiceItem, Contact, InvoicePreviewProps, InvoiceItemCreate, Invoice, InvoiceCreate } from '../../types';

const PreviewContainer = styled(Box)(({ theme }) => ({
    width: '210mm',
    minHeight: '297mm',
    padding: '20mm',
    margin: 'auto',
    backgroundColor: 'white',
    boxShadow: '0 0 10px rgba(0,0,0,0.1)',
    '@media print': {
        boxShadow: 'none',
        margin: 0,
    },
}));

interface StyledTableCellProps {
    template: Template;
}

const StyledTableCell = styled(TableCell, {
    shouldForwardProp: (prop) => prop !== 'template',
})<StyledTableCellProps>(({ theme, template }) => ({
    fontFamily: template.fonts.main,
    fontSize: `${template.font_sizes.normal_text}px`,
    color: template.colors.primary,
    wordBreak: 'break-word',
}));

const ContactInfo: React.FC<{ contact?: Contact | null; label: string; template: Template }> = ({
    contact,
    label,
    template
}) => (
    <Box mb={2}>
        <Typography variant="h6" style={{
            color: template.colors.primary,
            fontFamily: template.fonts.main,
            fontSize: `${template.font_sizes.section_header}px`,
        }}>
            {label}:
        </Typography>
        {contact && (
            <>
                <Typography>{contact.name}</Typography>
                {contact.street_address && <Typography>{contact.street_address}</Typography>}
                {contact.city && <Typography>{contact.city}</Typography>}
                {(contact.state || contact.postal_code) && (
                    <Typography>
                        {contact.state} {contact.postal_code}
                    </Typography>
                )}
            </>
        )}
    </Box>
);

const calculateLineTotal = (item: InvoiceItem | InvoiceItemCreate): number => {
    return item.quantity * item.unit_price * (1 - item.discount_percentage / 100);
};

const calculateSubtotal = (items: (InvoiceItem | InvoiceItemCreate)[], discount_percentage: number): number => {
    return items.reduce((sum, item) => sum + calculateLineTotal(item), 0);
};

const calculateTax = (subtotal: number, taxRate: number, discount_percentage: number): number => {
    return (subtotal * (1 - (discount_percentage / 100))) * (taxRate / 100);
};

const calculateTotal = (subtotal: number, tax: number, discount_percentage: number): number => {
    return (subtotal * (1 - (discount_percentage / 100))) + tax;
};

const calculateDiscountAmount = (subtotal: number, discount_percentage: number): number => {
    return subtotal * (discount_percentage / 100);
};

const isFullInvoice = (invoice: Partial<Invoice> | InvoiceCreate): invoice is Invoice =>
    'id' in invoice && 'subtotal' in invoice && 'tax' in invoice && 'total' in invoice;

const InvoicePreview: React.FC<InvoicePreviewProps> = ({ invoice, template, billToContact, sendToContact }) => {
    const subtotal =
        'subtotal' in invoice ?
            invoice.subtotal :
            calculateSubtotal(invoice.items || [], invoice.discount_percentage || 0);
    const tax =
        'tax' in invoice ?
        invoice.tax :
        calculateTax(subtotal, invoice.tax_rate || 0, invoice.discount_percentage || 0);
    const total = 
        'total' in invoice ?
        invoice.total :
        calculateTotal(subtotal, tax, invoice.discount_percentage || 0);
    const discount_percentage = invoice.discount_percentage || 0;
    const discount_amount = calculateDiscountAmount(subtotal, discount_percentage);


    return (
        <PreviewContainer className="invoice-preview">
            <Typography className="invoice-title" variant="h4" style={{
                color: template.colors.primary,
                fontFamily: template.fonts.accent,
                fontSize: `${template.font_sizes.title}px`,
                marginBottom: '0',
                textAlign: 'right',
            }}>
                Invoice
            </Typography>
            <Typography className="invoice-subtitle" variant="h4" style={{
                color: template.colors.primary,
                fontFamily: template.fonts.main,
                fontSize: `${template.font_sizes.invoice_number}px`,
                marginBottom: '1rem',
                textAlign: 'right',
            }}>
                #{invoice.invoice_number || ''}
            </Typography>
            <Box display="flex" flexDirection={"column"} justifyContent="space-between" mb={0}>
                <Box>
                    <ContactInfo contact={billToContact} label="Bill To" template={template} />
                </Box>
                <Box>
                    <ContactInfo contact={sendToContact} label="Send To" template={template} />
                </Box>
            </Box>


            <Typography style={{
                fontFamily: template.fonts.main,
                fontSize: `${template.font_sizes.normal_text}px`,
                marginBottom: '1rem',
            }}>
                Date: {invoice.invoice_date}
            </Typography>

            <Table style={{ marginTop: '2rem' }}>
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
                        <Fragment key={index}>
                            <TableRow className="invoice-item">
                                <StyledTableCell template={template} style={{ border: "none" }}>
                                    {item.description}
                                    {item.discount_percentage > 0 && ` (${item.discount_percentage}% Discount)`}
                                </StyledTableCell>
                                <StyledTableCell template={template} align="right" style={{ border: "none" }}>{item.quantity}</StyledTableCell>
                                <StyledTableCell template={template} align="right" style={{ border: "none" }}>
                                    ${item.unit_price}
                                </StyledTableCell>
                                <StyledTableCell template={template} align="right" style={{ border: "none" }}>
                                    ${isFullInvoice(invoice)
                                        ? (item as InvoiceItem).line_total
                                        : (calculateLineTotal(item))}
                                </StyledTableCell>
                            </TableRow>
                            {item.subitems && item.subitems.length > 0 && (
                                <TableRow className="invoice-subitem">
                                    <StyledTableCell template={template} colSpan={4} style={{ paddingLeft: '3em', border: "none", marginTop: '0' }}>
                                        <ul style={{ margin: 0, paddingLeft: '.5em', color: template.colors.secondary }}>
                                            {item.subitems.map((subitem, subIndex) => (
                                                <li key={subIndex}>{subitem.description}</li>
                                            ))}
                                        </ul>
                                    </StyledTableCell>
                                </TableRow>
                            )}
                        </Fragment>
                    ))}
                </TableBody>
            </Table>

            <Box display="flex" justifyContent="flex-end" mt={4}>
                <Box>
                    <>
                        <Typography variant="h6" align="right" style={{
                            padding: '0 16px',
                            color: template.colors.primary,
                            fontFamily: template.fonts.main,
                            fontSize: `${template.font_sizes.normal_text}px`,
                        }}>Subtotal: ${subtotal.toFixed(2)}</Typography>
                        {discount_percentage > 0 && (
                            <>
                                <Typography variant="h6" align="right" style={{
                                    padding: '0 16px',
                                    color: template.colors.primary,
                                    fontFamily: template.fonts.main,
                                    fontSize: `${template.font_sizes.normal_text}px`,
                                }}>Discount ({discount_percentage}%): -${discount_amount.toFixed(2)}</Typography>
                                <Typography variant="h6" align="right" style={{
                                    padding: '0 16px',
                                    color: template.colors.accent,
                                    fontFamily: template.fonts.main,
                                    fontSize: `${template.font_sizes.normal_text}px`,
                                }}>Discounted Subtotal: ${(subtotal - discount_amount).toFixed(2)}</Typography>
                            </>
                        )}
                        <Typography variant="h6" align="right" style={{
                            padding: '16px',
                            color: template.colors.primary,
                            fontFamily: template.fonts.main,
                            fontSize: `${template.font_sizes.normal_text}px`,
                        }}>Tax ({invoice.tax_rate || 0}%): ${tax.toFixed(2)}</Typography>
                        <Typography variant="h6" align="right" style={{
                            padding: '0 16px',
                            color: template.colors.primary,
                            fontFamily: template.fonts.main,
                            fontSize: `${template.font_sizes.normal_text}px`,
                        }}>
                            Total: ${total.toFixed(2)}
                        </Typography>
                    </>
                </Box>
            </Box>

            {invoice.notes && (
                <Box mt={4}>
                    <Typography variant="h6">Notes:</Typography>
                    <Typography>{invoice.notes}</Typography>
                </Box>
            )}
        </PreviewContainer>
    );
};

export default InvoicePreview;