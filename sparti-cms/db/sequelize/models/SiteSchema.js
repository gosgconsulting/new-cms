import { DataTypes } from 'sequelize';

export default function SiteSchema(sequelize) {
  const SiteSchema = sequelize.define('SiteSchema', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    schema_key: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    schema_value: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    language: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'default',
    },
    tenant_id: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  }, {
    tableName: 'site_schemas',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['schema_key', 'tenant_id', 'language'],
        name: 'site_schemas_schema_key_tenant_id_language_unique'
      }
    ]
  });

  return SiteSchema;
}

