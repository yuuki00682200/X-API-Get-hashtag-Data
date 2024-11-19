searchPosts()
function writeToSheet(posts, users) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  if (!posts) {
    return
  }
  posts.forEach(function(post) {
    const user = users.find(u => u.id === post.author_id);
    const userId = user ? user.id : 'Unknown';
    const username = user ? user.name : 'Unknown';
    const screenName = user ? '@' + user.username : 'Unknown';
    const followersCount = user ? user.public_metrics.followers_count : 'Unknown';
    const followingCount = user ? user.public_metrics.following_count : 'Unknown';
    const likeCount = post.public_metrics ? post.public_metrics.like_count : 'Unknown';

    const row = [
      userId,
      screenName,
      username,
      followersCount,
      followingCount,
      likeCount
    ];
    sheet.appendRow(row);
  });
}

function fetchPosts(hashtag, bearerToken, nextToken) {
  const twitterEndpoint = 'https://api.twitter.com/2/posts/search/recent';
  const params = {
    query: encodeURIComponent(hashtag),
    'post.fields': 'author_id,created_at,public_metrics',
    'expansions': 'author_id',
    'user.fields': 'id,name,username,public_metrics',
    max_results: 20
    
  };

  if (nextToken) {
    params['next_token'] = nextToken;
  }

  const options = {
    method: 'get',
    headers: {
      'Authorization': 'Bearer ' + bearerToken,
      'Content-Type': 'application/json'
    },
    muteHttpExceptions: true
  };

  const queryString = Object.keys(params).map(function(key) {
    return key + '=' + params[key];
  }).join('&');

  const response = UrlFetchApp.fetch(twitterEndpoint + '?' + queryString, options);
  const responseCode = response.getResponseCode();
  const responseBody = response.getContentText();

  if (responseCode === 200) {
    return JSON.parse(responseBody);
  } else {
    Logger.log('Error: ' + responseCode + '\n' + responseBody);
    return null;
  }
}



function searchPosts() {
  const hashtag = '#your hashtag here';
  const bearerToken = 'your bearer token here';
  let nextToken = null;
  do {
    const json = fetchPosts(hashtag, bearerToken, nextToken);
    if (json) {
      writeToSheet(json.data, json.includes.users);
      // Logger.log(json);
      nextToken = json.meta && json.meta.next_token ? json.meta.next_token : null;
      console.log(json.data.length)
      console.log(nextToken)
    } else {
      break;
    }
  } while (nextToken);
}
