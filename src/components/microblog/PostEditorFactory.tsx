import React, { useState } from 'react';
import { MicroblogPost } from './PostFactory';

export function PostEditorFactory({
  initial,
  onSave,
  onCancel
}: {
  initial?: Partial<MicroblogPost>;
  onSave: (post: Partial<MicroblogPost>) => void;
  onCancel?: () => void;
}) {
  const [content, setContent] = useState(initial?.content || '');
  const [tags, setTags] = useState(initial?.tags?.join(', ') || '');
  const [isPublic, setIsPublic] = useState(initial?.isPublic ?? true);

  return (
    <form
      className="border rounded p-3 mb-3 bg-gray-50"
      onSubmit={e => {
        e.preventDefault();
        onSave({ ...initial, content, tags: tags.split(',').map(t => t.trim()).filter(Boolean), isPublic });
      }}
    >
      <textarea
        className="w-full border rounded p-2 mb-2"
        rows={3}
        placeholder="What's on your mind?"
        value={content}
        onChange={e => setContent(e.target.value)}
        required
      />
      <input
        className="w-full border rounded p-2 mb-2"
        placeholder="Tags (comma separated)"
        value={tags}
        onChange={e => setTags(e.target.value)}
      />
      <label className="inline-flex items-center mb-2">
        <input type="checkbox" checked={isPublic} onChange={e => setIsPublic(e.target.checked)} />
        <span className="ml-2">Public</span>
      </label>
      <div className="flex gap-2">
        <button type="submit" className="bg-blue-600 text-white px-3 py-1 rounded">Save</button>
        {onCancel && <button type="button" className="bg-gray-300 px-3 py-1 rounded" onClick={onCancel}>Cancel</button>}
      </div>
    </form>
  );
}
