---
---

$(document).ready(function(){
  // parallax effect
  $.stellar({
    horizontalScrolling: false,
    verticalOffset: 40
  });

  // code example carousel
  $('.carousel').carousel();
  $(document).keyup(function(event) {
    switch (event.keyCode) {
      case 37: // lef t
        $('.carousel').carousel('prev');
        break;
      case 39: // right
        $('.carousel').carousel('next');
        break;
      default:
        break;
    }
  });

  // tweets
  $(function(){
    $("#tweets").liveTwitter('scala_lang');
  });

});


/******************************
 * Events and trainings feeds *
 ******************************/

$(document).ready(function(){
  var $eventsAndTrainingDiv = $('#eventsAndTraining');

  var MAX_EVENTS = 5;
  var MAX_TRAININGS = 5;

  // Stop early if the element does not exist
  if ($eventsAndTrainingDiv.length == 0)
    return;

  function compareFormattedDates(lhs, rhs) {
    var lhsDate = new Date(lhs);
    var rhsDate = new Date(rhs);
    if (lhsDate < rhsDate)
      return -1;
    else if (lhsDate > rhsDate)
      return 1;
    else
      return 0;
  }

  // EVENTS

  function compareEventsByDate(lhs, rhs) {
    return compareFormattedDates(lhs.start, rhs.start);
  }

  var scalaLangEvents = [
  {% for event in site.categories.events %}
  {% if event.date >= site.time %}{% comment %} No point in including outdated events {% endcomment %}
    {
      "title": "{{ event.title }}",
      "logo": "{{ event.logo }}",
      "location": "{{ event.location }}",
      "start": "{{ event.start }}",
      "end": "{{ event.end }}",
      "url": "{{ event.link-out }}",
    },
  {% endif %}
  {% endfor%}
  ];

  function doPopulateEventsPane(allEvents) {
    allEvents = allEvents.filter(function (event) {
      return (event.end ? new Date(event.end) : new Date(event.start)) >= new Date();
    });
    allEvents.sort(compareEventsByDate);
    var content = "";
    for (i = 0; i < allEvents.length && i < MAX_EVENTS; i++) {
      var event = allEvents[i];
      var thisContent =
        '<div class="event-item">' +
          '<div class="event-title"><a href="'+event.url+'">'+event.title+'</a></div>' +
          '<div class="event-logo"><img class="event-logo" src="'+event.logo+'" alt="Logo" /></div>' +
          '<div class="event-location">'+event.location+'</div>' +
          '<div class="event-date"><img src="{{ site.baseurl }}/resources/img/icon-date.png" /> '+
            event.start + (event.end ? ' to '+event.end : '') + '</div>' +
        '</div>';
      $("#eventspane").append(thisContent);
    }
  };

  function onEventsAjaxSuccess(response, textStatus, jqXHR) {
    var allEvents = scalaLangEvents.concat(response);
    doPopulateEventsPane(allEvents);
  }

  function onEventsAjaxError(jqXHR, textStatus, errorThrown) {
    // log the error to the console
    console.error(
      "Could not load Typesafe event feed: " + textStatus, errorThrown);
    // but at least display events from scala-lang
    doPopulateEventsPane(scalaLangEvents);
  }

  $.ajax({
    url: "{{ site.baseurl }}/cgi-bin/typesafe-feed-events",
    type: "GET",
    dataType: "json",
    success: onEventsAjaxSuccess,
    error: onEventsAjaxError
  });

  // TRAININGS

  function compareTrainingsByDate(lhs, rhs) {
    return compareFormattedDates(lhs.when, rhs.when);
  }

  var scalaLangTrainings = [
  {% for training in site.categories.training %}
  {% if training.date >= site.time %}{% comment %} No point in including outdated training sessions {% endcomment %}
    {
      title: "{{ training.title }}",
      description: "{{ training.description }}",
      url: "{{ training.link-out }}",
      sessions: [
        {
          where: "{{ training.where }}",
          when: "{{ training.when }}",
          trainers: "{{ training.trainers }}",
          organizer: "{{ training.organizer }}",
          status: "{{ training.status }}"
        }
      ]
    },
  {% endif %}
  {% endfor%}
  ];

  function keepOnlyOneSession(trainings) {
    var result = new Array();
    for (i = 0; i < trainings.length && i < MAX_TRAININGS; i++) {
      var training = trainings[i];
      var firstSession = training.sessions[0];
      result[i] = {
        title: training.title,
        description: training.description,
        url: training.url,
        where: firstSession.where,
        when: firstSession.when,
        trainers: firstSession.trainers,
        organizer: firstSession.organizer,
        status: firstSession.status
      };
    }
    return result;
  }

  function doPopulateTrainingsPane(allTrainings0) {
    var allTrainings = keepOnlyOneSession(allTrainings0);
    allTrainings = allTrainings.filter(function (training) {
      return new Date(training.when) >= new Date();
    });
    allTrainings.sort(compareTrainingsByDate);
    var content = "";
    for (i = 0; i < allTrainings.length; i++) {
      var training = allTrainings[i];
      var thisContent =
        '<div class="training-item">' +
          '<div class="training-title"><a href="'+training.url+'">'+training.title+'</a></div>' +
          '<div class="training-description">'+training.description+'</div>' +
          '<div class="training-location">'+training.where+'</div>' +
          '<div class="training-date"><img src="{{ site.baseurl }}/resources/img/icon-date.png" /> '+training.when+'</div>' +
          '<div class="training-trainers"><span class="by">By</span> <div class="training-trainers-name">'+training.trainers+'</div></div>' +
          '<div class="training-organizer">'+training.organizer+'</div>' +
        '</div>';
      $("#trainingspane").append(thisContent);
    }
  }

  function onTrainingsAjaxSuccess(response, textStatus, jqXHR) {
    var allTrainings = scalaLangTrainings.concat(response);
    doPopulateTrainingsPane(allTrainings);
  }

  function onTrainingsAjaxError(jqXHR, textStatus, errorThrown) {
    // log the error to the console
    console.error(
      "Could not load Typesafe training feed: " + textStatus, errorThrown);
    // but at least display trainings from scala-lang
    doPopulateTrainingsPane(scalaLangTrainings);
  }

  $.ajax({
    url: "{{ site.baseurl }}/cgi-bin/typesafe-feed-trainings",
    type: "GET",
    dataType: "json",
    success: onTrainingsAjaxSuccess,
    error: onTrainingsAjaxError
  });

});
