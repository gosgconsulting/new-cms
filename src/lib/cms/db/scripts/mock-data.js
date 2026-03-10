// Mock data service for development when database is not available
// This provides sample data to test the contacts functionality

export const mockContacts = [
  {
    id: 1,
    first_name: 'John',
    last_name: 'Doe',
    email: 'john.doe@example.com',
    phone: '+65 1234 5678',
    company: 'Tech Solutions Pte Ltd',
    source: 'Contact Modal Form',
    status: 'new',
    notes: 'Form message: I am interested in your SEO services for my e-commerce website. Please contact me to discuss pricing and timeline.',
    form_messages: [
      {
        id: 1,
        form_name: 'Contact Modal Form',
        message: 'I am interested in your SEO services for my e-commerce website. Please contact me to discuss pricing and timeline.',
        submitted_at: '2024-01-15T10:30:00Z'
      }
    ],
    created_at: '2024-01-15T10:30:00Z',
    updated_at: '2024-01-15T10:30:00Z'
  },
  {
    id: 2,
    first_name: 'Sarah',
    last_name: 'Chen',
    email: 'sarah.chen@businesscorp.sg',
    phone: '+65 9876 5432',
    company: 'Business Corp Singapore',
    source: 'Contact Modal Form',
    status: 'contacted',
    notes: 'Form message: We need help with local SEO for our Singapore-based business. Looking for a comprehensive SEO audit and strategy.',
    form_messages: [
      {
        id: 2,
        form_name: 'Contact Modal Form',
        message: 'We need help with local SEO for our Singapore-based business. Looking for a comprehensive SEO audit and strategy.',
        submitted_at: '2024-01-14T14:20:00Z'
      }
    ],
    created_at: '2024-01-14T14:20:00Z',
    updated_at: '2024-01-16T09:15:00Z'
  },
  {
    id: 3,
    first_name: 'Michael',
    last_name: 'Tan',
    email: 'michael.tan@startup.io',
    phone: '+65 8765 4321',
    company: 'Startup Innovation Hub',
    source: 'Contact Modal Form',
    status: 'qualified',
    notes: 'Form message: Our startup needs SEO help to improve organic traffic. We have a limited budget but are looking for long-term partnership.',
    form_messages: [
      {
        id: 3,
        form_name: 'Contact Modal Form',
        message: 'Our startup needs SEO help to improve organic traffic. We have a limited budget but are looking for long-term partnership.',
        submitted_at: '2024-01-13T16:45:00Z'
      }
    ],
    created_at: '2024-01-13T16:45:00Z',
    updated_at: '2024-01-17T11:30:00Z'
  },
  {
    id: 4,
    first_name: 'Lisa',
    last_name: 'Wong',
    email: 'lisa.wong@restaurant.sg',
    phone: '+65 6543 2109',
    company: 'Wong\'s Family Restaurant',
    source: 'Contact Modal Form',
    status: 'new',
    notes: 'Form message: I own a family restaurant and want to improve our online presence. Need help with Google My Business and local search.',
    form_messages: [
      {
        id: 4,
        form_name: 'Contact Modal Form',
        message: 'I own a family restaurant and want to improve our online presence. Need help with Google My Business and local search.',
        submitted_at: '2024-01-12T12:15:00Z'
      }
    ],
    created_at: '2024-01-12T12:15:00Z',
    updated_at: '2024-01-12T12:15:00Z'
  },
  {
    id: 5,
    first_name: 'David',
    last_name: 'Lim',
    email: 'david.lim@consulting.com',
    phone: '+65 9123 4567',
    company: 'Lim Consulting Services',
    source: 'Contact Modal Form',
    status: 'converted',
    notes: 'Form message: Looking for ongoing SEO services for multiple client websites. Interested in white-label partnership opportunities.',
    form_messages: [
      {
        id: 5,
        form_name: 'Contact Modal Form',
        message: 'Looking for ongoing SEO services for multiple client websites. Interested in white-label partnership opportunities.',
        submitted_at: '2024-01-10T09:30:00Z'
      }
    ],
    created_at: '2024-01-10T09:30:00Z',
    updated_at: '2024-01-18T15:45:00Z'
  }
];

export const mockFormSubmissions = [
  {
    id: '1',
    date: '15/01/2024, 10:30',
    data: {
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '+65 1234 5678',
      message: 'I am interested in your SEO services for my e-commerce website. Please contact me to discuss pricing and timeline.'
    }
  },
  {
    id: '2',
    date: '14/01/2024, 14:20',
    data: {
      name: 'Sarah Chen',
      email: 'sarah.chen@businesscorp.sg',
      phone: '+65 9876 5432',
      message: 'We need help with local SEO for our Singapore-based business. Looking for a comprehensive SEO audit and strategy.'
    }
  },
  {
    id: '3',
    date: '13/01/2024, 16:45',
    data: {
      name: 'Michael Tan',
      email: 'michael.tan@startup.io',
      phone: '+65 8765 4321',
      message: 'Our startup needs SEO help to improve organic traffic. We have a limited budget but are looking for long-term partnership.'
    }
  },
  {
    id: '4',
    date: '12/01/2024, 12:15',
    data: {
      name: 'Lisa Wong',
      email: 'lisa.wong@restaurant.sg',
      phone: '+65 6543 2109',
      message: 'I own a family restaurant and want to improve our online presence. Need help with Google My Business and local search.'
    }
  },
  {
    id: '5',
    date: '10/01/2024, 09:30',
    data: {
      name: 'David Lim',
      email: 'david.lim@consulting.com',
      phone: '+65 9123 4567',
      message: 'Looking for ongoing SEO services for multiple client websites. Interested in white-label partnership opportunities.'
    }
  }
];

// Mock API functions
export function getMockContacts(limit = 50, offset = 0, search = '') {
  let filteredContacts = mockContacts;
  
  if (search) {
    const searchLower = search.toLowerCase();
    filteredContacts = mockContacts.filter(contact => 
      contact.first_name.toLowerCase().includes(searchLower) ||
      (contact.last_name && contact.last_name.toLowerCase().includes(searchLower)) ||
      contact.email.toLowerCase().includes(searchLower) ||
      (contact.company && contact.company.toLowerCase().includes(searchLower))
    );
  }
  
  const startIndex = offset;
  const endIndex = offset + limit;
  const paginatedContacts = filteredContacts.slice(startIndex, endIndex);
  
  return {
    contacts: paginatedContacts,
    total: filteredContacts.length,
    limit,
    offset
  };
}

export function getMockFormSubmissions(formId) {
  return mockFormSubmissions;
}

export function createMockContact(contactData) {
  const newId = Math.max(...mockContacts.map(c => c.id)) + 1;
  const newContact = {
    id: newId,
    ...contactData,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  mockContacts.push(newContact);
  return newContact;
}

export function updateMockContact(contactId, contactData) {
  const index = mockContacts.findIndex(c => c.id === parseInt(contactId));
  if (index !== -1) {
    mockContacts[index] = {
      ...mockContacts[index],
      ...contactData,
      updated_at: new Date().toISOString()
    };
    return mockContacts[index];
  }
  return null;
}

export function deleteMockContact(contactId) {
  const index = mockContacts.findIndex(c => c.id === parseInt(contactId));
  if (index !== -1) {
    mockContacts.splice(index, 1);
    return true;
  }
  return false;
}
