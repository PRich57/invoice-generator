"""Refactored subtotal, total, and line_total logic

Revision ID: 58bb598e9c85
Revises: 88ea364e42bb
Create Date: 2024-08-31 17:37:25.833794

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '58bb598e9c85'
down_revision: Union[str, None] = '88ea364e42bb'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('invoice_items', sa.Column('discount_percentage', sa.DECIMAL(precision=5, scale=2), nullable=True))
    op.add_column('invoices', sa.Column('discount_percentage', sa.DECIMAL(precision=5, scale=2), nullable=True))
    op.drop_column('invoices', 'override_total')
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('invoices', sa.Column('override_total', sa.NUMERIC(precision=10, scale=2), autoincrement=False, nullable=True))
    op.drop_column('invoices', 'discount_percentage')
    op.drop_column('invoice_items', 'discount_percentage')
    # ### end Alembic commands ###
