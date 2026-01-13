import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { toast } from 'react-toastify';
import api from '../lib/api';

export default function TaskDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery(['task', id], async () => {
    const res = await api.get(`/tasks/${id}`);
    return res.data;
  });

  const del = useMutation(async () => {
    await api.delete(`/tasks/${id}`);
  }, { onSuccess: () => qc.invalidateQueries('tasks') });

  if (isLoading) return <div>Loading...</div>;
  const task = data;

  const handleDelete = async () => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await del.mutateAsync();
      toast.success('Task deleted');
      navigate('/tasks');
    } catch (e) {
      toast.error('Delete failed');
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h2 className="text-xl leading-6 font-bold text-gray-900">Task Details</h2>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">ID: {task.id}</p>
        </div>
        <div className="px-4 py-5 sm:p-6 space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-medium text-gray-500">Title</dt>
              <dd className="mt-1 text-sm text-gray-900 font-semibold">{task.title}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Assignee</dt>
              <dd className="mt-1 text-sm text-gray-900">{task.assignee ?? 'Unassigned'}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Priority</dt>
              <dd className="mt-1">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${task.priority === 'High' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                  {task.priority}
                </span>
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Status</dt>
              <dd className="mt-1 text-sm text-gray-900">{task.status}</dd>
            </div>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Description</dt>
            <dd className="mt-1 text-sm text-gray-900 bg-gray-50 p-3 rounded-md border border-gray-100">{task.description}</dd>
          </div>
        </div>
        <div className="px-4 py-4 sm:px-6 bg-gray-50 flex gap-3">
          <button
            onClick={() => navigate(`/tasks/${task.id}/edit`)}
            className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            Edit
          </button>
          <button
            onClick={handleDelete}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
