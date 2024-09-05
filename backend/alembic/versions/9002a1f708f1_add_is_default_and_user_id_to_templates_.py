"""Add is_default and user_id to templates table

Revision ID: 9002a1f708f1
Revises: 4d31b27537b2
Create Date: 2023-05-24 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '9002a1f708f1'
down_revision = '4d31b27537b2'
branch_labels = None
depends_on = None

def upgrade():
    # Check if is_default column exists
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    columns = inspector.get_columns('templates')
    column_names = [c['name'] for c in columns]

    if 'is_default' not in column_names:
        # Add is_default column if it doesn't exist
        op.add_column('templates', sa.Column('is_default', sa.Boolean(), nullable=True))
    
    # Set default value for existing rows
    op.execute("UPDATE templates SET is_default = FALSE WHERE is_default IS NULL")
    
    # Make is_default NOT NULL
    op.alter_column('templates', 'is_default',
               existing_type=sa.Boolean(),
               nullable=False)
    
    if 'user_id' not in column_names:
        # Add user_id column if it doesn't exist
        op.add_column('templates', sa.Column('user_id', sa.Integer(), nullable=True))
        op.create_foreign_key(None, 'templates', 'users', ['user_id'], ['id'])

def downgrade():
    op.drop_constraint(None, 'templates', type_='foreignkey')
    op.drop_column('templates', 'user_id')
    op.drop_column('templates', 'is_default')