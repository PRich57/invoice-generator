"""Add template_id to invoices

Revision ID: 898df5e68e74
Revises: f48d4c4035a4
Create Date: 2024-09-04 12:50:28.983597

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '898df5e68e74'
down_revision: Union[str, None] = 'f48d4c4035a4'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    pass
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    pass
    # ### end Alembic commands ###
