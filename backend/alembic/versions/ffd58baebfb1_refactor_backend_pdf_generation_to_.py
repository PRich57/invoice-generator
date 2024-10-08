"""Refactor backend pdf generation to match original CLI version

Revision ID: ffd58baebfb1
Revises: 6480cea734f7
Create Date: 2024-09-04 11:17:56.624824

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = 'ffd58baebfb1'
down_revision: Union[str, None] = '6480cea734f7'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('templates', sa.Column('colors', sa.JSON(), nullable=True))
    op.add_column('templates', sa.Column('fonts', sa.JSON(), nullable=True))
    op.add_column('templates', sa.Column('font_sizes', sa.JSON(), nullable=True))
    op.add_column('templates', sa.Column('layout', sa.JSON(), nullable=True))
    op.drop_column('templates', 'logo_url')
    op.drop_column('templates', 'font_size')
    op.drop_column('templates', 'content')
    op.drop_column('templates', 'font_family')
    op.drop_column('templates', 'secondary_color')
    op.drop_column('templates', 'primary_color')
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('templates', sa.Column('primary_color', sa.VARCHAR(), autoincrement=False, nullable=True))
    op.add_column('templates', sa.Column('secondary_color', sa.VARCHAR(), autoincrement=False, nullable=True))
    op.add_column('templates', sa.Column('font_family', sa.VARCHAR(), autoincrement=False, nullable=True))
    op.add_column('templates', sa.Column('content', postgresql.JSON(astext_type=sa.Text()), autoincrement=False, nullable=True))
    op.add_column('templates', sa.Column('font_size', sa.INTEGER(), autoincrement=False, nullable=True))
    op.add_column('templates', sa.Column('logo_url', sa.VARCHAR(), autoincrement=False, nullable=True))
    op.drop_column('templates', 'layout')
    op.drop_column('templates', 'font_sizes')
    op.drop_column('templates', 'fonts')
    op.drop_column('templates', 'colors')
    # ### end Alembic commands ###
