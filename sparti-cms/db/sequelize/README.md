# Sequelize ORM Setup

This directory contains Sequelize models, migrations, and seeders for the Sparti CMS project.

## Structure

```
sequelize/
├── models/          # Sequelize model definitions
├── migrations/      # Database migration files
├── seeders/         # Database seed files
└── config.js        # Sequelize CLI configuration
```

## Models

- **Category**: Categories for organizing posts (hierarchical with parent_id)
- **Tag**: Tags for categorizing posts
- **Post**: Blog posts and content
- **PostCategory**: Junction table for post-category relationships
- **PostTag**: Junction table for post-tag relationships

## Running Migrations

### Run all pending migrations
```bash
npm run sequelize:migrate
```

### Undo last migration
```bash
npm run sequelize:migrate:undo
```

### Check migration status
```bash
npm run sequelize:migrate:status
```

## Using Models in Code

```javascript
import models from '../sequelize/models/index.js';
const { Category, Tag, Post } = models;

// Create a category
const category = await Category.create({
  name: 'SEO',
  slug: 'seo',
  description: 'Search Engine Optimization'
});

// Find all categories
const categories = await Category.findAll();

// Find with associations
const post = await Post.findByPk(1, {
  include: [
    { model: Category, as: 'categories' },
    { model: Tag, as: 'tags' }
  ]
});
```

## Migration: Categories and Tags

The migration `20241201000000-create-categories-and-tags.js` creates the categories and tags tables and migrates existing data from the `terms`/`term_taxonomy` system.

## Notes

- Models use underscored naming (created_at, updated_at)
- Timestamps are automatically managed by Sequelize
- Associations are defined in each model's `associate` method
- Post counts are updated automatically when relationships change

