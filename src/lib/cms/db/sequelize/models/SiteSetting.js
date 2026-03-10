import { DataTypes } from 'sequelize';

export default function SiteSetting(sequelize) {
  const SiteSetting = sequelize.define('SiteSetting', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    setting_key: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    setting_value: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    setting_type: {
      type: DataTypes.STRING(50),
      defaultValue: 'text',
    },
    setting_category: {
      type: DataTypes.STRING(100),
      defaultValue: 'general',
    },
    is_public: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    tenant_id: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    theme_id: {
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
    tableName: 'site_settings',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['setting_key', 'tenant_id', 'theme_id'],
        name: 'site_settings_setting_key_tenant_theme_unique',
      },
      {
        fields: ['tenant_id', 'theme_id'],
        name: 'idx_site_settings_tenant_theme',
      },
      {
        fields: ['theme_id'],
        name: 'idx_site_settings_theme_id',
      },
    ],
  });

  return SiteSetting;
}

