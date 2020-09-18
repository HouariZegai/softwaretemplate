var config = {
	siteurl: 'https://bilalbentoumi-soft.blogspot.com'
};

function getFirstImage(html) {
	var elem = document.createElement('div');
	elem.style.display = 'none';
	document.body.appendChild(elem);
	elem.innerHTML = html;
	return elem.querySelector('img') == null ? '' : elem.querySelector('img').src;
}

function getImagesLinks(html) {
	var tmp = document.createElement('div');
	tmp.innerHTML = html;
	var images = tmp.getElementsByTagName("img");
	var links = [];
	for (var i = 0; i < images.length; i++) {
		links.push(images[i].src);
	}
	return links;
}

function stripHtml(html) {
	var tmp = document.createElement("DIV");
	tmp.innerHTML = html;
	return tmp.textContent || tmp.innerText || "";
}

async function getPost(id) {
	return new Promise(function(resolve, reject) {
		$.get('https://www.googleapis.com/blogger/v3/blogs/2050216668380744009/posts/' + id + '?key=AIzaSyAtLqb45iGfBvm7JjCyNQ76VCI_hl989cU', function (json) {
				resolve(json);
		});
	});
}

function getPostsByLabel(label) {
	var url = config.siteurl + '/feeds/posts/default/-/' + label + '?alt=json';
	return new Promise(function(resolve, reject) {
		$.get(url, function (json) {
			var posts = [];
			if (json.feed.entry) {
				for (var i = 0; i < json.feed.entry.length; i++) {
					var post = {};
					post.title = json.feed.entry[i].title.$t;
					post.images = getImagesLinks(json.feed.entry[i].content.$t);
					post.content = json.feed.entry[i].content.$t;
					post.author = json.feed.entry[i].author[0].name.$t;
					for (var j = 0; j < json.feed.entry[i].link.length; j++) {
						if (json.feed.entry[i].link[j].rel == 'alternate') {
							post.url = json.feed.entry[i].link[j].href;
							break;
						}
					}
					posts.push(post);
				}
			}
			resolve(posts);
		});
	});
}

async function renderPosts(selector, label) {
	$(selector + ' .panel-body').html(`
		<div class="loading">
			<div class="lds-default"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>
		</div>
	`);
	var posts = await getPostsByLabel(label);
	if (posts.length) {
		$(selector + ' .panel-body').html('');
		for (post of posts) {
			$(selector + ' .panel-body').append(`
				<a href="${post.url}" class="app-card">
					<div class="card-header">
						<img src="${post.images[0]}" class="app-icon"/>
					</div>
					<div class="card-body">
						<h3 class="app-title">${post.title}</h3>
						<p class="app-description">${stripHtml(post.content).substr(0, 33)} ..</p>
					</div>
				</a>
			`);
		}
		$(selector + ' .panel-footer').html(`<a href="/search/label/${label}" class="showmore">عرض المزيد من تطبيقات ${label}</a>`);
	} else {
		$(selector + ' .panel-body').html('لا يوجد معطيات');
	}
}

/* Home Page */
renderPosts('.windows', 'ويندوز');
renderPosts('.android', 'أندرويد');

/* Post Page */
$('.post-body img').first().remove();

/* Search Page */
$('.app-row').each(async function(){
	var post_id = $(this).attr('id');

	var post = await getPost(post_id);
	var tmp = document.createElement('div');
	tmp.innerHTML = post.content;

	var size = $(tmp).find('.size .value').html();
	var version = $(tmp).find('.version .value').html();
	var updated = $(tmp).find('.updated .value').html();

	if (size != null && version != null && updated != null)
		$(this).find('.row-footer').html(`
			<div class="item"><i class="fa fa-database"></i>${size}</div>
			<div class="item"><i class="fa fa-refresh"></i>${version}</div>
			<div class="item"><i class="fa fa-clock-o"></i>${updated}</div>
		  `);
});
