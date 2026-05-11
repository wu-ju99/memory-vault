import { useRef, useState } from 'react';

function MediaUploader({
  uploading,
  uploadMessage,
  uploadError,
  onUpload,
}) {
  const [description, setDescription] = useState('');
  const [eventTime, setEventTime] = useState('');
  const fileInputRef = useRef(null);

  async function handleUpload(e) {
    const files = e.target.files;
    const result = await onUpload(files, { description, eventTime });
    if (result) {
      setDescription('');
      setEventTime('');
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  return (
    <div className="upload-section upload-note">
      <textarea
        className="upload-desc"
        placeholder="写点这张照片背后的回忆..."
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={3}
      />
      <input
        className="upload-event"
        type="datetime-local"
        value={eventTime}
        onChange={(e) => setEventTime(e.target.value)}
      />
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp,video/mp4,video/mov,video/webm"
        onChange={handleUpload}
        id="file-upload-detail"
        className="file-input"
      />
      <label htmlFor="file-upload-detail" className={`upload-btn ${uploading ? 'disabled' : ''}`}>
        {uploading ? '上传中...' : '贴一张新照片 / 视频'}
      </label>
      {uploadMessage && <p className="status-text success">{uploadMessage}</p>}
      {uploadError && <p className="status-text error">{uploadError}</p>}
    </div>
  );
}

export default MediaUploader;
