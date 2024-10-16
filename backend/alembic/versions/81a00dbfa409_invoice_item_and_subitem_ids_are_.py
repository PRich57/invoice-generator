"""Invoice Item and Subitem IDs are BigIntegers

Revision ID: 81a00dbfa409
Revises: 0821d54e1f4b
Create Date: 2024-10-16 15:58:41.683971

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '81a00dbfa409'
down_revision: Union[str, None] = '0821d54e1f4b'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_index('ix_refresh_tokens_id', table_name='refresh_tokens')
    op.drop_index('ix_refresh_tokens_token', table_name='refresh_tokens')
    op.drop_table('refresh_tokens')
    op.alter_column('invoice_items', 'id',
               existing_type=sa.INTEGER(),
               type_=sa.BigInteger(),
               existing_nullable=False,
               autoincrement=True,
               existing_server_default=sa.text("nextval('invoice_items_id_seq'::regclass)"))
    op.alter_column('invoice_subitems', 'id',
               existing_type=sa.INTEGER(),
               type_=sa.BigInteger(),
               existing_nullable=False,
               autoincrement=True)
    op.alter_column('invoice_subitems', 'invoice_item_id',
               existing_type=sa.INTEGER(),
               type_=sa.BigInteger(),
               existing_nullable=True)
    op.drop_constraint('invoice_subitems_invoice_item_id_fkey', 'invoice_subitems', type_='foreignkey')
    op.create_foreign_key(None, 'invoice_subitems', 'invoice_items', ['invoice_item_id'], ['id'])
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_constraint(None, 'invoice_subitems', type_='foreignkey')
    op.create_foreign_key('invoice_subitems_invoice_item_id_fkey', 'invoice_subitems', 'invoice_items', ['invoice_item_id'], ['id'], ondelete='CASCADE')
    op.alter_column('invoice_subitems', 'invoice_item_id',
               existing_type=sa.BigInteger(),
               type_=sa.INTEGER(),
               existing_nullable=True)
    op.alter_column('invoice_subitems', 'id',
               existing_type=sa.BigInteger(),
               type_=sa.INTEGER(),
               existing_nullable=False,
               autoincrement=True)
    op.alter_column('invoice_items', 'id',
               existing_type=sa.BigInteger(),
               type_=sa.INTEGER(),
               existing_nullable=False,
               autoincrement=True,
               existing_server_default=sa.text("nextval('invoice_items_id_seq'::regclass)"))
    op.create_table('refresh_tokens',
    sa.Column('id', sa.INTEGER(), autoincrement=True, nullable=False),
    sa.Column('token', sa.VARCHAR(), autoincrement=False, nullable=True),
    sa.Column('user_id', sa.INTEGER(), autoincrement=False, nullable=True),
    sa.Column('created_at', postgresql.TIMESTAMP(timezone=True), server_default=sa.text('now()'), autoincrement=False, nullable=True),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], name='refresh_tokens_user_id_fkey'),
    sa.PrimaryKeyConstraint('id', name='refresh_tokens_pkey')
    )
    op.create_index('ix_refresh_tokens_token', 'refresh_tokens', ['token'], unique=True)
    op.create_index('ix_refresh_tokens_id', 'refresh_tokens', ['id'], unique=False)
    # ### end Alembic commands ###
