import React from 'react';
import { Construction } from 'lucide-react';

export default function CommentSystem({ comments, onAddComment }) {
  return (
    <div className="text-center py-8 border-t">
        <Construction className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold">Comentarios (En construcción)</h3>
    </div>
  );
}