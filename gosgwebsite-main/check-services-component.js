import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_PUBLIC_URL,
});

async function checkServicesComponent() {
  try {
    console.log('=== Checking Services Component in Database ===');
    const tenantId = process.env.CMS_TENANT;
    console.log('Using tenant ID:', tenantId);

    // Find the home page
    const pageResult = await pool.query(
      'SELECT id, page_name, slug FROM pages WHERE tenant_id = $1 AND page_name = $2',
      [tenantId, 'GOSG Homepage']
    );

    if (pageResult.rows.length === 0) {
      console.log('Homepage not found for tenant', tenantId);
      return;
    }

    const pageId = pageResult.rows[0].id;
    console.log('Homepage found:', pageResult.rows[0]);

    // Get the layout JSON
    const layoutResult = await pool.query(
      'SELECT layout_json FROM page_layouts WHERE page_id = $1',
      [pageId]
    );

    if (layoutResult.rows.length === 0) {
      console.log('No layout found for page ID:', pageId);
      return;
    }

    let components = layoutResult.rows[0].layout_json;

    if (typeof components === 'string') {
      try {
        components = JSON.parse(components);
      } catch (e) {
        console.error('Error parsing layout_json:', e);
        return;
      }
    }

    if (components && typeof components === 'object' && components.components) {
      components = components.components;
    }

    // Find the SEOServicesShowcase component
    const servicesComponent = components.find(comp => 
      comp.key === 'SEOServicesShowcase' || comp.type === 'ServicesShowcase'
    );

    if (!servicesComponent) {
      console.log('SEOServicesShowcase component not found');
      return;
    }

    console.log('\n=== SEOServicesShowcase Component ===');
    console.log('Key:', servicesComponent.key);
    console.log('Type:', servicesComponent.type);
    console.log('Name:', servicesComponent.name);
    
    if (servicesComponent.items && servicesComponent.items.length > 0) {
      console.log('\nItems count:', servicesComponent.items.length);
      
      // Find Services array
      const servicesArray = servicesComponent.items.find(item => item.key === 'Services');
      
      if (servicesArray) {
        console.log('\n=== Services Array ===');
        console.log('Key:', servicesArray.key);
        console.log('Type:', servicesArray.type);
        
        if (servicesArray.items && servicesArray.items.length > 0) {
          console.log('\nService sections count:', servicesArray.items.length);
          
          // Check all service sections
          servicesArray.items.forEach((service, sectionIndex) => {
            console.log(`\n=== Service Section ${sectionIndex + 1} ===`);
            console.log('Key:', service.key);
            console.log('Type:', service.type);
            
            if (service.items && service.items.length > 0) {
              console.log(`\nItems in service section ${sectionIndex + 1}:`, service.items.length);
              
              // Print all items in this service section
              service.items.forEach((item, index) => {
                console.log(`\nItem ${index + 1}:`);
                console.log('Key:', item.key);
                console.log('Type:', item.type);
                console.log('Content:', item.content);
                
                // If it's a carousel, check its properties
                if (item.type === 'carousel') {
                  console.log('Title:', item.title);
                  console.log('Highlight:', item.highlight);
                  console.log('Description:', item.description);
                  console.log('ButtonText:', item.buttonText);
                  console.log('Images:', item.images);
                }
              });
            }
          });
        }
      } else {
        console.log('Services array not found in items');
      }
    }

  } catch (error) {
    console.error('Error during database query:', error);
  } finally {
    await pool.end();
    console.log('\n=== Check Completed ===');
  }
}

checkServicesComponent();
