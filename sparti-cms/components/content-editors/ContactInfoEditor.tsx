import React, { useState } from 'react';
import { Plus, Trash2, MapPin, Phone, Mail, Clock } from 'lucide-react';
import { Button } from '../../../src/components/ui/button';
import { Input } from '../../../src/components/ui/input';
import { Label } from '../../../src/components/ui/label';
import { Textarea } from '../../../src/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../../../src/components/ui/card';
import { Badge } from '../../../src/components/ui/badge';

interface OfficeHoursItem {
  day: string;
  time: string;
}

interface ContactInfoEditorProps {
  address?: string;
  phone?: string;
  email?: string;
  hours?: OfficeHoursItem[];
  onAddressChange?: (address: string) => void;
  onPhoneChange?: (phone: string) => void;
  onEmailChange?: (email: string) => void;
  onHoursChange?: (hours: OfficeHoursItem[]) => void;
  className?: string;
}

export const ContactInfoEditor: React.FC<ContactInfoEditorProps> = ({
  address = '',
  phone = '',
  email = '',
  hours = [],
  onAddressChange,
  onPhoneChange,
  onEmailChange,
  onHoursChange,
  className = ''
}) => {
  const [officeHours, setOfficeHours] = useState<OfficeHoursItem[]>(
    hours.length > 0 ? hours : [{ day: 'Monday - Friday', time: '9:00 - 18:00' }]
  );

  const handleAddressChange = (value: string) => {
    onAddressChange?.(value);
  };

  const handlePhoneChange = (value: string) => {
    onPhoneChange?.(value);
  };

  const handleEmailChange = (value: string) => {
    onEmailChange?.(value);
  };

  const handleHoursChange = (updatedHours: OfficeHoursItem[]) => {
    setOfficeHours(updatedHours);
    onHoursChange?.(updatedHours);
  };

  const handleDayChange = (index: number, day: string) => {
    const updatedHours = [...officeHours];
    updatedHours[index] = { ...updatedHours[index], day };
    handleHoursChange(updatedHours);
  };

  const handleTimeChange = (index: number, time: string) => {
    const updatedHours = [...officeHours];
    updatedHours[index] = { ...updatedHours[index], time };
    handleHoursChange(updatedHours);
  };

  const addOfficeHoursItem = () => {
    const newHours = [...officeHours, { day: '', time: '' }];
    handleHoursChange(newHours);
  };

  const removeOfficeHoursItem = (index: number) => {
    if (officeHours.length <= 1) {
      return; // Don't remove the last item
    }
    
    const updatedHours = officeHours.filter((_, i) => i !== index);
    handleHoursChange(updatedHours);
  };

  // Email validation
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Phone validation (basic)
  const isValidPhone = (phone: string) => {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Address Section */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <MapPin className="h-4 w-4 text-blue-500" />
            Address
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={address}
            onChange={(e) => handleAddressChange(e.target.value)}
            placeholder="Enter physical address..."
            rows={3}
            className="w-full"
          />
        </CardContent>
      </Card>

      {/* Contact Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Phone */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Phone className="h-4 w-4 text-green-500" />
              Phone Number
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              type="tel"
              value={phone}
              onChange={(e) => handlePhoneChange(e.target.value)}
              placeholder="+1 (555) 123-4567"
              className={`w-full ${phone && !isValidPhone(phone) ? 'border-red-500' : ''}`}
            />
            {phone && !isValidPhone(phone) && (
              <p className="text-xs text-red-500 mt-1">Please enter a valid phone number</p>
            )}
          </CardContent>
        </Card>

        {/* Email */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Mail className="h-4 w-4 text-purple-500" />
              Email Address
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              type="email"
              value={email}
              onChange={(e) => handleEmailChange(e.target.value)}
              placeholder="contact@example.com"
              className={`w-full ${email && !isValidEmail(email) ? 'border-red-500' : ''}`}
            />
            {email && !isValidEmail(email) && (
              <p className="text-xs text-red-500 mt-1">Please enter a valid email address</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Office Hours */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Clock className="h-4 w-4 text-orange-500" />
              Office Hours
            </CardTitle>
            <Button size="sm" onClick={addOfficeHoursItem} variant="outline">
              <Plus className="h-3 w-3 mr-1" />
              Add Hours
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {officeHours.map((hoursItem, index) => (
            <div 
              key={index}
              className="border border-gray-200 rounded-md p-4 bg-gray-50"
            >
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-sm font-medium text-gray-600">Hours #{index + 1}</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeOfficeHoursItem(index)}
                  className="text-red-500 hover:text-red-700"
                  disabled={officeHours.length <= 1}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-gray-600 mb-1">Days</Label>
                  <Input
                    type="text"
                    value={hoursItem.day}
                    onChange={(e) => handleDayChange(index, e.target.value)}
                    placeholder="e.g. Monday - Friday"
                    className="text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs text-gray-600 mb-1">Hours</Label>
                  <Input
                    type="text"
                    value={hoursItem.time}
                    onChange={(e) => handleTimeChange(index, e.target.value)}
                    placeholder="e.g. 9:00 - 18:00"
                    className="text-sm"
                  />
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Preview Section */}
      <Card className="bg-gray-50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {address && (
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Address</p>
                  <p className="text-sm text-gray-600 whitespace-pre-line">{address}</p>
                </div>
              </div>
            )}
            
            {phone && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm font-medium">Phone</p>
                  <p className="text-sm text-gray-600">{phone}</p>
                </div>
              </div>
            )}
            
            {email && (
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm text-gray-600">{email}</p>
                </div>
              </div>
            )}
            
            {officeHours.length > 0 && (
              <div className="flex items-start gap-2">
                <Clock className="h-4 w-4 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Office Hours</p>
                  <div className="space-y-1">
                    {officeHours.map((hoursItem, index) => (
                      <div key={index} className="flex justify-between items-center text-sm">
                        <span className="font-medium">{hoursItem.day}</span>
                        <span className="text-gray-600">{hoursItem.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            {!address && !phone && !email && officeHours.length === 0 && (
              <p className="text-sm text-gray-500 italic">No contact information added yet</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContactInfoEditor;
