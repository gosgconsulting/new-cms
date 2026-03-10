import { DataTypes } from 'sequelize';

export default function PageFactory(sequelize) {
  const Page = sequelize.define('Page', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    page_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    slug: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    meta_title: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    meta_description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    seo_index: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    status: {
      type: DataTypes.STRING(50),
      defaultValue: 'draft',
    },
    page_type: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'page',
    },
    tenant_id: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: 'tenant-gosg',
    },
    campaign_source: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    conversion_goal: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    legal_type: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    last_reviewed_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    version: {
      type: DataTypes.STRING(20),
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
    tableName: 'pages',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['slug', 'tenant_id'],
        name: 'unique_slug_per_tenant',
      },
      {
        fields: ['tenant_id'],
        name: 'idx_pages_tenant_id',
      },
      {
        fields: ['page_type'],
        name: 'idx_pages_page_type',
      },
      {
        fields: ['status'],
        name: 'idx_pages_status',
      },
    ],
  });

  return Page;
}
