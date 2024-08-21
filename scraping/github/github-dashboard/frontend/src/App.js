import React, { useState } from 'react';

function App() {
    const [username, setUsername] = useState('');  // Default is an empty string
    const [profile, setProfile] = useState(null);

    const fetchProfile = () => {
        if (username) {
            fetch(`/profile/${username}`)
                .then(response => response.json())
                .then(data => setProfile(data));
        }
    };

    const handleUsernameChange = (e) => {
        setUsername(e.target.value);
    };

    return (
        <div className="App">
            <input
                type="text"
                value={username}
                onChange={handleUsernameChange}
                placeholder="Enter GitHub username"
            />
            <button onClick={fetchProfile}>Fetch Profile</button>

            {profile && (
                <div>
                    <img src={profile.avatar_url} alt="Avatar" />
                    <h1>{profile.bio}</h1>
                    <h2>Pinned Repositories:</h2>
                    <ul>
                        {profile.pinned_repos.map(repo => (
                            <li key={repo.name}>
                                <a href={repo.url} target="_blank" rel="noopener noreferrer">{repo.name}</a>
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
