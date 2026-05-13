import MediaUserSection from './MediaUserSection';
import useMediaUsers from '../hooks/useMediaUsers';

function MediaYearSection({ year, items, renderMediaCard }) {
  const userGroups = useMediaUsers(items);

  return (
    <section id={`year-${year}`} className="memory-year-section">
      <div className="year-heading">
        <h2>{year}</h2>
        <span>{items.length} 张</span>
      </div>

      <div className="media-year-user-sections">
        {userGroups.map((group) => (
          <MediaUserSection
            key={group.userKey}
            group={group}
            renderMediaCard={renderMediaCard}
          />
        ))}
      </div>
    </section>
  );
}

export default MediaYearSection;
