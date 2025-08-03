import React, { useState, useEffect } from "react";
import { useAddNewVoteMutation, useGetAlluserNameQuery } from "../../../redux/apis/AdminApis";
import {
  Calendar,
  Users,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle,
  Clock,
  Vote,
  User,
  FileText,
  Save,
  X
} from "lucide-react";

export const CreateNewVote = () => {
  const [formData, setFormData] = useState({
    voteSubject: "",
    startDate: "",
    endDate: "",
    startTime: "",
    endTime: "",
    candidates: [{ id: "", description: "" }],
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showNotification, setShowNotification] = useState(false);
  const [touched, setTouched] = useState({});

  const { data: userName = [], isLoading: loadingUsers } = useGetAlluserNameQuery();
  const [addNewVote] = useAddNewVoteMutation();

  // Jordan timezone utility functions
  const getJordanTime = (date = null) => {
    const targetDate = date || new Date();
    return new Date(targetDate.toLocaleString("en-US", {timeZone: "Asia/Amman"}));
  };

  const getJordanDateString = (date = null) => {
    const targetDate = date || getJordanTime();
    const year = targetDate.getFullYear();
    const month = String(targetDate.getMonth() + 1).padStart(2, '0');
    const day = String(targetDate.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getJordanTimeString = (date = null) => {
    const targetDate = date || getJordanTime();
    const hours = String(targetDate.getHours()).padStart(2, '0');
    const minutes = String(targetDate.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  // Clear success message and hide notification after 5 seconds
  useEffect(() => {
    if (successMessage) {
      setShowNotification(true);
      const timer = setTimeout(() => {
        setSuccessMessage("");
        setShowNotification(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Smooth scroll to top when notification appears
  useEffect(() => {
    if (showNotification) {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  }, [showNotification]);

  // Validation functions
  const validateForm = () => {
    const newErrors = {};

    // Vote subject validation
    if (!formData.voteSubject.trim()) {
      newErrors.voteSubject = "Vote subject is required";
    } else if (formData.voteSubject.trim().length < 3) {
      newErrors.voteSubject = "Vote subject must be at least 3 characters";
    } else if (formData.voteSubject.trim().length > 200) {
      newErrors.voteSubject = "Vote subject must be less than 200 characters";
    }

    // Date validation with Jordan timezone
    const jordanToday = getJordanTime();
    jordanToday.setHours(0, 0, 0, 0);
    
    if (!formData.startDate) {
      newErrors.startDate = "Start date is required";
    } else {
      const startDate = new Date(formData.startDate);
      startDate.setHours(0, 0, 0, 0);
      if (startDate < jordanToday) {
        newErrors.startDate = "Start date cannot be in the past (Jordan time)";
      }
    }

    if (!formData.endDate) {
      newErrors.endDate = "End date is required";
    } else if (formData.startDate) {
      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);
      
      if (endDate < startDate) {
        newErrors.endDate = "End date must be after or equal to start date";
      }
    }

    // Time validation
    if (!formData.startTime) {
      newErrors.startTime = "Start time is required";
    }

    if (!formData.endTime) {
      newErrors.endTime = "End time is required";
    }

    // Combined date and time validation with Jordan timezone
    if (formData.startDate && formData.endDate && formData.startTime && formData.endTime) {
      // Create date objects in local time but validate against Jordan time
      const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`);
      const endDateTime = new Date(`${formData.endDate}T${formData.endTime}`);
      const jordanNow = getJordanTime();

      // Check if start date time is in the past (Jordan time)
      if (startDateTime <= jordanNow) {
        newErrors.startTime = "Start date and time must be in the future (Jordan time)";
      }

      // Check if end date time is after start date time
      if (endDateTime <= startDateTime) {
        newErrors.endTime = "End date and time must be after start date and time";
      }

      // Check minimum voting period (at least 1 hour)
      const diffMs = endDateTime - startDateTime;
      const diffHours = diffMs / (1000 * 60 * 60);
      
      if (diffHours < 1) {
        newErrors.endTime = "Voting period must be at least 1 hour";
      }

      // Additional validation for same-day votes
      if (formData.startDate === formData.endDate) {
        const startTime24 = new Date(`1970-01-01T${formData.startTime}:00`);
        const endTime24 = new Date(`1970-01-01T${formData.endTime}:00`);
        const timeDiffMs = endTime24 - startTime24;
        const timeDiffHours = timeDiffMs / (1000 * 60 * 60);
        
        if (timeDiffHours < 1) {
          newErrors.endTime = "For same-day voting, end time must be at least 1 hour after start time";
        }
      }
    }

    // Candidates validation
    if (formData.candidates.length < 2) {
      newErrors.candidates = "At least 2 candidates are required";
    } else {
      const candidateIds = formData.candidates.map(c => c.id).filter(id => id);
      const uniqueIds = new Set(candidateIds);
      
      if (candidateIds.length !== uniqueIds.size) {
        newErrors.candidates = "Duplicate candidates are not allowed";
      }

      formData.candidates.forEach((candidate, index) => {
        if (!candidate.id) {
          newErrors[`candidate_${index}_id`] = "Please select a candidate";
        }
        if (!candidate.description.trim()) {
          newErrors[`candidate_${index}_description`] = "Description is required";
        } else if (candidate.description.trim().length < 5) {
          newErrors[`candidate_${index}_description`] = "Description must be at least 5 characters";
        }
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }

    // Mark field as touched
    setTouched(prev => ({ ...prev, [name]: true }));
  };

  const handleCandidateChange = (index, field, value) => {
    const updatedCandidates = [...formData.candidates];
    updatedCandidates[index][field] = value;
    setFormData((prevData) => ({
      ...prevData,
      candidates: updatedCandidates,
    }));

    // Clear related errors
    const errorKey = `candidate_${index}_${field}`;
    if (errors[errorKey]) {
      setErrors(prev => ({ ...prev, [errorKey]: "", candidates: "" }));
    }
  };

  const handleAddCandidate = () => {
    setFormData((prevData) => ({
      ...prevData,
      candidates: [...prevData.candidates, { id: "", description: "" }],
    }));
  };

  const handleRemoveCandidate = (index) => {
    const updated = [...formData.candidates];
    updated.splice(index, 1);
    setFormData((prevData) => ({
      ...prevData,
      candidates: updated,
    }));

    // Clear related errors
    const newErrors = { ...errors };
    delete newErrors[`candidate_${index}_id`];
    delete newErrors[`candidate_${index}_description`];
    setErrors(newErrors);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      await addNewVote(formData).unwrap();
      setSuccessMessage("Vote created successfully! 🎉");
      
      // Reset form
      setFormData({
        voteSubject: "",
        startDate: "",
        endDate: "",
        startTime: "",
        endTime: "",
        candidates: [{ id: "", description: "" }],
      });
      setTouched({});
      setErrors({});
      
    } catch (err) {
      setErrors({ submit: err?.data?.message || "Failed to create vote. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getMinDate = () => {
    return getJordanDateString();
  };

  const getMinEndDate = () => {
    if (!formData.startDate) return getMinDate();
    return formData.startDate; // End date can be same as start date (different times)
  };

  const getMinTime = () => {
    if (!formData.startDate) return "";
    
    const jordanNow = getJordanTime();
    const selectedDate = new Date(formData.startDate);
    const jordanToday = new Date(getJordanDateString());
    
    // If start date is today in Jordan timezone
    if (selectedDate.toDateString() === jordanToday.toDateString()) {
      // Return current Jordan time (no additional buffer)
      return getJordanTimeString(jordanNow);
    }
    
    return ""; // No minimum time for future dates
  };

  const getMinEndTime = () => {
    if (!formData.startDate || !formData.endDate || !formData.startTime) return "";
    
    // If same date, end time must be after start time
    if (formData.startDate === formData.endDate) {
      const startTime = new Date(`1970-01-01T${formData.startTime}:00`);
      const minEndTime = new Date(startTime.getTime() + 60 * 60 * 1000); // Add 1 hour
      const hours = String(minEndTime.getHours()).padStart(2, '0');
      const minutes = String(minEndTime.getMinutes()).padStart(2, '0');
      return `${hours}:${minutes}`;
    }
    
    return ""; // No minimum time for different dates
  };

  const getSelectedCandidateIds = () => {
    return formData.candidates.map(c => c.id).filter(id => id);
  };

  const getAvailableUsers = (currentIndex) => {
    const selectedIds = getSelectedCandidateIds();
    const currentId = formData.candidates[currentIndex]?.id;
    return userName.filter(user => 
      !selectedIds.includes(user._id) || user._id === currentId
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-6 px-4 sm:px-6 lg:px-8">
      
      {/* Success Notification Popup */}
      {showNotification && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-slideDown">
          <div className="bg-white border border-green-200 rounded-xl shadow-2xl p-4 lg:p-6 max-w-md mx-auto">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800">Success!</h3>
                <p className="text-sm text-gray-600">{successMessage}</p>
              </div>
              <button
                onClick={() => {
                  setShowNotification(false);
                  setSuccessMessage("");
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        {/* Footer Info */}
        <div className="mb-8 lg:mb-12 text-center">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 lg:p-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">📝 Voting Guidelines</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Minimum 2 candidates required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Minimum 1 hour voting period</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>No duplicate candidates</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-blue-500" />
                <span>All times in Jordan timezone</span>
              </div>
            </div>
          </div>
        </div>
        {/* Header */}
        <div className="text-center mb-8 lg:mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-full mb-4">
            <Vote className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">
            Create New Vote
          </h1>
          <p className="text-gray-600 text-sm lg:text-base max-w-2xl mx-auto">
            Set up a new voting poll for your organization. Define candidates, set voting period, and let democracy work!
          </p>
          <p className="text-blue-600 text-xs mt-2">
            🕐 All times are in Jordan timezone (GMT+3)
          </p>
        </div>

        {/* Main Form */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <form onSubmit={handleSubmit} className="space-y-6 lg:space-y-8">
            
            {/* Form Header */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 lg:px-8 py-6 lg:py-8">
              <h2 className="text-xl lg:text-2xl font-bold text-white mb-2">Vote Configuration</h2>
              <p className="text-blue-100 text-sm lg:text-base">Fill in the details to create your voting poll (Jordan timezone)</p>
            </div>

            <div className="px-6 lg:px-8 pb-6 lg:pb-8 space-y-6 lg:space-y-8">
              
              {/* Submit Error */}
              {errors.submit && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                    <span className="text-red-700 font-medium">{errors.submit}</span>
                  </div>
                </div>
              )}

              {/* Vote Subject */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm lg:text-base font-semibold text-gray-700">
                  <FileText className="w-5 h-5 text-blue-500" />
                  Vote Subject *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="voteSubject"
                    value={formData.voteSubject}
                    onChange={handleChange}
                    placeholder="Enter the main topic or question for this vote..."
                    className={`w-full px-4 py-3 lg:py-4 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm lg:text-base ${
                      errors.voteSubject ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                    }`}
                  />
                  {errors.voteSubject && (
                    <div className="mt-2 flex items-center gap-2 text-red-600 text-sm">
                      <AlertCircle className="w-4 h-4" />
                      {errors.voteSubject}
                    </div>
                  )}
                </div>
              </div>

              {/* Date and Time Range */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-500" />
                  Voting Period * (Jordan Time - GMT+3)
                </h3>
                
                {/* Start Date and Time */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm lg:text-base font-medium text-gray-700">
                      <Calendar className="w-4 h-4 text-green-500" />
                      Start Date *
                    </label>
                    <input
                      type="date"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleChange}
                      min={getMinDate()}
                      className={`w-full px-4 py-3 lg:py-4 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm lg:text-base ${
                        errors.startDate ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                      }`}
                    />
                    {errors.startDate && (
                      <div className="mt-2 flex items-center gap-2 text-red-600 text-sm">
                        <AlertCircle className="w-4 h-4" />
                        {errors.startDate}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm lg:text-base font-medium text-gray-700">
                      <Clock className="w-4 h-4 text-green-500" />
                      Start Time * (Jordan Time)
                    </label>
                    <input
                      type="time"
                      name="startTime"
                      value={formData.startTime}
                      onChange={handleChange}
                      min={getMinTime()}
                      className={`w-full px-4 py-3 lg:py-4 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm lg:text-base ${
                        errors.startTime ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                      }`}
                    />
                    {errors.startTime && (
                      <div className="mt-2 flex items-center gap-2 text-red-600 text-sm">
                        <AlertCircle className="w-4 h-4" />
                        {errors.startTime}
                      </div>
                    )}
                  </div>
                </div>

                {/* End Date and Time */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm lg:text-base font-medium text-gray-700">
                      <Calendar className="w-4 h-4 text-orange-500" />
                      End Date *
                    </label>
                    <input
                      type="date"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleChange}
                      min={getMinEndDate()}
                      className={`w-full px-4 py-3 lg:py-4 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm lg:text-base ${
                        errors.endDate ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                      }`}
                    />
                    {errors.endDate && (
                      <div className="mt-2 flex items-center gap-2 text-red-600 text-sm">
                        <AlertCircle className="w-4 h-4" />
                        {errors.endDate}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm lg:text-base font-medium text-gray-700">
                      <Clock className="w-4 h-4 text-orange-500" />
                      End Time * (Jordan Time)
                    </label>
                    <input
                      type="time"
                      name="endTime"
                      value={formData.endTime}
                      onChange={handleChange}
                      min={getMinEndTime()}
                      className={`w-full px-4 py-3 lg:py-4 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm lg:text-base ${
                        errors.endTime ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                      }`}
                    />
                    {errors.endTime && (
                      <div className="mt-2 flex items-center gap-2 text-red-600 text-sm">
                        <AlertCircle className="w-4 h-4" />
                        {errors.endTime}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Candidates Section */}
              <div className="space-y-4 lg:space-y-6">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm lg:text-base font-semibold text-gray-700">
                    <Users className="w-5 h-5 text-purple-500" />
                    Candidates * (Minimum 2 required)
                  </label>
                  <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                    {formData.candidates.length} candidate{formData.candidates.length !== 1 ? 's' : ''}
                  </span>
                </div>

                {errors.candidates && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-red-600 text-sm">
                      <AlertCircle className="w-4 h-4" />
                      {errors.candidates}
                    </div>
                  </div>
                )}

                <div className="space-y-4 lg:space-y-6">
                  {formData.candidates.map((candidate, index) => (
                    <div
                      key={index}
                      className="relative bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-4 lg:p-6 transition-all duration-200 group"
                    >
                      {/* Remove button */}
                      {formData.candidates.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveCandidate(index)}
                          className="absolute top-3 right-3 w-8 h-8 bg-red-100 hover:bg-red-200 text-red-600 rounded-full flex items-center justify-center transition-colors duration-200 opacity-0 group-hover:opacity-100"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}

                      <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-4">
                          <div className="w-8 h-8 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold text-sm">{index + 1}</span>
                          </div>
                          <h3 className="font-semibold text-gray-800">Candidate {index + 1}</h3>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                              <User className="w-4 h-4 text-blue-500" />
                              Select Candidate
                            </label>
                            <div className="relative">
                              <select
                                value={candidate.id}
                                onChange={(e) => handleCandidateChange(index, "id", e.target.value)}
                                disabled={loadingUsers}
                                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm lg:text-base appearance-none bg-white ${
                                  errors[`candidate_${index}_id`] ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                                }`}
                                style={{
                                  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                                  backgroundPosition: 'right 0.5rem center',
                                  backgroundRepeat: 'no-repeat',
                                  backgroundSize: '1.5em 1.5em',
                                  paddingRight: '2.5rem'
                                }}
                              >
                                <option value="" className="text-gray-500">
                                  {loadingUsers ? "Loading candidates..." : "Select a candidate"}
                                </option>
                                {getAvailableUsers(index).map((user) => (
                                  <option key={user._id} value={user._id} className="text-gray-900 bg-white hover:bg-blue-50 py-2">
                                    {user.name} (ID: {user.emp_id})
                                  </option>
                                ))}
                              </select>
                            </div>
                            {errors[`candidate_${index}_id`] && (
                              <div className="flex items-center gap-2 text-red-600 text-sm">
                                <AlertCircle className="w-4 h-4" />
                                {errors[`candidate_${index}_id`]}
                              </div>
                            )}
                          </div>

                          <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                              <FileText className="w-4 h-4 text-green-500" />
                              Description
                            </label>
                            <textarea
                              value={candidate.description}
                              onChange={(e) => handleCandidateChange(index, "description", e.target.value)}
                              placeholder="Brief description about the candidate..."
                              rows="3"
                              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm lg:text-base resize-none ${
                                errors[`candidate_${index}_description`] ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                              }`}
                            />
                            {errors[`candidate_${index}_description`] && (
                              <div className="flex items-center gap-2 text-red-600 text-sm">
                                <AlertCircle className="w-4 h-4" />
                                {errors[`candidate_${index}_description`]}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add Candidate Button */}
                <button
                  type="button"
                  onClick={handleAddCandidate}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-3 lg:py-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
                >
                  <Plus className="w-5 h-5" />
                  Add Another Candidate
                </button>
              </div>

              {/* Submit Button */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 sm:flex-none sm:px-8 flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-6 py-3 lg:py-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:shadow-md font-semibold text-sm lg:text-base"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Creating Vote...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Create Vote
                    </>
                  )}
                </button>

                <div className="text-sm text-gray-500 flex items-center justify-center sm:justify-start">
                  <span>All fields marked with * are required</span>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
   </div>
 );
};