import './styles/team.css';

export default function index() {
  const coreTeam = [
    {
      name: 'Sanjeev Sharma',
      role: 'Founder, CEO',
      image: 'https://api.builder.io/api/v1/image/assets/TEMP/747d174cbca2753978e766efb69d4001311566ac?width=648'
    },
    {
      name: 'Priyanka Chaturvedi',
      role: 'Investor Relation & Future Strategies\nPart-Time',
      image: 'https://api.builder.io/api/v1/image/assets/TEMP/a4277d9d99558d6a0651e45f0eedf44260684cbb?width=682'
    },
  ];

  const coreTeamAndTA = [
    {
      name: 'Shani Dev',
      role: 'Teaching Assistant',
      jobrole: 'Full Time Engineer',
      image: 'https://api.builder.io/api/v1/image/assets/TEMP/925626afec80ddc9d74bc411260ae2bc842d86ef?width=648'
    },
    {
      name: 'Harimohan Jha',
      role: 'Teaching Assistant',
      jobrole: 'Full Time Engineer',
      image: 'https://api.builder.io/api/v1/image/assets/TEMP/f630a2597f6ba1eb2fd48060c96f800841c3de76?width=693'
    },
    {
      name: 'P Vinohith Reddy',
      role: 'Teaching Assistant',
      jobrole: 'Full Time Engineer',
      image: 'https://api.builder.io/api/v1/image/assets/TEMP/6b1c46c2a59cca9a62704e45ef6b23ab9b2f8efb?width=972'
    }
  ]

  const advisoryBoard = [
    {
      name: 'Matthew Taylor',
      role: 'Faculty, Computing Science Department University of Alberta, Canada',
      image: 'https://api.builder.io/api/v1/image/assets/TEMP/8bd168be85a6b74a4cdb543eab22ec4749a66608?width=666'
    },
    {
      name: 'Zvi Shiller',
      role: 'Chair, Israel Robotics Association Faculty, Mech. Eng. & Mechatronics Dept. Ariel University, Israel',
      image: 'https://api.builder.io/api/v1/image/assets/TEMP/f265cdf147d26f731fb75eaf9115ec759eef4835?width=648'
    },
    {
      name: 'Jan Kuenne',
      role: 'Senior Consultant, Enterprise Development Group, Inc. Nuremberg, Bavaria, Germany',
      image: 'https://api.builder.io/api/v1/image/assets/TEMP/2418bbb8b459429fa402c544cb64a7de8c2374c9?width=680'
    }
  ];

  return (
    <div className="team-page-wrapper">
      <div className="team-container">
        <section className="team-section">
          <div className="section-header">
            <h1 className="section-title">Core Team Members</h1>
            <p className="section-subtitle">
              Meet the incredible people who are making a difference at our organization.
            </p>
          </div>

          <div className="team-grid">
            {coreTeam.map((member, index) => (
              <div key={index} className="team-card">
                <div className="team-image-wrapper">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="team-image"
                  />
                </div>
                <div className="team-info">
                  <h3 className="team-name">{member.name}</h3>
                  <p className="team-role">{member.role}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="team-section">
          <div className="team-grid">
            {coreTeamAndTA.map((member, index) => (
              <div key={index} className="team-card">
                <div className="team-image-wrapper">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="team-image"
                  />
                </div>
                <div className="team-info">
                  <h3 className="team-name">{member.name}</h3>
                  <p className="team-role">{member.role}</p>
                  <p className='team-role'>{member.jobrole}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="team-section">
          <div className="section-header">
            <h1 className="section-title">Academic Advisory Board</h1>
            <p className="section-subtitle">
              Experts guiding the strategic and academic direction of our organization.
            </p>
          </div>

          <div className="team-grid">
            {advisoryBoard.map((member, index) => (
              <div key={index} className="team-card">
                <div className="team-image-wrapper">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="team-image"
                  />
                </div>
                <div className="team-info">
                  <h3 className="team-name">{member.name}</h3>
                  <p className="team-role">{member.role}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
