"use client";
import { useState } from 'react';

type Schedule = {
  repeatEvery: number;
  repeatFrequency: string;
  repeatUntil: string;
  date: string;
  time: string;
};

const ScheduleForm = () => {
  const [schedule, setSchedule] = useState<Schedule>({
    repeatEvery: 1,
    repeatFrequency: 'Day',
    repeatUntil: 'Forever',
    date: '',
    time: '',
  });

  const calculateNextSchedule = () => {
    const { repeatEvery, repeatFrequency, date, time } = schedule;
    let nextScheduleDate = new Date();

    // Set start date and time if provided
    if (date) {
      nextScheduleDate = new Date(date + 'T' + time);
    }

    switch (repeatFrequency) {
      case 'Day':
        nextScheduleDate.setDate(nextScheduleDate.getDate() + repeatEvery + 1);
        // console.log("day ", nextScheduleDate.setDate(nextScheduleDate.getDate() + repeatEvery + 1));
        break;
      case 'Week':
        nextScheduleDate.setDate(nextScheduleDate.getDate() + repeatEvery * 7);
        break;
      case 'Month':
        nextScheduleDate.setMonth(nextScheduleDate.getMonth() + repeatEvery + 1);
        break;
      case 'Year':
        nextScheduleDate.setFullYear(nextScheduleDate.getFullYear() + repeatEvery);
        break;
      default:
        break;
    }

    console.log('Next Schedule Date: ', nextScheduleDate);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    calculateNextSchedule();
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 bg-gray-100 rounded-md shadow-md">
      <div className="mb-4">
        <label className="block text-gray-700">Repeat Every</label>
        <input
          type="number"
          value={schedule.repeatEvery}
          onChange={(e) => setSchedule({ ...schedule, repeatEvery: Number(e.target.value) })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          min="1"
        />
      </div>

      <div className="mb-4">
        <label className="block text-gray-700">Frequency</label>
        <select
          value={schedule.repeatFrequency}
          onChange={(e) => setSchedule({ ...schedule, repeatFrequency: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        >
          <option value="Day">Day</option>
          <option value="Week">Week</option>
          <option value="Month">Month</option>
          <option value="Year">Year</option>
        </select>
      </div>

      <div className="mb-4">
        <label className="block text-gray-700">Repeat Until</label>
        <select
          value={schedule.repeatUntil}
          onChange={(e) => setSchedule({ ...schedule, repeatUntil: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        >
          <option value="Forever">Forever</option>
          <option value="Custom">Custom Date and Time</option>
        </select>
      </div>

      {schedule.repeatUntil === 'Custom' && (
        <div className="mb-4">
          <label className="block text-gray-700">Date</label>
          <input
            type="date"
            value={schedule.date}
            onChange={(e) => setSchedule({ ...schedule, date: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
      )}

      {schedule.repeatUntil === 'Custom' && (
        <div className="mb-4">
          <label className="block text-gray-700">Time</label>
          <input
            type="time"
            value={schedule.time}
            onChange={(e) => setSchedule({ ...schedule, time: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Schedule
        </button>
      </div>
    </form>
  );
};

export default ScheduleForm;