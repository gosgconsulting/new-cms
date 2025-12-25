import React, { useState, useEffect } from 'react';
import { 
  Target, 
  Search, 
  Mail, 
  Phone, 
  Calendar,
  Filter,
  Download,
  Eye,
  X,
} from 'lucide-react';
import { useAuth } from '../auth/AuthProvider';
import { api } from '../../utils/api';

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  source: string;
  created: string;
  createdFormatted: string;
}

interface LeadsManagerProps {
  currentTenantId: string;
}

const LeadsManager: React.FC<LeadsManagerProps> = ({ currentTenantId }) => {
  const { user } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadLeads();
  }, []);

  const formatDateTime = (dateString: string | null | undefined) => {
    if (!dateString) {
      return 'N/A';
    }
    
    try {
      const date = new Date(dateString);
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        console.warn('[testing] Invalid date string:', dateString);
        return 'Invalid Date';
      }
      
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
    } catch (err) {
      console.error('[testing] Error formatting date:', err, dateString);
      return 'Invalid Date';
    }
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) {
      return 'N/A';
    }
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Invalid Date';
      }
      return date.toLocaleDateString('en-SG', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch (err) {
      return 'Invalid Date';
    }
  };

  const loadLeads = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Use the authenticated API utility which includes tenant context
      const response = await api.get('/api/form-submissions/contact-modal');
      
      if (!response.ok) {
        throw new Error('Failed to fetch leads');
      }

      const submissions = await response.json();

      const formattedLeads: Lead[] = submissions.map((sub: any) => {
        // Handle different possible date fields
        const dateValue = sub.date || sub.created_at || sub.submitted_at || sub.created;
        
        return {
          id: sub.id?.toString() || String(Math.random()),
          name: sub.data?.name || sub.name || 'Unknown',
          email: sub.data?.email || sub.email || '',
          phone: sub.data?.phone || sub.phone || 'N/A',
          message: sub.data?.message || sub.message || '',
          source: sub.source || 'Contact Modal Form',
          created: dateValue || new Date().toISOString(),
          createdFormatted: formatDateTime(dateValue)
        };
      });

      setLeads(formattedLeads);
    } catch (err) {
      console.error('[testing] Error loading leads:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      setLeads([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Filter leads based on search term
    // For now, we'll reload all leads and filter client-side
    loadLeads();
  };

  const filteredLeads = leads.filter(lead =>
    lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.phone.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            <Target className="h-6 w-6 mr-2" />
            Leads
          </h2>
          <p className="text-gray-600 mt-1">
            Manage your leads and form submissions
            {currentTenantId && (
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

      {/* Search and Filters - Flowbite Style */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
        <div className="flex items-center gap-4">
          <form onSubmit={handleSearch} className="flex-1 flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search leads by name, email, or phone..."
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2 text-gray-800 hover:bg-gray-200 transition-colors"
            >
              Search
            </button>
          </form>
          <div className="flex items-center gap-2">
            <button className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
              <Filter className="h-4 w-4" />
              <span>Filter</span>
            </button>
            <button className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
              <Download className="h-4 w-4" />
              <span>Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* Leads Table - Flowbite Table Style */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-6 py-3 font-semibold">
                  Contact
                </th>
                <th className="px-6 py-3 font-semibold">
                  Email
                </th>
                <th className="px-6 py-3 font-semibold">
                  Phone
                </th>
                <th className="px-6 py-3 font-semibold">
                  Source
                </th>
                <th className="px-6 py-3 font-semibold">
                  Submitted
                </th>
                <th className="px-6 py-3 text-right font-semibold">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    {searchTerm ? 'No leads found matching your search.' : 'No leads found.'}
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => (
                  <tr key={lead.id} className="border-t border-gray-200 transition-colors hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8">
                          <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center">
                            <span className="text-sm font-medium text-orange-600">
                              {lead.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {lead.name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <Mail className="h-4 w-4 text-gray-400 mr-2" />
                        <a href={`mailto:${lead.email}`} className="hover:text-orange-600">
                          {lead.email}
                        </a>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {lead.phone && lead.phone !== 'N/A' ? (
                        <div className="flex items-center text-sm text-gray-900">
                          <Phone className="h-4 w-4 text-gray-400 mr-2" />
                          <a href={`tel:${lead.phone}`} className="hover:text-orange-600">
                            {lead.phone}
                          </a>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-purple-100 text-purple-700">
                        {lead.source}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="h-4 w-4" />
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
                        className="text-orange-600 hover:text-orange-700 transition-colors"
                        title="View lead"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

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
    </div>
  );
};

// Lead Details Modal Component
const LeadDetailsModal: React.FC<{
  lead: Lead;
  onClose: () => void;
}> = ({ lead, onClose }) => {
  const formatDate = (dateString: string) => {
    if (!dateString) {
      return 'N/A';
    }
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Invalid Date';
      }
      return date.toLocaleDateString('en-SG', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch (err) {
      return 'Invalid Date';
    }
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
          
          {lead.message && (
            <div>
              <label className="text-sm font-medium text-gray-500">Message</label>
              <p className="text-base mt-1 whitespace-pre-wrap">{lead.message}</p>
            </div>
          )}
          
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

export default LeadsManager;

