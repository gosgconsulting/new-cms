import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Trash2, 
  Mail, 
  Phone, 
  Calendar,
  Filter,
  Download,
  Eye,
  X,
  MessageSquare
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '../auth/AuthProvider';
import { api } from '../../utils/api';

interface Contact {
  id: string;
  name: string;
  email: string;
  phone?: string;
  source: string;
  latest_submission: string;
  total_submissions: number;
  messages: string[];
}

interface ContactsData {
  contacts: Contact[];
  total: number;
  limit: number;
  offset: number;
}

interface ContactsManagerProps {
  currentTenantId: string;
}

const ContactsManager: React.FC<ContactsManagerProps> = ({ currentTenantId }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('contacts');
  const [currentPage, setCurrentPage] = useState(1);
  const [contactsData, setContactsData] = useState<ContactsData>({
    contacts: [],
    total: 0,
    limit: 50,
    offset: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [showContactModal, setShowContactModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showLeadModal, setShowLeadModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [leadsData, setLeadsData] = useState<{ leads: any[], total: number }>({ leads: [], total: 0 });

  useEffect(() => {
    loadContacts();
    loadLeads();
  }, []);

  const loadContacts = async (search = '') => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Use the authenticated API utility which includes tenant context
      const response = await api.get(`/api/contacts?limit=100&search=${encodeURIComponent(search)}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch contacts');
      }

      const result = await response.json();
      
      // Transform backend contacts to frontend format
      const transformedContacts: Contact[] = result.contacts.map((contact: any) => ({
        id: contact.id.toString(),
        name: `${contact.first_name} ${contact.last_name || ''}`.trim(),
        email: contact.email,
        phone: contact.phone || '',
        source: contact.source || 'form',
        latest_submission: contact.updated_at || contact.created_at,
        total_submissions: 1, // We'll need to get this from form submissions
        messages: contact.notes ? [contact.notes] : []
      }));

      setContactsData({
        contacts: transformedContacts,
        total: result.total,
        limit: result.limit,
        offset: result.offset
      });
    } catch (err) {
      console.error('Error loading contacts:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      setContactsData({
        contacts: [],
        total: 0,
        limit: 50,
        offset: 0
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadLeads = async () => {
    try {
      // Use the authenticated API utility which includes tenant context
      const response = await api.get('/api/form-submissions/contact-modal');
      
      if (!response.ok) {
        throw new Error('Failed to fetch leads');
      }

      const submissions = await response.json();

      const formattedLeads = submissions.map((sub: any) => ({
        id: sub.id,
        name: sub.data.name,
        email: sub.data.email,
        phone: sub.data.phone || 'N/A',
        message: sub.data.message || '',
        source: 'Contact Modal Form',
        created: sub.date,
        createdFormatted: formatDateTime(sub.date)
      }));

      setLeadsData({ leads: formattedLeads, total: formattedLeads.length });
    } catch (err) {
      console.error('Error loading leads:', err);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadContacts(searchTerm);
  };

  const handleDeleteContact = async (contactId: string) => {
    if (!confirm('Are you sure you want to delete all submissions from this contact?')) {
      return;
    }

    try {
      const contact = contactsData.contacts.find(c => c.id === contactId);
      if (!contact) return;

      // Use API endpoint to delete submissions
      const response = await fetch(`/api/form-submissions?email=${encodeURIComponent(contact.email)}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete submissions');
      }

      loadContacts(searchTerm);
      loadLeads();
    } catch (err) {
      console.error('Error deleting contact:', err);
      setError('Failed to delete contact');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-SG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    // If less than 24 hours ago, show relative time
    if (diffInHours < 24) {
      if (diffInHours < 1) {
        const minutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
        return `${minutes} min${minutes !== 1 ? 's' : ''} ago`;
      }
      const hours = Math.floor(diffInHours);
      return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    }
    
    // Otherwise show full date and time
    return date.toLocaleDateString('en-SG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-12 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
          <Users className="h-6 w-6 mr-2" />
          Contacts
        </h2>
        <p className="text-gray-600 mt-1">
          Manage your contact database and leads
          {mode === 'theme' && currentThemeId && (
            <span className="ml-2 text-sm text-purple-600 font-medium">
              (Theme: {currentThemeId})
            </span>
          )}
          {mode === 'tenants' && currentTenantId && (
            <span className="ml-2 text-sm text-blue-600 font-medium">
              (Tenant: {currentTenantId})
            </span>
          )}
        </p>
      </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center space-x-4">
          <form onSubmit={handleSearch} className="flex-1 flex items-center space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search contacts by name, email, or company..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Search
            </button>
          </form>
          <div className="flex items-center space-x-2">
            <button className="px-3 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-1">
              <Filter className="h-4 w-4" />
              <span>Filter</span>
            </button>
            <button className="px-3 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-1">
              <Download className="h-4 w-4" />
              <span>Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full justify-start border-b rounded-none bg-white p-0">
          <TabsTrigger value="contacts" className="px-6 py-3">Contacts</TabsTrigger>
          <TabsTrigger value="leads" className="px-6 py-3">Leads</TabsTrigger>
        </TabsList>

        {/* Contacts Tab Content */}
        <TabsContent value="contacts" className="mt-6">
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Phone
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Source
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Submissions
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Contact
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {contactsData.contacts.map((contact) => (
                    <tr key={contact.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8">
                            <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                              <span className="text-sm font-medium text-purple-600">
                                {contact.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">
                              {contact.name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900">
                          <Mail className="h-4 w-4 text-gray-400 mr-2" />
                          <a href={`mailto:${contact.email}`} className="hover:text-purple-600">
                            {contact.email}
                          </a>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {contact.phone ? (
                          <div className="flex items-center text-sm text-gray-900">
                            <Phone className="h-4 w-4 text-gray-400 mr-2" />
                            <a href={`tel:${contact.phone}`} className="hover:text-purple-600">
                              {contact.phone}
                            </a>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800">
                          {contact.source}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                          {contact.total_submissions}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="h-4 w-4 mr-2" />
                          <span title={formatDate(contact.latest_submission)}>
                            {formatDateTime(contact.latest_submission)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => {
                              setSelectedContact(contact);
                              setShowContactModal(true);
                            }}
                            className="text-purple-600 hover:text-purple-900"
                            title="View contact"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteContact(contact.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete contact"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {contactsData.total > contactsData.limit && (
              <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setCurrentPage(Math.min(Math.ceil(contactsData.total / contactsData.limit), currentPage + 1))}
                      disabled={currentPage >= Math.ceil(contactsData.total / contactsData.limit)}
                      className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        Showing <span className="font-medium">{((currentPage - 1) * contactsData.limit) + 1}</span> to{' '}
                        <span className="font-medium">{Math.min(currentPage * contactsData.limit, contactsData.total)}</span> of{' '}
                        <span className="font-medium">{contactsData.total}</span> results
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                        <button
                          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                          disabled={currentPage === 1}
                          className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                        >
                          Previous
                        </button>
                        {Array.from({ length: Math.ceil(contactsData.total / contactsData.limit) }, (_, i) => i + 1).map((page) => (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              page === currentPage
                                ? 'z-10 bg-purple-50 border-purple-500 text-purple-600'
                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                            }`}
                          >
                            {page}
                          </button>
                        ))}
                        <button
                          onClick={() => setCurrentPage(Math.min(Math.ceil(contactsData.total / contactsData.limit), currentPage + 1))}
                          disabled={currentPage >= Math.ceil(contactsData.total / contactsData.limit)}
                          className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                        >
                          Next
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Leads Tab Content */}
        <TabsContent value="leads" className="mt-6">
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Phone
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Source
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Submitted
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {leadsData.leads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{lead.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-600">
                          <Mail className="h-4 w-4 mr-2 text-gray-400" />
                          {lead.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-600">
                          <Phone className="h-4 w-4 mr-2 text-gray-400" />
                          {lead.phone}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800">
                          {lead.source}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                          <span title={formatDate(lead.created)}>
                            {lead.createdFormatted}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button 
                          onClick={() => {
                            setSelectedLead(lead);
                            setShowLeadModal(true);
                          }}
                          className="inline-flex items-center px-3 py-1.5 text-sm text-purple-600 hover:text-purple-900 hover:bg-purple-50 rounded-md transition-colors"
                        >
                          <Eye className="h-4 w-4 mr-1.5" />
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Lead Details Modal */}
      {showLeadModal && selectedLead && (
        <LeadDetailsModal
          lead={selectedLead}
          onClose={() => {
            setShowLeadModal(false);
            setSelectedLead(null);
          }}
        />
      )}

      {/* Contact Details Modal for Contacts Tab */}
      {showContactModal && selectedContact && (
        <ContactDetailsModal
          contact={selectedContact}
          onClose={() => {
            setShowContactModal(false);
            setSelectedContact(null);
          }}
        />
      )}
    </div>
  );
};

// Lead Details Modal Component
const LeadDetailsModal: React.FC<{
  lead: any;
  onClose: () => void;
}> = ({ lead, onClose }) => {
  if (!lead) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-SG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-semibold">Lead Details</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-500">Contact Name</label>
            <p className="text-base mt-1">{lead.name}</p>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-500">Email</label>
            <p className="text-base mt-1">{lead.email}</p>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-500">Phone</label>
            <p className="text-base mt-1">{lead.phone}</p>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-500">Source</label>
            <p className="mt-1">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                {lead.source}
              </span>
            </p>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-500">Message</label>
            <p className="text-base mt-1 whitespace-pre-wrap">{lead.message}</p>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-500">Submitted</label>
            <p className="text-base text-gray-600 mt-1" title={formatDate(lead.created)}>
              {lead.createdFormatted}
            </p>
          </div>
        </div>
        
        <div className="mt-6 flex justify-end border-t border-gray-200 pt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// Contact Details Modal Component
const ContactDetailsModal: React.FC<{
  contact: Contact | null;
  onClose: () => void;
}> = ({ contact, onClose }) => {
  if (!contact) return null;

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    // If less than 24 hours ago, show relative time
    if (diffInHours < 24) {
      if (diffInHours < 1) {
        const minutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
        return `${minutes} min${minutes !== 1 ? 's' : ''} ago`;
      }
      const hours = Math.floor(diffInHours);
      return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    }
    
    // Otherwise show full date and time
    return date.toLocaleDateString('en-SG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-SG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Contact Details</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
              <span className="text-lg font-medium text-purple-600">
                {contact.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h4 className="text-xl font-medium text-gray-900">{contact.name}</h4>
              <p className="text-gray-600">{contact.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <p className="text-sm text-gray-900">{contact.phone || '-'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
              <p className="text-sm text-gray-900">{contact.source}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Total Submissions</label>
              <p className="text-sm text-gray-900">{contact.total_submissions}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Contact</label>
              <p className="text-sm text-gray-900" title={formatDate(contact.latest_submission)}>
                {formatDateTime(contact.latest_submission)}
              </p>
            </div>
          </div>

          {contact.messages && contact.messages.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Messages</label>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {contact.messages.map((message, index) => (
                  <div
                    key={index}
                    className="p-3 bg-gray-50 rounded-lg text-sm text-gray-900"
                  >
                    {message}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end pt-4 mt-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContactsManager;
