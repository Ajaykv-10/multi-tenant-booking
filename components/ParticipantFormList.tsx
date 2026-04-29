import React from 'react';

export interface ParticipantData {
  name: string;
  email: string;
  phone: string;
}

interface ParticipantFormListProps {
  participants: ParticipantData[];
  setParticipants: React.Dispatch<React.SetStateAction<ParticipantData[]>>;
}

export function ParticipantFormList({ participants, setParticipants }: ParticipantFormListProps) {
  const handleChange = (index: number, field: keyof ParticipantData, value: string) => {
    const updated = [...participants];
    updated[index] = { ...updated[index], [field]: value };
    setParticipants(updated);
  };

  if (participants.length === 0) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 mt-6">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Participant Details</h3>
      <p className="text-sm text-gray-500 mb-6">Please provide details for each participant.</p>
      
      <div className="space-y-6">
        {participants.map((participant, index) => (
          <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600">
            <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-3">Participant {index + 1}</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Name *</label>
                <input
                  type="text"
                  required
                  value={participant.name}
                  onChange={(e) => handleChange(index, 'name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white text-sm"
                  placeholder="Full Name"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Email (Optional)</label>
                <input
                  type="email"
                  value={participant.email}
                  onChange={(e) => handleChange(index, 'email', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white text-sm"
                  placeholder="Email Address"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Phone (Optional)</label>
                <input
                  type="tel"
                  value={participant.phone}
                  onChange={(e) => handleChange(index, 'phone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white text-sm"
                  placeholder="Phone Number"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
