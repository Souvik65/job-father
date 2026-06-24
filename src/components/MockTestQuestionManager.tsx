'use client';

import { useState, useEffect } from 'react';
import { MOCK_TEST_SUBJECTS } from '@/lib/constants';

interface Question {
  id: number;
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: string;
  explanation: string;
}

export function MockTestQuestionManager() {
  const [subject, setSubject] = useState<string>('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [publishing, setPublishing] = useState<boolean>(false);
  const [success, setSuccess] = useState<string>('');
  
  // For Edit / Add Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<Partial<Question>>({});
  const [isEditing, setIsEditing] = useState(false);

  const handlePublish = async () => {
    if (!subject) return;
    setPublishing(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch('/api/admin/mock-tests/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to publish');
      setSuccess(`Successfully pushed ${data.count} questions to live site!`);
      // Clear out the subject selector and list
      setSubject('');
      setQuestions([]);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setPublishing(false);
    }
  };

  const fetchQuestions = async (selectedSubject: string) => {
    if (!selectedSubject) {
      setQuestions([]);
      return;
    }
    
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/admin/mock-tests?subject=${selectedSubject}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch');
      setQuestions(data.questions || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Avoid synchronous setState by putting it in an async IIFE or setTimeout,
    // though for data fetching this is standard. We just wrap it.
    let isMounted = true;
    const load = async () => {
      if (!subject) {
        setQuestions([]);
        return;
      }
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`/api/admin/mock-tests?subject=${subject}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to fetch');
        if (isMounted) setQuestions(data.questions || []);
      } catch (err: unknown) {
        if (isMounted) setError(err instanceof Error ? err.message : String(err));
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    load();
    return () => { isMounted = false; };
  }, [subject]);

  const handleSubjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSubject(e.target.value);
  };

  const handleSave = async () => {
    if (!subject) return;

    setLoading(true);
    setError('');
    try {
      const method = isEditing ? 'PUT' : 'POST';
      const res = await fetch('/api/admin/mock-tests', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...currentQuestion, subject }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save');
      
      setIsModalOpen(false);
      // Wait for the modal to close before re-fetching
      setTimeout(() => fetchQuestions(subject), 0);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this question?')) return;
    
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/admin/mock-tests?subject=${subject}&id=${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete');
      
      setTimeout(() => fetchQuestions(subject), 0);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setCurrentQuestion({
      question: '', optionA: '', optionB: '', optionC: '', optionD: '', correctAnswer: '', explanation: ''
    });
    setIsEditing(false);
    setIsModalOpen(true);
  };

  const openEditModal = (q: Question) => {
    setCurrentQuestion(q);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div className="w-full md:w-1/3">
          <label className="block text-sm font-medium text-gray-700 mb-1">Select Subject</label>
          <select 
            className="w-full border border-gray-300 rounded-md shadow-sm p-2"
            value={subject}
            onChange={handleSubjectChange}
          >
            <option value="" disabled>Select a subject</option>
            {MOCK_TEST_SUBJECTS.map((cat) => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>
        </div>
        
        <div className="flex gap-2.5">
          <button 
            onClick={handlePublish}
            disabled={!subject || loading || publishing}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md disabled:bg-gray-400 font-semibold transition-colors disabled:cursor-not-allowed"
          >
            {publishing ? 'Pushing...' : 'Push to Live Site'}
          </button>
          <button 
            onClick={openAddModal}
            disabled={!subject || loading}
            className="bg-[#000666] text-white px-4 py-2 rounded-md disabled:bg-gray-400 font-semibold"
          >
            Add Question
          </button>
        </div>
      </div>

      {success && <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-md mb-4">{success}</div>}
      {error && <div className="text-red-600 mb-4">{error}</div>}

      {loading ? (
        <div className="text-center py-10">Loading...</div>
      ) : questions.length === 0 && subject ? (
        <div className="text-center py-10 text-gray-500">No questions found for this subject. Add some!</div>
      ) : questions.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Question</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Answer</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {questions.map((q) => (
                <tr key={q.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{q.id}</td>
                  <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">{q.question}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{q.correctAnswer}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onClick={() => openEditModal(q)} className="text-[#343d96] hover:text-[#000666] mr-4">Edit</button>
                    <button onClick={() => handleDelete(q.id)} className="text-red-600 hover:text-red-900">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-10 text-gray-500">Please select a subject to manage questions.</div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black bg-opacity-50 px-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 my-8 overflow-y-auto max-h-[90vh]">
            <h2 className="text-xl font-bold mb-4">{isEditing ? 'Edit' : 'Add'} Question</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Question</label>
                <textarea 
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                  rows={3}
                  value={currentQuestion.question || ''}
                  onChange={(e) => setCurrentQuestion({...currentQuestion, question: e.target.value})}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Option A</label>
                  <input type="text" className="mt-1 block w-full border border-gray-300 rounded-md p-2" 
                    value={currentQuestion.optionA || ''} onChange={(e) => setCurrentQuestion({...currentQuestion, optionA: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Option B</label>
                  <input type="text" className="mt-1 block w-full border border-gray-300 rounded-md p-2" 
                    value={currentQuestion.optionB || ''} onChange={(e) => setCurrentQuestion({...currentQuestion, optionB: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Option C</label>
                  <input type="text" className="mt-1 block w-full border border-gray-300 rounded-md p-2" 
                    value={currentQuestion.optionC || ''} onChange={(e) => setCurrentQuestion({...currentQuestion, optionC: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Option D</label>
                  <input type="text" className="mt-1 block w-full border border-gray-300 rounded-md p-2" 
                    value={currentQuestion.optionD || ''} onChange={(e) => setCurrentQuestion({...currentQuestion, optionD: e.target.value})} />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Correct Answer (e.g. A, B, C, D)</label>
                <input type="text" className="mt-1 block w-full border border-gray-300 rounded-md p-2" 
                  value={currentQuestion.correctAnswer || ''} onChange={(e) => setCurrentQuestion({...currentQuestion, correctAnswer: e.target.value})} />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Explanation (Optional)</label>
                <textarea 
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                  rows={2}
                  value={currentQuestion.explanation || ''}
                  onChange={(e) => setCurrentQuestion({...currentQuestion, explanation: e.target.value})}
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md font-medium"
              >
                Cancel
              </button>
              <button 
                onClick={handleSave}
                disabled={loading}
                className="px-4 py-2 bg-[#000666] text-white rounded-md font-medium disabled:bg-gray-400"
              >
                {loading ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
