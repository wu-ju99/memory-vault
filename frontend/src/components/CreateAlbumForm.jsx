import { useMemo, useState } from 'react';

function buildYearOptions() {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let year = currentYear + 1; year >= 1900; year -= 1) {
    years.push(year);
  }
  return years;
}

function CreateAlbumForm({ onCreate }) {
  const [title, setTitle] = useState('');
  const [albumYear, setAlbumYear] = useState(new Date().getFullYear().toString());
  const yearOptions = useMemo(buildYearOptions, []);

  async function handleCreate() {
    const album = await onCreate(title, Number(albumYear));
    if (album) {
      setTitle('');
    }
  }

  return (
    <div className="create-album create-album-note">
      <input
        className="album-input-lg"
        placeholder="新建一本相册..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
      />
      <select
        className="album-year-select"
        value={albumYear}
        onChange={(e) => setAlbumYear(e.target.value)}
        aria-label="相册年份"
      >
        {yearOptions.map((year) => (
          <option key={year} value={year}>{year}</option>
        ))}
      </select>
      <button className="upload-btn" onClick={handleCreate}>创建</button>
    </div>
  );
}

export default CreateAlbumForm;
