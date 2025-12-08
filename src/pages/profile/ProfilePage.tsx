import { MainLayout } from '../../components/layout/MainLayout';
import { useAuth } from '../../contexts/AuthContext';
import { User } from 'lucide-react';

export function ProfilePage() {
  const { user } = useAuth();

  return (
    <MainLayout>
      <div className="p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Profile</h1>

        <div className="max-w-2xl bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center mb-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mr-4">
              <User className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{user?.email}</h2>
              <p className="text-gray-600">Travel Buddy Member</p>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
            <div className="space-y-3">
              <div>
                <span className="text-sm font-medium text-gray-700">Email:</span>
                <span className="ml-2 text-sm text-gray-900">{user?.email}</span>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">User ID:</span>
                <span className="ml-2 text-sm text-gray-500 font-mono">{user?.id}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
