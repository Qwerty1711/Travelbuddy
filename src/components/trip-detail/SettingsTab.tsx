import { useState, useEffect } from 'react';
import { Share2, Link as LinkIcon, Users, Copy, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Trip } from '../../types';
import { updateTrip } from '../../services/trips';
import { getTripShare, createTripShare } from '../../services/trips';

interface SettingsTabProps {
  trip: Trip;
  onTripUpdated: (trip: Trip) => void;
}

export function SettingsTab({ trip, onTripUpdated }: SettingsTabProps) {
  const navigate = useNavigate();
  const [shareLink, setShareLink] = useState('');
  const [loadingShare, setLoadingShare] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadShareLink();
  }, [trip.id]);

  async function loadShareLink() {
    try {
      const share = await getTripShare(trip.id);
      if (share) {
        setShareLink(`${window.location.origin}/share/${share.public_id}`);
      }
    } catch (error) {
      console.error('Error loading share link:', error);
    }
  }

  async function handleGenerateShareLink() {
    setLoadingShare(true);
    try {
      const share = await createTripShare(trip.id);
      const link = `${window.location.origin}/share/${share.public_id}`;
      setShareLink(link);
    } catch (error) {
      console.error('Error generating share link:', error);
      alert('Failed to generate share link. Please try again.');
    } finally {
      setLoadingShare(false);
    }
  }

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Error copying link:', error);
    }
  }

  function handleExport() {
    navigate(`/trips/${trip.id}/print`);
  }

  return (
    <div className="p-8">
      <div className="max-w-3xl space-y-8">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <Share2 className="w-5 h-5 text-blue-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Share & Collaborate</h3>
          </div>

          <p className="text-gray-600 mb-4">
            Generate a shareable link to let others view your trip itinerary, packing list, and expenses.
          </p>

          {shareLink ? (
            <div>
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={shareLink}
                  readOnly
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm"
                />
                <button
                  onClick={handleCopyLink}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <p className="text-sm text-gray-500">
                Anyone with this link can view your trip in read-only mode.
              </p>
            </div>
          ) : (
            <button
              onClick={handleGenerateShareLink}
              disabled={loadingShare}
              className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
            >
              <LinkIcon className="w-5 h-5 mr-2" />
              {loadingShare ? 'Generating...' : 'Generate Share Link'}
            </button>
          )}
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <Download className="w-5 h-5 text-blue-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Export Trip</h3>
          </div>

          <p className="text-gray-600 mb-4">
            Download a complete PDF snapshot of your trip including itinerary, packing list, and expenses.
          </p>

          <button
            onClick={handleExport}
            className="flex items-center px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Download className="w-5 h-5 mr-2" />
            Download Trip (HTML/PDF)
          </button>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <Users className="w-5 h-5 text-blue-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Trip Details</h3>
          </div>

          <div className="space-y-3">
            <div>
              <span className="text-sm font-medium text-gray-700">Trip Type:</span>
              <span className="ml-2 text-sm text-gray-900 capitalize">{trip.trip_type}</span>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-700">Vibe:</span>
              <span className="ml-2 text-sm text-gray-900 capitalize">{trip.vibe}</span>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-700">Travelers:</span>
              <span className="ml-2 text-sm text-gray-900">{trip.num_travelers}</span>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-700">Interests:</span>
              <div className="mt-1 flex flex-wrap gap-1">
                {trip.interests.map((interest) => (
                  <span
                    key={interest}
                    className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
