import React from 'react';
import { useSelector } from 'react-redux';

export const AdminSettings = () => {
  const { user } = useSelector(state => state.auth);

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Admin Settings</h2>
      <div className="space-y-6">
        {/* Profile Settings */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input 
                type="text" 
                value={user?.name || 'Admin User'}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input 
                type="text" 
                value={user?.email || 'Admin User'}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Employee ID</label>
              <input 
                type="text" 
                value={user?.emp_id || 'N/A'}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-300 hover:cursor-no-drop"
                readOnly
                disabled
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <input 
                type="text" 
                value="Administrator"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-300 hover:cursor-no-drop"
                readOnly
                disabled
              />
            </div>
          </div>
        </div>

        {/* System Settings */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">System Settings</h3>
          <div className="space-y-4">
            <label className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Auto-approve new users</span>
              <input type="checkbox" className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" />
            </label>
            <label className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Send email notifications for new votes</span>
              <input type="checkbox" className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" defaultChecked />
            </label>
            {/* <label className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Allow anonymous voting</span>
              <input type="checkbox" className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" />
            </label> */}
            <label className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Enable vote result notifications</span>
              <input type="checkbox" className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" defaultChecked />
            </label>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Admin Notification Preferences</h3>
          <div className="space-y-3">
            <label className="flex items-center">
              <input type="checkbox" className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" defaultChecked />
              <span className="ml-2 text-sm text-gray-700">Daily activity reports</span>
            </label>
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Security Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Session Timeout (minutes)</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent">
                <option value="30">30 minutes</option>
                <option value="60" selected>60 minutes</option>
                <option value="120">2 hours</option>
                <option value="240">4 hours</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Maximum Failed Login Attempts</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent">
                <option value="3">3 attempts</option>
                <option value="5" selected>5 attempts</option>
                <option value="10">10 attempts</option>
              </select>
            </div>
            <label className="flex items-center">
              <input type="checkbox" className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" defaultChecked />
              <span className="ml-2 text-sm text-gray-700">Enable two-factor authentication</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" />
              <span className="ml-2 text-sm text-gray-700">Require password change every 90 days</span>
            </label>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button className="px-6 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-colors">
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};