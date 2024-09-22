$(function () {
  var LEADERBOARD_SIZE = 5;
  var rootRef = new Firebase("https://INSTANCE.firebaseio.com/leaderboard");
  var scoreListRef = rootRef.child("scoreList");
  var highestScoreRef = rootRef.child("highestScore");

  var htmlForPath = {};

  function handleScoreAdd(scoreSnapshot, prevScoreName) {
    var newScoreRow = $("<tr/>");
    newScoreRow.append($("<td/>").text(scoreSnapshot.val().name));
    newScoreRow.append($("<td/>").text(scoreSnapshot.val().score));
    htmlForPath[scoreSnapshot.key()] = newScoreRow;
    if (prevScoreName === null) {
      $("#leaderboardTable").append(newScoreRow);
    } else {
      var lowerScoreRow = htmlForPath[prevScoreName];
      lowerScoreRow.before(newScoreRow);
    }
  }
  function handleScoreRemoved(scoreSnapshot) {
    var removedScoreRow = htmlForPath[scoreSnapshot.key()];
    removedScoreRow.remove();
    delete htmlForPath[scoreSnapshot.key()];
  }

  var scoreListView = scoreListRef.limitToLast(LEADERBOARD_SIZE);
  scoreListView.on("child_added", function (newScoreSnapshot, prevScoreName) {
    handleScoreAdd(newScoreSnapshot, prevScoreName);
  });

  scoreListView.on("child_removed", function (oldScoreSnapshot) {
    handleScoreRemoved(oldScoreSnapshot);
  });

  var changedCallback = function (scoreSnapshot, prevScoreName) {
    handleScoreRemoved(scoreSnapshot);
    handleScoreAdd(scoreSnapshot, prevScoreName);
  };
  scoreListView.on("child_moved", changedCallback);
  scoreListView.on("child_changed", changedCallback);

  $("#scoreInput").keypress(function (e) {
    if (e.keyCode == 13) {
      var newScore = Number($("#scoreInput").val());
      var name = $("#nameInput").val();
      $("#scoreInput").val("");

      if (name.length === 0) {
        return;
      }
      var useScoreRef = scoreListRef.child(name);
      userScore.setWithPriority({ name: name, score: newScore }, newScore);

      highestScoreRef.transaction(function (currentHighestScore) {
        if (currentHighestScore === null || newScore > currentHighestScore) {
          return newScore;
        }
        return;
      });
    }
  });

  highestScoreRef.on("value", function (newHighestScore) {
    $("#highestScoreDiv").text(newHighestScore.val());
  });
});
