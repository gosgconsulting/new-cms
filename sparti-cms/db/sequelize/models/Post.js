import { DataTypes } from 'sequelize';

export default function Post(sequelize) {
  const Post = sequelize.define('Post', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    slug: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    excerpt: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING(20),
      defaultValue: 'draft',
    },
    post_type: {
      type: DataTypes.STRING(50),
      defaultValue: 'post',
    },
    author_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    parent_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'posts',
        key: 'id',
      },
    },
    menu_order: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    featured_image_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    meta_title: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    meta_description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    meta_keywords: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    canonical_url: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    robots_meta: {
      type: DataTypes.STRING(100),
      defaultValue: 'index,follow',
    },
    og_title: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    og_description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    og_image: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    twitter_title: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    twitter_description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    twitter_image: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    view_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    last_viewed_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    published_at: {
      type: DataTypes.DATE,
      allowNull: true,
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
    tableName: 'posts',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    underscored: true,
  });

  Post.associate = function(models) {
    // Many-to-many relationship with Categories
    Post.belongsToMany(models.Category, {
      through: models.PostCategory,
      foreignKey: 'post_id',
      otherKey: 'category_id',
      as: 'categories',
    });

    // Many-to-many relationship with Tags
    Post.belongsToMany(models.Tag, {
      through: models.PostTag,
      foreignKey: 'post_id',
      otherKey: 'tag_id',
      as: 'tags',
    });
  };

  return Post;
}

