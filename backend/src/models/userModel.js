export const UserModel = {
  tableName: 'users',
  fields: {
    id: { type: 'uuid', primaryKey: true, default: 'gen_random_uuid()' },
    name: { type: 'text', required: true },
    email: { type: 'text', required: true, unique: true },
    password_hash: { type: 'text', required: true },
    role: { type: 'text', required: true, values: ['admin', 'sales', 'warehouse', 'accounts'] },
    created_at: { type: 'timestamptz', default: 'now()' },
  },
  selectableFields: ['id', 'name', 'email', 'role', 'created_at'],
};
