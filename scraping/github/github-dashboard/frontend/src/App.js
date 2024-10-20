import React, { useState } from 'react';
import axios from 'axios';

function App() {
  const [srn, setSrn] = useState('');
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    setSrn(e.target.value);
  };

  const handleSearch = async () => {
    try {
      const response = await axios.get(`http://localhost:8080/profile/${srn}`);
      setProfile(response.data);
      setError('');
    } catch (err) {
      setProfile(null);
      setError('Profile not found');
    }
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>GitHub Profile Lookup</h1>
      <input
        type="text"
        value={srn}
        onChange={handleInputChange}
        placeholder="Enter SRN"
        style={{ padding: '10px', fontSize: '16px' }}
      />
      <button onClick={handleSearch} style={{ marginLeft: '10px', padding: '10px 20px', fontSize: '16px' }}>
        Search
      </button>

      {error && <p style={{ color: 'red', marginTop: '20px' }}>{error}</p>}

      {profile && (
        <div style={{ marginTop: '20px', textAlign: 'left', display: 'inline-block' }}>
          <h2>{profile.bio}</h2>
          <img src={profile.avatar_url} alt="Avatar" style={{ width: '150px', borderRadius: '50%' }} />
          <h3>Pinned Repositories</h3>
          <ul>
            {profile.pinned_repos.map((repo, index) => (
              <li key={index}>
                <a href={repo.url} target="_blank" rel="noopener noreferrer">
                  {repo.name}
                </a>
                <p>{repo.description}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;
