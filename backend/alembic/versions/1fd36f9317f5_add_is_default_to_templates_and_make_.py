"""Add is_default to templates and make template_id non-nullable

Revision ID: 1fd36f9317f5
Revises: c60a936123ca
Create Date: 2024-09-04 16:52:33.939738

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '1fd36f9317f5'
down_revision: Union[str, None] = 'c60a936123ca'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.alter_column('invoices', 'template_id',
               existing_type=sa.INTEGER(),
               nullable=False)
    op.add_column('templates', sa.Column('is_default', sa.Boolean(), nullable=True))
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('templates', 'is_default')
    op.alter_column('invoices', 'template_id',
               existing_type=sa.INTEGER(),
               nullable=True)
    # ### end Alembic commands ###
