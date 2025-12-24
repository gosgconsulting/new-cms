/**
 * Example script to create an About page schema
 * 
 * This script demonstrates how to create a new page schema
 * and insert it into the database
 */

import { Pool } from 'pg';
import dotenv from 'dotenv';

// Configure dotenv
dotenv.config();

// PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_PUBLIC_URL
});

// About page schema data
const aboutPageData = {
  slug: 'about',
  meta: {
    title: 'About Us - GOSG Consulting',
    description: 'Learn about our SEO services and our team',
    keywords: 'SEO, Singapore, about us, team',
    ogImage: '/assets/team-photo.png'
  },
  components: [
    {
      "key": "AboutHeroSection",
      "name": "Hero",
      "type": "HeroSection",
      "items": [
        {
          "key": "title",
          "type": "heading",
          "level": 1,
          "content": "About GOSG Consulting"
        },
        {
          "key": "description",
          "type": "text",
          "content": "We are a team of SEO experts dedicated to helping businesses grow their online presence."
        },
        {
          "key": "button",
          "icon": "arrowRight",
          "type": "button",
          "content": "Contact Us"
        }
      ]
    },
    {
      "key": "TeamSection",
      "name": "Team",
      "type": "TeamSection",
      "items": [
        {
          "key": "title",
          "type": "heading",
          "level": 2,
          "content": "Meet Our Team"
        },
        {
          "key": "subtitle",
          "type": "text",
          "content": "Our experts are passionate about helping businesses succeed online."
        },
        {
          "key": "team",
          "type": "array",
          "items": [
            {
              "key": "member1",
              "type": "teamMember",
              "name": "John Doe",
              "role": "CEO & Founder",
              "bio": "John has over 10 years of experience in SEO and digital marketing.",
              "image": "/assets/team/john-doe.jpg"
            },
            {
              "key": "member2",
              "type": "teamMember",
              "name": "Jane Smith",
              "role": "SEO Specialist",
              "bio": "Jane specializes in technical SEO and on-page optimization.",
              "image": "/assets/team/jane-smith.jpg"
            },
            {
              "key": "member3",
              "type": "teamMember",
              "name": "Mike Johnson",
              "role": "Content Strategist",
              "bio": "Mike creates content strategies that drive organic traffic and conversions.",
              "image": "/assets/team/mike-johnson.jpg"
            }
          ]
        }
      ]
    },
    {
      "key": "ValuesSection",
      "name": "Values",
      "type": "ValuesSection",
      "items": [
        {
          "key": "title",
          "type": "heading",
          "level": 2,
          "content": "Our Values"
        },
        {
          "key": "values",
          "type": "array",
          "items": [
            {
              "key": "value1",
              "type": "value",
              "title": "Transparency",
              "description": "We believe in complete transparency with our clients."
            },
            {
              "key": "value2",
              "type": "value",
              "title": "Results-Driven",
              "description": "We focus on delivering measurable results for our clients."
            },
            {
              "key": "value3",
              "type": "value",
              "title": "Innovation",
              "description": "We stay ahead of the curve with the latest SEO techniques."
            }
          ]
        }
      ]
    },
    {
      "key": "ContactSection",
      "name": "Contact",
      "type": "ContactForm",
      "items": [
        {
          "key": "title",
          "type": "heading",
          "level": 2,
          "content": "Get In Touch"
        },
        {
          "key": "description",
          "type": "text",
          "content": "Have questions about our services? Fill out the form, and we'll get back to you shortly."
        },
        {
          "key": "contactInfo",
          "type": "array",
          "items": [
            {
              "key": "phone",
              "type": "text",
              "content": "+65 8024 6850"
            },
            {
              "key": "calendar",
              "link": "https://calendly.com/gosgconsulting/oliver-shih",
              "type": "text",
              "content": "Schedule a meeting"
            }
          ]
        }
      ]
    }
  ]
};

// Insert about page data
const insertAboutPageData = async () => {
  try {
    const result = await pool.query(
      'INSERT INTO page_schemas (slug, meta, components) VALUES ($1, $2, $3) ON CONFLICT (slug) DO UPDATE SET meta = $2, components = $3, updated_at = NOW() RETURNING id',
      [aboutPageData.slug, aboutPageData.meta, aboutPageData.components]
    );
    
    console.log('About page schema inserted or updated with ID:', result.rows[0].id);
    return result.rows[0].id;
  } catch (error) {
    console.error('Error inserting about page schema:', error);
    throw error;
  }
};

// Run the script
const run = async () => {
  try {
    await insertAboutPageData();
    console.log('Done!');
  } catch (error) {
    console.error('Script failed:', error);
  } finally {
    await pool.end();
  }
};

run();