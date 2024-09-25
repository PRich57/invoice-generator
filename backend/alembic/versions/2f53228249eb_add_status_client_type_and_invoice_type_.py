"""Add status, client_type, and invoice_type columns with enums

Revision ID: f1a2b3c4d5e6
Revises: a097791d498f
Create Date: 2024-09-24 20:00:00.000000

"""
from typing import Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = 'f1a2b3c4d5e6'
down_revision: Union[str, None] = 'a097791d498f'
branch_labels: Union[str, None] = None
depends_on: Union[str, None] = None


def upgrade() -> None:
    # Step 1: Create Enum Types
    invoicestatusenum = postgresql.ENUM('PAID', 'UNPAID', 'OVERDUE', name='invoicestatusenum')
    clienttypeenum = postgresql.ENUM('INDIVIDUAL', 'BUSINESS', name='clienttypeenum')
    invoicetypeenum = postgresql.ENUM('SERVICE', 'PRODUCT', name='invoicetypeenum')
    
    invoicestatusenum.create(op.get_bind(), checkfirst=True)
    clienttypeenum.create(op.get_bind(), checkfirst=True)
    invoicetypeenum.create(op.get_bind(), checkfirst=True)
    
    # Step 2: Add New Columns as Nullable
    op.add_column('invoices', sa.Column('status', sa.Enum('PAID', 'UNPAID', 'OVERDUE', name='invoicestatusenum'), nullable=True))
    op.add_column('invoices', sa.Column('client_type', sa.Enum('INDIVIDUAL', 'BUSINESS', name='clienttypeenum'), nullable=True))
    op.add_column('invoices', sa.Column('invoice_type', sa.Enum('SERVICE', 'PRODUCT', name='invoicetypeenum'), nullable=True))
    
    # Step 3: Update Existing Data to Set Non-NULL Values
    # Assign default values or map existing data if applicable
    # Example: Set default 'UNPAID' for all existing invoices
    op.execute("UPDATE invoices SET status = 'UNPAID' WHERE status IS NULL;")
    op.execute("UPDATE invoices SET client_type = 'BUSINESS' WHERE client_type IS NULL;")
    op.execute("UPDATE invoices SET invoice_type = 'SERVICE' WHERE invoice_type IS NULL;")
    
    # Step 4: Alter Columns to NOT NULL
    op.alter_column('invoices', 'status', nullable=False)
    op.alter_column('invoices', 'client_type', nullable=False)
    op.alter_column('invoices', 'invoice_type', nullable=False)
    
    # Step 5: Create Indexes on New Columns (Optional)
    op.create_index('ix_invoices_status', 'invoices', ['status'], unique=False)
    op.create_index('ix_invoices_client_type', 'invoices', ['client_type'], unique=False)
    op.create_index('ix_invoices_invoice_type', 'invoices', ['invoice_type'], unique=False)


def downgrade() -> None:
    # Step 1: Drop Indexes on New Columns
    op.drop_index('ix_invoices_status', table_name='invoices')
    op.drop_index('ix_invoices_client_type', table_name='invoices')
    op.drop_index('ix_invoices_invoice_type', table_name='invoices')
    
    # Step 2: Alter Columns to Nullable
    op.alter_column('invoices', 'status', nullable=True)
    op.alter_column('invoices', 'client_type', nullable=True)
    op.alter_column('invoices', 'invoice_type', nullable=True)
    
    # Step 3: Drop Columns
    op.drop_column('invoices', 'status')
    op.drop_column('invoices', 'client_type')
    op.drop_column('invoices', 'invoice_type')
    
    # Step 4: Drop Enum Types
    invoicestatusenum = postgresql.ENUM('PAID', 'UNPAID', 'OVERDUE', name='invoicestatusenum')
    clienttypeenum = postgresql.ENUM('INDIVIDUAL', 'BUSINESS', name='clienttypeenum')
    invoicetypeenum = postgresql.ENUM('SERVICE', 'PRODUCT', name='invoicetypeenum')
    
    invoicestatusenum.drop(op.get_bind(), checkfirst=True)
    clienttypeenum.drop(op.get_bind(), checkfirst=True)
    invoicetypeenum.drop(op.get_bind(), checkfirst=True)
