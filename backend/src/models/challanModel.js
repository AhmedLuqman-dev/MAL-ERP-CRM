export const FollowUpNoteModel = {
  tableName: 'follow_up_notes',
  fields: {
    id: { type: 'uuid', primaryKey: true, default: 'gen_random_uuid()' },
    customer_id: { type: 'uuid', required: true, foreignKey: 'customers.id' },
    note: { type: 'text', required: true },
    follow_up_date: { type: 'date', required: true },
    created_by: { type: 'uuid', foreignKey: 'users.id' },
    created_at: { type: 'timestamptz', default: 'now()' },
  },
  selectableFields: ['id', 'customer_id', 'note', 'follow_up_date', 'created_by', 'created_at'],
};

export const SalesChallanModel = {
  tableName: 'sales_challans',
  fields: {
    id: { type: 'uuid', primaryKey: true, default: 'gen_random_uuid()' },
    challan_number: { type: 'text', required: true, unique: true },
    customer_id: { type: 'uuid', required: true, foreignKey: 'customers.id' },
    status: { type: 'text', required: true, values: ['draft', 'confirmed', 'cancelled'], default: 'draft' },
    total_quantity: { type: 'integer', required: true, default: 0 },
    created_by: { type: 'uuid', foreignKey: 'users.id' },
    created_at: { type: 'timestamptz', default: 'now()' },
  },
  selectableFields: ['id', 'challan_number', 'customer_id', 'status', 'total_quantity', 'created_by', 'created_at'],
};

export const SalesChallanItemModel = {
  tableName: 'sales_challan_items',
  fields: {
    id: { type: 'uuid', primaryKey: true, default: 'gen_random_uuid()' },
    challan_id: { type: 'uuid', required: true, foreignKey: 'sales_challans.id' },
    product_id: { type: 'uuid', required: true, foreignKey: 'products.id' },
    product_snapshot: { type: 'jsonb', required: true },
    quantity: { type: 'integer', required: true },
    unit_price: { type: 'numeric(12,2)', required: true },
    created_at: { type: 'timestamptz', default: 'now()' },
  },
  selectableFields: ['id', 'challan_id', 'product_id', 'product_snapshot', 'quantity', 'unit_price', 'created_at'],
};
