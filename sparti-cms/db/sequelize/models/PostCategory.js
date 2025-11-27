import { DataTypes } from 'sequelize';

export default function PostCategory(sequelize) {
  const PostCategory = sequelize.define('PostCategory', {
    post_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: 'posts',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    category_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: 'categories',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
  }, {
    tableName: 'post_categories',
    timestamps: false,
    underscored: true,
  });

  return PostCategory;
}

