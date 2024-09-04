import React from 'react';
import { Typography, List, ListItem, ListItemText } from '@mui/material';
import { Invoice } from '../../types';

interface InvoiceViewProps {
    invoice: Invoice;
}

const InvoiceView: React.FC<InvoiceViewProps> = ({ invoice }) => {
    return (
        <div>
            <Typography variant="h4">Invoice #{invoice.invoice_number}</Typography>
            <Typography>Date: {new Date(invoice.invoice_date).toLocaleDateString()}</Typography>
            {/* Add more invoice details here */}

            <Typography variant="h6" style={{ marginTop: '1rem' }}>Items</Typography>
            <List>
                {invoice.items.map((item, index) => (
                    <ListItem key={index} style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                        <ListItemText
                            primary={`${item.description} (${item.quantity} x $${item.unit_price})`}
                            secondary={`$${(item.quantity * item.unit_price).toFixed(2)}`}
                        />
                        {item.subitems.length > 0 && (
                            <List style={{ marginLeft: '1rem', width: '100%' }}>
                                {item.subitems.map((subitem, subIndex) => (
                                    <ListItem key={subIndex}>
                                        <ListItemText
                                            primary={`• ${subitem.description}`}
                                            primaryTypographyProps={{
                                                style: { color: '#666', fontSize: '0.9em' }
                                            }}
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        )}
                    </ListItem>
                ))}
            </List>

            {/* Add totals, tax, and other invoice details here */}
        </div>
    );
};

export default InvoiceView;