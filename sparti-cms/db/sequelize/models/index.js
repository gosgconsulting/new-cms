import { getSequelize } from '../../sequelize.js';

const sequelize = getSequelize();

// Import model factories
import CategoryFactory from './Category.js';
import TagFactory from './Tag.js';
import PostFactory from './Post.js';
import PostCategoryFactory from './PostCategory.js';
import PostTagFactory from './PostTag.js';
import SiteSchemaFactory from './SiteSchema.js';

// Initialize models
const Category = CategoryFactory(sequelize);
const Tag = TagFactory(sequelize);
const Post = PostFactory(sequelize);
const PostCategory = PostCategoryFactory(sequelize);
const PostTag = PostTagFactory(sequelize);
const SiteSchema = SiteSchemaFactory(sequelize);

const models = {
  Category,
  Tag,
  Post,
  PostCategory,
  PostTag,
  SiteSchema,
};

// Define associations
Object.keys(models).forEach((modelName) => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

export { sequelize };
export default models;

