"""Make order non nullable

Revision ID: 6dfca4bca1fe
Revises: 8d62ca7f6d13
Create Date: 2024-09-18 18:34:31.916380

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '6dfca4bca1fe'
down_revision: Union[str, None] = '8d62ca7f6d13'
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
