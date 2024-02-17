searchTweets()
function writeToSheet(tweets, users) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  if (!tweets) {
    return
  }
  tweets.forEach(function(tweet) {
    var user = users.find(u => u.id === tweet.author_id);
    var userId = user ? user.id : 'Unknown';
    var username = user ? user.name : 'Unknown';
    var screenName = user ? '@' + user.username : 'Unknown';
    var followersCount = user ? user.public_metrics.followers_count : 'Unknown';
    var followingCount = user ? user.public_metrics.following_count : 'Unknown';
    var likeCount = tweet.public_metrics ? tweet.public_metrics.like_count : 'Unknown';

    var row = [
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

function fetchTweets(hashtag, bearerToken, nextToken) {
  var twitterEndpoint = 'https://api.twitter.com/2/tweets/search/recent';
  var params = {
    query: encodeURIComponent(hashtag),
    'tweet.fields': 'author_id,created_at,public_metrics',
    'expansions': 'author_id',
    'user.fields': 'id,name,username,public_metrics',
    max_results: 20
    
  };

  if (nextToken) {
    params['next_token'] = nextToken;
  }

  var options = {
    method: 'get',
    headers: {
      'Authorization': 'Bearer ' + bearerToken,
      'Content-Type': 'application/json'
    },
    muteHttpExceptions: true
  };

  var queryString = Object.keys(params).map(function(key) {
    return key + '=' + params[key];
  }).join('&');

  var response = UrlFetchApp.fetch(twitterEndpoint + '?' + queryString, options);
  var responseCode = response.getResponseCode();
  var responseBody = response.getContentText();

  if (responseCode === 200) {
    return JSON.parse(responseBody);
  } else {
    Logger.log('Error: ' + responseCode + '\n' + responseBody);
    return null;
  }
}



function searchTweets() {
  var hashtag = '#your hashtag here';
  var bearerToken = 'your bearer token here';
  var nextToken = null;
  do {
    var json = fetchTweets(hashtag, bearerToken, nextToken);
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
