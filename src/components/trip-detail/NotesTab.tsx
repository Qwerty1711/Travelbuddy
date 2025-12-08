import { useState, useEffect } from 'react';
import { Sparkles, Save } from 'lucide-react';
import type { Trip, TripDay, Note } from '../../types';
import { getTripDays } from '../../services/trips';
import { getNoteByDay, upsertNote, updateNoteAISummary } from '../../services/notes';
import { summariseNotes } from '../../services/ai';

interface NotesTabProps {
  trip: Trip;
}

export function NotesTab({ trip }: NotesTabProps) {
  const [days, setDays] = useState<TripDay[]>([]);
  const [notes, setNotes] = useState<Record<number, Note>>({});
  const [editingDay, setEditingDay] = useState<number | null>(null);
  const [editText, setEditText] = useState('');
  const [summarizing, setSummarizing] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [trip.id]);

  async function loadData() {
    try {
      const daysData = await getTripDays(trip.id);
      setDays(daysData);

      const notesMap: Record<number, Note> = {};
      for (const day of daysData) {
        const note = await getNoteByDay(trip.id, day.day_number);
        if (note) {
          notesMap[day.day_number] = note;
        }
      }
      setNotes(notesMap);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveNote(dayNumber: number) {
    try {
      const note = await upsertNote({
        trip_id: trip.id,
        day_number: dayNumber,
        text: editText,
        ai_summary: notes[dayNumber]?.ai_summary || '',
      });
      setNotes({ ...notes, [dayNumber]: note });
      setEditingDay(null);
      setEditText('');
    } catch (error) {
      console.error('Error saving note:', error);
      alert('Failed to save note. Please try again.');
    }
  }

  async function handleGenerateSummary(dayNumber: number) {
    const note = notes[dayNumber];
    if (!note || !note.text.trim()) {
      alert('Please add some notes first before generating a summary.');
      return;
    }

    setSummarizing(dayNumber);

    try {
      const summary = await summariseNotes(note.text);
      await updateNoteAISummary(trip.id, dayNumber, summary);
      setNotes({
        ...notes,
        [dayNumber]: { ...note, ai_summary: summary },
      });
    } catch (error) {
      console.error('Error generating summary:', error);
      alert('Failed to generate summary. Please try again.');
    } finally {
      setSummarizing(null);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (days.length === 0) {
    return (
      <div className="p-8 text-center py-20">
        <p className="text-gray-500">
          Create an itinerary first to start adding daily notes.
        </p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="space-y-6">
        {days.map((day) => {
          const note = notes[day.day_number];
          const isEditing = editingDay === day.day_number;

          return (
            <div key={day.id} className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="mb-4">
                <h4 className="text-lg font-semibold text-gray-900">
                  Day {day.day_number}: {day.title}
                </h4>
                <p className="text-sm text-gray-600">
                  {new Date(day.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>

              {isEditing ? (
                <div className="space-y-3">
                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm min-h-32"
                    placeholder="Write your notes for this day..."
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSaveNote(day.day_number)}
                      className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                    >
                      <Save className="w-4 h-4 mr-1" />
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setEditingDay(null);
                        setEditText('');
                      }}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  {note?.text ? (
                    <div className="mb-4">
                      <h5 className="text-sm font-medium text-gray-700 mb-2">Notes</h5>
                      <p className="text-gray-900 whitespace-pre-wrap">{note.text}</p>
                    </div>
                  ) : (
                    <p className="text-gray-500 mb-4">No notes yet for this day.</p>
                  )}

                  {note?.ai_summary && (
                    <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
                      <div className="flex items-center mb-2">
                        <Sparkles className="w-4 h-4 text-blue-600 mr-2" />
                        <h5 className="text-sm font-medium text-blue-900">AI Summary</h5>
                      </div>
                      <p className="text-blue-900">{note.ai_summary}</p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingDay(day.day_number);
                        setEditText(note?.text || '');
                      }}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm"
                    >
                      {note?.text ? 'Edit Notes' : 'Add Notes'}
                    </button>
                    {note?.text && (
                      <button
                        onClick={() => handleGenerateSummary(day.day_number)}
                        disabled={summarizing === day.day_number}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-sm"
                      >
                        <Sparkles className="w-4 h-4 mr-1" />
                        {summarizing === day.day_number ? 'Summarizing...' : 'AI Summary'}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
