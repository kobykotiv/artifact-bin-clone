import React, { useState } from 'react';

export function CommentThread({ artifactId, versionId }: { artifactId: string, versionId?: string }) {
  const [comments, setComments] = useState<{ user: string, text: string, date: string }[]>([]);
  const [input, setInput] = useState('');
  return (
    <div className="comment-thread">
      <h4>Comments</h4>
      <div className="comments-list">
        {comments.map((c, i) => (
          <div key={i} className="comment">
            <b>{c.user}</b> <span>{c.date}</span>
            <div>{c.text}</div>
          </div>
        ))}
      </div>
      <textarea value={input} onChange={e => setInput(e.target.value)} placeholder="Add a comment..." />
      <button onClick={() => {
        setComments([...comments, { user: 'You', text: input, date: new Date().toLocaleString() }]);
        setInput('');
      }} disabled={!input.trim()}>Post</button>
    </div>
  );
}
