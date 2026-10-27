var marketsData = [];
var produceData = [];
var faqData = [];
var favorites = { markets: [], produce: [] };
var personalNotes = {};

if (localStorage.getItem('freshfind_favs')) {
  try {
    favorites = JSON.parse(localStorage.getItem('freshfind_favs')) || { markets: [], produce: [] };
  } catch(e) {
    favorites = { markets: [], produce: [] };
  }
}
if (localStorage.getItem('freshfind_notes')) {
  try {
    personalNotes = JSON.parse(localStorage.getItem('freshfind_notes')) || {};
  } catch(e) {
    personalNotes = {};
  }
}

$(document).ready(function() {

  initVisitorCounter();

  startLiveClock();

  loadAllData();

  setupEventListeners();
  $('.n-link').on('click', function() {
  if (window.innerWidth >= 769 && window.innerWidth <= 1025) {
    $('#nav-list').removeClass('open');
  }
});
$(document).on('click', function(e) {
  if (window.innerWidth >= 769 && window.innerWidth <= 1025) {
    if (!$(e.target).closest('#menu-toggle, #nav-list').length) {
      $('#nav-list').removeClass('open');
    }
  }
});
$('#explore-more-markets').on('click', function() {

  showSection('mkts-sec');

  $('#f-srch').val('');
  $('#f-area').val('');
  $('#f-day').val('');
  $('#f-prod').val('');
  $('#f-sort').val('name');

  renderMarketDirectory(marketsData);

});
  initHeroSlider();

  setupScrollAnimations();
function setupScrollAnimations() {

  var elements = document.querySelectorAll('.scroll-reveal');

  function showElements() {

    elements.forEach(function(element) {

      var rect = element.getBoundingClientRect();

      if (rect.top < window.innerHeight - 80 && rect.bottom > 0) {

        element.classList.add('show');

      } else {

        element.classList.remove('show');

      }

    });

  }

  window.addEventListener('scroll', showElements);

  showElements();

}
});

function initVisitorCounter() {
  var currentCount = 1042;
  if (localStorage.getItem('freshfind_visitors')) {
    currentCount = parseInt(localStorage.getItem('freshfind_visitors'), 10) || 1042;
  }
  currentCount = currentCount + 1;
  localStorage.setItem('freshfind_visitors', currentCount);
  $('#v-count').text(currentCount.toLocaleString());
}

function startLiveClock() {
  function updateClock() {
    var now = new Date();
    var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    var currentDay = days[now.getDay()];
    var timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    $('#clock-txt').text(currentDay + ' ' + timeString);
  }
  updateClock();
  setInterval(updateClock, 1000);
}

function initHeroSlider() {
  var currentSlide = 0;
  var totalSlides = 3;
  var slideTimer = null;

  function showSlide(index) {
    if (index >= totalSlides) {
      currentSlide = 0;
    } else if (index < 0) {
      currentSlide = totalSlides - 1;
    } else {
      currentSlide = index;
    }
    $('.slide').removeClass('active').eq(currentSlide).addClass('active');
    $('.dot').removeClass('active').eq(currentSlide).addClass('active');
  }

  function startAutoSlide() {
    if (slideTimer) clearInterval(slideTimer);
    slideTimer = setInterval(function() {
      showSlide(currentSlide + 1);
    }, 4000);
  }

  $(document).on('click', '#hero-next', function(e) {
    e.preventDefault();
    showSlide(currentSlide + 1);
    startAutoSlide();
  });

  $(document).on('click', '#hero-prev', function(e) {
    e.preventDefault();
    showSlide(currentSlide - 1);
    startAutoSlide();
  });

  $(document).on('click', '.dot', function(e) {
    e.preventDefault();
    var slideIdx = parseInt($(this).attr('data-slide'), 10);
    if (!isNaN(slideIdx)) {
      showSlide(slideIdx);
      startAutoSlide();
    }
  });

  startAutoSlide();
}

function loadAllData() {
  $.getJSON('data/markets.json', function(data1) {
    marketsData = data1;
    $.getJSON('data/produce.json', function(data2) {
      produceData = data2;
      $.getJSON('data/faq.json', function(data3) {
        faqData = data3;
        renderFeaturedMarkets();
        renderMarketDirectory(marketsData);
        renderProduceGuide(produceData);
        populateFilterDropdowns();
        updateOpenMarketsBadge();
        updateBookmarksCount();
        updateStatsCounters();
      });
    });
  });
}

function updateStatsCounters() {
  if (marketsData.length > 0) {
    $('#st-mkt-cnt').text(marketsData.length + '+');
  }
  if (produceData.length > 0) {
    $('#st-prd-cnt').text(produceData.length + '+');
  }
}

function updateOpenMarketsBadge() {
  var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var today = days[new Date().getDay()];
  var openCount = 0;
  for (var i = 0; i < marketsData.length; i++) {
    var m = marketsData[i];
    if (m.operatingDays && m.operatingDays.indexOf(today) !== -1) {
      openCount = openCount + 1;
    }
  }
  if (openCount > 0) {
    $('#open-bdg').html(openCount + ' Markets Open Today (' + today + ')');
  } else {
    $('#open-bdg').html('Next Markets Open Tomorrow');
  }
}
function updateBreadcrumb(sectionId) {

  var names = {
    'home-sec': 'Home',
    'mkts-sec': 'Market Directory',
    'prod-sec': 'Produce Guide',
    'bms-sec': 'Saved Bookmarks'
  };

  $('#site-breadcrumb').text(names[sectionId] || 'Home');

}
function showSection(sectionId) {
  $('.pg-sec').removeClass('act-sec');
  $('#' + sectionId).addClass('act-sec');
  $('.n-link').removeClass('active');
  $('[data-target="' + sectionId + '"]').addClass('active');
  if (sectionId === 'bms-sec') {
    renderBookmarks();
  }
updateBreadcrumb(sectionId);
window.scrollTo({ top: 0, behavior: 'smooth' });}

function setupEventListeners() {
  $('#global-find-btn').on('click', function() {
  showSection('mkts-sec');
  $('#f-srch').val('');
  $('#f-area').val('');
  $('#f-day').val('');
  $('#f-prod').val('');
  $('#f-sort').val('name');
  renderMarketDirectory(marketsData);
});
      setupSmartSearch();
  $('#menu-toggle').on('click', function() {
    $('#nav-list').toggleClass('open');
  });

  $('.n-link, .lkn-btn').on('click', function(e) {
    e.preventDefault();
$('#nav-list').removeClass('open');
    var target = $(this).data('target');
    var scrollTarget = $(this).data('scroll');
    if (scrollTarget) {
      showSection('home-sec');
      var element = document.getElementById(scrollTarget);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
      return;
    }
    if (target) {
      showSection(target);
    }
  });

  $('#h-srch-btn').on('click', function() {
    var query = $('#h-srch-inp').val().toLowerCase();
    var area = $('#h-area-sel').val();
    showSection('mkts-sec');
    $('#f-srch').val(query);
    $('#f-area').val(area);
    applyMarketFilters();
  });

  $('#f-srch, #f-area, #f-day, #f-prod, #f-sort').on('change keyup', function() {
    applyMarketFilters();
  });

  $('#rst-btn').on('click', function() {
    $('#f-srch').val('');
    $('#f-area').val('');
    $('#f-day').val('');
    $('#f-prod').val('');
    $('#f-sort').val('name');
    renderMarketDirectory(marketsData);
  });

  $('.pro-c-btn').on('click', function() {
    var category = $(this).data('cat');
    filterProduce(category);
  });

  $('.m-close, .modal-bg').on('click', function(e) {
    if (e.target === this || $(this).hasClass('m-close')) {
      $('.modal-bg').removeClass('open');
    }
  });

  $('#save-n-btn').on('click', function() {
    var itemId = $(this).data('item-id');
    var noteText = $('#note-inp').val().trim();
    if (itemId) {
      personalNotes[itemId] = noteText;
      localStorage.setItem('freshfind_notes', JSON.stringify(personalNotes));
      alert('Your session note has been saved!');
      if ($('#bms-sec').hasClass('act-sec')) {
        renderBookmarks();
      }
    }
  });

  

  $('#chat-btn').on('click', function(e) {
    e.stopPropagation();
    $('#chat-wnd').toggleClass('open');
  });

  $('#chat-wnd').on('click', function(e) {
    e.stopPropagation();
  });

  $('#chat-c-btn').on('click', function(e) {
    e.stopPropagation();
    $('#chat-wnd').removeClass('open');
  });

  $(document).on('click', function(e) {
    if (
      !$(e.target).closest('#chat-wnd').length &&
      !$(e.target).closest('#chat-btn').length
    ) {
      $('#chat-wnd').removeClass('open');
    }
  });

  $('#chat-s-btn').on('click', function() {
    handleUserChatMessage();
  });

  $('#chat-inp').on('keypress', function(e) {
    if (e.which === 13) {
      handleUserChatMessage();
    }
  });

$(document).on('click', '.qr-btn', function(e) {
  e.preventDefault();
  e.stopImmediatePropagation();

  var text = $(this).text().trim();

  if (text === 'Show Market Details') {

    var lastBot = $('#chat-msgs .bot-msg').last();
    var marketButton = lastBot.find('button[onclick*="openMarketDetail"]').last();

    if (marketButton.length) {
      marketButton[0].click();
    } else {
      appendChatMsg(
        'Please select a specific market first so I can show its details.',
        'bot'
      );
    }

    return false;
  }

  if (text === 'Go to Bookmarks') {

    showSection('bms-sec');

    appendChatMsg(
      'Sure! I have opened your Saved Bookmarks section.',
      'bot'
    );

    return false;
  }

  if (text === 'Go to Contact Us') {

    showSection('home-sec');

    setTimeout(function() {
      var element = document.getElementById('cnt-blk');

      if (element) {
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    }, 150);

    appendChatMsg(
      'Sure! I have opened the Contact Us section for you.',
      'bot'
    );

    return false;
  }

  if (text === 'View Produce Guide') {

    showSection('prod-sec');

    appendChatMsg(
      'Sure! I have opened the Produce Guide for you.',
      'bot'
    );

    return false;
  }

  $('#chat-inp').val(text);

  handleUserChatMessage();

  return false;
});

 
 

$('#cnt-f').on('submit', function(e) {
  e.preventDefault();

  var name = $('#cnt-nm').val().trim();
  var email = $('#cnt-em').val().trim();
  var subject = $('#cnt-sbj').val().trim();
  var message = $('#cnt-msg').val().trim();

  var isValid = true;

  // Clear old errors
  $('#cnt-nm-error').text('');
  $('#cnt-em-error').text('');
  $('#cnt-sbj-error').text('');
  $('#cnt-msg-error').text('');

  $('#cnt-nm, #cnt-em, #cnt-sbj, #cnt-msg')
    .removeClass('input-error input-valid');

  // NAME
  if (name === '') {
    $('#cnt-nm-error').text('Please enter your name.');
    $('#cnt-nm').addClass('input-error');
    isValid = false;
  } 
  else if (!/^[A-Za-z ]+$/.test(name)) {
    $('#cnt-nm-error').text('Numbers and special characters are not allowed.');
    $('#cnt-nm').addClass('input-error');
    isValid = false;
  } 
  else {
    $('#cnt-nm').addClass('input-valid');
  }

  // EMAIL
  var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (email === '') {
    $('#cnt-em-error').text('Please enter your email address.');
    $('#cnt-em').addClass('input-error');
    isValid = false;
  } 
  else if (!emailPattern.test(email)) {
    $('#cnt-em-error').text('Please enter a valid email address.');
    $('#cnt-em').addClass('input-error');
    isValid = false;
  } 
  else {
    $('#cnt-em').addClass('input-valid');
  }

  // SUBJECT
  if (subject === '') {
    $('#cnt-sbj-error').text('Please enter a subject.');
    $('#cnt-sbj').addClass('input-error');
    isValid = false;
  } 
  else if (subject.length < 3) {
    $('#cnt-sbj-error').text('Subject must contain at least 3 characters.');
    $('#cnt-sbj').addClass('input-error');
    isValid = false;
  } 
  else {
    $('#cnt-sbj').addClass('input-valid');
  }

  // MESSAGE
  if (message === '') {
    $('#cnt-msg-error').text('Please enter your message.');
    $('#cnt-msg').addClass('input-error');
    isValid = false;
  } 
  else if (message.length < 10) {
    $('#cnt-msg-error').text('Message must contain at least 10 characters.');
    $('#cnt-msg').addClass('input-error');
    isValid = false;
  } 
  else {
    $('#cnt-msg').addClass('input-valid');
  }

  if (isValid) {
    alert('Thank you for contacting FreshFind! We will get back to you soon.');

    $('#cnt-f')[0].reset();

    $('#cnt-nm, #cnt-em, #cnt-sbj, #cnt-msg')
      .removeClass('input-error input-valid');

    $('.form-error').text('');
  }
});
  $('#exp-bm-btn').on('click', function() {
    exportBookmarksTxt();
  });
}

function populateFilterDropdowns() {
  var areasList = [];
  var produceTypesList = [];
  for (var i = 0; i < marketsData.length; i++) {
    var market = marketsData[i];
    if (market.area && areasList.indexOf(market.area) === -1) {
      areasList.push(market.area);
    }
    if (market.produceTypes) {
      for (var j = 0; j < market.produceTypes.length; j++) {
        var pType = market.produceTypes[j];
        if (produceTypesList.indexOf(pType) === -1) {
          produceTypesList.push(pType);
        }
      }
    }
  }

  $('#f-area').html('<option value="">All Neighborhoods</option>');
  $('#h-area-sel').html('<option value="">All Areas</option>');
  for (var a = 0; a < areasList.length; a++) {
    var areaName = areasList[a];
    $('#f-area').append('<option value="' + areaName + '">' + areaName + '</option>');
    $('#h-area-sel').append('<option value="' + areaName + '">' + areaName + '</option>');
  }

  $('#f-prod').html('<option value="">All Produce Types</option>');
  for (var p = 0; p < produceTypesList.length; p++) {
    var produceName = produceTypesList[p];
    $('#f-prod').append('<option value="' + produceName + '">' + produceName + '</option>');
  }
}

function renderFeaturedMarkets() {
  var html = '';
  for (var i = 0; i < 3 && i < marketsData.length; i++) {
    html = html + createMarketCardHtml(marketsData[i]);
  }
  $('#feat-grid').html(html);
}

function renderMarketDirectory(marketsList) {
  if (!marketsList || marketsList.length === 0) {
    $('#mkt-grid').html('<div style="grid-column: 1/-1; text-align:center; padding: 40px; background:#fff; border-radius:8px; border:1px solid #ddd;"><i class="fas fa-search" style="font-size:32px; color:#888; margin-bottom:10px;"></i><p style="font-weight:bold; color:#000;">No markets match your filter criteria.</p><p style="font-size:13px; color:#555; margin-top:5px;">Try changing operating day, area, or produce category.</p></div>');
    return;
  }
  var html = '';
  for (var i = 0; i < marketsList.length; i++) {
    html = html + createMarketCardHtml(marketsList[i]);
  }
  $('#mkt-grid').html(html);
}

function createMarketCardHtml(m) {
  var isFav = (favorites.markets.indexOf(m.id) !== -1);
  var activeClass = isFav ? 'active' : '';
  var iconClass = isFav ? 'fas fa-heart' : 'far fa-heart';
  var tagsHtml = '';
  if (m.produceTypes) {
    for (var i = 0; i < m.produceTypes.length; i++) {
      tagsHtml = tagsHtml + '<span class="t-badge">' + m.produceTypes[i] + '</span> ';
    }
  }

  var cardHtml = '';
  cardHtml += '<div class="mk-card">';
  cardHtml += '  <div class="c-img-box">';
  cardHtml += '    <img src="' + m.image + '" alt="' + m.name + '">';
  cardHtml += '    <span class="area-tag">' + m.area + '</span>';
  cardHtml += '    <button class="fav-b ' + activeClass + '" onclick="toggleFavorite(\'market\', \'' + m.id + '\', event)">';
  cardHtml += '      <i class="' + iconClass + '"></i>';
  cardHtml += '    </button>';
  cardHtml += '  </div>';
  cardHtml += '  <div class="c-body">';
  cardHtml += '    <h3 class="c-title">' + m.name + '</h3>';
  cardHtml += '    <div class="c-meta">';
  cardHtml += '      <span><i class="far fa-clock"></i> ' + m.hours + '</span>';
  cardHtml += '      <span><i class="fas fa-star" style="color:#fbc02d;"></i> ' + m.rating + '</span>';
  cardHtml += '    </div>';
  cardHtml += '    <p class="c-desc">' + m.description + '</p>';
  cardHtml += '    <div class="tag-box">' + tagsHtml + '</div>';
  cardHtml += '    <div class="c-foot">';
  cardHtml += '      <small><i class="far fa-calendar-alt"></i> ' + m.operatingDays.join(', ') + '</small>';
  cardHtml += '      <button class="btn-p btn-sm" onclick="openMarketDetail(\'' + m.id + '\')">View Details</button>';
  cardHtml += '    </div>';
  cardHtml += '  </div>';
  cardHtml += '</div>';
  return cardHtml;
}

function applyMarketFilters() {
  var searchText = $('#f-srch').val().toLowerCase().trim();
  var selectedArea = $('#f-area').val();
  var selectedDay = $('#f-day').val();
  var selectedProduce = $('#f-prod').val();
  var sortBy = $('#f-sort').val();

  var filteredList = [];
  for (var i = 0; i < marketsData.length; i++) {
    var m = marketsData[i];
    var nameMatch = m.name.toLowerCase().indexOf(searchText) !== -1;
    var addressMatch = m.address.toLowerCase().indexOf(searchText) !== -1;
    var descMatch = m.description.toLowerCase().indexOf(searchText) !== -1;
    var matchesSearch = (nameMatch || addressMatch || descMatch);

    var matchesArea = true;
    if (selectedArea !== '') {
      if (m.area !== selectedArea) {
        matchesArea = false;
      }
    }

    var matchesDay = true;
    if (selectedDay !== '') {
      if (!m.operatingDays || m.operatingDays.indexOf(selectedDay) === -1) {
        matchesDay = false;
      }
    }

    var matchesProduce = true;
    if (selectedProduce !== '') {
      var inTypes = m.produceTypes && m.produceTypes.indexOf(selectedProduce) !== -1;
      var inProduceItems = false;
      if (produceData && m.produceIds) {
        for (var pIdx = 0; pIdx < produceData.length; pIdx++) {
          var pItem = produceData[pIdx];
          if (m.produceIds.indexOf(pItem.id) !== -1) {
            if (pItem.category === selectedProduce || pItem.name.toLowerCase().indexOf(selectedProduce.toLowerCase()) !== -1) {
              inProduceItems = true;
              break;
            }
          }
        }
      }
      if (!inTypes && !inProduceItems) {
        matchesProduce = false;
      }
    }

    if (matchesSearch && matchesArea && matchesDay && matchesProduce) {
      filteredList.push(m);
    }
  }

  if (sortBy === 'name') {
    filteredList.sort(function(a, b) {
      return a.name.localeCompare(b.name);
    });
  } else if (sortBy === 'name-desc') {
    filteredList.sort(function(a, b) {
      return b.name.localeCompare(a.name);
    });
  } else if (sortBy === 'rating') {
    filteredList.sort(function(a, b) {
      return b.rating - a.rating;
    });
  }

  renderMarketDirectory(filteredList);
}

function openMarketDetail(id) {
  var market = null;
  for (var i = 0; i < marketsData.length; i++) {
    if (marketsData[i].id === id) {
      market = marketsData[i];
      break;
    }
  }
  if (!market) return;

  $('#bc-name').text(market.name);
  $('#mdl-title').text(market.name);
  $('#mdl-addr').html('<strong>Address:</strong> ' + market.address + ' (' + market.area + ')');
  $('#mdl-desc').text(market.longDescription || market.description);
  $('#mdl-phn').html('<strong>Phone:</strong> ' + market.phone);
  $('#mdl-hrs').html('<strong>Operating Days:</strong> ' + market.operatingDays.join(', ') + ' (' + market.hours + ')');
  $('#map-iframe').attr('src', market.mapEmbed);

  var daysOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  var daysNow = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var todayName = daysNow[new Date().getDay()];

  var schedHtml = '';
  for (var d = 0; d < daysOrder.length; d++) {
    var day = daysOrder[d];
    var status = (market.schedule && market.schedule[day]) ? market.schedule[day] : 'Closed';
    var isToday = (day === todayName);
    var rowStyle = isToday ? 'style="background-color: #e8f5e9; font-weight: bold;"' : '';
    var statusBadge = status !== 'Closed' 
      ? '<span class="t-badge">' + status + '</span>' 
      : '<span class="t-badge" style="background:#ffe0b2; color:#e65100;">Closed</span>';

    schedHtml += '<tr ' + rowStyle + '>' +
      '<td>' + day + (isToday ? ' (Today)' : '') + '</td>' +
      '<td>' + statusBadge + '</td>' +
    '</tr>';
  }
  $('#sch-body').html(schedHtml);

  var prodHtml = '';
  for (var p = 0; p < produceData.length; p++) {
    var produce = produceData[p];
    if (market.produceIds && market.produceIds.indexOf(produce.id) !== -1) {
      prodHtml += '<span class="t-badge" style="padding: 6px 12px; margin-bottom:4px;">' + produce.name + ' (' + produce.category + ')</span> ';
    }
  }
  $('#avail-prod').html(prodHtml || '<span>Check market directly for daily seasonal items.</span>');

  var savedNote = personalNotes[id] || '';
  $('#note-inp').val(savedNote);
  $('#save-n-btn').data('item-id', id);

  $('#mkt-mdl').addClass('open');
}

function renderProduceGuide(list) {
  if (!list || list.length === 0) {
    $('#prod-grid').html('<div style="grid-column: 1/-1; text-align:center; padding: 40px; background:#fff; border-radius:8px; border:1px solid #ddd;"><p style="font-weight:bold;">No produce items found for this category.</p></div>');
    return;
  }

  var html = '';
  for (var i = 0; i < list.length; i++) {
    var p = list[i];
    var isFav = (favorites.produce.indexOf(p.id) !== -1);
    var iconClass = isFav ? 'fas fa-heart' : 'far fa-heart';
    var activeClass = isFav ? 'active' : '';

    var mNames = [];
    for (var m = 0; m < marketsData.length; m++) {
      if (p.markets && p.markets.indexOf(marketsData[m].id) !== -1) {
        mNames.push(marketsData[m].name);
      }
    }

    html += '<div class="pro-card">' +
      '<div class="c-img-box">' +
        '<img src="' + p.image + '" alt="' + p.name + '" class="pro-img">' +
        '<span class="sn-badge-overlay">Season: ' + p.season + '</span>' +
        '<button class="fav-b ' + activeClass + '" onclick="toggleFavorite(\'produce\', \'' + p.id + '\', event)" title="Bookmark Item">' +
          '<i class="' + iconClass + '"></i>' +
        '</button>' +
      '</div>' +
      '<div class="pro-body">' +
        '<h3 style="font-size: 16px; font-weight:bold; margin-bottom: 4px; color:#000;">' + p.name + '</h3>' +
        '<div><span class="cat-pill">' + p.category + '</span></div>' +
        '<p style="font-size:13px; color:#111; margin: 8px 0 10px 0;">' + p.description + '</p>' +
        '<div style="font-size:12px; background:#f0f4f1; padding:8px; border-radius:6px; margin-bottom:10px; color:#111;">' +
          '<strong>Nutrition:</strong> ' + p.nutrition +
        '</div>' +
        '<div style="margin-top:auto; font-size:12px; color:#2e7d32; margin-bottom:12px;">' +
          '<strong>Available at:</strong> ' + (mNames.length > 0 ? mNames.join(', ') : 'Selected Markets') +
        '</div>' +
        '<button class="btn-o btn-sm" style="width:100%; justify-content:center;" onclick="findMarketsForProduce(\'' + p.id + '\', \'' + p.category + '\')">Find Market</button>' +
      '</div>' +
    '</div>';
  }
  $('#prod-grid').html(html);
}

function findMarketsForProduce(produceId, category) {
  showSection('mkts-sec');
  $('#f-srch').val('');
  $('#f-area').val('');
  $('#f-day').val('');
  if (category) {
    $('#f-prod').val(category);
  }
  applyMarketFilters();
}

function filterProduce(category) {
  $('.pro-c-btn').removeClass('active');
  $('.pro-c-btn[data-cat="' + category + '"]').addClass('active');

  if (category === 'All') {
    renderProduceGuide(produceData);
  } else {
    var filtered = [];
    for (var i = 0; i < produceData.length; i++) {
      if (produceData[i].category === category) {
        filtered.push(produceData[i]);
      }
    }
    renderProduceGuide(filtered);
  }
}

function toggleFavorite(type, id, event) {
  if (event) {
    event.stopPropagation();
  }
  var list = (type === 'market') ? favorites.markets : favorites.produce;
  var index = list.indexOf(id);

  if (index !== -1) {
    list.splice(index, 1);
  } else {
    list.push(id);
  }

  localStorage.setItem('freshfind_favs', JSON.stringify(favorites));
  updateBookmarksCount();
  renderMarketDirectory(marketsData);
  renderFeaturedMarkets();
  renderProduceGuide(produceData);

  if ($('#bms-sec').hasClass('act-sec')) {
    renderBookmarks();
  }
}

function updateBookmarksCount() {
  var totalCount = favorites.markets.length + favorites.produce.length;
  $('#bm-cnt').text(totalCount);
}

function renderBookmarks() {
  var mFavs = [];
  for (var i = 0; i < marketsData.length; i++) {
    if (favorites.markets.indexOf(marketsData[i].id) !== -1) {
      mFavs.push(marketsData[i]);
    }
  }

  var pFavs = [];
  for (var j = 0; j < produceData.length; j++) {
    if (favorites.produce.indexOf(produceData[j].id) !== -1) {
      pFavs.push(produceData[j]);
    }
  }

  if (mFavs.length === 0 && pFavs.length === 0) {
    $('#bm-cont').html('<div style="text-align:center; padding: 40px; background:#fff; border-radius:8px; border:1px solid #ddd;"><i class="far fa-heart" style="font-size:36px; color:#e65100; margin-bottom:10px;"></i><p style="font-weight:bold; color:#000;">Your bookmark list is empty.</p><p style="font-size:13px; color:#555; margin-top:4px;">Click the heart icon on any market or produce item to save it here for quick access!</p></div>');
    return;
  }

  var html = '';

  if (mFavs.length > 0) {
    html += '<h3 style="margin: 20px 0 10px 0; color: #000000;"><i class="fas fa-store"></i> Saved Markets</h3>';
    for (var k = 0; k < mFavs.length; k++) {
      var m = mFavs[k];
      var note = personalNotes[m.id] || 'No notes added yet.';
      html += '<div class="bm-card">' +
        '<div>' +
          '<h4 style="font-size:16px; font-weight:bold; color:#000;">' + m.name + '</h4>' +
          '<p style="font-size:13px; color:#111;">Area: ' + m.area + ' | Hours: ' + m.hours + '</p>' +
          '<div style="background:#fffde7; padding:6px 10px; border-radius:6px; margin-top:8px; font-size:13px; border:1px solid #fff59d; color:#111;">' +
            '<strong>Session Note:</strong> ' + note +
          '</div>' +
        '</div>' +
        '<div style="display:flex; gap:8px;">' +
          '<button class="btn-p btn-sm" onclick="openMarketDetail(\'' + m.id + '\')">View</button>' +
          '<button class="btn-s btn-sm" onclick="toggleFavorite(\'market\', \'' + m.id + '\')">Remove</button>' +
        '</div>' +
      '</div>';
    }
  }

  if (pFavs.length > 0) {
    html += '<h3 style="margin: 30px 0 10px 0; color: #000000;"><i class="fas fa-apple-alt"></i> Saved Produce Items</h3>';
    for (var n = 0; n < pFavs.length; n++) {
      var p = pFavs[n];
      var noteP = personalNotes[p.id] || 'No notes added.';
      html += '<div class="bm-card">' +
        '<div>' +
          '<h4 style="font-size:16px; font-weight:bold; color:#000;">' + p.name + '</h4>' +
          '<p style="font-size:13px; color:#111;">Category: ' + p.category + ' | Season: ' + p.season + '</p>' +
          '<div style="background:#fffde7; padding:6px 10px; border-radius:6px; margin-top:8px; font-size:13px; border:1px solid #fff59d; color:#111;">' +
            '<strong>Nutrition:</strong> ' + p.nutrition +
          '</div>' +
        '</div>' +
        '<div style="display:flex; gap:8px;">' +
          '<button class="btn-o btn-sm" onclick="findMarketsForProduce(\'' + p.id + '\', \'' + p.category + '\')">Find Market</button>' +
          '<button class="btn-s btn-sm" onclick="toggleFavorite(\'produce\', \'' + p.id + '\')">Remove</button>' +
        '</div>' +
      '</div>';
    }
  }

  $('#bm-cont').html(html);
}

function exportBookmarksTxt() {
  var mFavs = [];
  for (var i = 0; i < marketsData.length; i++) {
    if (favorites.markets.indexOf(marketsData[i].id) !== -1) {
      mFavs.push(marketsData[i]);
    }
  }

  var pFavs = [];
  for (var j = 0; j < produceData.length; j++) {
    if (favorites.produce.indexOf(produceData[j].id) !== -1) {
      pFavs.push(produceData[j]);
    }
  }

  if (mFavs.length === 0 && pFavs.length === 0) {
    alert('You have no saved bookmarks to export!');
    return;
  }

  var text = "=== FreshFind Saved Favorites & Personal Notes ===\n\n";
  text += "-- SAVED MARKETS --\n";
  for (var a = 0; a < mFavs.length; a++) {
    var m = mFavs[a];
    text += (a + 1) + ". " + m.name + "\n";
    text += "   Address: " + m.address + "\n";
    text += "   Hours: " + m.hours + " (" + m.operatingDays.join(', ') + ")\n";
    text += "   Note: " + (personalNotes[m.id] || "None") + "\n\n";
  }

  text += "-- SAVED PRODUCE ITEMS --\n";
  for (var b = 0; b < pFavs.length; b++) {
    var p = pFavs[b];
    text += (b + 1) + ". " + p.name + " (" + p.category + ")\n";
    text += "   Season: " + p.season + "\n";
    text += "   Nutrition: " + p.nutrition + "\n\n";
  }

  var linkElement = document.createElement('a');
  linkElement.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  linkElement.setAttribute('download', 'FreshFind_Bookmarks.txt');
  linkElement.style.display = 'none';
  document.body.appendChild(linkElement);
  linkElement.click();
  document.body.removeChild(linkElement);
}

function handleUserChatMessage() {
  var userText = $('#chat-inp').val().trim();

  if (userText === '') return;

  appendChatMsg(userText, 'user');
  $('#chat-inp').val('');

  setTimeout(function() {
    var query = userText.toLowerCase().trim();
    var bestMatch = null;
    var highestScore = 0;

    for (var i = 0; i < faqData.length; i++) {
      var item = faqData[i];
      var score = 0;

      for (var k = 0; k < item.keywords.length; k++) {
        var keyword = item.keywords[k].toLowerCase();

        if (query.indexOf(keyword) !== -1) {
          score += 3;
        }
      }

      if (item.question) {
        var questionWords = item.question.toLowerCase().split(/\s+/);

        for (var q = 0; q < questionWords.length; q++) {
          if (
            questionWords[q].length > 3 &&
            query.indexOf(questionWords[q]) !== -1
          ) {
            score += 1;
          }
        }
      }

      if (score > highestScore) {
        highestScore = score;
        bestMatch = item;
      }
    }

    for (var m = 0; m < marketsData.length; m++) {
      var market = marketsData[m];

      var marketName = (market.name || '').toLowerCase();
      var marketArea = (market.area || '').toLowerCase();
      var marketAddress = (market.address || '').toLowerCase();

      if (
        (marketName && query.indexOf(marketName) !== -1) ||
        (marketArea && query.indexOf(marketArea) !== -1) ||
        (marketAddress && query.indexOf(marketAddress) !== -1)
      ) {
        if (
          query.includes('where') ||
          query.includes('location') ||
          query.includes('address') ||
          query.includes('located')
        ) {
          appendChatMsg(
            market.name + ' is located in ' +
            (market.area || market.address || 'the listed location') +
            '. You can open its details from the Market Directory.',
            'bot'
          );

          return;
        }

        if (
          query.includes('hour') ||
          query.includes('time') ||
          query.includes('open') ||
          query.includes('day') ||
          query.includes('schedule')
        ) {
          appendChatMsg(
            market.name +
            ' operates according to its listed weekly schedule. ' +
            'You can use the Market Directory to view its complete operating hours and current status.',
            'bot'
          );

          return;
        }
      }
    }

    for (var p = 0; p < produceData.length; p++) {
      var produce = produceData[p];

      var produceName = (produce.name || '').toLowerCase();
      var produceCategory = (produce.category || '').toLowerCase();
      var produceDescription = (produce.description || '').toLowerCase();

      if (
        (produceName && query.indexOf(produceName) !== -1) ||
        (produceCategory && query.indexOf(produceCategory) !== -1)
      ) {
        if (
          query.includes('season') ||
          query.includes('when') ||
          query.includes('available')
        ) {
          appendChatMsg(
            produce.name +
            ' is listed under ' +
            produce.category +
            '. Its seasonal information is available in the Produce Guide.',
            'bot'
          );

          return;
        }

        if (
          query.includes('nutrition') ||
          query.includes('healthy') ||
          query.includes('vitamin')
        ) {
          appendChatMsg(
            produce.name +
            ' includes nutritional information in the Produce Guide.',
            'bot'
          );

          return;
        }

        appendChatMsg(
          produce.name +
          ' is available in our Produce Guide. You can view its season, description, nutritional information, and associated markets there.',
          'bot'
        );

        return;
      }
    }

    var websiteWords = [
      'website',
      'freshfind',
      'market',
      'markets',
      'produce',
      'fruit',
      'fruits',
      'vegetable',
      'vegetables',
      'bookmark',
      'bookmarks',
      'save',
      'saved',
      'note',
      'notes',
      'chatbot',
      'assistant',
      'search',
      'filter',
      'sort',
      'contact',
      'map',
      'maps',
      'location',
      'timing',
      'hours',
      'open',
      'closed',
      'season',
      'seasonal'
    ];

    var isWebsiteRelated = false;

    for (var w = 0; w < websiteWords.length; w++) {
      if (query.indexOf(websiteWords[w]) !== -1) {
        isWebsiteRelated = true;
        break;
      }
    }

    if (bestMatch && highestScore > 0) {
      appendChatMsg(bestMatch.answer, 'bot', bestMatch);
      return;
    }

    if (isWebsiteRelated) {
      appendChatMsg(
        'I can help you with FreshFind. You can ask me about market locations, opening hours, available produce, seasonal produce, bookmarks, personal notes, searching, filtering, or how to use the website.',
        'bot',
        {
          quickReplies: [
            'Which markets are open today?',
            'Find organic tomatoes',
            'How to bookmark?',
            'View Produce Guide'
          ]
        }
      );

      return;
    }

    appendChatMsg(
      'I can help with FreshFind only. You can ask me about markets, produce, opening hours, locations, bookmarks, search, or website features.',
      'bot',
      {
        quickReplies: [
          'Which markets are open today?',
          'Find organic tomatoes',
          'How to bookmark?',
          'View Produce Guide'
        ]
      }
    );

  }, 300);
}

function appendChatMsg(text, sender, meta) {
  var bubbleClass = (sender === 'user') ? 'usr-msg' : 'bot-msg';
  var html = '<div class="msg-bbl ' + bubbleClass + '">' + text;

  if (meta && meta.link) {
    if (meta.linkType === 'market') {
      html += '<br><button class="btn-p btn-sm" style="margin-top:8px;" onclick="openMarketDetail(\'' + meta.link + '\')">View Market Details</button>';
    } else if (meta.linkType === 'produce') {
      html += '<br><button class="btn-p btn-sm" style="margin-top:8px;" onclick="showSection(\'prod-sec\')">View Produce Guide</button>';
    }
  }
  html += '</div>';

  $('#chat-msgs').append(html);

  if (meta && meta.quickReplies) {
    var qrHtml = '<div class="qr-box">';
    for (var q = 0; q < meta.quickReplies.length; q++) {
qrHtml += '<button type="button" class="qr-btn">' + meta.quickReplies[q] + '</button>';    }
    qrHtml += '</div>';
    $('#chat-msgs').append(qrHtml);
  }

  var chatBox = document.getElementById('chat-msgs');
  if (chatBox) {
    chatBox.scrollTop = chatBox.scrollHeight;
  }
}

function setupSmartSearch() {

  $('#f-srch').on('input', function() {
    showSearchSuggestions($(this), $('#search-suggestions'));
  });

  $('#h-srch-inp').on('input', function() {
    showSearchSuggestions($(this), $('#home-search-suggestions'));
  });

  $(document).on('click', '.search-suggestion-item', function() {
    var value = $(this).data('value');
    var targetInput = $(this).data('target');

    $('#' + targetInput).val(value);

    if (targetInput === 'f-srch') {
      $('#search-suggestions').hide();
      applyMarketFilters();
    } else {
      $('#home-search-suggestions').hide();
    }
  });

  $(document).on('click', function(e) {
    if (!$(e.target).closest('.smart-search-box, #f-srch, #search-suggestions').length) {
      $('.search-suggestions').hide();
    }
  });
}

function showSearchSuggestions(input, suggestionBox) {
  var query = input.val().toLowerCase().trim();

  if (query === '') {
    suggestionBox.hide();
    return;
  }

  var suggestions = [];

  for (var i = 0; i < marketsData.length; i++) {
    var market = marketsData[i];

    if (
      market.name.toLowerCase().indexOf(query) !== -1 ||
      market.area.toLowerCase().indexOf(query) !== -1
    ) {
      suggestions.push({
        text: market.name,
        icon: 'fa-store'
      });
    }

    if (suggestions.length >= 5) {
      break;
    }
  }

  for (var j = 0; j < produceData.length && suggestions.length < 5; j++) {
    var product = produceData[j];

    if (
      product.name.toLowerCase().indexOf(query) !== -1 ||
      product.category.toLowerCase().indexOf(query) !== -1
    ) {
      suggestions.push({
        text: product.name,
        icon: 'fa-leaf'
      });
    }
  }

  if (suggestions.length === 0) {
    suggestionBox.hide();
    return;
  }

  var html = '';

  for (var s = 0; s < suggestions.length; s++) {
    html +=
      '<div class="search-suggestion-item" data-value="' +
      suggestions[s].text +
      '" data-target="' +
      input.attr('id') +
      '">' +
      '<i class="fas ' +
      suggestions[s].icon +
      '"></i> ' +
      suggestions[s].text +
      '</div>';
  }

  suggestionBox.html(html);
  suggestionBox.show();
}
