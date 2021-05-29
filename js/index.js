const init = () => {

    //declaring variables, selecting elements
    const searchForm = document.querySelector('#github-form');
    const userList = document.querySelector('#user-list');
    const searchInput = document.querySelector('#search')
    const submitBtn = document.querySelector("#github-form > input[type=submit]:nth-child(2)")
    const resultsContainer = document.querySelector('#github-container')

    //creating a header to display summary of results
    const summaryDiv = document.createElement('div');
    summaryDiv.id = 'summary-div'
    const summary = document.createElement('h3');
    summaryDiv.appendChild(summary);
    resultsContainer.insertBefore(summaryDiv, userList);
    summaryDiv.appendChild(userList)

    //create radio button for toggling search by user or search by repo
    const searchByRepo = document.createElement('input');
    const labelByRepo = document.createElement('label');
    searchByRepo.setAttribute('type', 'radio');
    searchByRepo.setAttribute('value', 'repo');
    searchByRepo.setAttribute('name', 'searchBy');
    labelByRepo.setAttribute('for', 'repo');
    labelByRepo.innerText = 'Repos';
    searchForm.insertBefore(labelByRepo, submitBtn);
    searchForm.insertBefore(searchByRepo, labelByRepo);

    const searchByUser = document.createElement('input');
    const labelByUser = document.createElement('label');
    searchByUser.setAttribute('type', 'radio');
    searchByUser.setAttribute('value', 'user');
    searchByUser.setAttribute('name', 'searchBy');
    labelByUser.setAttribute('for', 'user');
    labelByUser.innerText = 'Users';
    searchForm.insertBefore(labelByUser, submitBtn);
    searchForm.insertBefore(searchByUser, labelByUser);

    const radioSpan = document.createElement('span')
    radioSpan.innerText = 'Search by:'
    searchForm.insertBefore(radioSpan, searchByRepo);
    

    //add event listener to form submit
    searchForm.addEventListener('submit', formSubmitHandler);

    //prevents default submit to prevent refresh, sends submit text input to the proper function dependant on selected keyword search preference
    function formSubmitHandler(e){
        e.preventDefault();
        while (userList.firstChild) {
         userList.removeChild(userList.lastChild);
        }
        
        let searchBy = document.querySelector('input[name="searchBy"]:checked').value;

        if(searchBy === 'repo'){
            repoKeywordSearch(searchInput.value)
        }else if(searchBy === 'user'){
            userKeywordSearch(searchInput.value)
        }else if(null){
            alert('Please select a search type.')
        }
    }

    //config object required for github requests
    const configObj = {
        method: "GET",
        headers: {"Accept": "application/vnd.github.v3+json"}
    }

    //searches by repo keyword
    function repoKeywordSearch(keyword){
        fetch(`https://api.github.com/search/repositories?q=${keyword}&sort=stars`, configObj)
        .then(res=>res.json())
        .then(data => manageFetchData(data))
    }

    //searches by user keyword
    function userKeywordSearch(keyword){
        fetch(`https://api.github.com/search/users?q=${keyword}`, configObj)
        .then(res=>res.json())
        .then(data => manageFetchData(data))
    }

    //populates results from fetches on page
    function manageFetchData(data){
        const searchBy = document.querySelector('input[name="searchBy"]:checked').value;
        summary.innerText = `Displaying ${data.items.length} results for ${searchBy}s matching '${searchInput.value}'`;
        searchInput.value = '';

        if(data.items[0].hasOwnProperty('login')){
            console.log(data)
            populateUsers(data)
        }else{
            populateRepos(data)
        }
    }

    //populates user data
    function populateUsers(data){

        for(let i=0;i<data.items.length ; i++){
            const userResults = data["items"][i]
            const newUserDiv = document.createElement('div');
            newUserDiv.id = userResults["id"];
            newUserDiv.style.borderStyle = "solid";
            newUserDiv.style.borderColor = "#ff7777"
            userList.appendChild(newUserDiv);

            const newUserImg = document.createElement('img');
            newUserImg.src = userResults["avatar_url"];
            newUserImg.style.maxWidth = "15vh";
            newUserDiv.appendChild(newUserImg);

            const newUserName = document.createElement('h4');
            newUserName.innerText = userResults['login'];
            newUserDiv.appendChild(newUserName);

            const newUserRepos = document.createElement('div');
            const userRepoBtn = document.createElement('button');
            const repoList = document.createElement('ul');
            repoList.classList.add = 'hidden'
            newUserRepos.id = `${userResults['id']}repos`
            userRepoBtn.type = 'button';
            userRepoBtn.classList = 'button';
            userRepoBtn.innerText = `Show ${newUserName.innerText}'s repos`;
            userRepoBtn.addEventListener('click', userRepoClickHandler = () => getUserRepos(userResults['repos_url']));
            newUserRepos.appendChild(repoList);
            newUserDiv.appendChild(userRepoBtn);
            newUserDiv.appendChild(newUserRepos);
            
            const profileBtn = document.createElement('button');
            profileBtn.type = 'button';
            profileBtn.name = 'profilebutton';
            profileBtn.classList = 'button';
            profileBtn.innerText = `Visit ${newUserName.innerText}'s profile`;
            profileBtn.addEventListener('click', profileButtonHandler = () => window.open(userResults['html_url']));
            newUserDiv.appendChild(profileBtn);
            newUserDiv.style.textAlign = "center";
        }
    }

    //fetching user repos
    function getUserRepos(url){
        fetch(url, configObj)
        .then(res=>res.json())
        .then(data=>listUserRepos(data))
    }

    //listing user repos
    function listUserRepos(data){
        console.log(data);
        for(let i=0;i<data.length ; i++){
            let repoResults = data[i];
            let mainRepoDiv = document.getElementById(`${data[i]['owner']['id']}repos`)
            let newRepoDiv = document.createElement('div')
            mainRepoDiv.appendChild(newRepoDiv)
            newRepoDiv.style.borderColor = "#ffff"
            newRepoDiv.style.backgroundColor = "#ff7777"

            const newRepoName = document.createElement('h3');
            newRepoName.innerText = repoResults['name'];
            newRepoDiv.appendChild(newRepoName);

            const newRepoDescription = document.createElement('div');
            newRepoDescription.innerText = repoResults['description'];
            newRepoDiv.appendChild(newRepoDescription);

            const repoLink = document.createElement('a');
            repoLink.href = repoResults["html_url"];
            repoLink.innerText = `View ${newRepoName.innerText} on GitHub`
            newRepoDiv.appendChild(repoLink);
        }
    }
    

  
    //populates repo data
    function populateRepos(data){
        for(let i=0;i<data.items.length ; i++){
            const repoResults = data["items"][i]
            const repoOwner = repoResults["owner"]
            const newRepoDiv = document.createElement('div');
            newRepoDiv.id = repoResults["id"];
            newRepoDiv.style.borderStyle = "solid";
            userList.appendChild(newRepoDiv);
          
            const newRepoName = document.createElement('h3');
            newRepoName.innerText = repoResults['name'];
            newRepoDiv.appendChild(newRepoName);

            const newRepoOwner = document.createElement('h5');
            newRepoOwner.innerHTML = `by: <a href=${repoOwner['url']}>${repoOwner['login']}`;
            newRepoDiv.appendChild(newRepoOwner)

            const newRepoDescription = document.createElement('div');
            newRepoDescription.innerText = repoResults['description'];
            newRepoDiv.appendChild(newRepoDescription);

            const br = document.createElement('br');
            newRepoDiv.appendChild(br);

            const repoLink = document.createElement('a');
            repoLink.href = repoResults["url"];
            repoLink.innerText = `View ${newRepoName.innerText} on GitHub`
            newRepoDiv.appendChild(repoLink);

            newRepoDiv.style.textAlign = "left";
        }
    }

}




document.addEventListener('DOMContentLoaded', init);