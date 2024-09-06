import React from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableHead, TableRow, styled } from '@mui/material';
import { Template, InvoiceItem, Contact, InvoicePreviewProps, InvoiceItemCreate, Invoice, InvoiceCreate } from '../../types';
import { BorderAll } from '@mui/icons-material';


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

const calculateInvoiceTotals = (invoice: Partial<Invoice | InvoiceCreate>) => {
    const subtotal = invoice.items?.reduce((acc, item) => 
        acc + (item.quantity || 0) * (item.unit_price || 0), 0
    ) || 0;
    
    const tax = subtotal * (invoice.tax_rate || 0) / 100;
    const total = subtotal + tax;

    return { subtotal, tax, total };
};

const ContactInfo: React.FC<{ contact?: Contact | null; label: string; template: Template }> = ({ contact, label, template }) => (
    <Box>
        <Typography variant="h6" style={{
            color: template.colors.secondary,
            fontFamily: template.fonts.main,
            fontSize: `${template.font_sizes.section_header}px`,
        }}>
            {label}:
        </Typography>
        {contact && (
            <>
                <Typography>{contact.name}</Typography>
                {contact.street_address && <Typography>{contact.street_address}</Typography>}
                {(contact.city || contact.state || contact.postal_code) && (
                    <Typography>
                        {contact.city}{contact.city && ','} {contact.state} {contact.postal_code}
                    </Typography>
                )}
            </>
        )}
    </Box>
);

const InvoicePreview: React.FC<InvoicePreviewProps> = ({ invoice, template, billToContact, sendToContact }) => {
    const isFullInvoice = (inv: Partial<Invoice | InvoiceCreate>): inv is Invoice => 
        'subtotal' in inv && 'tax' in inv && 'total' in inv;

    return (
        <PreviewContainer className="invoice-preview">
            <Typography variant="h4" style={{
                color: template.colors.primary,
                fontFamily: template.fonts.accent,
                fontSize: `${template.font_sizes.title}px`,
            }}>
                Invoice #{invoice.invoice_number || 'N/A'}
            </Typography>

            <Box display="flex" justifyContent="space-between" mt={4}>
                <ContactInfo contact={billToContact} label="Bill To" template={template} />
                <ContactInfo contact={sendToContact} label="Send To" template={template} />
            </Box>

            <Box display="flex" justifyContent="flex-end" mt={2}>
                <Typography>Date: {invoice.invoice_date || 'N/A'}</Typography>
            </Box>

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
                    {(invoice.items || []).map((item: Partial<InvoiceItem | InvoiceItemCreate>, index) => (
                        <React.Fragment key={index}>
                            <TableRow style={{ marginBottom: "0", paddingBottom: '0' }}>
                                <StyledTableCell template={template} style={{ border: "none", marginBottom: '0' }}>
                                    {item.description}
                                    {item.discount_percentage && item.discount_percentage > 0 && ` (${item.discount_percentage}% Discount)`}
                                </StyledTableCell>
                                <StyledTableCell template={template} align="right" style={{ border: "none" }}>{item.quantity || 0}</StyledTableCell>
                                <StyledTableCell template={template} align="right" style={{ border: "none" }}>
                                    ${(item.unit_price || 0).toFixed(2)}
                                </StyledTableCell>
                                <StyledTableCell template={template} align="right" style={{ border: "none" }}>
                                    ${(item.line_total || 0).toFixed(2)}
                                </StyledTableCell>
                            </TableRow>
                            {item.subitems && item.subitems.length > 0 && (
                                <TableRow style={{ marginTop: '0', paddingTop: '0' }}>
                                    <StyledTableCell template={template} colSpan={4} style={{ paddingLeft: '3em', border: "none", marginTop: '0' }}>
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

            <Box display="flex" justifyContent="flex-end" mt={4}>
                <Box>
                    {isFullInvoice(invoice) ? (
                        <>
                            <Typography>Subtotal: ${invoice.subtotal.toFixed(2)}</Typography>
                            <Typography>Tax ({invoice.tax_rate || 0}%): ${invoice.tax.toFixed(2)}</Typography>
                            <Typography variant="h6" style={{
                                color: template.colors.primary,
                                fontFamily: template.fonts.accent,
                                fontSize: `${template.font_sizes.normal_text}px`,
                            }}>
                                Total: ${invoice.total.toFixed(2)}
                            </Typography>
                        </>
                    ) : (
                        <Typography>Totals will be calculated when the invoice is saved.</Typography>
                    )}
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