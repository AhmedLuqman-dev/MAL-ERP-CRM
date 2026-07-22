export const ProductModel = {
  tableName: 'products',
  fields: {
    id: { type: 'uuid', primaryKey: true, default: 'gen_random_uuid()' },
    name: { type: 'text', required: true },
    sku: { type: 'text', required: true, unique: true },
    category: { type: 'text' },
    unit_price: { type: 'numeric(12,2)', required: true, default: 0 },
    current_stock: { type: 'integer', required: true, default: 0 },
    minimum_stock: { type: 'integer', required: true, default: 0 },
    warehouse_location: { type: 'text' },
    created_by: { type: 'uuid', foreignKey: 'users.id' },
    created_at: { type: 'timestamptz', default: 'now()' },
    updated_at: { type: 'timestamptz', default: 'now()' },
  },
  selectableFields: ['id', 'name', 'sku', 'category', 'unit_price', 'current_stock', 'minimum_stock', 'warehouse_location', 'created_by', 'created_at', 'updated_at'],
};

export const StockMovementModel = {
  tableName: 'stock_movements',
  fields: {
    id: { type: 'uuid', primaryKey: true, default: 'gen_random_uuid()' },
    product_id: { type: 'uuid', required: true, foreignKey: 'products.id' },
    quantity_changed: { type: 'integer', required: true },
    movement_type: { type: 'text', required: true, values: ['IN', 'OUT'] },
    reason: { type: 'text' },
    created_by: { type: 'uuid', foreignKey: 'users.id' },
    created_at: { type: 'timestamptz', default: 'now()' },
  },
  selectableFields: ['id', 'product_id', 'quantity_changed', 'movement_type', 'reason', 'created_by', 'created_at'],
};
