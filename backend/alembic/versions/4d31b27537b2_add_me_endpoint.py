"""Add /me endpoint

Revision ID: 4d31b27537b2
Revises: 1fd36f9317f5
Create Date: 2024-09-04 18:28:22.371224

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '4d31b27537b2'
down_revision: Union[str, None] = '1fd36f9317f5'
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