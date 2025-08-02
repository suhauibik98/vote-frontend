/* eslint-disable no-unused-vars */

import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Eye,
  Calendar,
  Shield,
  Clock,
  CheckCircle,
  XCircle,
  Hash,
  X,
  Mail,
  User,
  Vote,
} from "lucide-react";

export const PopUpUserView = ({ isOpen, onClose, user }) => {
  if (!user) return null;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (isActive) => {
    return isActive ? (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
        <CheckCircle className="w-3 h-3 mr-1" />
        Active
      </span>
    ) : (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
        <XCircle className="w-3 h-3 mr-1" />
        Inactive
      </span>
    );
  };

  const getRoleBadge = (isAdmin) => {
    return isAdmin ? (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
        <Shield className="w-3 h-3 mr-1" />
        Administrator
      </span>
    ) : (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
        <User className="w-3 h-3 mr-1" />
        User
      </span>
    );
  };

  const getVotingStatusBadge = (isVote) => {
    return isVote ? (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
        <Vote className="w-3 h-3 mr-1" />
        Can Vote
      </span>
    ) : (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
        <XCircle className="w-3 h-3 mr-1" />
        Cannot Vote
      </span>
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", duration: 0.3 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-full overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">
                      {user.name}
                    </h2>
                    <p className="text-emerald-100 text-sm">User Profile</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="text-white/80 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {/* Basic Information */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Eye className="w-5 h-5 mr-2 text-emerald-600" />
                  Basic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <User className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-500">
                        Full Name
                      </span>
                    </div>
                    <p className="text-gray-900 font-medium">{user.name}</p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Mail className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-500">
                        Email
                      </span>
                    </div>
                    <p className="text-gray-900 font-medium">{user.email}</p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Users className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-500">
                        Reference Name
                      </span>
                    </div>
                    <p className="text-gray-900 font-medium">
                      {user.ref_Name || "N/A"}
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Hash className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-500">
                        Employee ID
                      </span>
                    </div>
                    <p className="text-gray-900 font-medium">{user.emp_id}</p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-500">
                        Birth Date
                      </span>
                    </div>
                    <p className="text-gray-900 font-medium">
                      {formatDate(user.birth_date)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Status Information */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Status & Permissions
                </h3>
                <div className="flex flex-wrap gap-3">
                  {getStatusBadge(user.isActive)}
                  {getRoleBadge(user.isAdmin)}
                  {getVotingStatusBadge(user.isVote)}
                </div>
              </div>

              {/* Activity Information */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Activity Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <div className="flex items-center space-x-2 mb-2">
                      <Clock className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-700">
                        Last Login
                      </span>
                    </div>
                    <p className="text-blue-900 font-medium">
                      {formatDateTime(user.lastLogin)}
                    </p>
                  </div>

                  <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                    <div className="flex items-center space-x-2 mb-2">
                      <Calendar className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium text-green-700">
                        Member Since
                      </span>
                    </div>
                    <p className="text-green-900 font-medium">
                      {formatDate(user.createdAt)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Voting History */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Vote className="w-5 h-5 mr-2 text-emerald-600" />
                  Voting History ({user.votedList?.length || 0} votes)
                </h3>

                {user.votedList && user.votedList.length > 0 ? (
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {user.votedList.map((vote) => (
                      <div
                        key={vote._id}
                        className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg p-4 border border-emerald-200"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-emerald-900 flex-1">
                            {vote.voteMainId?.voteSubject || "Unknown Vote"}
                          </h4>
                          <span className="text-xs text-emerald-600 bg-emerald-100 px-2 py-1 rounded-full ml-2">
                            {formatDateTime(vote.voteDate)}
                          </span>
                        </div>

                        {vote.voteTo ? (
                          <div className="mb-2">
                            <span className="text-sm text-gray-600">
                              Voted for:{" "}
                            </span>
                            <span className="text-sm font-medium text-gray-900">
                              {vote.voteTo.name}
                            </span>
                          </div>
                        ) : (
                          <div className="mb-2">
                            <span className="text-sm text-orange-600 bg-orange-100 px-2 py-1 rounded">
                              No candidate selected
                            </span>
                          </div>
                        )}

                        {vote.candidateDescription && (
                          <div>
                            <span className="text-sm text-gray-600">
                              Description:{" "}
                            </span>
                            <span className="text-sm text-gray-800">
                              {vote.candidateDescription}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Vote className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No voting history available</p>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-4 py-4 border-t">
              <div className="flex justify-between gap-2 items-center text-sm text-gray-500">
                <span>User ID: {user._id}</span>|
                <span>Last Updated: {formatDateTime(user.updatedAt)}</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
