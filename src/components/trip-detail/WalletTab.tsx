import { useState, useEffect } from 'react';
import { Upload, FileText, Image, File, Trash2, ExternalLink } from 'lucide-react';
import type { Trip, Document } from '../../types';
import { getDocuments, uploadDocument, deleteDocument, getDocumentUrl } from '../../services/documents';

interface WalletTabProps {
  trip: Trip;
}

const BYTES_PER_KB = 1024;
const BYTES_PER_MB = 1024 * 1024;

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

  function getDocumentType(mimeType: string): string {
    if (mimeType.startsWith('image/')) return 'Image';
    if (mimeType === 'application/pdf') return 'PDF';
    if (mimeType.includes('word') || mimeType.includes('document')) return 'Document';
    if (mimeType.includes('sheet') || mimeType.includes('spreadsheet')) return 'Spreadsheet';
    return 'File';
  }

  function getCleanFileName(fileName: string): string {
    // Remove file extension
    const nameWithoutExt = fileName.substring(0, fileName.lastIndexOf('.')) || fileName;
    // Remove timestamp prefix if it exists (e.g., "1702123456-abc123-filename.pdf")
    const parts = nameWithoutExt.split('-');
    // If the first part is a number (timestamp), start from the third part
    if (parts.length > 2 && !isNaN(Number(parts[0]))) {
      return parts.slice(2).join('-');
    }
    return nameWithoutExt;
  }

  function formatFileSize(bytes: number): string {
    if (bytes < BYTES_PER_KB) return bytes + ' B';
    if (bytes < BYTES_PER_MB) return (bytes / BYTES_PER_KB).toFixed(1) + ' KB';
    return (bytes / BYTES_PER_MB).toFixed(1) + ' MB';
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
              className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow bg-white"
            >
              {doc.mime_type.startsWith('image/') ? (
                <div className="relative h-40 bg-gray-100 overflow-hidden">
                  <img
                    src={getDocumentUrl(doc.storage_path)}
                    alt={getCleanFileName(doc.file_name)}
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => handleDelete(doc)}
                    className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-600 bg-white rounded hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="p-4 flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {getFileIcon(doc.mime_type)}
                    <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded">
                      {getDocumentType(doc.mime_type)}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDelete(doc)}
                    className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}

              <div className="p-4">
                <h4 className="font-medium text-gray-900 mb-1 truncate" title={getCleanFileName(doc.file_name)}>
                  {getCleanFileName(doc.file_name)}
                </h4>
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
