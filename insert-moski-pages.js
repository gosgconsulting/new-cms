import 'dotenv/config';
import pool from './sparti-cms/db/postgres.js';

/**
 * Script to insert MOSKI Paris pages and layouts for tenant-110ee38b
 */
async function insertMoskiPages() {
  console.log('[testing] Starting MOSKI pages insertion for tenant-110ee38b...');
  
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // First, ensure the tenant exists
    console.log('[testing] Ensuring tenant-110ee38b exists...');
    await client.query(`
      INSERT INTO tenants (id, name, created_at)
      VALUES ('tenant-110ee38b', 'MOSKI Paris', NOW())
      ON CONFLICT (id) DO NOTHING
    `);
    
    // Insert the home page
    console.log('[testing] Inserting home page...');
    const homePageResult = await client.query(`
      INSERT INTO pages (
        page_name, slug, meta_title, meta_description, seo_index, status, tenant_id, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
      RETURNING id
    `, [
      'Home',
      '/home',
      'MOSKI Paris - Luxury Eyewear',
      'Discover our collection of luxury Parisian eyewear',
      true,
      'published',
      'tenant-110ee38b'
    ]);
    
    const homePageId = homePageResult.rows[0].id;
    console.log(`[testing] Home page created with ID: ${homePageId}`);
    
    // Insert home page layout
    const homeLayout = {
      components: [
        {
          type: 'MinimalHeroSection',
          props: {
            backgroundImage: '/lovable-uploads/840088d6-ebcb-429f-908c-43367c0daf2e.png',
            title: {
              fr: "L'Art de la Lunetterie Parisienne",
              en: "The Art of Parisian Eyewear"
            },
            buttonText: {
              fr: 'Découvrir Collections',
              en: 'Discover Collections'
            },
            buttonLink: '/collections',
            showScrollArrow: true
          }
        },
        {
          type: 'LifestyleShowcase',
          props: {
            title: {
              fr: 'Style de Vie',
              en: 'Lifestyle'
            },
            subtitle: {
              fr: 'Inspiré par Paris',
              en: 'Inspired by Paris'
            },
            items: [
              {
                image: '/lovable-uploads/076a0ae4-3537-49ad-8de9-80d0902e325b.png',
                title: {
                  fr: 'Optique',
                  en: 'Optical'
                },
                link: '/optical'
              },
              {
                image: '/lovable-uploads/557c8620-57ca-4b0c-a0cd-1c679d1e8f68.png',
                title: {
                  fr: 'Solaires',
                  en: 'Sunglasses'
                },
                link: '/sunglasses'
              }
            ]
          },
          wrapper: {
            className: 'md:mb-[50px]'
          }
        },
        {
          type: 'ProductGridShowcase',
          props: {
            title: {
              fr: 'Nos Collections',
              en: 'Our Collections'
            },
            subtitle: {
              fr: 'Découvrez nos dernières créations',
              en: 'Discover our latest creations'
            },
            limit: 8,
            featured: true
          }
        },
        {
          type: 'ReviewsSection',
          props: {
            title: {
              fr: 'Ce que disent nos clients',
              en: 'What our customers say'
            },
            reviews: [
              {
                id: '1',
                name: 'Marie Dubois',
                rating: 5,
                text: {
                  fr: 'Magnifiques lunettes, qualité exceptionnelle!',
                  en: 'Beautiful glasses, exceptional quality!'
                },
                avatar: '/images/avatar-1.jpg'
              },
              {
                id: '2',
                name: 'Jean Martin',
                rating: 5,
                text: {
                  fr: 'Service client impeccable, je recommande!',
                  en: 'Impeccable customer service, I recommend!'
                },
                avatar: '/images/avatar-2.jpg'
              }
            ]
          }
        },
        {
          type: 'MinimalNewsletterSection',
          props: {
            title: {
              fr: 'Restez informé',
              en: 'Stay informed'
            },
            subtitle: {
              fr: 'Recevez nos dernières nouveautés',
              en: 'Receive our latest news'
            },
            placeholder: {
              fr: 'Votre email',
              en: 'Your email'
            },
            buttonText: {
              fr: 'S\'abonner',
              en: 'Subscribe'
            }
          }
        }
      ]
    };
    
    await client.query(`
      INSERT INTO page_layouts (page_id, layout_json, version, updated_at)
      VALUES ($1, $2, 1, NOW())
    `, [homePageId, JSON.stringify(homeLayout)]);
    
    console.log('[testing] Home page layout created');
    
    // Insert the contact page
    console.log('[testing] Inserting contact page...');
    const contactPageResult = await client.query(`
      INSERT INTO pages (
        page_name, slug, meta_title, meta_description, seo_index, status, tenant_id, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
      RETURNING id
    `, [
      'Contact',
      '/contact',
      'Contact - MOSKI Paris',
      'Get in touch with MOSKI Paris',
      true,
      'published',
      'tenant-110ee38b'
    ]);
    
    const contactPageId = contactPageResult.rows[0].id;
    console.log(`[testing] Contact page created with ID: ${contactPageId}`);
    
    // Insert contact page layout
    const contactLayout = {
      components: [
        {
          type: 'PageTitle',
          props: {
            title: {
              fr: 'Contactez-nous',
              en: 'Contact Us'
            }
          }
        },
        {
          type: 'ContactForm',
          props: {
            title: {
              fr: 'Envoyez-nous un message',
              en: 'Send Us a Message'
            },
            fields: [
              {
                name: 'name',
                type: 'text',
                label: {
                  fr: 'Nom',
                  en: 'Name'
                },
                required: true
              },
              {
                name: 'email',
                type: 'email',
                label: {
                  fr: 'Email',
                  en: 'Email'
                },
                required: true
              },
              {
                name: 'subject',
                type: 'text',
                label: {
                  fr: 'Sujet',
                  en: 'Subject'
                },
                required: true
              },
              {
                name: 'message',
                type: 'textarea',
                label: {
                  fr: 'Message',
                  en: 'Message'
                },
                required: true
              }
            ]
          }
        }
      ]
    };
    
    await client.query(`
      INSERT INTO page_layouts (page_id, layout_json, version, updated_at)
      VALUES ($1, $2, 1, NOW())
    `, [contactPageId, JSON.stringify(contactLayout)]);
    
    console.log('[testing] Contact page layout created');
    
    // Insert the about page
    console.log('[testing] Inserting about page...');
    const aboutPageResult = await client.query(`
      INSERT INTO pages (
        page_name, slug, meta_title, meta_description, seo_index, status, tenant_id, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
      RETURNING id
    `, [
      'About',
      '/about',
      'About - MOSKI Paris',
      'Learn about MOSKI Paris and our story',
      true,
      'published',
      'tenant-110ee38b'
    ]);
    
    const aboutPageId = aboutPageResult.rows[0].id;
    console.log(`[testing] About page created with ID: ${aboutPageId}`);
    
    // Insert about page layout
    const aboutLayout = {
      components: [
        {
          type: 'AboutSection',
          props: {
            title: {
              fr: 'Notre Histoire',
              en: 'Our Story'
            },
            content: {
              fr: 'Depuis 2020, MOSKI Paris crée des lunettes de luxe qui allient tradition parisienne et innovation moderne. Chaque pièce est conçue avec passion et attention aux détails.',
              en: 'Since 2020, MOSKI Paris has been creating luxury eyewear that combines Parisian tradition with modern innovation. Each piece is crafted with passion and attention to detail.'
            },
            image: '/images/about-hero.jpg',
            features: [
              {
                icon: 'craftsmanship',
                title: {
                  fr: 'Savoir-faire Artisanal',
                  en: 'Artisanal Craftsmanship'
                },
                description: {
                  fr: 'Chaque lunette est fabriquée à la main',
                  en: 'Each pair is handcrafted'
                }
              },
              {
                icon: 'quality',
                title: {
                  fr: 'Qualité Premium',
                  en: 'Premium Quality'
                },
                description: {
                  fr: 'Matériaux de la plus haute qualité',
                  en: 'Highest quality materials'
                }
              },
              {
                icon: 'design',
                title: {
                  fr: 'Design Parisien',
                  en: 'Parisian Design'
                },
                description: {
                  fr: 'Esthétique française contemporaine',
                  en: 'Contemporary French aesthetics'
                }
              }
            ]
          }
        }
      ]
    };
    
    await client.query(`
      INSERT INTO page_layouts (page_id, layout_json, version, updated_at)
      VALUES ($1, $2, 1, NOW())
    `, [aboutPageId, JSON.stringify(aboutLayout)]);
    
    console.log('[testing] About page layout created');
    
    await client.query('COMMIT');
    console.log('[testing] MOSKI pages insertion completed successfully!');
    
    // Verify the insertion
    const verifyResult = await client.query(`
      SELECT p.id, p.page_name, p.slug, pl.layout_json
      FROM pages p
      LEFT JOIN page_layouts pl ON p.id = pl.page_id
      WHERE p.tenant_id = 'tenant-110ee38b'
      ORDER BY p.created_at
    `);
    
    console.log(`[testing] Verification: Found ${verifyResult.rows.length} pages for tenant-110ee38b`);
    verifyResult.rows.forEach(page => {
      console.log(`[testing] - ${page.page_name} (${page.slug}) - Components: ${page.layout_json?.components?.length || 0}`);
    });
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('[testing] Error during MOSKI pages insertion:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Run insertion if called directly
if (process.argv[1] === new URL(import.meta.url).pathname) {
  insertMoskiPages()
    .then(() => {
      console.log('MOSKI pages insertion completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('MOSKI pages insertion failed:', error);
      process.exit(1);
    });
}

export default insertMoskiPages;
