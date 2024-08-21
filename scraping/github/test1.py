import requests
from bs4 import BeautifulSoup

def scrape_github_profile(username):
    url = f"https://github.com/{username}"
    response = requests.get(url)
    soup = BeautifulSoup(response.text, 'html.parser')
    
    bio = soup.find('div', class_='p-note user-profile-bio mb-3 js-user-profile-bio f4').text.strip() if soup.find('div', class_='p-note user-profile-bio mb-3 js-user-profile-bio f4') else "No bio available"
    
    pinned_repos = []
    for pinned in soup.find_all('span', class_='repo'):
        pinned_repos.append(pinned.text.strip())
    
    avatar_url = soup.find('img', class_='avatar-user')['src'] if soup.find('img', class_='avatar-user') else "No avatar available"
    
    profile_info = {
        "bio": bio,
        "pinned_repos": pinned_repos,
        "avatar_url": avatar_url
    }
    
    return profile_info

username = "octocat"
profile_data = scrape_github_profile(username)
print(profile_data)
