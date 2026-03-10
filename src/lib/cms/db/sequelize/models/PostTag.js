import { DataTypes } from 'sequelize';

export default function PostTag(sequelize) {
  const PostTag = sequelize.define('PostTag', {
    post_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: 'posts',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    tag_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: 'tags',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
  }, {
    tableName: 'post_tags',
    timestamps: false,
    underscored: true,
  });

  return PostTag;
}

