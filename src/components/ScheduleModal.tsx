import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Job } from '../types';
import { Calendar, Clock, X, Check } from 'lucide-react';

interface ScheduleModalProps {
  job: Job;
  onClose: () => void;
}

export const ScheduleModal: React.FC<ScheduleModalProps> = ({ job, onClose }) => {
  const { scheduleAppointment } = useApp();

  const [date, setDate] = useState('Tomorrow, Oct 15');
  const [timeSlot, setTimeSlot] = useState('9:00 AM - 11:30 AM');

  const dates = [
    'Today (Rush Dispatch)',
    'Tomorrow, Oct 15',
    'Thursday, Oct 16',
    'Friday, Oct 17',
    'Saturday, Oct 18',
  ];

  const slots = [
    '8:00 AM - 10:00 AM (Early Window)',
    '9:00 AM - 11:30 AM (Morning)',
    '1:00 PM - 3:30 PM (Afternoon)',
    '4:00 PM - 6:30 PM (Late Afternoon)',
  ];

  const handleConfirm = () => {
    scheduleAppointment(job.id, date, timeSlot);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-white rounded-xl max-w-md w-full border border-neutral-200 shadow-xl p-6 animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base font-bold text-neutral-900">Schedule Service Appointment</h3>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-600 p-1 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-2">
              Select Date
            </label>
            <div className="grid grid-cols-1 gap-1.5">
              {dates.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDate(d)}
                  className={`text-left text-xs px-3 py-2 rounded-lg border transition-all ${
                    date === d
                      ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900 font-semibold'
                      : 'border-neutral-200 hover:bg-neutral-50 text-neutral-700'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-2">
              Arrival Time Window
            </label>
            <div className="grid grid-cols-1 gap-1.5">
              {slots.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setTimeSlot(s)}
                  className={`text-left text-xs px-3 py-2 rounded-lg border transition-all ${
                    timeSlot === s
                      ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900 font-semibold'
                      : 'border-neutral-200 hover:bg-neutral-50 text-neutral-700'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-neutral-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-neutral-600 hover:text-neutral-900"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            <span>Confirm Booking</span>
          </button>
        </div>
      </div>
    </div>
  );
};
