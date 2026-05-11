import { useState } from 'react';

export default function useMediaEditor(saveDescription) {
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const [saving, setSaving] = useState(false);

  function startEdit(item) {
    setEditingId(item.id);
    setEditText(item.description || '');
  }

  function cancelEdit() {
    setEditingId(null);
    setEditText('');
  }

  async function saveEdit(mediaId) {
    setSaving(true);
    try {
      await saveDescription(mediaId, editText);
      setEditingId(null);
    } catch {} finally {
      setSaving(false);
    }
  }

  return {
    editingId,
    editText,
    saving,
    startEdit,
    setEditText,
    saveEdit,
    cancelEdit,
  };
}
