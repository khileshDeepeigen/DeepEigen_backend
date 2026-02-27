import React from 'react';

interface AnnouncementsProps {
  courseId?: number;
  courseUrl?: string;
  sectionUrl?: string;
  sectionId?: number;
}

const Announcements: React.FC<AnnouncementsProps> = () => {
  return (
    <div>Announcements</div>
  )
}

export default Announcements