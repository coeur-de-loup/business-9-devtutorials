'use client';

import { useState } from 'react';
import { XMarkIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

interface Tutorial {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string | null;
  level: string | null;
  tags: string[];
  duration: number | null;
  curriculum: any;
  requirements: string[];
  learningGoals: string[];
  creator: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
    stripeAccountId: string | null;
  };
  adminNotes: string | null;
  createdAt: string;
}

interface Props {
  tutorial: Tutorial;
  onClose: () => void;
  onComplete: () => void;
}

const QUALITY_CHECKLIST_ITEMS = [
  { id: 'content-quality', label: 'Content is accurate and well-structured', category: 'Content' },
  { id: 'audio-quality', label: 'Audio is clear and professional', category: 'Production' },
  { id: 'video-quality', label: 'Video quality is acceptable (720p+)', category: 'Production' },
  { id: 'code-examples', label: 'Code examples are correct and runnable', category: 'Content' },
  { id: 'learning-objectives', label: 'Learning objectives are clearly defined', category: 'Content' },
  { id: 'prerequisites', label: 'Prerequisites are accurately listed', category: 'Content' },
  { id: 'appropriate-level', label: 'Content difficulty matches stated level', category: 'Content' },
  { id: 'no-copyright', label: 'No copyright violations detected', category: 'Legal' },
  { id: 'original-content', label: 'Content appears to be original', category: 'Legal' },
  { id: 'appropriate-price', label: 'Price is reasonable for content value', category: 'Business' },
];

const REJECTION_REASONS = [
  'Poor audio/video quality',
  'Inaccurate or outdated information',
  'Missing code examples or broken code',
  'Unclear learning objectives',
  'Prerequisites not accurately listed',
  'Content difficulty mismatch',
  'Copyright concerns',
  'Plagiarism detected',
  'Inappropriate pricing',
  'Other (specify in notes)',
];

export default function TutorialReviewPanel({ tutorial, onClose, onComplete }: Props) {
  const [action, setAction] = useState<'approve' | 'reject' | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [selectedChecklist, setSelectedChecklist] = useState<string[]>([]);
  const [selectedRejectionReasons, setSelectedRejectionReasons] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!action) {
      setError('Please select an action (approve or reject)');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/tutorials/${tutorial.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          adminNotes: action === 'reject' ? adminNotes : undefined,
          rejectionReasons: action === 'reject' ? selectedRejectionReasons : undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to submit review');
      }

      setSuccess(true);
      setTimeout(() => {
        onComplete();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleChecklist = (item: string) => {
    setSelectedChecklist((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const toggleRejectionReason = (reason: string) => {
    setSelectedRejectionReasons((prev) =>
      prev.includes(reason) ? prev.filter((r) => r !== reason) : [...prev, reason]
    );
  };

  const curriculum = tutorial.curriculum as Array<{ title: string; duration: number }>;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        ></div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
          &#8203;
        </span>

        {success ? (
          <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="sm:flex sm:items-start">
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-green-100 sm:mx-0 sm:h-10 sm:w-10">
                  <CheckCircleIcon className="h-6 w-6 text-green-600" aria-hidden="true" />
                </div>
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Review Submitted
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      {action === 'approve'
                        ? 'Tutorial has been approved and published.'
                        : 'Tutorial has been rejected and creator will be notified.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
            {/* Header */}
            <div className="bg-gray-50 px-4 py-3 sm:px-6 flex justify-between items-center border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Review Tutorial: {tutorial.title}
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            {/* Content */}
            <div className="px-4 py-5 sm:px-6 max-h-[70vh] overflow-y-auto">
              {/* Error Message */}
              {error && (
                <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-4">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              {/* Tutorial Overview */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Overview</h4>
                <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                  <div>
                    <dt className="text-gray-500">Creator</dt>
                    <dd className="font-medium text-gray-900">
                      {tutorial.creator.name || tutorial.creator.email}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Email</dt>
                    <dd className="font-medium text-gray-900">{tutorial.creator.email}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Category</dt>
                    <dd className="font-medium text-gray-900">{tutorial.category || 'N/A'}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Level</dt>
                    <dd className="font-medium text-gray-900">{tutorial.level || 'N/A'}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Price</dt>
                    <dd className="font-medium text-gray-900">
                      ${(tutorial.price / 100).toFixed(2)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Duration</dt>
                    <dd className="font-medium text-gray-900">
                      {tutorial.duration ? `${tutorial.duration} minutes` : 'N/A'}
                    </dd>
                  </div>
                </dl>
                <div className="mt-3">
                  <dt className="text-gray-500 text-sm">Description</dt>
                  <dd className="mt-1 text-sm text-gray-900">{tutorial.description}</dd>
                </div>
                {tutorial.tags.length > 0 && (
                  <div className="mt-3">
                    <dt className="text-gray-500 text-sm">Tags</dt>
                    <dd className="mt-1 flex flex-wrap gap-2">
                      {tutorial.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                        >
                          {tag}
                        </span>
                      ))}
                    </dd>
                  </div>
                )}
              </div>

              {/* Learning Goals */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-900 mb-2">
                  Learning Goals ({tutorial.learningGoals.length})
                </h4>
                <ul className="space-y-1">
                  {tutorial.learningGoals.map((goal, idx) => (
                    <li key={idx} className="text-sm text-gray-700 flex items-start">
                      <span className="mr-2 text-indigo-600">•</span>
                      <span>{goal}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Requirements */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-900 mb-2">
                  Prerequisites ({tutorial.requirements.length})
                </h4>
                <ul className="space-y-1">
                  {tutorial.requirements.map((req, idx) => (
                    <li key={idx} className="text-sm text-gray-700 flex items-start">
                      <span className="mr-2 text-indigo-600">•</span>
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Curriculum */}
              {curriculum && curriculum.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">
                    Curriculum ({curriculum.length} lessons)
                  </h4>
                  <div className="space-y-2">
                    {curriculum.map((lesson, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm"
                      >
                        <span className="font-medium text-gray-900">
                          {idx + 1}. {lesson.title}
                        </span>
                        <span className="text-gray-500">{lesson.duration} min</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quality Checklist */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-900 mb-3">
                  Quality Checklist
                </h4>
                <div className="space-y-2">
                  {QUALITY_CHECKLIST_ITEMS.map((item) => (
                    <label
                      key={item.id}
                      className="flex items-start p-3 bg-gray-50 rounded hover:bg-gray-100 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedChecklist.includes(item.id)}
                        onChange={() => toggleChecklist(item.id)}
                        className="mt-0.5 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <div className="ml-3">
                        <span className="text-sm font-medium text-gray-900">
                          {item.label}
                        </span>
                        <span className="ml-2 text-xs text-gray-500">
                          ({item.category})
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Action Selection */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Review Action</h4>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setAction('approve')}
                    className={`flex-1 flex items-center justify-center px-4 py-3 border rounded-md text-sm font-medium ${
                      action === 'approve'
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <CheckCircleIcon className="h-5 w-5 mr-2" />
                    Approve & Publish
                  </button>
                  <button
                    type="button"
                    onClick={() => setAction('reject')}
                    className={`flex-1 flex items-center justify-center px-4 py-3 border rounded-md text-sm font-medium ${
                      action === 'reject'
                        ? 'border-red-500 bg-red-50 text-red-700'
                        : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <XCircleIcon className="h-5 w-5 mr-2" />
                    Reject
                  </button>
                </div>
              </div>

              {/* Rejection Reasons */}
              {action === 'reject' && (
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">
                    Rejection Reasons
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {REJECTION_REASONS.map((reason) => (
                      <label
                        key={reason}
                        className="flex items-start p-2 bg-gray-50 rounded hover:bg-gray-100 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedRejectionReasons.includes(reason)}
                          onChange={() => toggleRejectionReason(reason)}
                          className="mt-0.5 h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-xs text-gray-700">{reason}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Admin Notes */}
              <div className="mb-6">
                <label htmlFor="adminNotes" className="block text-sm font-medium text-gray-900 mb-2">
                  Admin Notes {action === 'reject' ? '(Required)' : '(Optional)'}
                </label>
                <textarea
                  id="adminNotes"
                  rows={4}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  className="shadow-sm block w-full focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border border-gray-300 rounded-md"
                  placeholder={
                    action === 'reject'
                      ? 'Provide feedback to the creator about why their tutorial was rejected and how they can improve it...'
                      : 'Add any notes about this tutorial (optional)...'
                  }
                />
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse border-t border-gray-200">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting || !action}
                className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white sm:ml-3 sm:w-auto sm:text-sm ${
                  submitting || !action
                    ? 'bg-gray-300 cursor-not-allowed'
                    : action === 'approve'
                    ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
                    : 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                } focus:outline-none focus:ring-2 focus:ring-offset-2`}
              >
                {submitting ? 'Submitting...' : action === 'approve' ? 'Approve Tutorial' : 'Reject Tutorial'}
              </button>
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
