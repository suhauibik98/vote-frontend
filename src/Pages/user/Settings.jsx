import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useEditProfileMutation } from '../../redux/apis/UserApis';
import { editUser } from '../../redux/slices/authSlice';

export const Settings = () => {
  const { user: authuser } = useSelector((state) => state.auth);
  const [editProfile] = useEditProfileMutation()
  const [formData , setFormData] = useState({...authuser})

  console.log(authuser);
  
  const dispatch = useDispatch()
  const handleChange = (event)=>{
    setFormData({ ...formData, [event.target.name]: event.target.value })
  }

  const handleEdit = async()=>{
    try {
       const res =  await editProfile(formData).unwrap();
        dispatch(editUser(res.user))

    } catch (error) {
        console.log(error);
        
    }
  }

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Settings</h2>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Profile Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input 
                  type="text" 
                  onChange={handleChange}
                  value={formData.name}
                  name="name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  
                />
              </div>
              <div>
                <label className="block  text-sm font-medium text-gray-700 mb-1">Email</label>
                <input 
                  type="text" 
                  disabled
                  value={formData.email}
                  className="w-full px-3 py-2 hover:cursor-no-drop border border-gray-300 rounded-lg bg-gray-50"
                  readOnly
                />
              </div>
              <div>
                <label className="block  text-sm font-medium text-gray-700 mb-1">Employee ID</label>
                <input 
                  type="text" 
                  disabled
                  value={formData.emp_id}
                  className="w-full px-3 py-2 hover:cursor-no-drop border border-gray-300 rounded-lg bg-gray-50"
                  readOnly
                />
              </div>
            </div>
          </div>
          
          {/* <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Notification Preferences</h3>
            <div className="space-y-3">
              <label className="flex items-center">
                <input type="checkbox" className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" defaultChecked />
                <span className="ml-2 text-sm text-gray-700">Email notifications for new votes</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" defaultChecked />
                <span className="ml-2 text-sm text-gray-700">Reminders for pending votes</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" />
                <span className="ml-2 text-sm text-gray-700">Vote result notifications</span>
              </label>
            </div>
          </div> */}
        </div>
     

        {/* Save Button */}
        <div className="flex justify-end my-4">
          <button onClick={handleEdit} className="px-6 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-colors">
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};