import { useState, useEffect } from 'react';
import { Upload, FileText, Image, File, Trash2, ExternalLink } from 'lucide-react';
import type { Trip, Document } from '../../types';
import { getDocuments, uploadDocument, deleteDocument, getDocumentUrl } from '../../services/documents';

interface WalletTabProps {
  trip: Trip;
}

export function WalletTab({ trip }: WalletTabProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadDocuments();
  }, [trip.id]);

  async function loadDocuments() {
    try {
      const data = await getDocuments(trip.id);
      setDocuments(data);
    } catch (error) {
      console.error('Error loading documents:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);

    try {
      for (const file of Array.from(files)) {
        await uploadDocument(trip.id, file);
      }
      await loadDocuments();
    } catch (error) {
      console.error('Error uploading files:', error);
      alert('Failed to upload files. Please try again.');
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(doc: Document) {
    if (!confirm(`Are you sure you want to delete ${doc.file_name}?`)) return;

    try {
      await deleteDocument(doc.id, doc.storage_path);
      setDocuments(documents.filter((d) => d.id !== doc.id));
    } catch (error) {
      console.error('Error deleting document:', error);
      alert('Failed to delete document. Please try again.');
    }
  }

  function getFileIcon(mimeType: string) {
    if (mimeType.startsWith('image/')) return <Image className="w-8 h-8 text-blue-500" />;
    if (mimeType === 'application/pdf') return <FileText className="w-8 h-8 text-red-500" />;
    return <File className="w-8 h-8 text-gray-500" />;
  }

  function formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <label className="flex items-center justify-center px-6 py-12 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors">
          <div className="text-center">
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-700 font-medium mb-1">
              {uploading ? 'Uploading...' : 'Upload Documents'}
            </p>
            <p className="text-sm text-gray-500">
              Boarding passes, hotel confirmations, visas, etc.
            </p>
          </div>
          <input
            type="file"
            multiple
            onChange={handleFileUpload}
            disabled={uploading}
            className="hidden"
            accept="image/*,.pdf,.doc,.docx"
          />
        </label>
      </div>

      {documents.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No documents uploaded yet. Add your tickets and reservations here.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-white"
            >
              <div className="flex items-start justify-between mb-3">
                {getFileIcon(doc.mime_type)}
                <button
                  onClick={() => handleDelete(doc)}
                  className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <h4 className="font-medium text-gray-900 mb-1 truncate">{doc.file_name}</h4>
              <p className="text-sm text-gray-500 mb-3">
                {formatFileSize(doc.file_size)} • {new Date(doc.uploaded_at).toLocaleDateString()}
              </p>

              <a
                href={getDocumentUrl(doc.storage_path)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-sm text-blue-600 hover:text-blue-700"
              >
                <ExternalLink className="w-4 h-4 mr-1" />
                View Document
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
