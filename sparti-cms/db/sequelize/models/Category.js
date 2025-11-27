import { DataTypes } from 'sequelize';

export default function Category(sequelize) {
  const Category = sequelize.define('Category', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    slug: {
      type: DataTypes.STRING(200),
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    parent_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'categories',
        key: 'id',
      },
      onDelete: 'SET NULL',
    },
    meta_title: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    meta_description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    post_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
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
    tableName: 'categories',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    underscored: true,
  });

  Category.associate = function(models) {
    // Self-referential relationship for parent categories
    Category.belongsTo(Category, {
      as: 'parent',
      foreignKey: 'parent_id',
    });
    Category.hasMany(Category, {
      as: 'children',
      foreignKey: 'parent_id',
    });

    // Many-to-many relationship with Posts
    Category.belongsToMany(models.Post, {
      through: models.PostCategory,
      foreignKey: 'category_id',
      otherKey: 'post_id',
      as: 'posts',
    });
  };

  return Category;
}

