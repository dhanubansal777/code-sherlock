const form = document.getElementById('searchForm');
const profileDiv = document.getElementById('profile');
const reposDiv = document.getElementById('repos');
const loadMoreBtn = document.getElementById('loadMore');

let currentUsername = '';
let currentPage = 1;
const perPage = 10;

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  currentUsername = document.getElementById('username').value.trim();
  if (!currentUsername) return;
  currentPage = 1;
  profileDiv.innerHTML = 'Loading...';
  reposDiv.innerHTML = '';
  loadMoreBtn.style.display = 'none';
  await fetchAndDisplayProfile(currentUsername);
  await fetchAndDisplayRepos(currentUsername, currentPage);
});

loadMoreBtn.addEventListener('click', async () => {
  currentPage++;
  await fetchAndDisplayRepos(currentUsername, currentPage, true);
});

async function fetchAndDisplayProfile(username) {
  try {
    const userRes = await fetch(`https://api.github.com/users/${username}`);
    if (!userRes.ok) throw new Error('User not found');
    const user = await userRes.json();

    profileDiv.innerHTML = `
      <img src="${user.avatar_url}" alt="${user.login}">
      <h2>${user.name || user.login}</h2>
      <p>Followers: ${user.followers} | Following: ${user.following}</p>
      <p><a href="${user.html_url}" target="_blank">View on GitHub</a></p>
    `;
  } catch (err) {
    profileDiv.innerHTML = `<p style="color:red;">${err.message}</p>`;
  }
}

async function fetchAndDisplayRepos(username, page, append = false) {
  try {
    reposDiv.innerHTML = append ? reposDiv.innerHTML : '<h3>Repositories</h3>';
    const repoRes = await fetch(`https://api.github.com/users/${username}/repos?per_page=${perPage}&page=${page}&sort=updated`);
    if (!repoRes.ok) throw new Error('Could not fetch repositories');
    const repos = await repoRes.json();

    if (repos.length === 0 && page === 1) {
      reposDiv.innerHTML += '<p>No repositories found.</p>';
      loadMoreBtn.style.display = 'none';
      return;
    }

    repos.forEach(repo => {
      const repoCard = document.createElement('div');
      repoCard.className = 'repo-card';
      repoCard.innerHTML = `
        <a href="${repo.html_url}" target="_blank">${repo.name}</a>
        <p>${repo.description || ''}</p>
        <span>★ ${repo.stargazers_count}</span>
      `;
      reposDiv.appendChild(repoCard);
    });

    // Show or hide the Load More button
    loadMoreBtn.style.display = repos.length === perPage ? 'block' : 'none';
  } catch (err) {
    reposDiv.innerHTML += `<p style="color:red;">${err.message}</p>`;
    loadMoreBtn.style.display = 'none';
  }
}
