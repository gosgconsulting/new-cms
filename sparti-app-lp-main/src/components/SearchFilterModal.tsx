import { FC, useState, useEffect } from 'react';
import { X, Search } from 'lucide-react';
import BaseModal from '@/components/base/BaseModal';
import BaseTouchButton from '@/components/base/BaseTouchButton';
import SearchWidget from '@/components/SearchWidget';
import { SearchData } from '@/types/search';

interface SearchFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch: (data: SearchData) => void;
  initialData?: SearchData;
}

const SearchFilterModal: FC<SearchFilterModalProps> = ({ 
  isOpen, 
  onClose, 
  onSearch, 
  initialData 
}) => {
  const [searchData, setSearchData] = useState<SearchData | null>(initialData || null);

  // Reset form when modal opens with initial data
  useEffect(() => {
    if (isOpen && initialData) {
      setSearchData(initialData);
    }
  }, [isOpen, initialData]);

  const handleSearch = (data: SearchData) => {
    onSearch(data);
    onClose();
  };

  const handleDataChange = (data: Partial<SearchData>) => {
    setSearchData(prev => prev ? { ...prev, ...data } : null);
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Filter Search"
      subtitle="Refine your business lead search"
      maxWidth="xl"
      className="glass border-primary/30 shadow-[0_0_50px_rgba(0,212,255,0.3)]"
    >
      <div className="space-y-6">
        <SearchWidget
          searchData={searchData}
          onDataChange={handleDataChange}
          onSearch={handleSearch}
          showTitle={false}
          className="w-full"
        />
        
        <div className="flex gap-3 pt-4">
          <BaseTouchButton
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            Cancel
          </BaseTouchButton>
          <BaseTouchButton
            variant="neon"
            onClick={() => searchData && handleSearch(searchData)}
            disabled={!searchData?.location}
            className="flex-1"
          >
            <Search className="h-4 w-4 mr-2" />
            Update Search
          </BaseTouchButton>
        </div>
      </div>
    </BaseModal>
  );
};

export default SearchFilterModal;